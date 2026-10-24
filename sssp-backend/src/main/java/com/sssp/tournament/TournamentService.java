package com.sssp.tournament;

import com.sssp.alert.Notification;
import com.sssp.alert.NotificationRepository;
import com.sssp.common.enums.UserRole;
import com.sssp.common.exception.BadRequestException;
import com.sssp.common.exception.ResourceNotFoundException;
import com.sssp.common.exception.UnauthorizedException;
import com.sssp.gpi.GPIEngine;
import com.sssp.gpi.GPIService;
import com.sssp.match.Match;
import com.sssp.match.MatchRepository;
import com.sssp.match.dto.MatchRequest;
import com.sssp.match.dto.MatchResponse;
import com.sssp.player.PlayerProfile;
import com.sssp.player.PlayerProfileRepository;
import com.sssp.stats.PlayerMatchStatistics;
import com.sssp.stats.repository.PlayerMatchStatisticsRepository;
import com.sssp.team.Team;
import com.sssp.team.TeamMembership;
import com.sssp.team.TeamMembershipRepository;
import com.sssp.team.TeamRepository;
import com.sssp.team.dto.TeamMemberRequest;
import com.sssp.team.dto.TeamMemberResponse;
import com.sssp.team.dto.TeamRequest;
import com.sssp.team.dto.TeamResponse;
import com.sssp.tournament.dto.*;
import com.sssp.user.User;
import com.sssp.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final TeamRepository teamRepository;
    private final TeamMembershipRepository teamMembershipRepository;
    private final MatchRepository matchRepository;
    private final PlayerMatchStatisticsRepository playerMatchStatisticsRepository;
    private final UserRepository userRepository;
    private final PlayerProfileRepository playerProfileRepository;
    private final GPIService gpiService;
    private final NotificationRepository notificationRepository;

    // ==================== TOURNAMENTS ====================

    public List<TournamentResponse> getAllTournaments() {
        return tournamentRepository.findAll().stream()
                .map(this::mapToTournamentResponse)
                .collect(Collectors.toList());
    }

    public List<TournamentResponse> getOrganizerTournaments(String username) {
        User organizer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return tournamentRepository.findByOrganizerId(organizer.getId()).stream()
                .map(this::mapToTournamentResponse)
                .collect(Collectors.toList());
    }

    public TournamentResponse getTournament(Long id) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found with ID: " + id));
        return mapToTournamentResponse(tournament);
    }

    public TournamentResponse createTournament(TournamentRequest request, String username) {
        User organizer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Tournament tournament = new Tournament();
        tournament.setName(request.getName());
        tournament.setAgeGroup(request.getAgeGroup());
        tournament.setGenderCategory(request.getGenderCategory());
        tournament.setLocation(request.getLocation());
        tournament.setVenue(request.getVenue());
        tournament.setStartDate(request.getStartDate());
        tournament.setEndDate(request.getEndDate());
        tournament.setFormat(request.getFormat());
        tournament.setRegistrationDeadline(request.getRegistrationDeadline());
        tournament.setOrganizer(organizer);
        tournament.setStatus(TournamentStatus.OPEN);

        Tournament saved = tournamentRepository.save(tournament);

        // Notify all registered players about the new tournament
        try {
            List<User> players = userRepository.findByRole(UserRole.PLAYER);
            List<Notification> notifications = new ArrayList<>();
            for (User p : players) {
                Notification n = new Notification();
                n.setUserId(p.getId());
                n.setTitle("New Tournament Announced: " + saved.getName());
                n.setMessage("A new tournament '" + saved.getName() + "' at " + (saved.getVenue() != null ? saved.getVenue() : "TBD") +
                        " has been announced. Dates: " + saved.getStartDate() + " to " + saved.getEndDate() + ".");
                n.setCreatedAt(LocalDateTime.now());
                notifications.add(n);
            }
            if (!notifications.isEmpty()) {
                notificationRepository.saveAll(notifications);
            }
        } catch (Exception ignored) {}

        return mapToTournamentResponse(saved);
    }

    public TournamentResponse updateTournament(Long id, TournamentRequest request, String username) {
        Tournament tournament = getOwnedTournament(id, username);

        tournament.setName(request.getName());
        tournament.setAgeGroup(request.getAgeGroup());
        tournament.setGenderCategory(request.getGenderCategory());
        tournament.setLocation(request.getLocation());
        tournament.setVenue(request.getVenue());
        tournament.setStartDate(request.getStartDate());
        tournament.setEndDate(request.getEndDate());
        tournament.setFormat(request.getFormat());
        tournament.setRegistrationDeadline(request.getRegistrationDeadline());

        return mapToTournamentResponse(tournamentRepository.save(tournament));
    }

    public TournamentResponse updateTournamentStatus(Long id, TournamentStatus newStatus, String username) {
        Tournament tournament = getOwnedTournament(id, username);
        validateTournamentTransition(tournament.getStatus(), newStatus);
        tournament.setStatus(newStatus);
        return mapToTournamentResponse(tournamentRepository.save(tournament));
    }

    public void deleteTournament(Long id, String username) {
        Tournament tournament = getOwnedTournament(id, username);
        // Clean up tournament stats and recalculate players
        List<PlayerMatchStatistics> statsList = playerMatchStatisticsRepository.findByTournamentId(id);
        for (PlayerMatchStatistics stat : statsList) {
            Long playerId = stat.getPlayer() != null ? stat.getPlayer().getId() : null;
            playerMatchStatisticsRepository.delete(stat);
            if (playerId != null) {
                gpiService.recalculatePlayerGPI(playerId);
            }
        }
        tournamentRepository.delete(tournament);
    }

    // ==================== TEAMS & SQUADS ====================

    public TeamResponse createTeam(TeamRequest request, String username) {
        Tournament tournament = getOwnedTournament(request.getTournamentId(), username);

        Team team = new Team();
        team.setName(request.getName());
        team.setTournament(tournament);

        return mapToTeamResponse(teamRepository.save(team));
    }

    public List<TeamResponse> getTeamsForTournament(Long tournamentId) {
        return teamRepository.findByTournamentId(tournamentId).stream()
                .map(this::mapToTeamResponse)
                .collect(Collectors.toList());
    }

    public TeamMemberResponse addTeamMember(Long teamId, TeamMemberRequest request, String username) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
        checkOwnership(team.getTournament(), username);

        if (teamMembershipRepository.existsByTeamIdAndPlayerId(teamId, request.getPlayerId())) {
            throw new BadRequestException("Player is already in this team");
        }

        User player = userRepository.findById(request.getPlayerId())
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with ID: " + request.getPlayerId()));

        TeamMembership membership = new TeamMembership();
        membership.setTeam(team);
        membership.setPlayer(player);
        membership.setJoinedAt(LocalDateTime.now());

        return mapToTeamMemberResponse(teamMembershipRepository.save(membership));
    }

    public void removeTeamMember(Long teamId, Long playerId, String username) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
        checkOwnership(team.getTournament(), username);

        TeamMembership membership = teamMembershipRepository.findByTeamIdAndPlayerId(teamId, playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Team membership not found for player ID: " + playerId));

        teamMembershipRepository.delete(membership);
    }

    // ==================== MATCH FIXTURES & LINEUPS ====================

    public MatchResponse createTournamentMatch(Long tournamentId, MatchRequest request, String username) {
        Tournament tournament = getOwnedTournament(tournamentId, username);

        Team homeTeam = request.getHomeTeamId() != null
                ? teamRepository.findById(request.getHomeTeamId()).orElse(null) : null;
        Team awayTeam = request.getAwayTeamId() != null
                ? teamRepository.findById(request.getAwayTeamId()).orElse(null) : null;

        Match match = new Match();
        match.setTournament(tournament);
        match.setHomeTeam(homeTeam);
        match.setAwayTeam(awayTeam);
        match.setMatchDateTime(request.getMatchDateTime());
        match.setVenue(request.getVenue() != null ? request.getVenue() : tournament.getVenue());

        return mapToMatchResponse(matchRepository.save(match));
    }

    public List<MatchResponse> getTournamentMatches(Long tournamentId) {
        return matchRepository.findByTournamentId(tournamentId).stream()
                .map(this::mapToMatchResponse)
                .collect(Collectors.toList());
    }

    public MatchResponse updateMatchScore(Long tournamentId, Long matchId, TournamentMatchScoreRequest request, String username) {
        Tournament tournament = getOwnedTournament(tournamentId, username);
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found with ID: " + matchId));

        if (!match.getTournament().getId().equals(tournament.getId())) {
            throw new BadRequestException("Match does not belong to this tournament");
        }

        match.setHomeScore(request.getHomeScore());
        match.setAwayScore(request.getAwayScore());
        match.setStatus(com.sssp.common.enums.MatchStatus.COMPLETED);

        return mapToMatchResponse(matchRepository.save(match));
    }

    // ==================== PLAYER TOURNAMENT STATS & GPI ====================

    public List<TournamentPlayerStatsResponse> getTournamentStats(Long tournamentId) {
        return playerMatchStatisticsRepository.findByTournamentId(tournamentId).stream()
                .map(this::mapToStatsResponse)
                .collect(Collectors.toList());
    }

    public TournamentPlayerStatsResponse addOrUpdateTournamentPlayerStats(Long tournamentId, TournamentPlayerStatsRequest request, String username) {
        Tournament tournament = getOwnedTournament(tournamentId, username);

        // Validation rule: Stats entry is allowed only on or after the tournament date (startDate or endDate)
        LocalDate allowedDate = tournament.getStartDate() != null ? tournament.getStartDate() : tournament.getEndDate();
        if (allowedDate != null && LocalDate.now().isBefore(allowedDate)) {
            throw new BadRequestException("Stats entry is allowed only on or after the tournament start date (" + allowedDate + ").");
        }

        User player = userRepository.findById(request.getPlayerId())
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with ID: " + request.getPlayerId()));

        Team team = request.getTeamId() != null
                ? teamRepository.findById(request.getTeamId()).orElse(null) : null;

        // One stats record per player per tournament
        PlayerMatchStatistics stat = playerMatchStatisticsRepository
                .findByTournamentIdAndPlayerId(tournamentId, request.getPlayerId())
                .orElseGet(() -> {
                    PlayerMatchStatistics newStat = new PlayerMatchStatistics();
                    newStat.setTournament(tournament);
                    newStat.setPlayer(player);
                    return newStat;
                });

        stat.setTeam(team);
        stat.setMatchDate(tournament.getEndDate() != null ? tournament.getEndDate() : tournament.getStartDate());
        stat.setCompetition(tournament.getName());
        stat.setOpponent(team != null ? team.getName() : "Tournament Fixture");
        stat.setPosition(request.getPosition() != null ? request.getPosition() : "CM");
        stat.setMatchKind(request.getMatchKind() != null ? request.getMatchKind() : "OFFICIAL");
        stat.setStars(request.getStars() != null ? request.getStars() : 3);

        stat.setMinutesPlayed(request.getMinutesPlayed());
        stat.setGoals(request.getGoals());
        stat.setAssists(request.getAssists());
        stat.setShots(request.getShots());
        stat.setShotsOnTarget(request.getShotsOnTarget());
        stat.setPassesAttempted(request.getPassesAttempted());
        stat.setPassesCompleted(request.getPassesCompleted());
        stat.setKeyPasses(request.getKeyPasses());
        stat.setDribblesAttempted(request.getDribblesAttempted());
        stat.setDribblesCompleted(request.getDribblesCompleted());
        stat.setTackles(request.getTackles());
        stat.setInterceptions(request.getInterceptions());
        stat.setClearances(request.getClearances());
        stat.setDuelsWon(request.getDuelsWon());
        stat.setYellowCards(request.getYellowCards());
        stat.setRedCards(request.getRedCards());

        // Performance score
        stat.setPerformanceScore(GPIEngine.matchPerformanceScore(stat));

        PlayerMatchStatistics saved = playerMatchStatisticsRepository.save(stat);

        // Recalculate player GPI
        gpiService.recalculatePlayerGPI(player.getId());

        return mapToStatsResponse(saved);
    }

    public void deleteTournamentPlayerStats(Long tournamentId, Long statsId, String username) {
        Tournament tournament = getOwnedTournament(tournamentId, username);
        PlayerMatchStatistics stat = playerMatchStatisticsRepository.findById(statsId)
                .orElseThrow(() -> new ResourceNotFoundException("Stats record not found with ID: " + statsId));

        if (stat.getTournament() == null || !stat.getTournament().getId().equals(tournament.getId())) {
            throw new BadRequestException("Stats record does not belong to this tournament");
        }

        Long playerId = stat.getPlayer().getId();
        playerMatchStatisticsRepository.delete(stat);

        // Recalculate player GPI
        gpiService.recalculatePlayerGPI(playerId);
    }

    // ==================== PLAYER SEARCH FOR ORGANIZERS ====================

    public List<Map<String, Object>> searchSignedUpPlayers(String query) {
        String q = query != null ? query.trim().toLowerCase() : "";
        List<User> players = userRepository.findByRole(UserRole.PLAYER);
        return players.stream()
                .filter(p -> q.isEmpty() || p.getUsername().toLowerCase().contains(q))
                .map(p -> {
                    PlayerProfile profile = playerProfileRepository.findByUserId(p.getId()).orElse(null);
                    return Map.<String, Object>of(
                            "id", p.getId(),
                            "username", p.getUsername(),
                            "name", profile != null && profile.getFullName() != null ? profile.getFullName() : p.getUsername(),
                            "position", profile != null && profile.getPrimaryPosition() != null ? profile.getPrimaryPosition() : "CM",
                            "teamAcademy", profile != null && profile.getTeamAcademy() != null ? profile.getTeamAcademy() : ""
                    );
                })
                .collect(Collectors.toList());
    }

    // ==================== HELPERS ====================

    private Tournament getOwnedTournament(Long tournamentId, String username) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found with ID: " + tournamentId));
        checkOwnership(tournament, username);
        return tournament;
    }

    private void checkOwnership(Tournament tournament, String username) {
        if (!tournament.getOrganizer().getUsername().equals(username)) {
            throw new UnauthorizedException("You are not authorized to manage this tournament");
        }
    }

    private TournamentResponse mapToTournamentResponse(Tournament t) {
        return TournamentResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .ageGroup(t.getAgeGroup())
                .genderCategory(t.getGenderCategory())
                .location(t.getLocation())
                .venue(t.getVenue())
                .startDate(t.getStartDate())
                .endDate(t.getEndDate())
                .format(t.getFormat())
                .registrationDeadline(t.getRegistrationDeadline())
                .organizerId(t.getOrganizer().getId())
                .organizerName(t.getOrganizer().getUsername())
                .status(t.getStatus())
                .createdAt(t.getCreatedAt())
                .build();
    }

    private TeamResponse mapToTeamResponse(Team t) {
        List<TeamMemberResponse> members = teamMembershipRepository.findByTeamId(t.getId()).stream()
                .map(this::mapToTeamMemberResponse)
                .collect(Collectors.toList());

        return TeamResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .tournamentId(t.getTournament().getId())
                .tournamentName(t.getTournament().getName())
                .members(members)
                .build();
    }

    private TeamMemberResponse mapToTeamMemberResponse(TeamMembership m) {
        return TeamMemberResponse.builder()
                .id(m.getId())
                .teamId(m.getTeam().getId())
                .playerId(m.getPlayer().getId())
                .playerName(m.getPlayer().getUsername())
                .name(m.getPlayer().getUsername())
                .joinedAt(m.getJoinedAt())
                .build();
    }

    private MatchResponse mapToMatchResponse(Match m) {
        return MatchResponse.builder()
                .id(m.getId())
                .tournamentId(m.getTournament() != null ? m.getTournament().getId() : null)
                .tournamentName(m.getTournament() != null ? m.getTournament().getName() : null)
                .homeTeamId(m.getHomeTeam() != null ? m.getHomeTeam().getId() : null)
                .homeTeamName(m.getHomeTeam() != null ? m.getHomeTeam().getName() : "TBD")
                .awayTeamId(m.getAwayTeam() != null ? m.getAwayTeam().getId() : null)
                .awayTeamName(m.getAwayTeam() != null ? m.getAwayTeam().getName() : "TBD")
                .matchDateTime(m.getMatchDateTime())
                .venue(m.getVenue())
                .status(m.getStatus())
                .homeScore(m.getHomeScore())
                .awayScore(m.getAwayScore())
                .confirmed(m.isConfirmed())
                .confirmedAt(m.getConfirmedAt())
                .build();
    }

    private TournamentPlayerStatsResponse mapToStatsResponse(PlayerMatchStatistics s) {
        return TournamentPlayerStatsResponse.builder()
                .id(s.getId())
                .tournamentId(s.getTournament() != null ? s.getTournament().getId() : null)
                .tournamentName(s.getTournament() != null ? s.getTournament().getName() : s.getCompetition())
                .playerId(s.getPlayer() != null ? s.getPlayer().getId() : null)
                .playerUsername(s.getPlayer() != null ? s.getPlayer().getUsername() : null)
                .playerName(s.getPlayer() != null ? s.getPlayer().getUsername() : null)
                .teamId(s.getTeam() != null ? s.getTeam().getId() : null)
                .teamName(s.getTeam() != null ? s.getTeam().getName() : null)
                .position(s.getPosition())
                .matchKind(s.getMatchKind())
                .stars(s.getStars())
                .minutesPlayed(s.getMinutesPlayed())
                .goals(s.getGoals())
                .assists(s.getAssists())
                .shots(s.getShots())
                .shotsOnTarget(s.getShotsOnTarget())
                .passesAttempted(s.getPassesAttempted())
                .passesCompleted(s.getPassesCompleted())
                .keyPasses(s.getKeyPasses())
                .dribblesAttempted(s.getDribblesAttempted())
                .dribblesCompleted(s.getDribblesCompleted())
                .tackles(s.getTackles())
                .interceptions(s.getInterceptions())
                .clearances(s.getClearances())
                .duelsWon(s.getDuelsWon())
                .yellowCards(s.getYellowCards())
                .redCards(s.getRedCards())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }

    private void validateTournamentTransition(TournamentStatus current, TournamentStatus next) {
        if (next == TournamentStatus.CANCELLED && current != TournamentStatus.COMPLETED) {
            return;
        }
        if (current == TournamentStatus.DRAFT && next == TournamentStatus.OPEN) return;
        if (current == TournamentStatus.OPEN && next == TournamentStatus.REGISTRATION_CLOSED) return;
        if (current == TournamentStatus.REGISTRATION_CLOSED && next == TournamentStatus.ONGOING) return;
        if (current == TournamentStatus.ONGOING && next == TournamentStatus.COMPLETED) return;

        throw new BadRequestException("Invalid state transition from " + current + " to " + next);
    }
}
