package com.KidQuest.kidquest_app.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ReturnRequest {
    private List<Integer> steps; // positions to mark as returned
}
