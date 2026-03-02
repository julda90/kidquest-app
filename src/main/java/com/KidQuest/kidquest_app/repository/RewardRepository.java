package com.KidQuest.kidquest_app.repository;

import com.KidQuest.kidquest_app.model.Reward;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RewardRepository extends JpaRepository<Reward, UUID> {
    List<Reward> findByFamilyId(UUID familyId);
}
