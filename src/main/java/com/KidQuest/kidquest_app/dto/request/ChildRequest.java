package com.KidQuest.kidquest_app.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChildRequest {

    @NotBlank
    private String name;

    @Positive
    @NotNull
    private Integer age;

    private String avatar;
}
