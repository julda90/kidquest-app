package com.KidQuest.kidquest_app.controller;

import com.KidQuest.kidquest_app.dto.request.PointTransactionRequest;
import com.KidQuest.kidquest_app.dto.response.PointTransactionResponse;
import com.KidQuest.kidquest_app.service.PointTransactionService;
import io.lettuce.core.dynamic.annotation.Value;
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

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<PointTransactionResponse>> getPointTransactionByTaskId(@PathVariable UUID taskId){
        List<PointTransactionResponse> pointTransactionResponses = pointTransactionService.findByTaskId(taskId);
        return ResponseEntity.ok(pointTransactionResponses);
    }

    @GetMapping("/child/{childId}")
    public ResponseEntity<List<PointTransactionResponse>> getPointTransactionByChildId(@PathVariable UUID childId){
        List<PointTransactionResponse> pointTransactionResponses = pointTransactionService.findByChildId(childId);
        return ResponseEntity.ok(pointTransactionResponses);
    }

    @PostMapping("/child/{childId}")
    public ResponseEntity<PointTransactionResponse> createPointTransaction(@RequestBody @Valid PointTransactionRequest pointTransactionRequest, @PathVariable UUID childId){
        PointTransactionResponse response = pointTransactionService.createPointTransaction(childId, pointTransactionRequest);
        return ResponseEntity.status(201).body(response);
    }

}
