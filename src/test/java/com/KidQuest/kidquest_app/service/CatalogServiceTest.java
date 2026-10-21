package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.catalog.CatalogRewardItem;
import com.KidQuest.kidquest_app.dto.catalog.CatalogTaskItem;
import com.KidQuest.kidquest_app.model.RewardTier;
import com.KidQuest.kidquest_app.model.TaskKind;
import com.KidQuest.kidquest_app.repository.RewardRepository;
import com.KidQuest.kidquest_app.repository.TaskRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class CatalogServiceTest {

    @Mock private TaskRepository taskRepository;
    @Mock private RewardRepository rewardRepository;
    @Mock private FamilyService familyService;
    @Mock private ChildService childService;

    private CatalogService catalogService;

    @BeforeEach
    void setUp() throws IOException {
        catalogService = new CatalogService(new ObjectMapper(), taskRepository, rewardRepository, familyService, childService);
        catalogService.loadCatalog();
    }

    @Test
    void catalogLoadsWithItems() {
        assertFalse(catalogService.getRawTaskCatalog().isEmpty(), "task catalog must not be empty");
        assertFalse(catalogService.getRawRewardCatalog().isEmpty(), "reward catalog must not be empty");
    }

    @Test
    void taskCatalogKeysAreUnique() {
        var keys = catalogService.getRawTaskCatalog().stream()
                .map(CatalogTaskItem::getCatalogKey).collect(Collectors.toList());
        assertEquals(keys.size(), Set.copyOf(keys).size(), "task catalogKeys must be unique");
    }

    @Test
    void rewardCatalogKeysAreUnique() {
        var keys = catalogService.getRawRewardCatalog().stream()
                .map(CatalogRewardItem::getCatalogKey).collect(Collectors.toList());
        assertEquals(keys.size(), Set.copyOf(keys).size(), "reward catalogKeys must be unique");
    }

    @Test
    void allTaskKindsAreValidEnums() {
        for (CatalogTaskItem item : catalogService.getRawTaskCatalog()) {
            assertDoesNotThrow(() -> TaskKind.valueOf(item.getKind()),
                    "Invalid TaskKind: " + item.getKind());
        }
    }

    @Test
    void allRewardTiersAreValidEnums() {
        for (CatalogRewardItem item : catalogService.getRawRewardCatalog()) {
            assertDoesNotThrow(() -> RewardTier.valueOf(item.getTier()),
                    "Invalid RewardTier: " + item.getTier());
        }
    }
}
