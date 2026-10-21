package com.KidQuest.kidquest_app.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class RoutineResponse {
    private UUID id;
    private UUID familyId;
    private UUID childId;
    private String name;
    private String deadline; // "HH:mm"
    private String daysOfWeek;
    private int pointValue;
    private boolean active;
    private List<StepItem> steps;

    @Getter
    @Setter
    public static class StepItem {
        private UUID id;
        private int position;
        private String label;
        private String icon;
    }
}
