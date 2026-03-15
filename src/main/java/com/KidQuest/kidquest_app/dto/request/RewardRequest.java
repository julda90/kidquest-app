package com.KidQuest.kidquest_app.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

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
}
