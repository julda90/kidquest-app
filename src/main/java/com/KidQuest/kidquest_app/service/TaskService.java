package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.response.TaskResponse;
import com.KidQuest.kidquest_app.model.Child;
import com.KidQuest.kidquest_app.model.Family;
import com.KidQuest.kidquest_app.model.Task;
import com.KidQuest.kidquest_app.repository.TaskRepository;
import org.springframework.stereotype.Service;

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

    public List<TaskResponse> findAllById(UUID childId) {
        return taskRepository.findAllById(childId)
                .stream()
                .map(this::response)
                .toList();
    }

    public List<TaskResponse> findAllByFamilyId(UUID familyId) {
        return taskRepository.findAllByFamilyId(familyId)
                .stream()
                .map(this::response)
                .toList();
    }

    public Task findById(UUID taskId){
        return taskRepository.findById(taskId).orElseThrow(()-> new RuntimeException("No task with such id:" + taskId));
    }

    public TaskResponse create(UUID familyId, UUID childId, Task task) {
        Family family = familyService.findById(familyId);
        task.setFamily(family);
        if (childId != null) {
            Child child = childService.findById(childId);
            task.setAssignedTo(child);
        }
        return response(taskRepository.save(task));
    }

    public TaskResponse updateTask(UUID taskId, UUID childId, Task updatedTask){
        Task existingTask = findById(taskId);
        existingTask.setPointValue(updatedTask.getPointValue());
        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setDescription(updatedTask.getDescription());
        existingTask.setDueDate(updatedTask.getDueDate());
        existingTask.setStatus(updatedTask.getStatus());
        if (childId != null) {
            existingTask.setAssignedTo(childService.findById(childId));
        }
        return response(taskRepository.save(existingTask));
    }

    public void delete(UUID id) {
        findById(id);
        taskRepository.deleteById(id);
    }
    public TaskResponse response(Task task){
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setAssignedTo(task.getAssignedTo().getId());
        response.setPointValue(task.getPointValue());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setDueDate(task.getDueDate());
        response.setStatus(task.getStatus());
        return response;
    }

}
