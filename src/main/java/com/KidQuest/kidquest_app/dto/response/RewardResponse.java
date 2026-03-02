package com.KidQuest.kidquest_app.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class RewardResponse {
    private UUID id;
    private UUID familyId;
    private String name;
    private String description;
    private Integer pointCost;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
