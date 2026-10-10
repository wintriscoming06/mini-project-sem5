package com.sssp.tournament;

import com.sssp.team.dto.TeamMemberResponse;

import com.sssp.team.dto.TeamMemberRequest;

import com.sssp.team.dto.TeamResponse;

import com.sssp.team.dto.TeamRequest;

import com.sssp.application.dto.ApplicationResponse;

import com.sssp.common.enums.ApplicationStatus;
import com.sssp.tournament.TournamentStatus;
import com.sssp.common.exception.ResourceNotFoundException;
import com.sssp.player.PlayerProfile;
import com.sssp.player.PlayerProfileRepository;
import com.sssp.user.User;
import com.sssp.user.UserRepository;
import com.sssp.tournament.dto.*;
import com.sssp.team.Team;
import com.sssp.team.TeamMembership;
import com.sssp.tournament.Tournament;
import com.sssp.application.TournamentApplication;
import com.sssp.team.TeamMembershipRepository;
import com.sssp.team.TeamRepository;
import com.sssp.application.TournamentApplicationRepository;
import com.sssp.tournament.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final TournamentApplicationRepository tournamentApplicationRepository;
    private final TeamRepository teamRepository;
    private final TeamMembershipRepository teamMembershipRepository;
    private final UserRepository userRepository;
    private final PlayerProfileRepository playerProfileRepository;

    public TournamentResponse createTournament(TournamentRequest request, String username) {
        User organizer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Tournament tournament = new Tournament();
        tournament.setName(request.getName());
        
        tournament.setStartDate(request.getStartDate());
        tournament.setEndDate(request.getEndDate());
        tournament.setLocation(request.getLocation());
        tournament.setOrganizer(organizer);
        tournament.setStatus(TournamentStatus.DRAFT);
        
        return mapToTournamentResponse(tournamentRepository.save(tournament));
    }

    public TournamentResponse getTournament(Long id) {
        return mapToTournamentResponse(tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found")));
    }

    public List<TournamentResponse> getAllTournaments() {
        return tournamentRepository.findAll().stream()
                .map(this::mapToTournamentResponse)
                .collect(Collectors.toList());
    }

    public List<TournamentResponse> getOrganizerTournaments(String username) {
        User organizer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return tournamentRepository.findByOrganizerId(organizer.getId()).stream()
                .map(this::mapToTournamentResponse)
                .collect(Collectors.toList());
    }

    public TournamentResponse updateTournament(Long id, TournamentRequest request, String username) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        if (!tournament.getOrganizer().getUsername().equals(username)) {
            throw new IllegalArgumentException("Not authorized to update this tournament");
        }
        
        if (request.getName() != null) tournament.setName(request.getName());
        if (null != null) 
        if (request.getStartDate() != null) tournament.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) tournament.setEndDate(request.getEndDate());
        if (request.getLocation() != null) tournament.setLocation(request.getLocation());
        
        return mapToTournamentResponse(tournamentRepository.save(tournament));
    }

    public TournamentResponse updateTournamentStatus(Long id, TournamentStatus newStatus, String username) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        if (!tournament.getOrganizer().getUsername().equals(username)) {
            throw new IllegalArgumentException("Not authorized to update this tournament");
        }
        
        validateTournamentTransition(tournament.getStatus(), newStatus);
        tournament.setStatus(newStatus);
        return mapToTournamentResponse(tournamentRepository.save(tournament));
    }

    public ApplicationResponse applyToTournament(Long tournamentId, String username) {
        User player = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
                
        if (tournament.getStatus() != TournamentStatus.OPEN) {
            throw new IllegalArgumentException("Tournament is not open for registration");
        }
        
        if (tournamentApplicationRepository.existsByPlayerIdAndTournamentId(player.getId(), tournamentId)) {
            throw new IllegalArgumentException("Player has already applied");
        }
        
        TournamentApplication application = new TournamentApplication();
        application.setPlayer(player);
        application.setTournament(tournament);
        application.setStatus(ApplicationStatus.PENDING);
        application.setAppliedAt(LocalDateTime.now());
        
        return mapToApplicationResponse(tournamentApplicationRepository.save(application));
    }

    public List<ApplicationResponse> getApplicationsForTournament(Long tournamentId) {
        return tournamentApplicationRepository.findByTournamentId(tournamentId).stream()
                .map(this::mapToApplicationResponse)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getPlayerApplications(String username) {
        User player = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return tournamentApplicationRepository.findByPlayerId(player.getId()).stream()
                .map(this::mapToApplicationResponse)
                .collect(Collectors.toList());
    }

    public ApplicationResponse decideApplication(Long applicationId, ApplicationStatus decision, String username) {
        TournamentApplication application = tournamentApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        
        if (!application.getTournament().getOrganizer().getUsername().equals(username)) {
            throw new IllegalArgumentException("Not authorized to decide this application");
        }
        
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new IllegalArgumentException("Application is not pending");
        }
        
        if (decision != ApplicationStatus.ACCEPTED && decision != ApplicationStatus.REJECTED) {
            throw new IllegalArgumentException("Invalid decision status");
        }
        
        application.setStatus(decision);
        application.setDecisionAt(LocalDateTime.now());
        User decidedBy = userRepository.findByUsername(username).orElse(null);
        application.setDecidedBy(decidedBy);
        
        return mapToApplicationResponse(tournamentApplicationRepository.save(application));
    }

    public ApplicationResponse withdrawApplication(Long applicationId, String username) {
        TournamentApplication application = tournamentApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
                
        if (!application.getPlayer().getUsername().equals(username)) {
            throw new IllegalArgumentException("Not authorized to withdraw this application");
        }
        
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new IllegalArgumentException("Only pending applications can be withdrawn");
        }
        
        application.setStatus(ApplicationStatus.WITHDRAWN);
        return mapToApplicationResponse(tournamentApplicationRepository.save(application));
    }

    public TeamResponse createTeam(TeamRequest request, String username) {
        Tournament tournament = tournamentRepository.findById(request.getTournamentId())
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
                
        if (!tournament.getOrganizer().getUsername().equals(username)) {
            throw new IllegalArgumentException("Not authorized to create a team in this tournament");
        }
        
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
                
        if (!team.getTournament().getOrganizer().getUsername().equals(username)) {
            throw new IllegalArgumentException("Not authorized to add members to this team");
        }
        
        TournamentApplication app = tournamentApplicationRepository.findByPlayerIdAndTournamentId(request.getPlayerId(), team.getTournament().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
                
        if (app.getStatus() != ApplicationStatus.ACCEPTED) {
            throw new IllegalArgumentException("Player application must be ACCEPTED");
        }
        
        if (teamMembershipRepository.existsByTeamIdAndPlayerId(teamId, request.getPlayerId())) {
            throw new IllegalArgumentException("Player is already in this team");
        }
        
        User player = userRepository.findById(request.getPlayerId())
                .orElseThrow(() -> new ResourceNotFoundException("Player not found"));
                
        TeamMembership membership = new TeamMembership();
        membership.setTeam(team);
        membership.setPlayer(player);
        
        return mapToTeamMemberResponse(teamMembershipRepository.save(membership));
    }

    public void removeTeamMember(Long teamId, Long playerId, String username) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
                
        if (!team.getTournament().getOrganizer().getUsername().equals(username)) {
            throw new IllegalArgumentException("Not authorized to remove members from this team");
        }
        
        TeamMembership membership = teamMembershipRepository.findByTeamIdAndPlayerId(teamId, playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Team membership not found"));
                
        teamMembershipRepository.delete(membership);
    }

    private TournamentResponse mapToTournamentResponse(Tournament t) {
        return TournamentResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .startDate(t.getStartDate())
                .endDate(t.getEndDate())
                .location(t.getLocation())
                .organizerId(t.getOrganizer().getId())
                .organizerName(t.getOrganizer().getUsername())
                .status(t.getStatus())
                .build();
    }

    private ApplicationResponse mapToApplicationResponse(TournamentApplication a) {
        return ApplicationResponse.builder()
                .id(a.getId())
                .playerId(a.getPlayer().getId())
                .playerName(a.getPlayer().getUsername())
                .tournamentId(a.getTournament().getId())
                .tournamentName(a.getTournament().getName())
                .status(a.getStatus())
                .appliedAt(a.getAppliedAt())
                .decisionAt(a.getDecisionAt())
                .decidedByName(a.getDecidedBy() != null ? a.getDecidedBy().getUsername() : null)
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
                .joinedAt(m.getJoinedAt())
                .build();
    }

    private void validateTournamentTransition(TournamentStatus current, TournamentStatus next) {
        if (next == TournamentStatus.CANCELLED && current != TournamentStatus.COMPLETED) {
            return; // allowed from non-terminal
        }
        if (current == TournamentStatus.DRAFT && next == TournamentStatus.OPEN) return;
        if (current == TournamentStatus.OPEN && next == TournamentStatus.REGISTRATION_CLOSED) return;
        if (current == TournamentStatus.REGISTRATION_CLOSED && next == TournamentStatus.ONGOING) return;
        if (current == TournamentStatus.ONGOING && next == TournamentStatus.COMPLETED) return;
        
        throw new IllegalArgumentException("Invalid state transition from " + current + " to " + next);
    }
}
