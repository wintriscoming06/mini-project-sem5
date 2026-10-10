package com.sssp.player.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttributesUpdateRequest {
    @JsonProperty("PAC")
    private Integer PAC;

    @JsonProperty("SHO")
    private Integer SHO;

    @JsonProperty("PAS")
    private Integer PAS;

    @JsonProperty("DRI")
    private Integer DRI;

    @JsonProperty("DEF")
    private Integer DEF;

    @JsonProperty("PHY")
    private Integer PHY;
}
