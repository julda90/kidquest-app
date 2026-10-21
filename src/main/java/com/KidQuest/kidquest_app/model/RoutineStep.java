package com.KidQuest.kidquest_app.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "routine_step")
@Getter
@Setter
public class RoutineStep {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routine_id", nullable = false)
    private Routine routine;

    @Column(nullable = false)
    private int position;

    @Column(nullable = false, length = 40)
    private String label;

    @Column(nullable = false, length = 16)
    private String icon;
}
