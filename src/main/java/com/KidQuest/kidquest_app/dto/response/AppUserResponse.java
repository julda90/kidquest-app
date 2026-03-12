package com.KidQuest.kidquest_app.dto.response;

import com.KidQuest.kidquest_app.model.Role;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class AppUserResponse {
    private String email;
    private UUID id;
    private Role role;
    private UUID familyId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
