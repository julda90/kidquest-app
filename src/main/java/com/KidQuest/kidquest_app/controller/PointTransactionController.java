package com.KidQuest.kidquest_app.controller;

import com.KidQuest.kidquest_app.dto.request.PointTransactionRequest;
import com.KidQuest.kidquest_app.dto.response.PointTransactionResponse;
import com.KidQuest.kidquest_app.service.PointTransactionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pointTransactions")
public class PointTransactionController {

    private final PointTransactionService pointTransactionService;

    public PointTransactionController(PointTransactionService pointTransactionService) {
        this.pointTransactionService = pointTransactionService;
    }

    @GetMapping("/child/{childId}")
    public ResponseEntity<List<PointTransactionResponse>> getByChild(@PathVariable UUID childId) {
        return ResponseEntity.ok(pointTransactionService.findByChildId(childId));
    }

    @PostMapping("/child/{childId}")
    public ResponseEntity<PointTransactionResponse> create(
            @PathVariable UUID childId,
            @RequestBody @Valid PointTransactionRequest request) {
        return ResponseEntity.status(201).body(pointTransactionService.createPointTransaction(childId, request));
    }
}
