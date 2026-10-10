package com.sssp.user;

import com.sssp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "organizer_profiles")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizerProfile extends BaseEntity {

    @OneToOne
    private User user;

    private String organization;
    private String affiliation;

    @Builder.Default
    private boolean verified = false;
}
