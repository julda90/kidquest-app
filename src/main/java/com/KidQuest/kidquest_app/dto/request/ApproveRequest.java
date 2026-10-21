package com.KidQuest.kidquest_app.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApproveRequest {
    private boolean onTime = true;
    @JsonAlias("bonus")
    private boolean selfChecked;
    private boolean noReminder;
}
