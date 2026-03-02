package com.KidQuest.kidquest_app.service;

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

    public List<Task> findAllById(UUID childId) {
        return taskRepository.findAllById(childId);
    }

    public List<Task> findAllByFamilyId(UUID familyId) {
        return taskRepository.findAllByFamilyId(familyId);
    }

    public Task findById(UUID taskId){
        return taskRepository.findById(taskId).orElseThrow(()-> new RuntimeException("No task with such id:" + taskId));
    }

    public Task create(UUID familyId, UUID childId, Task task) {
        Family family = familyService.findById(familyId);
        task.setFamily(family);
        if (childId != null) {
            Child child = childService.findById(childId);
            task.setAssignedTo(child);
        }
        return taskRepository.save(task);
    }

    public Task updateTask(UUID taskId, UUID childId, Task updatedTask){
        Task existingTask = findById(taskId);
        existingTask.setPointValue(updatedTask.getPointValue());
        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setDescription(updatedTask.getDescription());
        existingTask.setDueDate(updatedTask.getDueDate());
        existingTask.setStatus(updatedTask.getStatus());
        if (childId != null) {
            existingTask.setAssignedTo(childService.findById(childId));
        }
        return taskRepository.save(existingTask);
    }

    public void delete(UUID id) {
        findById(id);
        taskRepository.deleteById(id);
    }

}
