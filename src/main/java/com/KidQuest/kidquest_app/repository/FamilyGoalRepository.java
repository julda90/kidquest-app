package com.KidQuest.kidquest_app.repository;

import com.KidQuest.kidquest_app.model.FamilyGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface FamilyGoalRepository extends JpaRepository<FamilyGoal, UUID> {

    Optional<FamilyGoal> findByFamilyIdAndReachedAtIsNullAndCancelledAtIsNull(UUID familyId);

    @Query("SELECT COUNT(g) FROM FamilyGoal g WHERE g.family.id = :familyId AND g.reachedAt IS NOT NULL")
    long countCompletedByFamilyId(UUID familyId);
}
