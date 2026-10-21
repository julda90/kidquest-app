package com.KidQuest.kidquest_app.dto.response;

import com.KidQuest.kidquest_app.model.Badge;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProgressResponse {
    private int balance;
    private int xp;
    private int level;
    private String levelName;
    private int currentThreshold;
    private Integer nextThreshold;
    private double progressPct;
    private int streakDays;
    private boolean jokerUsedThisWeek;
    private List<Badge> badges;
    private List<BadgeInfoResponse> badgeInfo;
    private boolean chestAvailable;
    private int pendingRedemptionPoints;

    // Records
    private int recordTotalTasks;
    private int recordLongestStreak;
    private int recordBestDayTasks;
}
