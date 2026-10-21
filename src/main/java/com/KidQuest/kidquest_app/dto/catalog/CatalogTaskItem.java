package com.KidQuest.kidquest_app.dto.catalog;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class CatalogTaskItem {
    private String catalogKey;
    private String title;
    private String kind;
    private int points;
    private int bonusValue;
    private boolean openQuest;
    private Integer dailyLimit;
    private String audience;
    private String description;
    private boolean alreadyImported;
}
