package com.KidQuest.kidquest_app.controller;

import com.KidQuest.kidquest_app.dto.request.RewardRequest;
import com.KidQuest.kidquest_app.dto.response.RewardResponse;
import com.KidQuest.kidquest_app.service.RewardService;
import io.lettuce.core.dynamic.annotation.Value;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rewards")
public class RewardController {

    private final RewardService rewardService;

    public RewardController(RewardService rewardService) {
        this.rewardService = rewardService;
    }

    @GetMapping("/family/{familyId}")
    public ResponseEntity<List<RewardResponse>> findAllByFamilyId(@PathVariable UUID familyId){
        List<RewardResponse> response = rewardService.findByFamilyId(familyId);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/{rewardId}")
    public ResponseEntity<RewardResponse> findById(@PathVariable UUID rewardId){
        RewardResponse response = rewardService.findById(rewardId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/family/{familyId}")
    public ResponseEntity<RewardResponse> create(@PathVariable UUID familyId, @RequestBody @Valid RewardRequest rewardRequest){
        RewardResponse response = rewardService.create(familyId, rewardRequest);
        return ResponseEntity.status(201).body(response);
    }
    @PutMapping("/{rewardId}")
    public ResponseEntity<RewardResponse> update(@PathVariable UUID rewardId, @RequestBody @Valid RewardRequest rewardRequest){
        RewardResponse response = rewardService.update(rewardId, rewardRequest);
        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/{rewardId}")
    public ResponseEntity<Void> delete(@PathVariable UUID rewardId){
        rewardService.delete(rewardId);
        return ResponseEntity.noContent().build();
    }
}
