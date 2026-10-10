package com.sssp.gpi;

import com.sssp.admin.dto.GPIConfigRequest;
import com.sssp.admin.dto.GPIConfigResponse;
import com.sssp.user.User;
import com.sssp.user.UserRepository;
import com.sssp.common.enums.DataConfidence;
import com.sssp.common.enums.MatchStatus;
import com.sssp.common.enums.PositionCategory;
import com.sssp.common.exception.ResourceNotFoundException;
import com.sssp.gpi.dto.GPIHistoryPointDto;
import com.sssp.gpi.dto.GPIResponse;
import com.sssp.gpi.dto.GPIStatusResponse;
import com.sssp.gpi.GPIEngine;
import com.sssp.gpi.GPIPositionWeights;
import com.sssp.gpi.GPIHistory;
import com.sssp.gpi.GPIRecord;
import com.sssp.stats.repository.GPIHistoryRepository;
import com.sssp.gpi.GPIRecordRepository;
import com.sssp.player.PlayerProfile;
import com.sssp.player.PlayerProfileRepository;
import com.sssp.scout.ScoutObservation;
import com.sssp.scout.repository.ScoutObservationRepository;
import com.sssp.stats.PlayerMatchStatistics;
import com.sssp.stats.repository.PlayerMatchStatisticsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Authoritative GPI service implementing the Grassroots Player Index engine from gpi-app(2).
 */
@Service
@Transactional
public class GPIService {

    private final GPIRecordRepository gpiRecordRepository;
    private final GPIHistoryRepository gpiHistoryRepository;
    private final PlayerMatchStatisticsRepository playerMatchStatisticsRepository;
    private final UserRepository userRepository;
    private final PlayerProfileRepository playerProfileRepository;
    private final ScoutObservationRepository scoutObservationRepository;

    public GPIService(GPIRecordRepository gpiRecordRepository,
                      GPIHistoryRepository gpiHistoryRepository,
                      PlayerMatchStatisticsRepository playerMatchStatisticsRepository,
                      UserRepository userRepository,
                      PlayerProfileRepository playerProfileRepository,
                      ScoutObservationRepository scoutObservationRepository) {
        this.gpiRecordRepository = gpiRecordRepository;
        this.gpiHistoryRepository = gpiHistoryRepository;
        this.playerMatchStatisticsRepository = playerMatchStatisticsRepository;
        this.userRepository = userRepository;
        this.playerProfileRepository = playerProfileRepository;
        this.scoutObservationRepository = scoutObservationRepository;
    }

    /**
     * Recalculates a player's GPI status from all their matches.
     * If eligible (>= 10 official/competitive matches), updates performance attributes
     * (PAC, SHO, PAS, DRI, DEF, PHY) and records a new GPI history entry.
     */
    public GPIStatusResponse recalculatePlayerGPI(Long playerId) {
        User player = userRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with ID: " + playerId));

        PlayerProfile profile = playerProfileRepository.findByUserId(playerId)
                .orElseGet(() -> playerProfileRepository.save(
                        PlayerProfile.builder()
                                .user(player)
                                .fullName(player.getUsername())
                                .primaryPosition("CM")
                                .cardDesign("Bronze")
                                .cardTheme("light")
                                .build()
                ));

        List<PlayerMatchStatistics> allMatches = playerMatchStatisticsRepository.findByPlayerId(playerId);
        List<PlayerMatchStatistics> competitiveMatches = allMatches.stream()
                .filter(m -> "OFFICIAL".equalsIgnoreCase(m.getMatchKind())
                        || (m.getMatch() != null && m.getMatch().getStatus() == MatchStatus.COMPLETED))
                .collect(Collectors.toList());

        int competitiveCount = competitiveMatches.size();
        int totalMatches = allMatches.size();
        boolean eligible = competitiveCount >= GPIPositionWeights.MIN_COMPETITIVE_MATCHES;

        Double gpi = null;
        Map<String, Integer> perfAttrs = null;

        if (eligible) {
            // GPI is computed only from competitive/official matches
            gpi = GPIEngine.computeGPI(competitiveMatches);

            Optional<GPIHistory> lastHistory = gpiHistoryRepository.findTopByPlayerIdOrderByRecordedAtDesc(playerId);
            if (lastHistory.isEmpty() || Math.abs(lastHistory.get().getGpiValue() - gpi) > 0.001) {
                gpiHistoryRepository.save(GPIHistory.builder()
                        .player(player)
                        .gpiValue(gpi)
                        .competitiveMatches(competitiveCount)
                        .recordedAt(LocalDateTime.now())
                        .build());
            }

            perfAttrs = GPIEngine.computePerformanceAttributes(competitiveMatches);
            if (perfAttrs != null) {
                profile.setCurPac(perfAttrs.getOrDefault("PAC", 50));
                profile.setCurSho(perfAttrs.getOrDefault("SHO", 50));
                profile.setCurPas(perfAttrs.getOrDefault("PAS", 50));
                profile.setCurDri(perfAttrs.getOrDefault("DRI", 50));
                profile.setCurDef(perfAttrs.getOrDefault("DEF", 50));
                profile.setCurPhy(perfAttrs.getOrDefault("PHY", 50));
            }
            profile.setCurrentGpi(gpi);
            profile.setOverallRating((int) Math.round(gpi));
            profile.setGpiEligible(true);
        } else {
            // Before 10 matches, current attributes stay as player's initial baseline
            profile.setCurPac(profile.getOrigPac());
            profile.setCurSho(profile.getOrigSho());
            profile.setCurPas(profile.getOrigPas());
            profile.setCurDri(profile.getOrigDri());
            profile.setCurDef(profile.getOrigDef());
            profile.setCurPhy(profile.getOrigPhy());

            int avg = (int) Math.round((profile.getCurPac() + profile.getCurSho() + profile.getCurPas()
                    + profile.getCurDri() + profile.getCurDef() + profile.getCurPhy()) / 6.0);
            profile.setOverallRating(avg);
            profile.setCurrentGpi(null);
            profile.setGpiEligible(false);
        }

        profile.setCompetitiveMatches(competitiveCount);
        profile.setTotalMatches(totalMatches);
        playerProfileRepository.save(profile);

        // Synchronize GPIRecord for backward-compatibility with ranking / admin modules
        syncGPIRecord(player, profile, gpi, competitiveCount, eligible);

        return getGPIStatus(playerId);
    }

