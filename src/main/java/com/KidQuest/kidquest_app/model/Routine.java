package com.KidQuest.kidquest_app.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "routine")
@Getter
@Setter
public class Routine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "family_id", nullable = false)
    private Family family;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @Column(nullable = false, length = 100)
    private String name = "Ranní rutina";

    @Column(nullable = false)
    private LocalTime deadline = LocalTime.of(7, 30);

    @Column(name = "days_of_week", nullable = false, length = 20)
    private String daysOfWeek = "1,2,3,4,5";

    @Column(name = "point_value", nullable = false)
    private int pointValue = 10;

    @Column(nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "routine", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("position ASC")
    private List<RoutineStep> steps = new ArrayList<>();
}
