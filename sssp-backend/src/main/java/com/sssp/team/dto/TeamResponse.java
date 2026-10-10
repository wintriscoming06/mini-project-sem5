package com.sssp.team.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamResponse {
    private Long id;
    private Long tournamentId;
    private String tournamentName;
    private String name;
    private List<TeamMemberResponse> members;
}
