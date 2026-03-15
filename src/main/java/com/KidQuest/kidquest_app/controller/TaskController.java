package com.KidQuest.kidquest_app.controller;

import com.KidQuest.kidquest_app.dto.request.TaskRequest;
import com.KidQuest.kidquest_app.dto.response.TaskResponse;
import com.KidQuest.kidquest_app.service.TaskService;
import io.lettuce.core.dynamic.annotation.Value;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/child/{childId}")
    public ResponseEntity<List<TaskResponse>> findAllByAssignedToId(@PathVariable UUID childId){
        List<TaskResponse> tasks = taskService.findAllByAssignedToId(childId);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/family/{familyId}")
    public ResponseEntity<List<TaskResponse>> findAllByFamilyId(@PathVariable UUID familyId){
        List<TaskResponse> tasks = taskService.findAllByFamilyId(familyId);
        return ResponseEntity.ok(tasks);
    }
    @PostMapping("/family/{familyId}")
    public ResponseEntity<TaskResponse> createTask(@RequestBody @Valid TaskRequest taskRequest, @PathVariable UUID familyId){
        TaskResponse taskResponse = taskService.create(familyId, taskRequest);
        return ResponseEntity.ok(taskResponse);
    }
    @PutMapping("/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(@RequestBody @Valid TaskRequest taskRequest, @PathVariable UUID taskId){
        TaskResponse taskResponse = taskService.updateTask(taskId, taskRequest);
        return ResponseEntity.ok(taskResponse);
    }
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID taskId){
        taskService.delete(taskId);
        return ResponseEntity.noContent().build();
    }

}
