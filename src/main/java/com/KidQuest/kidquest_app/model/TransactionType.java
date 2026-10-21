package com.KidQuest.kidquest_app.model;

public enum TransactionType {
    TASK(true),
    BONUS(true),
    STREAK(true),
    CHEST(true),
    REDEEM(false),
    MANUAL(false);

    private final boolean xp;

    TransactionType(boolean xp) {
        this.xp = xp;
    }

    public boolean countsToXp() {
        return xp;
    }
}
