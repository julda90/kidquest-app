package com.KidQuest.kidquest_app.dto.response;

import com.KidQuest.kidquest_app.model.Badge;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ApprovalResult {
    private TaskResponse task;
    private int awardedPoints;
    private List<Badge> newBadges;
    private boolean levelUp;
    private int newLevel;
    private int streakDays;
    private boolean goalReached;
}
