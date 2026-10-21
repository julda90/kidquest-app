package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.request.FamilyGoalRequest;
import com.KidQuest.kidquest_app.dto.response.FamilyGoalResponse;
import com.KidQuest.kidquest_app.exception.BadRequestException;
import com.KidQuest.kidquest_app.exception.ConflictException;
import com.KidQuest.kidquest_app.exception.ResourceNotFoundException;
import com.KidQuest.kidquest_app.model.FamilyGoal;
import com.KidQuest.kidquest_app.repository.FamilyGoalRepository;
import com.KidQuest.kidquest_app.repository.PointTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class FamilyGoalService {

    private final FamilyGoalRepository goalRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final FamilyService familyService;
    private final Clock clock;

    public FamilyGoalService(FamilyGoalRepository goalRepository,
                             PointTransactionRepository pointTransactionRepository,
                             FamilyService familyService,
                             Clock clock) {
        this.goalRepository = goalRepository;
        this.pointTransactionRepository = pointTransactionRepository;
        this.familyService = familyService;
        this.clock = clock;
    }

    public Optional<FamilyGoalResponse> getActiveGoal(UUID familyId) {
        return goalRepository.findByFamilyIdAndReachedAtIsNullAndCancelledAtIsNull(familyId)
                .map(g -> toResponse(g, familyId));
    }

    @Transactional
    public FamilyGoalResponse createGoal(UUID familyId, FamilyGoalRequest request) {
        if (goalRepository.findByFamilyIdAndReachedAtIsNullAndCancelledAtIsNull(familyId).isPresent()) {
            throw new ConflictException("Family already has an active goal. Cancel it before creating a new one.");
        }
        FamilyGoal goal = new FamilyGoal();
        goal.setFamily(familyService.findById(familyId));
        goal.setName(request.getName());
        goal.setTargetPoints(request.getTargetPoints());
        return toResponse(goalRepository.save(goal), familyId);
    }

    @Transactional
    public FamilyGoalResponse cancelGoal(UUID familyId, UUID goalId) {
        FamilyGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found: " + goalId));
        if (!goal.getFamily().getId().equals(familyId)) {
            throw new BadRequestException("Goal does not belong to this family.");
        }
        if (goal.getCancelledAt() != null || goal.getReachedAt() != null) {
            throw new BadRequestException("Goal is already finished.");
        }
        goal.setCancelledAt(LocalDateTime.now(clock));
        return toResponse(goalRepository.save(goal), familyId);
    }

    private FamilyGoalResponse toResponse(FamilyGoal goal, UUID familyId) {
        int progress = pointTransactionRepository.sumFamilyGoalProgressSince(familyId, goal.getCreatedAt());
        double pct = goal.getTargetPoints() > 0
                ? Math.min(100.0, (double) progress / goal.getTargetPoints() * 100.0)
                : 0.0;
        FamilyGoalResponse r = new FamilyGoalResponse();
        r.setId(goal.getId());
        r.setFamilyId(familyId);
        r.setName(goal.getName());
        r.setTargetPoints(goal.getTargetPoints());
        r.setCurrentProgress(progress);
        r.setProgressPct(pct);
        r.setCreatedAt(goal.getCreatedAt());
        r.setReachedAt(goal.getReachedAt());
        r.setCancelledAt(goal.getCancelledAt());
        return r;
    }
}
