package com.sssp.ranking;

import com.sssp.ranking.dto.RankingResponse;
import com.sssp.ranking.RankingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rankings")
public class RankingController {

    private final RankingService rankingService;

    public RankingController(RankingService rankingService) {
        this.rankingService = rankingService;
    }

    @GetMapping({"", "/"})
    public List<RankingResponse> getRankingsByContext(@RequestParam(defaultValue = "OVERALL") String context) {
        return rankingService.getRankingsByContext(context);
    }

    @GetMapping("/contexts")
    public List<String> getAvailableContexts() {
        return rankingService.getAvailableContexts();
    }

    @PostMapping("/calculate")
    public void calculateRankings() {
        rankingService.calculateRankings();
    }
}
