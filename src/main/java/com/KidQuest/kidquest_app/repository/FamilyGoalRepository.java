package com.KidQuest.kidquest_app.repository;

import com.KidQuest.kidquest_app.model.FamilyGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FamilyGoalRepository extends JpaRepository<FamilyGoal, UUID> {

    Optional<FamilyGoal> findByFamilyIdAndReachedAtIsNullAndCancelledAtIsNull(UUID familyId);
}
