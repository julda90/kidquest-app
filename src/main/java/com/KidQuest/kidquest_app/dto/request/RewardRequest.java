package com.KidQuest.kidquest_app.dto.request;

import com.KidQuest.kidquest_app.model.RewardTier;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class RewardRequest {

    @NotBlank
    private String name;

    private String description;

    @NotNull
    @Positive
    private Integer pointCost;

    private Boolean active;

    private RewardTier tier;

    private String icon;

    private UUID childId;
    private String catalogKey;
    private Integer weeklyLimit;
}
