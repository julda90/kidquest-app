package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.request.TaskRequest;
import com.KidQuest.kidquest_app.dto.response.TaskResponse;
import com.KidQuest.kidquest_app.exception.BadRequestException;
import com.KidQuest.kidquest_app.exception.ResourceNotFoundException;
import com.KidQuest.kidquest_app.model.Child;
import com.KidQuest.kidquest_app.model.Task;
import com.KidQuest.kidquest_app.model.TaskKind;
import com.KidQuest.kidquest_app.model.TaskStatus;
import com.KidQuest.kidquest_app.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ChildService childService;
    private final FamilyService familyService;

    public TaskService(TaskRepository taskRepository, ChildService childService, FamilyService familyService) {
        this.taskRepository = taskRepository;
        this.childService = childService;
        this.familyService = familyService;
    }

    public List<TaskResponse> findAllByAssignedToId(UUID childId) {
        return taskRepository.findAllByAssignedToIdAndDeletedAtIsNull(childId)
                .stream()
                .map(this::response)
                .toList();
    }

    public List<TaskResponse> findAllByFamilyId(UUID familyId) {
        return taskRepository.findAllByFamilyIdAndDeletedAtIsNull(familyId)
                .stream()
                .map(this::response)
                .toList();
    }

    public Task findById(UUID id) {
        return taskRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("No task with such id: " + id));
    }

    public TaskResponse create(UUID familyId, TaskRequest taskRequest) {
        Task task = new Task();
        task.setTitle(taskRequest.getTitle());
        task.setDescription(taskRequest.getDescription());
        task.setFamily(familyService.findById(familyId));
        task.setPointValue(taskRequest.getPointValue());
        task.setDueDate(taskRequest.getDueDate());
        task.setKind(taskRequest.getKind() != null ? taskRequest.getKind() : TaskKind.OTHER);
        task.setBonusValue(taskRequest.getBonusValue() != null ? taskRequest.getBonusValue() : 0);
        task.setLatePointValue(taskRequest.getLatePointValue());
        task.setNoReminderBonus(taskRequest.getNoReminderBonus() != null ? taskRequest.getNoReminderBonus() : 0);
        task.setOpenQuest(Boolean.TRUE.equals(taskRequest.getOpenQuest()));
        task.setDailyLimit(taskRequest.getDailyLimit() != null ? taskRequest.getDailyLimit() : 1);
        if (taskRequest.getAssignedToId() != null) {
            task.setAssignedTo(childService.findById(taskRequest.getAssignedToId()));
            task.setStatus(TaskStatus.ASSIGNED);
        } else {
            task.setStatus(taskRequest.getStatus() != null ? taskRequest.getStatus() : TaskStatus.UNASSIGNED);
        }
        return response(taskRepository.save(task));
    }

    public TaskResponse updateTask(UUID id, TaskRequest updatedTask) {
        Task existingTask = findById(id);
        if (updatedTask.getStatus() == TaskStatus.COMPLETED) {
            throw new BadRequestException("Use POST /api/tasks/" + id + "/approve to complete a task.");
        }
        existingTask.setPointValue(updatedTask.getPointValue());
        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setDescription(updatedTask.getDescription());
        existingTask.setDueDate(updatedTask.getDueDate());
        existingTask.setKind(updatedTask.getKind() != null ? updatedTask.getKind() : TaskKind.OTHER);
        existingTask.setBonusValue(updatedTask.getBonusValue() != null ? updatedTask.getBonusValue() : 0);
        existingTask.setLatePointValue(updatedTask.getLatePointValue());
        existingTask.setNoReminderBonus(updatedTask.getNoReminderBonus() != null ? updatedTask.getNoReminderBonus() : 0);
        existingTask.setOpenQuest(Boolean.TRUE.equals(updatedTask.getOpenQuest()));
        existingTask.setDailyLimit(updatedTask.getDailyLimit() != null ? updatedTask.getDailyLimit() : 1);
        if (updatedTask.getAssignedToId() != null) {
            existingTask.setAssignedTo(childService.findById(updatedTask.getAssignedToId()));
            existingTask.setStatus(updatedTask.getStatus() != null ? updatedTask.getStatus() : TaskStatus.ASSIGNED);
        } else {
            existingTask.setAssignedTo(null);
            existingTask.setStatus(updatedTask.getStatus() != null ? updatedTask.getStatus() : TaskStatus.UNASSIGNED);
        }
        return response(taskRepository.save(existingTask));
    }

    public void delete(UUID id) {
        Task task = findById(id);
        task.setDeletedAt(LocalDateTime.now());
        taskRepository.save(task);
    }

    public TaskResponse response(Task task) {
        TaskResponse response = new TaskResponse();
        response.setTaskId(task.getId());
        response.setFamilyId(task.getFamily().getId());
        if (task.getAssignedTo() != null) {
            response.setAssignedTo(task.getAssignedTo().getId());
        }
        response.setPointValue(task.getPointValue());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setDueDate(task.getDueDate());
        response.setStatus(task.getStatus());
        response.setCreatedAt(task.getCreatedAt());
        response.setKind(task.getKind());
        response.setBonusValue(task.getBonusValue());
        response.setLatePointValue(task.getLatePointValue());
        response.setNoReminderBonus(task.getNoReminderBonus());
        response.setApprovedAt(task.getApprovedAt());
        response.setOpenQuest(task.isOpenQuest());
        response.setTemplateId(task.getTemplateId());
        response.setDailyLimit(task.getDailyLimit());
        return response;
    }

    public List<TaskResponse> findOpenQuestsByFamilyId(UUID familyId) {
        return taskRepository.findAllByFamilyIdAndOpenQuestTrueAndDeletedAtIsNull(familyId)
                .stream()
                .map(this::response)
                .toList();
    }

    public TaskResponse claimQuest(UUID templateId, UUID childId) {
        Task template = findById(templateId);
        if (!template.isOpenQuest()) {
            throw new BadRequestException("Task " + templateId + " is not an open quest.");
        }
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long alreadyClaimed = taskRepository.countByTemplateIdAndAssignedToIdAndCreatedAtAfter(
                templateId, childId, startOfDay);
        if (alreadyClaimed >= template.getDailyLimit()) {
            throw new BadRequestException("Daily claim limit reached for this quest.");
        }
        Child child = childService.findById(childId);
        Task claim = new Task();
        claim.setTitle(template.getTitle());
        claim.setDescription(template.getDescription());
        claim.setFamily(template.getFamily());
        claim.setPointValue(template.getPointValue());
        claim.setBonusValue(template.getBonusValue());
        claim.setLatePointValue(template.getLatePointValue());
        claim.setNoReminderBonus(template.getNoReminderBonus());
        claim.setKind(template.getKind());
        claim.setAssignedTo(child);
        claim.setStatus(TaskStatus.ASSIGNED);
        claim.setTemplateId(templateId);
        return response(taskRepository.save(claim));
    }
}
