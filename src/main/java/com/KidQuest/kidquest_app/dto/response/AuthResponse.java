package com.KidQuest.kidquest_app.dto.response;

import com.KidQuest.kidquest_app.model.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResponse {
    private String token;
    private Role role;

    public AuthResponse(String token, Role role) {
        this.token = token;
        this.role = role;
    }
}
