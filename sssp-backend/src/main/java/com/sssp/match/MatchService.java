package com.sssp.match;

import com.sssp.user.User;
import com.sssp.user.UserRepository;
import com.sssp.common.enums.MatchEventType;
import com.sssp.common.enums.MatchStatus;
import com.sssp.common.enums.UserRole;
import com.sssp.common.exception.BadRequestException;
import com.sssp.common.exception.ResourceNotFoundException;
import com.sssp.gpi.dto.GPIStatusResponse;
import com.sssp.gpi.GPIEngine;
import com.sssp.gpi.GPIService;
import com.sssp.match.dto.*;
import com.sssp.match.Match;
import com.sssp.match.MatchEvent;
import com.sssp.match.MatchParticipation;
import com.sssp.match.MatchEventRepository;
import com.sssp.match.MatchParticipationRepository;
import com.sssp.match.MatchRepository;
import com.sssp.player.PlayerProfile;
import com.sssp.player.PlayerProfileRepository;
import com.sssp.stats.dto.PlayerMatchStatsResponse;
import com.sssp.stats.PlayerMatchStatistics;
import com.sssp.stats.repository.PlayerMatchStatisticsRepository;
import com.sssp.team.Team;
import com.sssp.tournament.Tournament;
import com.sssp.team.TeamMembershipRepository;
import com.sssp.team.TeamRepository;
import com.sssp.tournament.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final MatchEventRepository matchEventRepository;
    private final MatchParticipationRepository matchParticipationRepository;
    private final TournamentRepository tournamentRepository;
    private final TeamRepository teamRepository;
    private final TeamMembershipRepository teamMembershipRepository;
    private final UserRepository userRepository;
    private final PlayerMatchStatisticsRepository playerMatchStatisticsRepository;
    private final PlayerProfileRepository playerProfileRepository;
    private final GPIService gpiService;

    public MatchResponse createMatch(MatchRequest request, String username) {
        Tournament tournament = tournamentRepository.findById(request.getTournamentId())
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        if (!tournament.getOrganizer().getUsername().equals(username)) {
            throw new IllegalArgumentException("Not authorized to create a match in this tournament");
        }

        Team homeTeam = teamRepository.findById(request.getHomeTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Home team not found"));
        Team awayTeam = teamRepository.findById(request.getAwayTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Away team not found"));

        if (!homeTeam.getTournament().getId().equals(tournament.getId()) || !awayTeam.getTournament().getId().equals(tournament.getId())) {
            throw new IllegalArgumentException("Teams must belong to the tournament");
        }

        Match match = new Match();
        match.setTournament(tournament);
        match.setHomeTeam(homeTeam);
        match.setAwayTeam(awayTeam);
        match.setMatchDateTime(request.getMatchDateTime());
        match.setVenue(request.getVenue());
        match.setStatus(MatchStatus.SCHEDULED);

        return mapToMatchResponse(matchRepository.save(match));
    }

    public MatchResponse getMatch(Long id) {
        return mapToMatchResponse(matchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found")));
    }

    public List<MatchResponse> getAllMatches() {
        return matchRepository.findAll().stream()
                .map(this::mapToMatchResponse)
                .collect(Collectors.toList());
    }

    public List<MatchResponse> getMatchesByTournament(Long tournamentId) {
        return matchRepository.findByTournamentId(tournamentId).stream()
                .map(this::mapToMatchResponse)
                .collect(Collectors.toList());
    }

    public MatchResponse updateMatchStatus(Long matchId, MatchStatus status, String username) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        if (!match.getTournament().getOrganizer().getUsername().equals(username)) {
            throw new IllegalArgumentException("Not authorized to update match");
        }

        validateMatchTransition(match.getStatus(), status);
        match.setStatus(status);

        return mapToMatchResponse(matchRepository.save(match));
    }

    public MatchEventResponse addMatchEvent(Long matchId, MatchEventRequest request, String username) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        if (!match.getTournament().getOrganizer().getUsername().equals(username)) {
            throw new IllegalArgumentException("Not authorized to add events to this match");
        }

        if (match.getStatus() != MatchStatus.LIVE) {
            throw new IllegalArgumentException("Events can only be added to LIVE matches");
        }

        User player = userRepository.findById(request.getPlayerId())
                .orElseThrow(() -> new ResourceNotFoundException("Player not found"));

        MatchEvent event = new MatchEvent();
        event.setMatch(match);
        event.setPlayer(player);
        event.setEventType(request.getEventType());
        event.setMinute(request.getMinute());

        return mapToEventResponse(matchEventRepository.save(event));
    }

    public List<MatchEventResponse> getMatchEvents(Long matchId) {
        return matchEventRepository.findByMatchId(matchId).stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList());
    }

    public MatchParticipationResponse addParticipation(Long matchId, MatchParticipationRequest request, String username) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        if (!match.getTournament().getOrganizer().getUsername().equals(username)) {
            throw new IllegalArgumentException("Not authorized");
        }

        User player = userRepository.findById(request.getPlayerId())
                .orElseThrow(() -> new ResourceNotFoundException("Player not found"));

        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        MatchParticipation participation = new MatchParticipation();
        participation.setMatch(match);
        participation.setPlayer(player);
        participation.setTeam(team);
        participation.setStarting(request.isStarting());
        participation.setMinutesPlayed(request.getMinutesPlayed());

        return mapToParticipationResponse(matchParticipationRepository.save(participation));
    }

    public List<MatchParticipationResponse> getParticipations(Long matchId) {
        return matchParticipationRepository.findByMatchId(matchId).stream()
                .map(this::mapToParticipationResponse)
                .collect(Collectors.toList());
    }

    public MatchResponse confirmMatch(Long matchId, MatchConfirmRequest request, String username) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        User organizer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!match.getTournament().getOrganizer().getId().equals(organizer.getId())) {
            throw new IllegalArgumentException("Not authorized");
        }

        if (match.getStatus() != MatchStatus.COMPLETED) {
            throw new IllegalArgumentException("Match must be COMPLETED to confirm");
        }

        if (match.isConfirmed()) {
            throw new IllegalArgumentException("Match already confirmed");
        }

        match.setHomeScore(request.getHomeScore());
        match.setAwayScore(request.getAwayScore());
        match.setConfirmed(true);
        match.setConfirmedAt(LocalDateTime.now());
        match.setConfirmedBy(organizer);

        List<MatchParticipation> participations = matchParticipationRepository.findByMatchId(matchId);
        List<MatchEvent> events = matchEventRepository.findByMatchId(matchId);

        for (MatchParticipation p : participations) {
            PlayerMatchStatistics stats = new PlayerMatchStatistics();
            stats.setPlayer(p.getPlayer());
            stats.setMatch(match);
            stats.setMatchDate(match.getMatchDateTime() != null ? match.getMatchDateTime().toLocalDate() : LocalDate.now());
            PlayerProfile pProfile = playerProfileRepository.findByUserId(p.getPlayer().getId()).orElse(null);
            stats.setPosition(pProfile != null && pProfile.getPrimaryPosition() != null ? pProfile.getPrimaryPosition() : "CM");
            stats.setMatchKind("OFFICIAL");
            stats.setStars(3);
            stats.setMinutesPlayed(p.getMinutesPlayed() != null ? p.getMinutesPlayed() : 0);

            long goals = events.stream().filter(e -> e.getPlayer().getId().equals(p.getPlayer().getId()) && e.getEventType() == MatchEventType.GOAL).count();
            long assists = events.stream().filter(e -> e.getPlayer().getId().equals(p.getPlayer().getId()) && e.getEventType() == MatchEventType.ASSIST).count();
            long yellowCards = events.stream().filter(e -> e.getPlayer().getId().equals(p.getPlayer().getId()) && e.getEventType() == MatchEventType.YELLOW_CARD).count();
            long redCards = events.stream().filter(e -> e.getPlayer().getId().equals(p.getPlayer().getId()) && e.getEventType() == MatchEventType.RED_CARD).count();

            stats.setGoals((int) goals);
            stats.setAssists((int) assists);
            stats.setYellowCards((int) yellowCards);
            stats.setRedCards((int) redCards);

            double pM = GPIEngine.matchPerformanceScore(stats);
            stats.setPerformanceScore(pM);

            playerMatchStatisticsRepository.save(stats);

            // Trigger GPI recalculation for participant
            gpiService.recalculatePlayerGPI(p.getPlayer().getId());
        }

        return mapToMatchResponse(matchRepository.save(match));
    }

    public List<PlayerMatchStatsResponse> getMatchStats(Long matchId) {
        return playerMatchStatisticsRepository.findByMatchId(matchId).stream()
                .map(this::mapToStatsResponse)
                .collect(Collectors.toList());
    }

    // ========================================================
    // GPI MATCH LOGGING & MANAGEMENT (PORTED FROM gpi-app(2))
    // ========================================================

    public Map<String, Object> logPlayerMatch(Long targetPlayerId, MatchCreateRequest request, String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        Long rawPlayerId = targetPlayerId != null ? targetPlayerId : request.getPlayerId();
        if (rawPlayerId == null) {
            if (currentUser.getRole() == UserRole.PLAYER) {
                rawPlayerId = currentUser.getId();
            } else {
                throw new BadRequestException("Player ID is required");
            }
        }
        final Long effectivePlayerId = rawPlayerId;

        // Authorization check
        if (currentUser.getRole() == UserRole.PLAYER && !currentUser.getId().equals(effectivePlayerId)) {
            throw new AccessDeniedException("Players can only log statistics for their own profile");
        }

        User player = userRepository.findById(effectivePlayerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with ID: " + effectivePlayerId));
        PlayerProfile profile = playerProfileRepository.findByUserId(effectivePlayerId).orElse(null);

        validateMatchPayload(request);

        String position = request.getPosition();
        if (position == null || position.isBlank()) {
            position = profile != null && profile.getPrimaryPosition() != null ? profile.getPrimaryPosition() : "CM";
        }

        PlayerMatchStatistics stat = new PlayerMatchStatistics();
        stat.setPlayer(player);
        stat.setMatchDate(request.getMatchDate() != null ? request.getMatchDate() : LocalDate.now());
        stat.setOpponent(request.getOpponent());
        stat.setCompetition(request.getCompetition());
        stat.setPosition(position);
        stat.setMatchKind(request.getMatchKind() != null ? request.getMatchKind().toUpperCase() : "OFFICIAL");
        stat.setStars("OFFICIAL".equalsIgnoreCase(stat.getMatchKind()) ? (request.getStars() != null ? request.getStars() : 3) : null);
        stat.setMinutesPlayed(request.getMinutesPlayed() != null ? request.getMinutesPlayed() : 0);
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

        double pM = GPIEngine.matchPerformanceScore(stat);
        stat.setPerformanceScore(pM);

        PlayerMatchStatistics saved = playerMatchStatisticsRepository.save(stat);

        // Recalculate GPI immediately
        GPIStatusResponse gpiStatus = gpiService.recalculatePlayerGPI(player.getId());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("match", serializePlayerMatch(saved));
        response.put("gpi", gpiStatus);
        return response;
    }

    public List<MatchPlayerRecordResponse> getPlayerMatches(Long playerId, String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        if (currentUser.getRole() == UserRole.PLAYER && !currentUser.getId().equals(playerId)) {
            throw new AccessDeniedException("Not authorized to view other player's match log");
        }

        return playerMatchStatisticsRepository.findByPlayerIdOrderByCreatedAtDesc(playerId)
                .stream()
                .map(this::serializePlayerMatch)
                .collect(Collectors.toList());
    }

    public Map<String, Object> deletePlayerMatch(Long matchStatId, String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        PlayerMatchStatistics stat = playerMatchStatisticsRepository.findById(matchStatId)
                .orElseThrow(() -> new ResourceNotFoundException("Match record not found with ID: " + matchStatId));

        if (currentUser.getRole() == UserRole.PLAYER && !stat.getPlayer().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Not authorized to delete this match record");
        }

        Long playerId = stat.getPlayer().getId();
        playerMatchStatisticsRepository.delete(stat);

        GPIStatusResponse gpiStatus = gpiService.recalculatePlayerGPI(playerId);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("gpi", gpiStatus);
        return response;
    }

    public MatchPlayerRecordResponse serializePlayerMatch(PlayerMatchStatistics row) {
        String playerName = row.getPlayer() != null ? row.getPlayer().getUsername() : null;
        return MatchPlayerRecordResponse.builder()
                .id(row.getId())
                .playerId(row.getPlayer() != null ? row.getPlayer().getId() : null)
                .playerName(playerName)
                .matchDate(row.getMatchDate())
                .opponent(row.getOpponent())
                .competition(row.getCompetition())
                .position(row.getPosition())
                .matchKind(row.getMatchKind())
                .stars(row.getStars())
                .minutesPlayed(row.getMinutesPlayed())
                .goals(row.getGoals())
                .assists(row.getAssists())
                .shots(row.getShots())
                .shotsOnTarget(row.getShotsOnTarget())
                .passesAttempted(row.getPassesAttempted())
                .passesCompleted(row.getPassesCompleted())
                .keyPasses(row.getKeyPasses())
                .dribblesAttempted(row.getDribblesAttempted())
                .dribblesCompleted(row.getDribblesCompleted())
                .tackles(row.getTackles())
                .interceptions(row.getInterceptions())
                .clearances(row.getClearances())
                .duelsWon(row.getDuelsWon())
                .yellowCards(row.getYellowCards())
                .redCards(row.getRedCards())
                .performanceScore(row.getPerformanceScore())
                .createdAt(row.getCreatedAt())
                .build();
    }

    private void validateMatchPayload(MatchCreateRequest b) {
        List<String> errors = new ArrayList<>();

        if (b.getMinutesPlayed() != null && (b.getMinutesPlayed() < 0 || b.getMinutesPlayed() > 130)) {
            errors.add("minutesPlayed must be between 0 and 130.");
        }
        if (b.getGoals() < 0) errors.add("goals must be a non-negative number.");
        if (b.getAssists() < 0) errors.add("assists must be a non-negative number.");
        if (b.getShots() < 0) errors.add("shots must be a non-negative number.");
        if (b.getShotsOnTarget() < 0) errors.add("shotsOnTarget must be a non-negative number.");
        if (b.getPassesAttempted() < 0) errors.add("passesAttempted must be a non-negative number.");
        if (b.getPassesCompleted() < 0) errors.add("passesCompleted must be a non-negative number.");
        if (b.getKeyPasses() < 0) errors.add("keyPasses must be a non-negative number.");
        if (b.getDribblesAttempted() < 0) errors.add("dribblesAttempted must be a non-negative number.");
        if (b.getDribblesCompleted() < 0) errors.add("dribblesCompleted must be a non-negative number.");
        if (b.getTackles() < 0) errors.add("tackles must be a non-negative number.");
        if (b.getInterceptions() < 0) errors.add("interceptions must be a non-negative number.");
        if (b.getClearances() < 0) errors.add("clearances must be a non-negative number.");
        if (b.getDuelsWon() < 0) errors.add("duelsWon must be a non-negative number.");

        if (b.getPassesCompleted() > b.getPassesAttempted()) {
            errors.add("passesCompleted cannot exceed passesAttempted.");
        }
        if (b.getDribblesCompleted() > b.getDribblesAttempted()) {
            errors.add("dribblesCompleted cannot exceed dribblesAttempted.");
        }
        if (b.getShotsOnTarget() > b.getShots()) {
            errors.add("shotsOnTarget cannot exceed shots.");
        }
        if (b.getMatchDate() == null) {
            errors.add("matchDate is required.");
        }
        if (b.getMatchKind() == null || (!"FRIENDLY".equalsIgnoreCase(b.getMatchKind()) && !"OFFICIAL".equalsIgnoreCase(b.getMatchKind()))) {
            errors.add("matchKind must be FRIENDLY or OFFICIAL.");
        }
        if ("OFFICIAL".equalsIgnoreCase(b.getMatchKind())) {
            if (b.getStars() == null || b.getStars() < 1 || b.getStars() > 5) {
                errors.add("stars must be 1-5 for official matches.");
            }
        }
        if (b.getYellowCards() < 0 || b.getYellowCards() > 2) {
            errors.add("yellowCards cannot exceed 2.");
        }
        if (b.getRedCards() < 0 || b.getRedCards() > 1) {
            errors.add("redCards cannot exceed 1.");
        }

        if (!errors.isEmpty()) {
            throw new BadRequestException(String.join(" ", errors));
        }
    }

    private MatchResponse mapToMatchResponse(Match m) {
        return MatchResponse.builder()
                .id(m.getId())
                .tournamentId(m.getTournament() != null ? m.getTournament().getId() : null)
                .tournamentName(m.getTournament() != null ? m.getTournament().getName() : null)
                .homeTeamId(m.getHomeTeam() != null ? m.getHomeTeam().getId() : null)
                .homeTeamName(m.getHomeTeam() != null ? m.getHomeTeam().getName() : null)
                .awayTeamId(m.getAwayTeam() != null ? m.getAwayTeam().getId() : null)
                .awayTeamName(m.getAwayTeam() != null ? m.getAwayTeam().getName() : null)
                .matchDateTime(m.getMatchDateTime())
                .venue(m.getVenue())
                .status(m.getStatus())
                .homeScore(m.getHomeScore())
                .awayScore(m.getAwayScore())
                .confirmed(m.isConfirmed())
                .build();
    }

    private MatchEventResponse mapToEventResponse(MatchEvent e) {
        return MatchEventResponse.builder()
                .id(e.getId())
                .matchId(e.getMatch() != null ? e.getMatch().getId() : null)
                .playerId(e.getPlayer() != null ? e.getPlayer().getId() : null)
                .playerName(e.getPlayer() != null ? e.getPlayer().getUsername() : null)
                .eventType(e.getEventType())
                .minute(e.getMinute())
                .build();
    }

    private MatchParticipationResponse mapToParticipationResponse(MatchParticipation p) {
        return MatchParticipationResponse.builder()
                .id(p.getId())
                .matchId(p.getMatch() != null ? p.getMatch().getId() : null)
                .playerId(p.getPlayer() != null ? p.getPlayer().getId() : null)
                .playerName(p.getPlayer() != null ? p.getPlayer().getUsername() : null)
                .teamId(p.getTeam() != null ? p.getTeam().getId() : null)
                .teamName(p.getTeam() != null ? p.getTeam().getName() : null)
                .starting(p.isStarting())
                .minutesPlayed(p.getMinutesPlayed())
                .build();
    }

    private PlayerMatchStatsResponse mapToStatsResponse(PlayerMatchStatistics s) {
        String description = "Match Appearance";
        if (s.getMatch() != null && s.getMatch().getHomeTeam() != null && s.getMatch().getAwayTeam() != null) {
            description = s.getMatch().getHomeTeam().getName() + " vs " + s.getMatch().getAwayTeam().getName();
        } else if (s.getOpponent() != null) {
            description = "vs " + s.getOpponent();
        }

        return PlayerMatchStatsResponse.builder()
                .id(s.getId())
                .playerId(s.getPlayer() != null ? s.getPlayer().getId() : null)
                .playerName(s.getPlayer() != null ? s.getPlayer().getUsername() : null)
                .matchId(s.getMatch() != null ? s.getMatch().getId() : null)
                .matchDescription(description)
                .goals(s.getGoals())
                .assists(s.getAssists())
                .yellowCards(s.getYellowCards())
                .redCards(s.getRedCards())
                .minutesPlayed(s.getMinutesPlayed())
                .goalsRecorded(s.isGoalsRecorded())
                .assistsRecorded(s.isAssistsRecorded())
                .build();
    }

    private void validateMatchTransition(MatchStatus current, MatchStatus next) {
        if (next == MatchStatus.CANCELLED && (current == MatchStatus.SCHEDULED || current == MatchStatus.LIVE)) return;
        if (current == MatchStatus.SCHEDULED && next == MatchStatus.LIVE) return;
        if (current == MatchStatus.LIVE && next == MatchStatus.COMPLETED) return;

        throw new IllegalArgumentException("Invalid state transition from " + current + " to " + next);
    }
}
