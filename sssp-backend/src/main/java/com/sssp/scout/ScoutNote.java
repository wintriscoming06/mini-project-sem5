package com.sssp.scout;

import com.sssp.user.User;
import com.sssp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scout_notes")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoutNote extends BaseEntity {

    @ManyToOne
    private User scout;

    @ManyToOne
    private User player;

    @Column(columnDefinition = "TEXT")
    private String note;

    private LocalDateTime notedAt;
}
