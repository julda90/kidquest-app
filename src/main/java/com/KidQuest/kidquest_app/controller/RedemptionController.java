package com.KidQuest.kidquest_app.controller;

import com.KidQuest.kidquest_app.dto.response.RedemptionResponse;
import com.KidQuest.kidquest_app.model.RedemptionStatus;
import com.KidQuest.kidquest_app.service.RewardRedemptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/redemptions")
public class RedemptionController {

    private final RewardRedemptionService redemptionService;

    public RedemptionController(RewardRedemptionService redemptionService) {
        this.redemptionService = redemptionService;
    }

    /** Child requests a reward. */
    @PostMapping("/child/{childId}/reward/{rewardId}")
    public ResponseEntity<RedemptionResponse> redeem(
            @PathVariable UUID childId,
            @PathVariable UUID rewardId) {
        return ResponseEntity.status(201).body(redemptionService.redeem(childId, rewardId));
    }

    /** Parent approves a redemption request. */
    @PostMapping("/{id}/approve")
    public ResponseEntity<RedemptionResponse> approve(@PathVariable UUID id) {
        return ResponseEntity.ok(redemptionService.approve(id));
    }

    /** Parent marks as delivered. */
    @PostMapping("/{id}/deliver")
    public ResponseEntity<RedemptionResponse> deliver(@PathVariable UUID id) {
        return ResponseEntity.ok(redemptionService.deliver(id));
    }

    /** Cancel a redemption (parent or child). */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<RedemptionResponse> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(redemptionService.cancel(id));
    }

    /** List all redemptions for a child. */
    @GetMapping("/child/{childId}")
    public ResponseEntity<List<RedemptionResponse>> listByChild(@PathVariable UUID childId) {
        return ResponseEntity.ok(redemptionService.findByChild(childId));
    }

    /** List all redemptions for a family. Optional ?status= filter. */
    @GetMapping("/family/{familyId}")
    public ResponseEntity<List<RedemptionResponse>> listByFamily(
            @PathVariable UUID familyId,
            @RequestParam(required = false) RedemptionStatus status) {
        if (status != null) {
            return ResponseEntity.ok(redemptionService.findByFamilyAndStatus(familyId, status));
        }
        return ResponseEntity.ok(redemptionService.findByFamily(familyId));
    }
}
