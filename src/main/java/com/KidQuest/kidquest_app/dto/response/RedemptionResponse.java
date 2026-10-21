package com.KidQuest.kidquest_app.dto.response;

import com.KidQuest.kidquest_app.model.RedemptionStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class RedemptionResponse {
    private UUID id;
    private UUID rewardId;
    private String rewardName;
    private String rewardIcon;
    private UUID childId;
    private String childName;
    private Integer pointCost;
    private RedemptionStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime cancelledAt;
}
