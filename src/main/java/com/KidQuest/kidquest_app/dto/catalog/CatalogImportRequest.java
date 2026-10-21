package com.KidQuest.kidquest_app.dto.catalog;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
public class CatalogImportRequest {
    private List<String> taskKeys;
    private List<String> rewardKeys;
    /** catalogKey -> childId for YOUNG items */
    private Map<String, UUID> assignments;
    /** catalogKey -> custom pointCost (optional overrides) */
    private Map<String, Integer> pricingOverrides;
}
