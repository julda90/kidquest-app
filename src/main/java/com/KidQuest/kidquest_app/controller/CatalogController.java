package com.KidQuest.kidquest_app.controller;

import com.KidQuest.kidquest_app.dto.catalog.CatalogImportRequest;
import com.KidQuest.kidquest_app.dto.catalog.CatalogImportResult;
import com.KidQuest.kidquest_app.dto.catalog.CatalogRewardItem;
import com.KidQuest.kidquest_app.dto.catalog.CatalogTaskItem;
import com.KidQuest.kidquest_app.service.CatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/api/catalog/tasks")
    public ResponseEntity<List<CatalogTaskItem>> getTaskCatalog(
            @RequestParam UUID familyId) {
        return ResponseEntity.ok(catalogService.getTaskCatalog(familyId));
    }

    @GetMapping("/api/catalog/rewards")
    public ResponseEntity<List<CatalogRewardItem>> getRewardCatalog(
            @RequestParam UUID familyId) {
        return ResponseEntity.ok(catalogService.getRewardCatalog(familyId));
    }

    @PostMapping("/api/families/{familyId}/catalog/import")
    public ResponseEntity<CatalogImportResult> importCatalog(
            @PathVariable UUID familyId,
            @RequestBody CatalogImportRequest request) {
        return ResponseEntity.ok(catalogService.importCatalog(familyId, request));
    }
}
