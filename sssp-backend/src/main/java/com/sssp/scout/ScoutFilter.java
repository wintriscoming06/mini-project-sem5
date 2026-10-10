package com.sssp.scout;

import com.sssp.user.User;
import com.sssp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "scout_filters")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoutFilter extends BaseEntity {

    @ManyToOne
    private User scout;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String criteriaJson;
}
