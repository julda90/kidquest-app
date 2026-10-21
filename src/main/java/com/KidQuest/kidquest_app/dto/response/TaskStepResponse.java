package com.KidQuest.kidquest_app.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class TaskStepResponse {
    private UUID id;
    private int position;
    private String label;
    private String icon;
    private LocalDateTime doneAt;
    private boolean returned;
}
