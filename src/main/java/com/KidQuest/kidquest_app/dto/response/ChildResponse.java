package com.KidQuest.kidquest_app.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class ChildResponse {
    private UUID id;

    private UUID familyId;

    private String name;

    private Integer age;

    private String avatar;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
