package com.KidQuest.kidquest_app.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "task_step")
@Getter
@Setter
public class TaskStep {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Column(nullable = false)
    private int position;

    @Column(nullable = false, length = 40)
    private String label;

    @Column(nullable = false, length = 16)
    private String icon;

    @Column(name = "done_at")
    private LocalDateTime doneAt;

    @Column(nullable = false)
    private boolean returned = false;
}
