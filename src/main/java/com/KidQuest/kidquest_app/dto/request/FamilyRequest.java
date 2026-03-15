package com.KidQuest.kidquest_app.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FamilyRequest {
    @NotBlank
    private String name;
}
