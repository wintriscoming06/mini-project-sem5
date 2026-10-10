package com.sssp.stats;

import com.sssp.audit.dto.AuditLogResponse;

import com.sssp.correction.dto.CorrectionResponse;

import com.sssp.correction.dto.CorrectionRequestDto;

import com.sssp.user.User;
import com.sssp.user.UserRepository;
import com.sssp.common.enums.CorrectionStatus;
import com.sssp.common.enums.MatchStatus;
import com.sssp.common.exception.ResourceNotFoundException;
import com.sssp.match.Match;
import com.sssp.match.MatchRepository;
import com.sssp.stats.dto.*;
import com.sssp.audit.AuditLog;
import com.sssp.correction.CorrectionRequest;
import com.sssp.stats.PlayerMatchStatistics;
import com.sssp.stats.PlayerPerformanceHistory;
import com.sssp.audit.AuditLogRepository;
import com.sssp.correction.CorrectionRequestRepository;
import com.sssp.stats.repository.PlayerMatchStatisticsRepository;
import com.sssp.stats.repository.PlayerPerformanceHistoryRepository;
import com.sssp.tournament.Tournament;
import com.sssp.tournament.TournamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class StatsService {

    private final PlayerMatchStatisticsRepository playerMatchStatisticsRepository;
    private final PlayerPerformanceHistoryRepository playerPerformanceHistoryRepository;
    private final CorrectionRequestRepository correctionRequestRepository;
    private final AuditLogRepository auditLogRepository;
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final TournamentRepository tournamentRepository;

    public StatsService(PlayerMatchStatisticsRepository playerMatchStatisticsRepository,
                        PlayerPerformanceHistoryRepository playerPerformanceHistoryRepository,
                        CorrectionRequestRepository correctionRequestRepository,
                        AuditLogRepository auditLogRepository,
                        MatchRepository matchRepository,
                        UserRepository userRepository,
                        TournamentRepository tournamentRepository) {
        this.playerMatchStatisticsRepository = playerMatchStatisticsRepository;
        this.playerPerformanceHistoryRepository = playerPerformanceHistoryRepository;
        this.correctionRequestRepository = correctionRequestRepository;
        this.auditLogRepository = auditLogRepository;
        this.matchRepository = matchRepository;
        this.userRepository = userRepository;
        this.tournamentRepository = tournamentRepository;
    }

    public List<PerformanceHistoryResponse> getPerformanceHistory(Long playerId) {
        return playerPerformanceHistoryRepository.findByPlayerId(playerId)
                .stream()
                .map(this::mapToHistoryResponse)
                .collect(Collectors.toList());
    }

    public void aggregatePerformanceHistory(Long playerId) {
        List<PlayerMatchStatistics> stats = playerMatchStatisticsRepository.findByPlayerId(playerId);
        List<PlayerMatchStatistics> confirmedStats = stats.stream()
                .filter(s -> s.getMatch() != null && s.getMatch().getStatus() == MatchStatus.COMPLETED)
                .collect(Collectors.toList());

        Map<Long, List<PlayerMatchStatistics>> byTournament = confirmedStats.stream()
                .filter(s -> s.getMatch().getTournament() != null)
                .collect(Collectors.groupingBy(s -> s.getMatch().getTournament().getId()));

        byTournament.forEach((tournamentId, matchStatsList) -> {
            Tournament tournament = tournamentRepository.findById(tournamentId).orElse(null);
            if (tournament == null) return;

            int totalMatches = matchStatsList.size();
            int totalGoals = matchStatsList.stream().mapToInt(PlayerMatchStatistics::getGoals).sum();
            int totalAssists = matchStatsList.stream().mapToInt(PlayerMatchStatistics::getAssists).sum();
            int totalYellowCards = matchStatsList.stream().mapToInt(PlayerMatchStatistics::getYellowCards).sum();
            int totalRedCards = matchStatsList.stream().mapToInt(PlayerMatchStatistics::getRedCards).sum();
            int totalMinutesPlayed = matchStatsList.stream().mapToInt(PlayerMatchStatistics::getMinutesPlayed).sum();

            double goalsPerMatch = totalMatches > 0 ? (double) totalGoals / totalMatches : 0.0;
            double assistsPerMatch = totalMatches > 0 ? (double) totalAssists / totalMatches : 0.0;
            double goalsPer90 = totalMinutesPlayed > 0 ? ((double) totalGoals / totalMinutesPlayed) * 90 : 0.0;
            double assistsPer90 = totalMinutesPlayed > 0 ? ((double) totalAssists / totalMinutesPlayed) * 90 : 0.0;

            PlayerPerformanceHistory history = playerPerformanceHistoryRepository.findByPlayerIdAndTournamentId(playerId, tournamentId)
                    .orElse(new PlayerPerformanceHistory());
            User player = userRepository.findById(playerId).orElse(null);
            if(player == null) return;

            history.setPlayer(player);
            history.setTournament(tournament);
            history.setTotalMatches(totalMatches);
            history.setTotalGoals(totalGoals);
            history.setTotalAssists(totalAssists);
            history.setTotalYellowCards(totalYellowCards);
            history.setTotalRedCards(totalRedCards);
            history.setTotalMinutesPlayed(totalMinutesPlayed);
            history.setGoalsPerMatch(goalsPerMatch);
            history.setAssistsPerMatch(assistsPerMatch);
            history.setGoalsPer90(goalsPer90);
            history.setAssistsPer90(assistsPer90);

            playerPerformanceHistoryRepository.save(history);
        });
    }

    public List<PlayerMatchStatsResponse> getPlayerMatchStats(Long playerId) {
        return playerMatchStatisticsRepository.findByPlayerId(playerId)
                .stream()
                .map(this::mapToStatsResponse)
                .collect(Collectors.toList());
    }

    public List<PlayerMatchStatsResponse> getMatchStatsByMatch(Long matchId) {
        return playerMatchStatisticsRepository.findByMatchId(matchId)
                .stream()
                .map(this::mapToStatsResponse)
                .collect(Collectors.toList());
    }

    public CorrectionResponse submitCorrection(Long matchId, CorrectionRequestDto request, String username) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));
        
        User submitter = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        User player = userRepository.findById(request.getPlayerId())
                .orElseThrow(() -> new ResourceNotFoundException("Player not found"));

        CorrectionRequest correction = new CorrectionRequest();
        correction.setMatch(match);
        correction.setPlayer(player);
        correction.setTargetField(request.getTargetField());
        correction.setOldValue(request.getOldValue());
        correction.setNewValue(request.getNewValue());
        correction.setReason(request.getReason());
        correction.setStatus(CorrectionStatus.PENDING);
        correction.setSubmitter(submitter);
        correction.setSubmittedAt(LocalDateTime.now());

        return mapToCorrectionResponse(correctionRequestRepository.save(correction));
    }

    public List<CorrectionResponse> getPendingCorrections() {
        return correctionRequestRepository.findByStatus(CorrectionStatus.PENDING)
                .stream()
                .map(this::mapToCorrectionResponse)
                .collect(Collectors.toList());
    }

    public List<CorrectionResponse> getAllCorrections() {
        return correctionRequestRepository.findAll()
                .stream()
                .map(this::mapToCorrectionResponse)
                .collect(Collectors.toList());
    }

    public CorrectionResponse decideCorrection(Long correctionId, CorrectionStatus decision, String username) {
        CorrectionRequest correction = correctionRequestRepository.findById(correctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Correction request not found"));
        
        if (correction.getStatus() != CorrectionStatus.PENDING) {
            throw new IllegalStateException("Correction is not pending");
        }

        User reviewer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));

        if (decision == CorrectionStatus.APPROVED) {
            PlayerMatchStatistics stats = playerMatchStatisticsRepository.findByMatchIdAndPlayerId(
                    correction.getMatch().getId(), correction.getPlayer().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Stats not found"));

            String oldValue = getStatFieldValue(stats, correction.getTargetField());
            updateStatField(stats, correction.getTargetField(), correction.getNewValue());

            AuditLog log = new AuditLog();
            log.setEntityType("PlayerMatchStatistics");
            log.setEntityId(stats.getId());
            log.setOldValue(oldValue);
            log.setNewValue(correction.getNewValue());
            log.setChangedBy(correction.getSubmitter());
            log.setReviewedBy(reviewer);
            log.setChangedAt(LocalDateTime.now());
            log.setReason(correction.getReason());
            auditLogRepository.save(log);

            playerMatchStatisticsRepository.save(stats);
            aggregatePerformanceHistory(correction.getPlayer().getId());
        }

        correction.setStatus(decision);
        correction.setReviewer(reviewer);
        correction.setReviewedAt(LocalDateTime.now());

        return mapToCorrectionResponse(correctionRequestRepository.save(correction));
    }

    public List<AuditLogResponse> getAuditLogs() {
        return auditLogRepository.findAllByOrderByChangedAtDesc()
                .stream()
                .map(this::mapToAuditResponse)
                .collect(Collectors.toList());
    }

    public List<AuditLogResponse> getAuditLogsByEntity(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByChangedAtDesc(entityType, entityId)
                .stream()
                .map(this::mapToAuditResponse)
                .collect(Collectors.toList());
    }

    private PlayerMatchStatsResponse mapToStatsResponse(PlayerMatchStatistics s) {
        PlayerMatchStatsResponse r = new PlayerMatchStatsResponse();
        r.setId(s.getId());
        r.setPlayerId(s.getPlayer().getId());
        r.setMatchId(s.getMatch().getId());
        r.setGoals(s.getGoals());
        r.setAssists(s.getAssists());
        r.setYellowCards(s.getYellowCards());
        r.setRedCards(s.getRedCards());
        r.setMinutesPlayed(s.getMinutesPlayed());
        return r;
    }

    private PerformanceHistoryResponse mapToHistoryResponse(PlayerPerformanceHistory h) {
        PerformanceHistoryResponse r = new PerformanceHistoryResponse();
        r.setId(h.getId());
        r.setPlayerId(h.getPlayer().getId());
        r.setTournamentId(h.getTournament().getId());
        r.setTotalMatches(h.getTotalMatches());
        r.setTotalGoals(h.getTotalGoals());
        r.setTotalAssists(h.getTotalAssists());
        r.setTotalYellowCards(h.getTotalYellowCards());
        r.setTotalRedCards(h.getTotalRedCards());
        r.setTotalMinutesPlayed(h.getTotalMinutesPlayed());
        r.setGoalsPerMatch(h.getGoalsPerMatch());
        r.setAssistsPerMatch(h.getAssistsPerMatch());
        r.setGoalsPer90(h.getGoalsPer90());
        r.setAssistsPer90(h.getAssistsPer90());
        return r;
    }

    private CorrectionResponse mapToCorrectionResponse(CorrectionRequest c) {
        CorrectionResponse r = new CorrectionResponse();
        r.setId(c.getId());
        r.setMatchId(c.getMatch().getId());
        r.setPlayerId(c.getPlayer().getId());
        r.setPlayerName(c.getPlayer().getUsername());
        r.setTargetField(c.getTargetField());
        r.setOldValue(c.getOldValue());
        r.setNewValue(c.getNewValue());
        r.setReason(c.getReason());
        r.setStatus(c.getStatus());
        r.setSubmitterName(c.getSubmitter() != null ? c.getSubmitter().getUsername() : null);
        if(c.getReviewer() != null) r.setReviewerName(c.getReviewer().getUsername());
        r.setSubmittedAt(c.getSubmittedAt());
        r.setReviewedAt(c.getReviewedAt());
        return r;
    }

    private AuditLogResponse mapToAuditResponse(AuditLog a) {
        AuditLogResponse r = new AuditLogResponse();
        r.setId(a.getId());
        r.setEntityType(a.getEntityType());
        r.setEntityId(a.getEntityId());
        r.setOldValue(a.getOldValue());
        r.setNewValue(a.getNewValue());
        r.setChangedByName(a.getChangedBy() != null ? a.getChangedBy().getUsername() : null);
        r.setChangedAt(a.getChangedAt());
        r.setReason(a.getReason());
        return r;
    }

    private String getStatFieldValue(PlayerMatchStatistics stats, String fieldName) {
        switch (fieldName) {
            case "goals": return String.valueOf(stats.getGoals());
            case "assists": return String.valueOf(stats.getAssists());
            case "yellowCards": return String.valueOf(stats.getYellowCards());
            case "redCards": return String.valueOf(stats.getRedCards());
            case "minutesPlayed": return String.valueOf(stats.getMinutesPlayed());
            default: throw new IllegalArgumentException("Unknown field: " + fieldName);
        }
    }

    private void updateStatField(PlayerMatchStatistics stats, String fieldName, String newValue) {
        int value = Integer.parseInt(newValue);
        switch (fieldName) {
            case "goals": stats.setGoals(value); break;
            case "assists": stats.setAssists(value); break;
            case "yellowCards": stats.setYellowCards(value); break;
            case "redCards": stats.setRedCards(value); break;
            case "minutesPlayed": stats.setMinutesPlayed(value); break;
            default: throw new IllegalArgumentException("Unknown field: " + fieldName);
        }
    }
}
