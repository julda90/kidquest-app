package com.KidQuest.kidquest_app.controller;

import com.KidQuest.kidquest_app.dto.request.FamilyGoalRequest;
import com.KidQuest.kidquest_app.dto.request.FamilyRequest;
import com.KidQuest.kidquest_app.dto.response.FamilyGoalResponse;
import com.KidQuest.kidquest_app.dto.response.FamilyResponse;
import com.KidQuest.kidquest_app.model.Family;
import com.KidQuest.kidquest_app.service.FamilyGoalService;
import com.KidQuest.kidquest_app.service.FamilyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/families")
public class FamilyController {

    private final FamilyService familyService;
    private final FamilyGoalService familyGoalService;

    public FamilyController(FamilyService familyService, FamilyGoalService familyGoalService) {
        this.familyService = familyService;
        this.familyGoalService = familyGoalService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Family> findById(@PathVariable UUID id) {
        Family family = familyService.findById(id);
        return ResponseEntity.ok(family);
    }

    @GetMapping
    public ResponseEntity<List<FamilyResponse>> findAll(){
        List<FamilyResponse> families = familyService.findAll();
        return ResponseEntity.ok(families);
    }
    @PostMapping()
    public ResponseEntity<FamilyResponse> create(@RequestBody @Valid FamilyRequest familyRequest){
        FamilyResponse createdFamily = familyService.create(familyRequest);
        return ResponseEntity.status(201).body(createdFamily);
    }
    @PutMapping("/{id}")
    public ResponseEntity<FamilyResponse> update(@PathVariable UUID id, @RequestBody @Valid FamilyRequest familyRequest){
        FamilyResponse updatedFamily = familyService.update(familyRequest,id);
        return ResponseEntity.ok(updatedFamily);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id){
        familyService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/goal")
    public ResponseEntity<FamilyGoalResponse> getActiveGoal(@PathVariable UUID id) {
        return familyGoalService.getActiveGoal(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/{id}/goal")
    public ResponseEntity<FamilyGoalResponse> createGoal(
            @PathVariable UUID id, @RequestBody @Valid FamilyGoalRequest request) {
        return ResponseEntity.status(201).body(familyGoalService.createGoal(id, request));
    }

    @PostMapping("/{id}/goal/{goalId}/cancel")
    public ResponseEntity<FamilyGoalResponse> cancelGoal(
            @PathVariable UUID id, @PathVariable UUID goalId) {
        return ResponseEntity.ok(familyGoalService.cancelGoal(id, goalId));
    }
}
