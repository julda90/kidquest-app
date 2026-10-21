package com.KidQuest.kidquest_app.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class ApproveBatchRequest {
    private List<UUID> taskIds;
}
