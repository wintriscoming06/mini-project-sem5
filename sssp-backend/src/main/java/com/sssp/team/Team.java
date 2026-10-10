package com.sssp.team;

import com.sssp.tournament.Tournament;

import com.sssp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "teams")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Team extends BaseEntity {

    @ManyToOne
    private Tournament tournament;

    private String name;
}
