package com.KidQuest.kidquest_app.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "family_goal")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public class FamilyGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "family_id", nullable = false)
    private Family family;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "target_points", nullable = false)
    private Integer targetPoints;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "reached_at")
    private LocalDateTime reachedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
}
