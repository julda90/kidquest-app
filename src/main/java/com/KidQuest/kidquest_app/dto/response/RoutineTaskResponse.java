package com.KidQuest.kidquest_app.dto.response;

import com.KidQuest.kidquest_app.model.TaskStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class RoutineTaskResponse {
    private UUID taskId;
    private String name;
    private List<TaskStepResponse> steps;
    private TaskStatus status;
    private String deadline; // "HH:mm"
    private boolean locked;
    private boolean onTimeEligible; // firstSubmittedOnTime == true → can resubmit after deadline
    private int pointValue;
    private List<Integer> returnedSteps; // positions of returned steps
    private LocalDateTime submittedAt;
}
