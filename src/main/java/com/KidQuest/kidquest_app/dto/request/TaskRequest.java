package com.KidQuest.kidquest_app.dto.request;

import com.KidQuest.kidquest_app.model.Child;
import com.KidQuest.kidquest_app.model.Family;
import com.KidQuest.kidquest_app.model.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class TaskRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    @Positive
    private Integer pointValue;

    private LocalDate dueDate;

    private TaskStatus status;

    private UUID assignedToId;
}

