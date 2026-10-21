package com.KidQuest.kidquest_app.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name="task")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id")
    private Child assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "family_id", nullable = false)
    private Family family;

    @Enumerated(EnumType.STRING)
    private TaskStatus status;

    @Column(name="point_value")
    private Integer pointValue;

    @Column(name="due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 30, nullable = false)
    private TaskKind kind = TaskKind.OTHER;

    @Column(name = "bonus_value", nullable = false)
    private Integer bonusValue = 0;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @CreatedDate
    @Column(name="created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name="updated_at",nullable = false)
    private LocalDateTime updatedAt;

    @Column(name="deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "is_open_quest", nullable = false)
    private boolean openQuest = false;

    @Column(name = "template_id")
    private UUID templateId;

    @Column(name = "daily_limit", nullable = false)
    private int dailyLimit = 1;

    @Column(name = "catalog_key", length = 50)
    private String catalogKey;

    @Column(name = "late_point_value")
    private Integer latePointValue;

    @Column(name = "no_reminder_bonus", nullable = false)
    private int noReminderBonus = 0;

    @Column(name = "routine_id")
    private UUID routineId;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "first_submitted_on_time")
    private Boolean firstSubmittedOnTime;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("position ASC")
    private List<TaskStep> steps = new ArrayList<>();
}
