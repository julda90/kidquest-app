package com.KidQuest.kidquest_app.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TodayResponse {
    private RoutineTaskResponse routine;          // morning routine, kept for backward compatibility
    private List<RoutineTaskResponse> routines;   // all of today's routines (morning + evening)
    private List<TaskResponse> tasks;
}
