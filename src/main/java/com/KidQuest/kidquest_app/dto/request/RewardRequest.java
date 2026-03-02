package com.KidQuest.kidquest_app.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RewardRequest {
    private String name;
    private String description;
    private Integer pointCost;
    private Boolean active;
}
