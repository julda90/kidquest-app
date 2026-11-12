package com.KidQuest.kidquest_app.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class ApproveRequest {
    private boolean onTime = true;
    @JsonAlias("bonus")
    private boolean selfChecked;
    private boolean noReminder;
    /** For team-effort tasks: the children who participated (each earns base + team bonus). */
    private List<UUID> teamParticipantIds;
}