    public GPIStatusResponse getGPIStatus(Long playerId) {
        PlayerProfile profile = playerProfileRepository.findByUserId(playerId).orElse(null);

        List<PlayerMatchStatistics> allMatches = playerMatchStatisticsRepository.findByPlayerId(playerId);
        int totalMatches = allMatches.size();
        int competitiveCount = (int) allMatches.stream()
                .filter(m -> "OFFICIAL".equalsIgnoreCase(m.getMatchKind())
                        || (m.getMatch() != null && m.getMatch().getStatus() == MatchStatus.COMPLETED))
                .count();

        boolean eligible = competitiveCount >= GPIPositionWeights.MIN_COMPETITIVE_MATCHES;

        List<GPIHistory> historyList = gpiHistoryRepository.findByPlayerIdOrderByRecordedAtAsc(playerId);
        Double currentGPI = null;
        if (eligible && !historyList.isEmpty()) {
            currentGPI = Double.valueOf(historyList.get(historyList.size() - 1).getGpiValue());
        } else if (profile != null) {
            currentGPI = profile.getCurrentGpi();
        }

        Double previousGPI = null;
        if (eligible && historyList.size() > 1) {
            previousGPI = Double.valueOf(historyList.get(historyList.size() - 2).getGpiValue());
        }

        Map<String, Integer> currentAttrs = new LinkedHashMap<>();
        currentAttrs.put("PAC", profile != null ? profile.getCurPac() : 50);
        currentAttrs.put("SHO", profile != null ? profile.getCurSho() : 50);
        currentAttrs.put("PAS", profile != null ? profile.getCurPas() : 50);
        currentAttrs.put("DRI", profile != null ? profile.getCurDri() : 50);
        currentAttrs.put("DEF", profile != null ? profile.getCurDef() : 50);
        currentAttrs.put("PHY", profile != null ? profile.getCurPhy() : 50);

        int overall = profile != null ? profile.getOverallRating() : 50;

        Map<String, String> card = new HashMap<>();
        card.put("design", profile != null && profile.getCardDesign() != null ? profile.getCardDesign() : "Bronze");
        card.put("theme", profile != null && profile.getCardTheme() != null ? profile.getCardTheme() : "light");

        List<GPIHistoryPointDto> points = historyList.stream()
                .map(h -> new GPIHistoryPointDto(h.getGpiValue(), h.getRecordedAt()))
                .collect(Collectors.toList());

        return GPIStatusResponse.builder()
                .eligible(eligible)
                .competitiveCount(competitiveCount)
                .totalMatches(totalMatches)
                .minRequired(GPIPositionWeights.MIN_COMPETITIVE_MATCHES)
                .currentGPI(currentGPI)
                .previousGPI(previousGPI)
                .overall(overall)
                .attributes(currentAttrs)
                .card(card)
                .history(points)
                .build();
    }

