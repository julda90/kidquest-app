package com.KidQuest.kidquest_app.dto.request;

import com.KidQuest.kidquest_app.model.Role;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class RegisterRequest {
    private String email;
    private String password;
    private Role role;
    private UUID familyId;
}
