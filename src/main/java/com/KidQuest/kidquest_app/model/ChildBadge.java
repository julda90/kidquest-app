package com.KidQuest.kidquest_app.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "child_badge",
    uniqueConstraints = @UniqueConstraint(columnNames = {"child_id", "badge"})
)
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public class ChildBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Badge badge;

    @CreatedDate
    @Column(name = "earned_at", nullable = false, updatable = false)
    private LocalDateTime earnedAt;
}
