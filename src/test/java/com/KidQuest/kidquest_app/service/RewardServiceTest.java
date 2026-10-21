package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.exception.ConflictException;
import com.KidQuest.kidquest_app.model.Family;
import com.KidQuest.kidquest_app.model.Reward;
import com.KidQuest.kidquest_app.model.RewardTier;
import com.KidQuest.kidquest_app.repository.RewardRedemptionRepository;
import com.KidQuest.kidquest_app.repository.RewardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RewardServiceTest {

    @Mock private RewardRepository rewardRepository;
    @Mock private RewardRedemptionRepository redemptionRepository;
    @Mock private FamilyService familyService;
    @Mock private ChildService childService;

    private RewardService rewardService;
    private final UUID familyId = UUID.randomUUID();
    private final UUID rewardId = UUID.randomUUID();

    private Reward makeReward() {
        Reward r = new Reward();
        r.setId(rewardId);
        r.setName("Test Reward");
        r.setPointCost(100);
        r.setActive(true);
        r.setTier(RewardTier.SMALL);
        Family family = new Family();
        family.setId(familyId);
        r.setFamily(family);
        return r;
    }

    @BeforeEach
    void setUp() {
        rewardService = new RewardService(rewardRepository, redemptionRepository, familyService, childService);
    }

    @Test
    void deleteRewardWithRedemptionThrows409() {
        when(rewardRepository.findById(rewardId)).thenReturn(Optional.of(makeReward()));
        when(redemptionRepository.existsByRewardId(rewardId)).thenReturn(true);

        assertThrows(ConflictException.class, () -> rewardService.delete(rewardId));
        verify(rewardRepository, never()).deleteById(any());
    }

    @Test
    void deleteRewardWithoutRedemptionSucceeds() {
        when(rewardRepository.findById(rewardId)).thenReturn(Optional.of(makeReward()));
        when(redemptionRepository.existsByRewardId(rewardId)).thenReturn(false);

        rewardService.delete(rewardId);
        verify(rewardRepository).deleteById(rewardId);
    }

    @Test
    void archiveHidesRewardFromActiveList() {
        Reward reward = makeReward();
        when(rewardRepository.findById(rewardId)).thenReturn(Optional.of(reward));
        when(rewardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = rewardService.archive(rewardId);

        assertNotNull(response.getArchivedAt());
        assertFalse(response.getActive());
    }

    @Test
    void restoreRewardClearsArchivedAt() {
        Reward reward = makeReward();
        reward.setArchivedAt(java.time.LocalDateTime.now().minusDays(1));
        reward.setActive(false);
        when(rewardRepository.findById(rewardId)).thenReturn(Optional.of(reward));
        when(rewardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = rewardService.restore(rewardId);

        assertNull(response.getArchivedAt());
        assertTrue(response.getActive());
    }

    @Test
    void findByFamilyIdDefaultExcludesArchived() {
        when(rewardRepository.findActiveByFamilyId(familyId)).thenReturn(List.of());
        rewardService.findByFamilyId(familyId);
        verify(rewardRepository).findActiveByFamilyId(familyId);
        verify(rewardRepository, never()).findByFamilyId(familyId);
    }
}
