package com.KidQuest.kidquest_app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class RewardStatResponse {
    private UUID rewardId;
    private long purchases;
    private LocalDateTime lastPurchasedAt;
}
