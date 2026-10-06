package com.sssp.player;

import com.sssp.user.User;
import com.sssp.common.entity.BaseEntity;
import com.sssp.common.enums.PositionCategory;
import com.sssp.common.enums.ProfileVisibility;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "player_profiles")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerProfile extends BaseEntity {

    @OneToOne
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    private User ownerCoach;

    private String fullName;
    private LocalDate dateOfBirth;
    private String location;
    private String preferredFoot;
    private String primaryPosition;
    private String secondaryPosition;

    @Enumerated(EnumType.STRING)
    private PositionCategory positionCategory;

    private String teamAcademy;

    @Column(columnDefinition = "TEXT")
    private String photoUrl;

    @Column(columnDefinition = "TEXT")
    private String biography;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ProfileVisibility visibility = ProfileVisibility.PUBLIC;

    // Card customization (from gpi-app(2))
    @Builder.Default
    private String cardDesign = "Bronze";

    @Builder.Default
    private String cardTheme = "light";

    // Original / editable baseline attributes (before 10 competitive matches)
    @Builder.Default
    private int origPac = 50;
    @Builder.Default
    private int origSho = 50;
    @Builder.Default
    private int origPas = 50;
    @Builder.Default
    private int origDri = 50;
    @Builder.Default
    private int origDef = 50;
    @Builder.Default
    private int origPhy = 50;

    // Current attributes (dynamically calculated once >= 10 competitive matches)
    @Builder.Default
    private int curPac = 50;
    @Builder.Default
    private int curSho = 50;
    @Builder.Default
    private int curPas = 50;
    @Builder.Default
    private int curDri = 50;
    @Builder.Default
    private int curDef = 50;
    @Builder.Default
    private int curPhy = 50;

    // GPI status
    private Double currentGpi;
    private Double previousGpi;

    @Builder.Default
    private int totalMatches = 0;

    @Builder.Default
    private int competitiveMatches = 0;

    @Builder.Default
    private boolean isGpiEligible = false;

    @Builder.Default
    private int overallRating = 50;
}
