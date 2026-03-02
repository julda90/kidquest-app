package com.KidQuest.kidquest_app.dto.response;

import com.KidQuest.kidquest_app.model.TaskStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class TaskResponse {
    private UUID id;

    private String title;

    private UUID familyId;

    private UUID assignedTo;

    private Integer pointValue;

    private TaskStatus status;

    private String description;

    private LocalDate dueDate;

    private LocalDateTime createdAt;
}
