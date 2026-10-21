package com.KidQuest.kidquest_app.repository;

import com.KidQuest.kidquest_app.model.RedemptionStatus;
import com.KidQuest.kidquest_app.model.RewardRedemption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface RewardRedemptionRepository extends JpaRepository<RewardRedemption, UUID> {

    List<RewardRedemption> findByChildIdAndStatus(UUID childId, RedemptionStatus status);

    List<RewardRedemption> findByChildId(UUID childId);

    List<RewardRedemption> findByChildIdAndCreatedAtAfter(UUID childId, LocalDateTime after);

    @Query("SELECT r FROM RewardRedemption r WHERE r.child.family.id = :familyId AND r.status = :status")
    List<RewardRedemption> findByFamilyIdAndStatus(UUID familyId, RedemptionStatus status);

    @Query("SELECT r FROM RewardRedemption r WHERE r.child.family.id = :familyId")
    List<RewardRedemption> findByFamilyId(UUID familyId);

    @Query("SELECT COALESCE(SUM(r.pointCost), 0) FROM RewardRedemption r WHERE r.child.id = :childId AND r.status = 'REQUESTED'")
    int sumPendingCostByChildId(UUID childId);

    boolean existsByRewardId(UUID rewardId);

    @Query("SELECT r.reward.id, COUNT(r), MAX(r.createdAt) FROM RewardRedemption r " +
           "WHERE r.reward.family.id = :familyId AND r.status IN ('APPROVED', 'DELIVERED') " +
           "GROUP BY r.reward.id")
    List<Object[]> findStatsByFamilyId(UUID familyId);
}
