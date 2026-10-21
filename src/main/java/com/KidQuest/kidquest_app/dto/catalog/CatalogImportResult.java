package com.KidQuest.kidquest_app.dto.catalog;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CatalogImportResult {
    private int created;
    private int skipped;
}
