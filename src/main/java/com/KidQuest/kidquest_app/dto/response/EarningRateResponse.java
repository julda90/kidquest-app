package com.KidQuest.kidquest_app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class EarningRateResponse {
    private UUID childId;
    private double avgDaily;
}
