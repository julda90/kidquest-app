package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.request.RewardRequest;
import com.KidQuest.kidquest_app.dto.response.RewardResponse;
import com.KidQuest.kidquest_app.dto.response.RewardStatResponse;
import com.KidQuest.kidquest_app.exception.ConflictException;
import com.KidQuest.kidquest_app.exception.ResourceNotFoundException;
import com.KidQuest.kidquest_app.model.Reward;
import com.KidQuest.kidquest_app.repository.RewardRedemptionRepository;
import com.KidQuest.kidquest_app.repository.RewardRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class RewardService {

    private final RewardRepository rewardRepository;
    private final RewardRedemptionRepository redemptionRepository;
    private final FamilyService familyService;
    private final ChildService childService;

    public RewardService(RewardRepository rewardRepository,
                         RewardRedemptionRepository redemptionRepository,
                         FamilyService familyService,
                         ChildService childService) {
        this.rewardRepository = rewardRepository;
        this.redemptionRepository = redemptionRepository;
        this.familyService = familyService;
        this.childService = childService;
    }

    private Reward findEntityById(UUID rewardId) {
        return rewardRepository.findById(rewardId)
                .orElseThrow(() -> new ResourceNotFoundException("No such reward with id: " + rewardId));
    }

    public RewardResponse findById(UUID rewardId) {
        return response(findEntityById(rewardId));
    }

    public List<RewardResponse> findByFamilyId(UUID familyId, boolean includeArchived) {
        List<Reward> rewards = includeArchived
                ? rewardRepository.findByFamilyId(familyId)
                : rewardRepository.findActiveByFamilyId(familyId);
        return rewards.stream().map(this::response).toList();
    }

    public List<RewardResponse> findByFamilyId(UUID familyId) {
        return findByFamilyId(familyId, false);
    }

    public RewardResponse create(UUID familyId, RewardRequest rewardRequest) {
        Reward reward = new Reward();
        applyRequest(reward, rewardRequest);
        reward.setFamily(familyService.findById(familyId));
        if (rewardRequest.getCatalogKey() != null) reward.setCatalogKey(rewardRequest.getCatalogKey());
        return response(rewardRepository.save(reward));
    }

    public RewardResponse update(UUID rewardId, RewardRequest updatedReward) {
        Reward existing = findEntityById(rewardId);
        applyRequest(existing, updatedReward);
        return response(rewardRepository.save(existing));
    }

    public void delete(UUID rewardId) {
        findEntityById(rewardId);
        if (redemptionRepository.existsByRewardId(rewardId)) {
            throw new ConflictException("Odměnu už někdo koupil, můžete ji jen archivovat.");
        }
        rewardRepository.deleteById(rewardId);
    }

    public RewardResponse archive(UUID rewardId) {
        Reward reward = findEntityById(rewardId);
        reward.setArchivedAt(LocalDateTime.now());
        reward.setActive(false);
        return response(rewardRepository.save(reward));
    }

    public RewardResponse restore(UUID rewardId) {
        Reward reward = findEntityById(rewardId);
        reward.setArchivedAt(null);
        reward.setActive(true);
        return response(rewardRepository.save(reward));
    }

    private void applyRequest(Reward reward, RewardRequest req) {
        reward.setName(req.getName());
        reward.setDescription(req.getDescription());
        reward.setPointCost(req.getPointCost());
        reward.setActive(req.getActive());
        if (req.getTier() != null) reward.setTier(req.getTier());
        reward.setIcon(req.getIcon());
        if (req.getChildId() != null) {
            reward.setChild(childService.findById(req.getChildId()));
        } else {
            reward.setChild(null);
        }
    }

    public List<RewardStatResponse> getStats(UUID familyId) {
        return redemptionRepository.findStatsByFamilyId(familyId).stream()
                .map(row -> new RewardStatResponse(
                        (UUID) row[0],
                        ((Number) row[1]).longValue(),
                        (java.time.LocalDateTime) row[2]))
                .toList();
    }

    public RewardResponse response(Reward reward) {
        RewardResponse r = new RewardResponse();
        r.setId(reward.getId());
        r.setName(reward.getName());
        r.setDescription(reward.getDescription());
        r.setPointCost(reward.getPointCost());
        r.setActive(reward.getActive());
        r.setCreatedAt(reward.getCreatedAt());
        r.setUpdatedAt(reward.getUpdatedAt());
        r.setTier(reward.getTier());
        r.setIcon(reward.getIcon());
        r.setFamilyId(reward.getFamily().getId());
        r.setArchivedAt(reward.getArchivedAt());
        r.setCatalogKey(reward.getCatalogKey());
        if (reward.getChild() != null) {
            r.setChildId(reward.getChild().getId());
            r.setChildName(reward.getChild().getName());
        }
        return r;
    }
}
