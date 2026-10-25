package com.sssp.scout;

import com.sssp.common.entity.BaseEntity;
import com.sssp.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "scout_contact_requests")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoutContactRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scout_id", nullable = false)
    private User scout;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    private User player;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false, length = 32)
    private String scoutContactNumber;

    @Column(length = 255)
    private String scoutOrganization;

    @Column(length = 255)
    private String scoutName;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 32)
    private ContactRequestStatus status = ContactRequestStatus.PENDING;
}
