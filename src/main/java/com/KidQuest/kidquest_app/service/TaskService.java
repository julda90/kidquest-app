package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.request.TaskRequest;
import com.KidQuest.kidquest_app.dto.response.TaskResponse;
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

    public List<TaskResponse> findAllByAssignedToId(UUID childId) {
        return taskRepository.findAllByAssignedToId(childId)
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

    public Task findById(UUID id){
        return taskRepository.findById(id).orElseThrow(()-> new RuntimeException("No task with such id:" + id));
    }

    public TaskResponse create(UUID familyId, TaskRequest taskRequest) {
        Task task = new Task();
        task.setTitle(taskRequest.getTitle());
        task.setDescription(taskRequest.getDescription());
        task.setFamily(familyService.findById(familyId));
        task.setPointValue(taskRequest.getPointValue());
        task.setStatus(taskRequest.getStatus());
        task.setDueDate(taskRequest.getDueDate());
        if (taskRequest.getAssignedToId() != null) {
            task.setAssignedTo(childService.findById(taskRequest.getAssignedToId()));
        }
        return response(taskRepository.save(task));
    }

    public TaskResponse updateTask(UUID id, TaskRequest updatedTask){
        Task existingTask = findById(id);
        existingTask.setPointValue(updatedTask.getPointValue());
        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setDescription(updatedTask.getDescription());
        existingTask.setDueDate(updatedTask.getDueDate());
        existingTask.setStatus(updatedTask.getStatus());
        if (updatedTask.getAssignedToId() != null) {
            existingTask.setAssignedTo(childService.findById(updatedTask.getAssignedToId()));
        }
        return response(taskRepository.save(existingTask));
    }

    public void delete(UUID id) {
        findById(id);
        taskRepository.deleteById(id);
    }
    public TaskResponse response(Task task){
        TaskResponse response = new TaskResponse();
        response.setTaskId(task.getId());
        response.setFamilyId(task.getFamily().getId());
        if (task.getAssignedTo() != null){
            response.setAssignedTo(task.getAssignedTo().getId());
        }
        response.setPointValue(task.getPointValue());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setDueDate(task.getDueDate());
        response.setStatus(task.getStatus());
        response.setCreatedAt(task.getCreatedAt());
        return response;
    }

}
