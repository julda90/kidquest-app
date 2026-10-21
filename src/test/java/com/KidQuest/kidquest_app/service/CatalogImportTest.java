package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.catalog.CatalogImportRequest;
import com.KidQuest.kidquest_app.dto.catalog.CatalogImportResult;
import com.KidQuest.kidquest_app.model.*;
import com.KidQuest.kidquest_app.repository.RewardRepository;
import com.KidQuest.kidquest_app.repository.TaskRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class CatalogImportTest {

    @Mock private TaskRepository taskRepository;
    @Mock private RewardRepository rewardRepository;
    @Mock private FamilyService familyService;
    @Mock private ChildService childService;

    private CatalogService catalogService;
    private final UUID familyId = UUID.randomUUID();

    @BeforeEach
    void setUp() throws IOException {
        catalogService = new CatalogService(new ObjectMapper(), taskRepository, rewardRepository, familyService, childService);
        catalogService.loadCatalog();
        Family family = new Family();
        family.setId(familyId);
        when(familyService.findById(familyId)).thenReturn(family);
        when(taskRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(rewardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void importCreatesNewItems() {
        when(taskRepository.existsByFamilyIdAndCatalogKeyAndDeletedAtIsNull(any(), any())).thenReturn(false);
        when(rewardRepository.existsByFamilyIdAndCatalogKey(any(), any())).thenReturn(false);

        CatalogImportRequest req = new CatalogImportRequest();
        req.setTaskKeys(List.of("table", "bed", "room"));
        req.setRewardKeys(List.of());

        CatalogImportResult result = catalogService.importCatalog(familyId, req);
        assertEquals(3, result.getCreated());
        assertEquals(0, result.getSkipped());
        verify(taskRepository, times(3)).save(any(Task.class));
    }

    @Test
    void reimportSkipsExistingItems() {
        when(taskRepository.existsByFamilyIdAndCatalogKeyAndDeletedAtIsNull(any(), any())).thenReturn(true);
        when(rewardRepository.existsByFamilyIdAndCatalogKey(any(), any())).thenReturn(false);

        CatalogImportRequest req = new CatalogImportRequest();
        req.setTaskKeys(List.of("table", "bed", "room"));
        req.setRewardKeys(List.of());

        CatalogImportResult result = catalogService.importCatalog(familyId, req);
        assertEquals(0, result.getCreated());
        assertEquals(3, result.getSkipped());
        verify(taskRepository, never()).save(any());
    }

    @Test
    void youngRewardWithAssignmentSetsChildId() {
        when(rewardRepository.existsByFamilyIdAndCatalogKey(any(), any())).thenReturn(false);
        UUID childId = UUID.randomUUID();
        Child child = new Child();
        child.setId(childId);
        when(childService.findById(childId)).thenReturn(child);

        CatalogImportRequest req = new CatalogImportRequest();
        req.setTaskKeys(List.of());
        req.setRewardKeys(List.of("y_sticker"));
        req.setAssignments(Map.of("y_sticker", childId));

        CatalogImportResult result = catalogService.importCatalog(familyId, req);
        assertEquals(1, result.getCreated());

        verify(rewardRepository).save(argThat(r -> r.getChild() != null && r.getChild().getId().equals(childId)));
    }
}
