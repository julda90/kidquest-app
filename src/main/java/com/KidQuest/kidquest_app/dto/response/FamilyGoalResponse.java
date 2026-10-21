package com.KidQuest.kidquest_app.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class FamilyGoalResponse {
    private UUID id;
    private UUID familyId;
    private String name;
    private int targetPoints;
    private int currentProgress;
    private double progressPct;
    private LocalDateTime createdAt;
    private LocalDateTime reachedAt;
    private LocalDateTime cancelledAt;
}
