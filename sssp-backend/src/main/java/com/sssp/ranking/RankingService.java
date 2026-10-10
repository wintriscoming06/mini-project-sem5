package com.sssp.ranking;

import com.sssp.user.User;
import com.sssp.user.UserRepository;
import com.sssp.common.enums.PositionCategory;
import com.sssp.gpi.GPIRecord;
import com.sssp.gpi.GPIRecordRepository;
import com.sssp.player.PlayerProfile;
import com.sssp.player.PlayerProfileRepository;
import com.sssp.ranking.dto.RankingResponse;
import com.sssp.ranking.RankingRecord;
import com.sssp.ranking.RankingRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RankingService {

    private final RankingRecordRepository rankingRecordRepository;
    private final GPIRecordRepository gpiRecordRepository;
    private final UserRepository userRepository;
    private final PlayerProfileRepository playerProfileRepository;

    public RankingService(RankingRecordRepository rankingRecordRepository,
                          GPIRecordRepository gpiRecordRepository,
                          UserRepository userRepository,
                          PlayerProfileRepository playerProfileRepository) {
        this.rankingRecordRepository = rankingRecordRepository;
        this.gpiRecordRepository = gpiRecordRepository;
        this.userRepository = userRepository;
        this.playerProfileRepository = playerProfileRepository;
    }

    public void calculateRankings() {
        List<GPIRecord> allLatest = gpiRecordRepository.findAll().stream()
                .filter(GPIRecord::isRankingEligible)
                .collect(Collectors.groupingBy(g -> g.getPlayer().getId()))
                .values().stream()
                .map(list -> list.stream().max(Comparator.comparing(GPIRecord::getComputedAt, Comparator.nullsFirst(Comparator.naturalOrder()))).orElse(null))
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());

        // Highest GPI first; ties broken by data confidence, matches considered, recent form, consistency (all descending).
        allLatest.sort(Comparator.comparingDouble(GPIRecord::getGpi).reversed()
                .thenComparing(Comparator.comparingInt((GPIRecord g) -> g.getDataConfidence() == null ? -1 : g.getDataConfidence().ordinal()).reversed())
                .thenComparing(Comparator.comparingInt(GPIRecord::getMatchesConsidered).reversed())
                .thenComparing(Comparator.comparingDouble(GPIRecord::getRecentForm).reversed())
                .thenComparing(Comparator.comparingDouble(GPIRecord::getConsistency).reversed()));

        rankingRecordRepository.deleteAllInBatch(); // simple MVP approach

        List<RankingRecord> recordsToSave = new ArrayList<>();
        int rank = 1;
        for (GPIRecord gpi : allLatest) {
            RankingRecord r = new RankingRecord();
            r.setPlayer(gpi.getPlayer());
            r.setContext("OVERALL");
            r.setRankValue(rank++);
            r.setGpiValue(gpi.getGpi());
            r.setComputedAt(LocalDateTime.now());
            recordsToSave.add(r);
        }

        for (PositionCategory pos : PositionCategory.values()) {
            List<GPIRecord> posLatest = allLatest.stream()
                    .filter(g -> {
                        PlayerProfile p = playerProfileRepository.findByUserId(g.getPlayer().getId()).orElse(null);
                        return p != null && p.getPositionCategory() == pos;
                    })
                    .collect(Collectors.toList());

            int posRank = 1;
            for (GPIRecord gpi : posLatest) {
                RankingRecord r = new RankingRecord();
                r.setPlayer(gpi.getPlayer());
                r.setContext("POSITION:" + pos.name());
                r.setRankValue(posRank++);
                r.setGpiValue(gpi.getGpi());
                r.setComputedAt(LocalDateTime.now());
                recordsToSave.add(r);
            }
        }

        rankingRecordRepository.saveAll(recordsToSave);
    }

    public List<RankingResponse> calculateRankingsForPlayer(Long playerId) {
        calculateRankings();
        return getPlayerRankings(playerId);
    }

    public List<RankingResponse> getPlayerRankings(Long playerId) {
        return rankingRecordRepository.findByPlayerId(playerId)
                .stream().map(this::mapToRankingResponse).collect(Collectors.toList());
    }

    public List<RankingResponse> getRankingsByContext(String context) {
        return rankingRecordRepository.findByContextOrderByRankValueAsc(context)
                .stream().map(this::mapToRankingResponse).collect(Collectors.toList());
    }

    public List<String> getAvailableContexts() {
        List<String> contexts = new ArrayList<>();
        contexts.add("OVERALL");
        for(PositionCategory pc : PositionCategory.values()) {
            contexts.add("POSITION:" + pc.name());
        }
        return contexts;
    }

    private RankingResponse mapToRankingResponse(RankingRecord r) {
        RankingResponse res = new RankingResponse();
        res.setId(r.getId());
        res.setPlayerId(r.getPlayer().getId());
        res.setPlayerName(playerDisplayName(r.getPlayer()));
        res.setContext(r.getContext());
        res.setRankValue(r.getRankValue());
        res.setGpiValue(r.getGpiValue());
        res.setComputedAt(r.getComputedAt());
        return res;
    }

    private String playerDisplayName(User user) {
        return playerProfileRepository.findByUserId(user.getId())
                .map(PlayerProfile::getFullName)
                .filter(name -> name != null && !name.isBlank())
                .orElse(user.getUsername());
    }
}
