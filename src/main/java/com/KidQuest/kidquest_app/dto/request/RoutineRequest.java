package com.KidQuest.kidquest_app.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class RoutineRequest {
    private UUID childId;
    private String name;
    private String deadline; // "HH:mm"
    private String daysOfWeek; // e.g. "1,2,3,4,5"
    private Integer pointValue;
    private Boolean active;
    private List<StepItem> steps;

    @Getter
    @Setter
    public static class StepItem {
        private int position;
        private String label;
        private String icon;
    }
}
