package com.KidQuest.kidquest_app.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class PointTransactionRequest {
    private Integer amount;
    private String reason;
    private UUID taskId;
}
