package com.KidQuest.kidquest_app.model;

public enum TaskKind {
    TABLE("DUTY"),
    LAUNDRY("DUTY"),
    ROOM("DUTY"),
    HOMEWORK("SCHOOL"),
    WOOD("BIG"),
    KINDLING("BIG"),
    BIG_OTHER("BIG"),
    OTHER("OTHER"),
    ROUTINE("ROUTINE");

    private final String group;

    TaskKind(String group) {
        this.group = group;
    }

    public String group() {
        return group;
    }

    /** Standard default point value (age 6+) for form pre-fill. */
    public int defaultPoints() {
        return switch (this) {
            case TABLE     -> 10;
            case LAUNDRY   -> 15;
            case ROOM      -> 20;
            case HOMEWORK  -> 20;
            case WOOD      -> 30;
            case KINDLING  -> 40;
            case BIG_OTHER -> 40;
            case OTHER     -> 10;
            case ROUTINE   -> 10;
        };
    }

    /**
     * Default point value for form pre-fill. young = age &lt; 6.
     * Younger children earn a consistent ~60% of the standard value, rounded to
     * the nearest 5 (minimum 5), mirroring how level thresholds scale by age.
     */
    public int defaultPoints(boolean young) {
        int standard = defaultPoints();
        if (!young) return standard;
        return Math.max(5, (int) Math.round(standard * 0.6 / 5.0) * 5);
    }
}
