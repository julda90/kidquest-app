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

    /** Default point value for form pre-fill. young = age < 6. */
    public int defaultPoints(boolean young) {
        return switch (this) {
            case TABLE    -> 10;
            case LAUNDRY  -> young ? 10 : 15;
            case ROOM     -> young ? 15 : 20;
            case HOMEWORK -> 20;
            case WOOD     -> young ? 10 : 30;
            case KINDLING -> 40;
            case BIG_OTHER -> 40;
            case OTHER    -> 10;
            case ROUTINE  -> young ? 5 : 10;
        };
    }
}
