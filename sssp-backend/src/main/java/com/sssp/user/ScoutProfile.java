package com.sssp.user;

import com.sssp.user.User;
import com.sssp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "scout_profiles")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoutProfile extends BaseEntity {

    @OneToOne
    private User user;

    private String affiliation;
    private String organization;

    @Builder.Default
    private boolean verified = false;
}
