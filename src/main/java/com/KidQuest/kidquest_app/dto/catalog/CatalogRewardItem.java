package com.KidQuest.kidquest_app.dto.catalog;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class CatalogRewardItem {
    private String catalogKey;
    private String name;
    private String description;
    private String icon;
    private String tier;
    private int pointCost;
    private String audience;
    private boolean alreadyImported;
}
