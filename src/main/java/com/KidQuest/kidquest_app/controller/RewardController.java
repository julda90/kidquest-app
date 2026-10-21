package com.KidQuest.kidquest_app.controller;

import com.KidQuest.kidquest_app.dto.request.RewardRequest;
import com.KidQuest.kidquest_app.dto.response.RewardResponse;
import com.KidQuest.kidquest_app.dto.response.RewardStatResponse;
import com.KidQuest.kidquest_app.service.RewardService;
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
    public ResponseEntity<List<RewardResponse>> findAllByFamilyId(
            @PathVariable UUID familyId,
            @RequestParam(defaultValue = "false") boolean includeArchived) {
        return ResponseEntity.ok(rewardService.findByFamilyId(familyId, includeArchived));
    }

    @GetMapping("/{rewardId}")
    public ResponseEntity<RewardResponse> findById(@PathVariable UUID rewardId) {
        return ResponseEntity.ok(rewardService.findById(rewardId));
    }

    @PostMapping("/family/{familyId}")
    public ResponseEntity<RewardResponse> create(@PathVariable UUID familyId,
            @RequestBody @Valid RewardRequest rewardRequest) {
        return ResponseEntity.status(201).body(rewardService.create(familyId, rewardRequest));
    }

    @PutMapping("/{rewardId}")
    public ResponseEntity<RewardResponse> update(@PathVariable UUID rewardId,
            @RequestBody @Valid RewardRequest rewardRequest) {
        return ResponseEntity.ok(rewardService.update(rewardId, rewardRequest));
    }

    @DeleteMapping("/{rewardId}")
    public ResponseEntity<Void> delete(@PathVariable UUID rewardId) {
        rewardService.delete(rewardId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{rewardId}/archive")
    public ResponseEntity<RewardResponse> archive(@PathVariable UUID rewardId) {
        return ResponseEntity.ok(rewardService.archive(rewardId));
    }

    @PostMapping("/{rewardId}/restore")
    public ResponseEntity<RewardResponse> restore(@PathVariable UUID rewardId) {
        return ResponseEntity.ok(rewardService.restore(rewardId));
    }

    @GetMapping("/family/{familyId}/stats")
    public ResponseEntity<List<RewardStatResponse>> getStats(@PathVariable UUID familyId) {
        return ResponseEntity.ok(rewardService.getStats(familyId));
    }
}
