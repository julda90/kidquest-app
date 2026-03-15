package com.KidQuest.kidquest_app.dto.request;

import com.KidQuest.kidquest_app.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateUserRequest {
    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 6, message = "Minimal length of password is 6 characters")
    private String password;

    @NotNull
    private Role role;

    private UUID familyId;
}
