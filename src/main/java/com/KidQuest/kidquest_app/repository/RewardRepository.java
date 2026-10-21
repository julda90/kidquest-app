package com.KidQuest.kidquest_app.repository;

import com.KidQuest.kidquest_app.model.Reward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface RewardRepository extends JpaRepository<Reward, UUID> {

    List<Reward> findByFamilyId(UUID familyId);

    @Query("SELECT r FROM Reward r WHERE r.family.id = :familyId AND r.archivedAt IS NULL")
    List<Reward> findActiveByFamilyId(UUID familyId);

    boolean existsByFamilyIdAndCatalogKey(UUID familyId, String catalogKey);
}
