package com.KidQuest.kidquest_app.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class PointTransactionResponse {
    private UUID id;
    private UUID childId;
    private Integer amount;
    private String reason;
    private LocalDateTime createdAt;
}
