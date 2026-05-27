package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.request.PointTransactionRequest;
import com.KidQuest.kidquest_app.dto.response.PointTransactionResponse;
import com.KidQuest.kidquest_app.exception.ResourceNotFoundException;
import com.KidQuest.kidquest_app.model.PointTransaction;
import com.KidQuest.kidquest_app.repository.PointTransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PointTransactionService {

    private final PointTransactionRepository pointTransactionRepository;
    private final ChildService childService;

    public PointTransactionService(PointTransactionRepository pointTransactionRepository, ChildService childService) {
        this.pointTransactionRepository = pointTransactionRepository;
        this.childService = childService;
    }

    public PointTransactionResponse createPointTransaction(UUID childId, PointTransactionRequest request) {
        PointTransaction tx = new PointTransaction();
        tx.setChild(childService.findById(childId));
        tx.setAmount(request.getAmount());
        tx.setReason(request.getReason());
        return toResponse(pointTransactionRepository.save(tx));
    }

    public List<PointTransactionResponse> findByChildId(UUID childId) {
        return pointTransactionRepository
                .findByChildId(childId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public PointTransaction findById(UUID id) {
        return pointTransactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PointTransaction not found: " + id));
    }

    private PointTransactionResponse toResponse(PointTransaction tx) {
        PointTransactionResponse r = new PointTransactionResponse();
        r.setId(tx.getId());
        r.setChildId(tx.getChild().getId());
        r.setAmount(tx.getAmount());
        r.setReason(tx.getReason());
        r.setCreatedAt(tx.getCreatedAt());
        return r;
    }
}
