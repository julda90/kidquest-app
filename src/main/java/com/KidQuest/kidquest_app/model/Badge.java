package com.KidQuest.kidquest_app.model;

public enum Badge {
    // ── Existing ──────────────────────────────────────────────────────────────
    LUMBERJACK(Tier.COMMON),
    SHERLOCK(Tier.COMMON),
    SELF_STARTER(Tier.COMMON),
    HEAD_WAITER(Tier.COMMON),
    TIDY(Tier.COMMON),
    LAUNDRY_PRO(Tier.COMMON),
    STREAK_7(Tier.COMMON),
    STREAK_30(Tier.RARE),
    EARLY_BIRD(Tier.COMMON),
    FIRST_REWARD(Tier.COMMON),
    TEAM_PLAYER(Tier.COMMON),

    // ── Task milestones ───────────────────────────────────────────────────────
    TASK_100(Tier.COMMON),
    TASK_250(Tier.RARE),
    TASK_500(Tier.LEGENDARY),

    // ── Morning routine ───────────────────────────────────────────────────────
    ROUTINE_STREAK_14(Tier.RARE),
    ROUTINE_30_ONTIME(Tier.RARE),

    // ── Homework ──────────────────────────────────────────────────────────────
    HOMEWORK_CLEAN_5(Tier.COMMON),
    HOMEWORK_NO_REMIND_10(Tier.RARE),
    HOMEWORK_PERFECT_20(Tier.LEGENDARY),

    // ── Variety ───────────────────────────────────────────────────────────────
    VARIETY_WEEK(Tier.COMMON),
    VARIETY_ALL(Tier.RARE),

    // ── Family goals ──────────────────────────────────────────────────────────
    FAMILY_5(Tier.COMMON),
    FAMILY_20(Tier.RARE),
    FAMILY_CAPTAIN(Tier.RARE),

    // ── Extended streaks ──────────────────────────────────────────────────────
    STREAK_14(Tier.RARE),
    STREAK_60(Tier.LEGENDARY),

    // ── Savings & rewards ─────────────────────────────────────────────────────
    SAVER_1000(Tier.RARE),
    MEGA_REWARD(Tier.RARE),
    COLLECTOR_5(Tier.RARE),

    // ── Seasonal ──────────────────────────────────────────────────────────────
    XMAS_15(Tier.COMMON),
    EASTER_10(Tier.COMMON),
    BIRTHDAY(Tier.COMMON),
    SUMMER_30(Tier.RARE),

    // ── Complex legendary ─────────────────────────────────────────────────────
    PET_GUARDIAN(Tier.LEGENDARY),
    GAME_DAY(Tier.LEGENDARY),
    CHEF(Tier.LEGENDARY);

    public enum Tier { COMMON, RARE, LEGENDARY }

    private final Tier tier;

    Badge(Tier tier) {
        this.tier = tier;
    }

    public Tier tier() {
        return tier;
    }
}