    public GPIResponse calculateGPI(Long playerId) {
        recalculatePlayerGPI(playerId);
        return getGPIByPlayerId(playerId);
    }

    public GPIResponse getGPIByPlayerId(Long playerId) {
        User player = userRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with ID: " + playerId));
        PlayerProfile profile = playerProfileRepository.findByUserId(playerId).orElse(null);
        GPIStatusResponse status = getGPIStatus(playerId);

        GPIRecord record = gpiRecordRepository.findTopByPlayerIdOrderByComputedAtDesc(playerId).orElse(null);

        GPIResponse res = new GPIResponse();
        res.setPlayerId(playerId);
        res.setPlayerName(profile != null && profile.getFullName() != null ? profile.getFullName() : player.getUsername());
        res.setEligible(status.isEligible());
        res.setCompetitiveCount(status.getCompetitiveCount());
        res.setMinRequired(status.getMinRequired());
        res.setCurrentGPI(status.getCurrentGPI());
        res.setPreviousGPI(status.getPreviousGPI());
        res.setGpi(status.getCurrentGPI() != null ? status.getCurrentGPI() : (record != null ? record.getGpi() : 0.0));
        res.setOverall(status.getOverall());
        res.setMatchesConsidered(status.getCompetitiveCount());
        res.setRankingEligible(status.isEligible());
        res.setProvisional(!status.isEligible());
        res.setStatus(status.isEligible() ? "ESTABLISHED" : "PROVISIONAL");

        if (status.getAttributes() != null) {
            res.setPace(status.getAttributes().get("PAC"));
            res.setShooting(status.getAttributes().get("SHO"));
            res.setPassing(status.getAttributes().get("PAS"));
            res.setDribbling(status.getAttributes().get("DRI"));
            res.setDefense(status.getAttributes().get("DEF"));
            res.setPhysical(status.getAttributes().get("PHY"));
            res.setAttributes(status.getAttributes());
        }

        res.setCard(status.getCard());
        res.setHistory(status.getHistory());
        res.setComputedAt(record != null ? record.getComputedAt() : LocalDateTime.now());
        if (record != null) {
            res.setId(record.getId());
            res.setQuantitativeScore(record.getQuantitativeScore());
            res.setObservationScore(record.getObservationScore());
            res.setDataConfidence(record.getDataConfidence());
            res.setRecentForm(record.getRecentForm());
            res.setConsistency(record.getConsistency());
        }
        return res;
    }

    public List<GPIResponse> getAllGPIRecords() {
        return playerProfileRepository.findAll().stream()
                .map(p -> getGPIByPlayerId(p.getUser().getId()))
                .collect(Collectors.toList());
    }

    public List<GPIResponse> getGPIHistory(Long playerId) {
        return List.of(getGPIByPlayerId(playerId));
    }

    public GPIConfigResponse getConfig() {
        Map<String, Map<String, Double>> positionWeights = new HashMap<>();
        for (String pos : List.of("ST", "CF", "LW", "RW", "CAM", "CM", "CDM", "LB", "RB", "CB", "GK")) {
            positionWeights.put(pos, new HashMap<>(GPIPositionWeights.getWeights(pos)));
        }
        return GPIConfigResponse.builder()
                .positionWeights(positionWeights)
                .observationWeight(0.0)
                .quantitativeWeight(1.0)
                .minMatchesForEligibility(GPIPositionWeights.MIN_COMPETITIVE_MATCHES)
                .build();
    }

    public GPIConfigResponse updateConfig(GPIConfigRequest request) {
        return getConfig();
    }

    private void syncGPIRecord(User player, PlayerProfile profile, Double gpi, int competitiveCount, boolean eligible) {
        GPIRecord record = gpiRecordRepository.findTopByPlayerIdOrderByComputedAtDesc(player.getId())
                .orElse(new GPIRecord());
        record.setPlayer(player);
        record.setGpi(gpi != null ? gpi : (double) profile.getOverallRating());
        record.setQuantitativeScore(gpi != null ? gpi : (double) profile.getOverallRating());
        record.setMatchesConsidered(competitiveCount);
        record.setDataConfidence(competitiveCount < 2 ? DataConfidence.LOW : (competitiveCount < 5 ? DataConfidence.MEDIUM : DataConfidence.HIGH));
        record.setRankingEligible(eligible);
        record.setProvisional(!eligible);
        record.setStatus(eligible ? "ESTABLISHED" : "PROVISIONAL");
        record.setRecentForm(75.0);
        record.setConsistency(80.0);
        record.setComputedAt(LocalDateTime.now());
        gpiRecordRepository.save(record);
    }
}
