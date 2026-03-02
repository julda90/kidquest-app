package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.response.PointTransactionResponse;
import com.KidQuest.kidquest_app.model.PointTransaction;
import com.KidQuest.kidquest_app.repository.PointTransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PointTransactionService {

    private final PointTransactionRepository pointTransactionRepository;
    private final TaskService taskService;
    private final ChildService childService;

    public PointTransactionService(PointTransactionRepository pointTransactionRepository, TaskService taskService, ChildService childService) {
        this.pointTransactionRepository = pointTransactionRepository;
        this.taskService = taskService;
        this.childService = childService;
    }

    public PointTransactionResponse createPointTransaction(UUID childId, UUID taskId, PointTransaction pointTransaction) {
        if (taskId!=null) {
            pointTransaction.setTask(taskService.findById(taskId));
        }
        pointTransaction.setChild(childService.findById(childId));
        return response(pointTransactionRepository.save(pointTransaction));
    }

    public List<PointTransactionResponse> findByTaskId(UUID taskId) {
        return pointTransactionRepository
                .findByTaskId(taskId)
                .stream()
                .map(this::response)
                .toList();
    }

    public List<PointTransactionResponse> findByChildId(UUID childId) {
        return pointTransactionRepository
                .findByChildId(childId)
                .stream()
                .map(this::response)
                .toList();
    }

    public PointTransaction findById(UUID pointTransactionId) {
        return pointTransactionRepository.findById(pointTransactionId).orElseThrow(() -> new RuntimeException("PointTransaction with id: " + pointTransactionId + " not found"));
    }
    public PointTransactionResponse response(PointTransaction pointTransaction){
        PointTransactionResponse pointTransactionResponse = new PointTransactionResponse();
        pointTransactionResponse.setId(pointTransaction.getId());
        pointTransactionResponse.setAmount(pointTransaction.getAmount());
        pointTransactionResponse.setReason(pointTransaction.getReason());
        pointTransactionResponse.setCreatedAt(pointTransaction.getCreatedAt());
        pointTransactionResponse.setTaskId(pointTransaction.getTask().getId());
        pointTransactionResponse.setChildId(pointTransaction.getChild().getId());
        return pointTransactionResponse;
    }
}
