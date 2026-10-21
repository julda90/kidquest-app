package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.response.RedemptionResponse;
import com.KidQuest.kidquest_app.exception.BadRequestException;
import com.KidQuest.kidquest_app.exception.ConflictException;
import com.KidQuest.kidquest_app.exception.ResourceNotFoundException;
import com.KidQuest.kidquest_app.model.*;
import com.KidQuest.kidquest_app.repository.PointTransactionRepository;
import com.KidQuest.kidquest_app.repository.RewardRedemptionRepository;
import com.KidQuest.kidquest_app.repository.RewardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class RewardRedemptionService {

    private final RewardRedemptionRepository redemptionRepository;
    private final RewardRepository rewardRepository;
    private final ChildService childService;
    private final PointTransactionRepository pointTransactionRepository;
    private final Clock clock;

    public RewardRedemptionService(RewardRedemptionRepository redemptionRepository,
                                   RewardRepository rewardRepository,
                                   ChildService childService,
                                   PointTransactionRepository pointTransactionRepository,
                                   Clock clock) {
        this.redemptionRepository = redemptionRepository;
        this.rewardRepository = rewardRepository;
        this.childService = childService;
        this.pointTransactionRepository = pointTransactionRepository;
        this.clock = clock;
    }

    /** Child requests a reward redemption. Checks no existing REQUESTED for same reward+child. */
    @Transactional
    public RedemptionResponse redeem(UUID childId, UUID rewardId) {
        Child child = childService.findById(childId);
        Reward reward = rewardRepository.findById(rewardId)
                .orElseThrow(() -> new ResourceNotFoundException("Reward not found: " + rewardId));

        // Idempotency: block if already REQUESTED for same child+reward
        boolean alreadyRequested = redemptionRepository
                .findByChildIdAndStatus(childId, RedemptionStatus.REQUESTED)
                .stream()
                .anyMatch(r -> r.getReward().getId().equals(rewardId));
        if (alreadyRequested) {
            throw new ConflictException("Redemption already requested for this reward.");
        }

        RewardRedemption redemption = new RewardRedemption();
        redemption.setReward(reward);
        redemption.setChild(child);
        redemption.setPointCost(reward.getPointCost());
        redemption.setStatus(RedemptionStatus.REQUESTED);
        return toResponse(redemptionRepository.save(redemption));
    }

    /** Parent approves — deducts points (creates REDEEM transaction). */
    @Transactional
    public RedemptionResponse approve(UUID redemptionId) {
        RewardRedemption r = findEntity(redemptionId);
        if (r.getStatus() != RedemptionStatus.REQUESTED) {
            throw new BadRequestException("Only REQUESTED redemptions can be approved.");
        }

        r.setStatus(RedemptionStatus.APPROVED);
        r.setApprovedAt(LocalDateTime.now(clock));
        redemptionRepository.save(r);

        // Deduct points
        PointTransaction tx = new PointTransaction();
        tx.setChild(r.getChild());
        tx.setAmount(-r.getPointCost());
        tx.setType(TransactionType.REDEEM);
        tx.setRedemption(r);
        tx.setReason("Odměna: " + r.getReward().getName());
        pointTransactionRepository.save(tx);

        return toResponse(r);
    }

    /** Parent marks as delivered. */
    @Transactional
    public RedemptionResponse deliver(UUID redemptionId) {
        RewardRedemption r = findEntity(redemptionId);
        if (r.getStatus() != RedemptionStatus.APPROVED) {
            throw new BadRequestException("Only APPROVED redemptions can be delivered.");
        }
        r.setStatus(RedemptionStatus.DELIVERED);
        r.setDeliveredAt(LocalDateTime.now(clock));
        return toResponse(redemptionRepository.save(r));
    }

    /** Parent or child cancels. If already APPROVED, refunds the REDEEM transaction. */
    @Transactional
    public RedemptionResponse cancel(UUID redemptionId) {
        RewardRedemption r = findEntity(redemptionId);
        if (r.getStatus() == RedemptionStatus.DELIVERED || r.getStatus() == RedemptionStatus.CANCELLED) {
            throw new BadRequestException("Cannot cancel a " + r.getStatus() + " redemption.");
        }

        // Refund if already approved (REDEEM transaction was created)
        if (r.getStatus() == RedemptionStatus.APPROVED) {
            PointTransaction refund = new PointTransaction();
            refund.setChild(r.getChild());
            refund.setAmount(r.getPointCost());
            refund.setType(TransactionType.MANUAL);
            refund.setReason("Zrušení odměny: " + r.getReward().getName());
            pointTransactionRepository.save(refund);
        }

        r.setStatus(RedemptionStatus.CANCELLED);
        r.setCancelledAt(LocalDateTime.now(clock));
        return toResponse(redemptionRepository.save(r));
    }

    public List<RedemptionResponse> findByChild(UUID childId) {
        return redemptionRepository.findByChildId(childId)
                .stream().map(this::toResponse).toList();
    }

    public List<RedemptionResponse> findByChild(UUID childId, int days) {
        if (days <= 0) return findByChild(childId);
        LocalDateTime cutoff = LocalDateTime.now(clock).minusDays(days);
        return redemptionRepository.findByChildIdAndCreatedAtAfter(childId, cutoff)
                .stream().map(this::toResponse).toList();
    }

    public List<RedemptionResponse> findByFamily(UUID familyId) {
        return redemptionRepository.findByFamilyId(familyId)
                .stream().map(this::toResponse).toList();
    }

    public List<RedemptionResponse> findByFamilyAndStatus(UUID familyId, RedemptionStatus status) {
        return redemptionRepository.findByFamilyIdAndStatus(familyId, status)
                .stream().map(this::toResponse).toList();
    }

    private RewardRedemption findEntity(UUID id) {
        return redemptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Redemption not found: " + id));
    }

    private RedemptionResponse toResponse(RewardRedemption r) {
        RedemptionResponse res = new RedemptionResponse();
        res.setId(r.getId());
        res.setRewardId(r.getReward().getId());
        res.setRewardName(r.getReward().getName());
        res.setRewardIcon(r.getReward().getIcon());
        res.setChildId(r.getChild().getId());
        res.setChildName(r.getChild().getName());
        res.setPointCost(r.getPointCost());
        res.setStatus(r.getStatus());
        res.setCreatedAt(r.getCreatedAt());
        res.setApprovedAt(r.getApprovedAt());
        res.setDeliveredAt(r.getDeliveredAt());
        res.setCancelledAt(r.getCancelledAt());
        return res;
    }
}
