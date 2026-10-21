package com.KidQuest.kidquest_app.repository;

import com.KidQuest.kidquest_app.model.Task;
import com.KidQuest.kidquest_app.model.TaskKind;
import com.KidQuest.kidquest_app.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findAllByAssignedToIdAndDeletedAtIsNull(UUID assignedTo);

    List<Task> findAllByFamilyIdAndDeletedAtIsNull(UUID familyId);

    List<Task> findAllByFamilyIdAndOpenQuestTrueAndDeletedAtIsNull(UUID familyId);

    Optional<Task> findByIdAndDeletedAtIsNull(UUID id);

    long countByAssignedToIdAndStatusAndKindIn(UUID childId, TaskStatus status, java.util.List<TaskKind> kinds);

    long countByAssignedToIdAndStatus(UUID childId, TaskStatus status);

    long countByTemplateIdAndAssignedToIdAndCreatedAtAfter(UUID templateId, UUID assignedToId, LocalDateTime after);

    boolean existsByFamilyIdAndCatalogKeyAndDeletedAtIsNull(UUID familyId, String catalogKey);

    Optional<Task> findByRoutineIdAndAssignedToIdAndDueDate(UUID routineId, UUID childId, LocalDate dueDate);

    List<Task> findByRoutineIdAndAssignedToId(UUID routineId, UUID childId);
}
