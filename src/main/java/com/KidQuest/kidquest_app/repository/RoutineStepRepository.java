package com.KidQuest.kidquest_app.repository;

import com.KidQuest.kidquest_app.model.RoutineStep;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RoutineStepRepository extends JpaRepository<RoutineStep, UUID> {

    List<RoutineStep> findByRoutineIdOrderByPosition(UUID routineId);

    void deleteByRoutineId(UUID routineId);
}
