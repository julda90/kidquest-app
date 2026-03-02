package com.KidQuest.kidquest_app.service;

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

    public PointTransaction createPointTransaction(UUID childId, UUID taskId, PointTransaction pointTransaction) {
        if (taskId!=null) {
            pointTransaction.setTask(taskService.findById(taskId));
        }
        pointTransaction.setChild(childService.findById(childId));
        return pointTransactionRepository.save(pointTransaction);
    }

    public List<PointTransaction> findByTaskId(UUID taskId) {
        return pointTransactionRepository.findByTaskId(taskId);
    }

    public List<PointTransaction> findByChildId(UUID childId) {
        return pointTransactionRepository.findByChildId(childId);
    }

    public PointTransaction findById(UUID pointTransactionId) {
        return pointTransactionRepository.findById(pointTransactionId).orElseThrow(() -> new RuntimeException("PointTransaction with id: " + pointTransactionId + " not found"));
    }
}
