package com.KidQuest.kidquest_app.repository;

import com.KidQuest.kidquest_app.model.Routine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoutineRepository extends JpaRepository<Routine, UUID> {

    Optional<Routine> findFirstByChildIdAndActive(UUID childId, boolean active);

    List<Routine> findByFamilyId(UUID familyId);

    List<Routine> findByChildId(UUID childId);
}
