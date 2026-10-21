package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.catalog.CatalogImportRequest;
import com.KidQuest.kidquest_app.dto.catalog.CatalogImportResult;
import com.KidQuest.kidquest_app.dto.catalog.CatalogRewardItem;
import com.KidQuest.kidquest_app.dto.catalog.CatalogTaskItem;
import com.KidQuest.kidquest_app.model.*;
import com.KidQuest.kidquest_app.repository.RewardRepository;
import com.KidQuest.kidquest_app.repository.TaskRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;

@Service
public class CatalogService {

    private final ObjectMapper objectMapper;
    private final TaskRepository taskRepository;
    private final RewardRepository rewardRepository;
    private final FamilyService familyService;
    private final ChildService childService;

    private List<CatalogTaskItem> taskCatalog;
    private List<CatalogRewardItem> rewardCatalog;

    public CatalogService(ObjectMapper objectMapper,
                          TaskRepository taskRepository,
                          RewardRepository rewardRepository,
                          FamilyService familyService,
                          ChildService childService) {
        this.objectMapper = objectMapper;
        this.taskRepository = taskRepository;
        this.rewardRepository = rewardRepository;
        this.familyService = familyService;
        this.childService = childService;
    }

    @PostConstruct
    public void loadCatalog() throws IOException {
        taskCatalog = objectMapper.readValue(
                new ClassPathResource("catalog/tasks.json").getInputStream(),
                new TypeReference<List<CatalogTaskItem>>() {});
        rewardCatalog = objectMapper.readValue(
                new ClassPathResource("catalog/rewards.json").getInputStream(),
                new TypeReference<List<CatalogRewardItem>>() {});
        validateUnique(taskCatalog.stream().map(CatalogTaskItem::getCatalogKey).toList(), "tasks");
        validateUnique(rewardCatalog.stream().map(CatalogRewardItem::getCatalogKey).toList(), "rewards");
        validateTaskKinds();
        validateRewardTiers();
    }

    private void validateUnique(List<String> keys, String label) {
        Set<String> seen = new HashSet<>();
        for (String k : keys) {
            if (!seen.add(k)) throw new IllegalStateException("Duplicate catalogKey in " + label + ": " + k);
        }
    }

    private void validateTaskKinds() {
        for (CatalogTaskItem item : taskCatalog) {
            TaskKind.valueOf(item.getKind()); // throws if invalid
        }
    }

    private void validateRewardTiers() {
        for (CatalogRewardItem item : rewardCatalog) {
            RewardTier.valueOf(item.getTier()); // throws if invalid
        }
    }

    public List<CatalogTaskItem> getTaskCatalog(UUID familyId) {
        return taskCatalog.stream().map(item -> {
            CatalogTaskItem copy = copyTask(item);
            copy.setAlreadyImported(taskRepository.existsByFamilyIdAndCatalogKeyAndDeletedAtIsNull(familyId, item.getCatalogKey()));
            return copy;
        }).toList();
    }

    public List<CatalogRewardItem> getRewardCatalog(UUID familyId) {
        return rewardCatalog.stream().map(item -> {
            CatalogRewardItem copy = copyReward(item);
            copy.setAlreadyImported(rewardRepository.existsByFamilyIdAndCatalogKey(familyId, item.getCatalogKey()));
            return copy;
        }).toList();
    }

    public CatalogImportResult importCatalog(UUID familyId, CatalogImportRequest req) {
        Family family = familyService.findById(familyId);
        int created = 0, skipped = 0;
        Map<String, UUID> assignments = req.getAssignments() != null ? req.getAssignments() : Map.of();
        Map<String, Integer> pricing = req.getPricingOverrides() != null ? req.getPricingOverrides() : Map.of();

        if (req.getTaskKeys() != null) {
            for (String key : req.getTaskKeys()) {
                if (taskRepository.existsByFamilyIdAndCatalogKeyAndDeletedAtIsNull(familyId, key)) {
                    skipped++;
                } else {
                    CatalogTaskItem tpl = taskCatalog.stream().filter(t -> t.getCatalogKey().equals(key)).findFirst().orElse(null);
                    if (tpl == null) { skipped++; continue; }
                    Task task = new Task();
                    task.setFamily(family);
                    task.setTitle(tpl.getTitle());
                    task.setDescription(tpl.getDescription());
                    task.setKind(TaskKind.valueOf(tpl.getKind()));
                    task.setPointValue(tpl.getPoints());
                    task.setBonusValue(tpl.getBonusValue());
                    task.setLatePointValue(tpl.getLatePointValue());
                    task.setNoReminderBonus(tpl.getNoReminderBonus());
                    task.setOpenQuest(tpl.isOpenQuest());
                    task.setDailyLimit(tpl.getDailyLimit() != null ? tpl.getDailyLimit() : 1);
                    task.setCatalogKey(key);
                    task.setStatus(TaskStatus.UNASSIGNED);
                    if (assignments.containsKey(key)) {
                        task.setAssignedTo(childService.findById(assignments.get(key)));
                        task.setStatus(TaskStatus.ASSIGNED);
                    }
                    taskRepository.save(task);
                    created++;
                }
            }
        }

        if (req.getRewardKeys() != null) {
            for (String key : req.getRewardKeys()) {
                if (rewardRepository.existsByFamilyIdAndCatalogKey(familyId, key)) {
                    skipped++;
                } else {
                    CatalogRewardItem tpl = rewardCatalog.stream().filter(r -> r.getCatalogKey().equals(key)).findFirst().orElse(null);
                    if (tpl == null) { skipped++; continue; }
                    Reward reward = new Reward();
                    reward.setFamily(family);
                    reward.setName(tpl.getName());
                    reward.setDescription(tpl.getDescription());
                    reward.setIcon(tpl.getIcon());
                    reward.setTier(RewardTier.valueOf(tpl.getTier()));
                    reward.setPointCost(pricing.getOrDefault(key, tpl.getPointCost()));
                    reward.setActive(true);
                    reward.setCatalogKey(key);
                    if (assignments.containsKey(key)) {
                        reward.setChild(childService.findById(assignments.get(key)));
                    }
                    rewardRepository.save(reward);
                    created++;
                }
            }
        }
        return new CatalogImportResult(created, skipped);
    }

    // ── Raw catalog access for tests ──────────────────────────────────────────

    public List<CatalogTaskItem> getRawTaskCatalog() { return taskCatalog; }
    public List<CatalogRewardItem> getRawRewardCatalog() { return rewardCatalog; }

    // ── Copy helpers ─────────────────────────────────────────────────────────

    private CatalogTaskItem copyTask(CatalogTaskItem src) {
        CatalogTaskItem c = new CatalogTaskItem();
        c.setCatalogKey(src.getCatalogKey()); c.setTitle(src.getTitle()); c.setKind(src.getKind());
        c.setPoints(src.getPoints()); c.setBonusValue(src.getBonusValue());
        c.setLatePointValue(src.getLatePointValue()); c.setNoReminderBonus(src.getNoReminderBonus());
        c.setOpenQuest(src.isOpenQuest());
        c.setDailyLimit(src.getDailyLimit()); c.setAudience(src.getAudience()); c.setDescription(src.getDescription());
        return c;
    }

    private CatalogRewardItem copyReward(CatalogRewardItem src) {
        CatalogRewardItem c = new CatalogRewardItem();
        c.setCatalogKey(src.getCatalogKey()); c.setName(src.getName()); c.setDescription(src.getDescription());
        c.setIcon(src.getIcon()); c.setTier(src.getTier()); c.setPointCost(src.getPointCost()); c.setAudience(src.getAudience());
        return c;
    }
}
