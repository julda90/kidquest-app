package com.KidQuest.kidquest_app.repository;

import com.KidQuest.kidquest_app.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findAllByAssignedToIdAndDeletedAtIsNull(UUID assignedTo);

    List<Task> findAllByFamilyIdAndDeletedAtIsNull(UUID familyId);

    Optional<Task> findByIdAndDeletedAtIsNull(UUID id);

    long countByAssignedToIdAndStatusAndKindIn(UUID childId, com.KidQuest.kidquest_app.model.TaskStatus status, java.util.List<com.KidQuest.kidquest_app.model.TaskKind> kinds);

    long countByAssignedToIdAndStatus(UUID childId, com.KidQuest.kidquest_app.model.TaskStatus status);
}
