package com.KidQuest.kidquest_app.service;

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

    public Reward findById(UUID rewardId){
        return rewardRepository.findById(rewardId).orElseThrow(()-> new RuntimeException("No such reward wit this id: " + rewardId));
    }

    public List<Reward> findByFamilyId(UUID familyId) {
        return rewardRepository.findByFamilyId(familyId);
    }

    public Reward create(UUID familyId, Reward reward){
        reward.setFamily(familyService.findById(familyId));
        return rewardRepository.save(reward);
    }
    public Reward update(UUID rewardId, Reward updatedReward){
        Reward existingReward = findById(rewardId);
        existingReward.setName(updatedReward.getName());
        existingReward.setDescription(updatedReward.getDescription());
        existingReward.setPointCost(updatedReward.getPointCost());
        existingReward.setActive(updatedReward.getActive());
        return rewardRepository.save(existingReward);
    }
    public void delete(UUID rewardId){
        findById(rewardId);
        rewardRepository.deleteById(rewardId);
    }

}
