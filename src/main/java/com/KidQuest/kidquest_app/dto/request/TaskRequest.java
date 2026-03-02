package com.KidQuest.kidquest_app.dto.request;

import com.KidQuest.kidquest_app.model.TaskStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class TaskRequest {
    private String title;
    private String description;
    private Integer pointValue;
    private LocalDate dueDate;
    private TaskStatus status;
    private UUID childId;
}

