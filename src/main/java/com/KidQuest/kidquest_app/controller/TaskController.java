package com.KidQuest.kidquest_app.controller;

import com.KidQuest.kidquest_app.dto.request.ApproveRequest;
import com.KidQuest.kidquest_app.dto.request.TaskRequest;
import com.KidQuest.kidquest_app.dto.response.ApprovalResult;
import com.KidQuest.kidquest_app.dto.response.TaskResponse;
import com.KidQuest.kidquest_app.model.TaskKind;
import com.KidQuest.kidquest_app.service.TaskApprovalService;
import com.KidQuest.kidquest_app.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;
    private final TaskApprovalService taskApprovalService;

    public TaskController(TaskService taskService, TaskApprovalService taskApprovalService) {
        this.taskService = taskService;
        this.taskApprovalService = taskApprovalService;
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

    @PostMapping("/{taskId}/approve")
    public ResponseEntity<ApprovalResult> approveTask(@PathVariable UUID taskId,
                                                      @RequestBody(required = false) ApproveRequest request) {
        if (request == null) request = new ApproveRequest();
        return ResponseEntity.ok(taskApprovalService.approve(taskId, request));
    }

    @PostMapping("/{taskId}/reject")
    public ResponseEntity<Void> rejectTask(@PathVariable UUID taskId) {
        taskApprovalService.reject(taskId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{taskId}/submit")
    public ResponseEntity<Void> submitTask(@PathVariable UUID taskId) {
        taskApprovalService.submit(taskId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/family/{familyId}/open-quests")
    public ResponseEntity<List<TaskResponse>> getOpenQuests(@PathVariable UUID familyId) {
        return ResponseEntity.ok(taskService.findOpenQuestsByFamilyId(familyId));
    }

    @PostMapping("/{taskId}/claim")
    public ResponseEntity<TaskResponse> claimQuest(@PathVariable UUID taskId,
                                                   @RequestParam UUID childId) {
        return ResponseEntity.ok(taskService.claimQuest(taskId, childId));
    }

    @GetMapping("/kinds")
    public ResponseEntity<List<Map<String, Object>>> getTaskKinds() {
        List<Map<String, Object>> kinds = Arrays.stream(TaskKind.values())
                .map(k -> Map.<String, Object>of(
                        "kind", k.name(),
                        "group", k.group(),
                        "defaultPointsOlder", k.defaultPoints(false),
                        "defaultPointsYounger", k.defaultPoints(true)
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(kinds);
    }

}
