package com.KidQuest.kidquest_app.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class BadgeInfoResponse {
    private String badge;
    private boolean earned;
    private LocalDateTime earnedAt;
    private Integer current;
    private Integer target;
}
