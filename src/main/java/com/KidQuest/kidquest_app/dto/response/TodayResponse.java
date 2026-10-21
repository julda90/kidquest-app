package com.KidQuest.kidquest_app.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TodayResponse {
    private RoutineTaskResponse routine; // null if no routine today
    private List<TaskResponse> tasks;
}
