package com.KidQuest.kidquest_app.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PointTransactionRequest {

    @NotNull
    private Integer amount;

    @NotBlank
    private String reason;
}
