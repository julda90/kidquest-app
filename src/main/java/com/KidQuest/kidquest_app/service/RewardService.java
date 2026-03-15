package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.request.RewardRequest;
import com.KidQuest.kidquest_app.dto.response.RewardResponse;
import com.KidQuest.kidquest_app.exception.ResourceNotFoundException;
import com.KidQuest.kidquest_app.model.Reward;
import com.KidQuest.kidquest_app.repository.RewardRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class RewardService {

    private final RewardRepository rewardRepository;
    private final FamilyService familyService;

    public RewardService(RewardRepository rewardRepository, FamilyService familyService) {
        this.rewardRepository = rewardRepository;
        this.familyService = familyService;
    }
    private Reward findEntityById(UUID rewardId){
        return rewardRepository.findById(rewardId).orElseThrow(()-> new ResourceNotFoundException("No such reward wit this id: " + rewardId));
    }

    public RewardResponse findById(UUID rewardId){
        return response(findEntityById(rewardId));
    }

    public List<RewardResponse> findByFamilyId(UUID familyId) {
        return rewardRepository
                .findByFamilyId(familyId)
                .stream()
                .map(this::response)
                .toList();
    }

    public RewardResponse create(UUID familyId, RewardRequest rewardRequest){
        Reward reward = new Reward();
        reward.setName(rewardRequest.getName());
        reward.setDescription(rewardRequest.getDescription());
        reward.setPointCost(rewardRequest.getPointCost());
        reward.setActive(rewardRequest.getActive());
        reward.setFamily(familyService.findById(familyId));
        return response(rewardRepository.save(reward));
    }
    public RewardResponse update(UUID rewardId, RewardRequest updatedReward){
        Reward existingReward = findEntityById(rewardId);
        existingReward.setName(updatedReward.getName());
        existingReward.setDescription(updatedReward.getDescription());
        existingReward.setPointCost(updatedReward.getPointCost());
        existingReward.setActive(updatedReward.getActive());
        return response(rewardRepository.save(existingReward));
    }
    public void delete(UUID rewardId){
        findById(rewardId);
        rewardRepository.deleteById(rewardId);
    }
    public RewardResponse response(Reward reward){
        RewardResponse response = new RewardResponse();
        response.setId(reward.getId());
        response.setName(reward.getName());
        response.setDescription(reward.getDescription());
        response.setPointCost(reward.getPointCost());
        response.setActive(reward.getActive());
        response.setCreatedAt(reward.getCreatedAt());
        response.setUpdatedAt(reward.getUpdatedAt());
        return response;
    }

}
