package com.KidQuest.kidquest_app.repository;

import com.KidQuest.kidquest_app.model.TaskStep;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskStepRepository extends JpaRepository<TaskStep, UUID> {

    List<TaskStep> findByTaskIdOrderByPosition(UUID taskId);

    Optional<TaskStep> findByTaskIdAndPosition(UUID taskId, int position);
}
