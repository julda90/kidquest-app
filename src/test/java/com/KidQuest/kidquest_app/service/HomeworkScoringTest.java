package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.request.ApproveRequest;
import com.KidQuest.kidquest_app.dto.response.ApprovalResult;
import com.KidQuest.kidquest_app.dto.response.TaskResponse;
import com.KidQuest.kidquest_app.exception.ConflictException;
import com.KidQuest.kidquest_app.model.*;
import com.KidQuest.kidquest_app.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class HomeworkScoringTest {

    @Mock TaskRepository taskRepository;
    @Mock PointTransactionRepository pointTransactionRepository;
    @Mock ChildBadgeRepository childBadgeRepository;
    @Mock FamilyGoalRepository familyGoalRepository;
    @Mock TaskService taskService;
    @Mock ProgressService progressService;
    @Mock Clock clock;

    @InjectMocks
    TaskApprovalService service;

    @Captor ArgumentCaptor<PointTransaction> txCaptor;

    UUID taskId;
    UUID childId;
    Child child;
    Family family;
    Task task;

    @BeforeEach
    void setUp() {
        taskId  = UUID.randomUUID();
        childId = UUID.randomUUID();
        family  = new Family(); family.setId(UUID.randomUUID());
        child   = new Child();  child.setId(childId); child.setFamily(family); child.setAge(8);
        task    = new Task();
        task.setId(taskId);
        task.setTitle("Domácí úkol");
        task.setKind(TaskKind.HOMEWORK);
        task.setPointValue(20);
        task.setBonusValue(15);
        task.setLatePointValue(10);
        task.setNoReminderBonus(5);
        task.setStatus(TaskStatus.ASSIGNED);
        task.setAssignedTo(child);
        task.setFamily(family);

        Instant now = Instant.parse("2026-01-15T10:00:00Z");
        when(clock.instant()).thenReturn(now);
        when(clock.getZone()).thenReturn(ZoneOffset.UTC);

        when(taskService.findById(taskId)).thenReturn(task);
        when(taskService.response(task)).thenReturn(new TaskResponse());
        when(taskRepository.save(any())).thenReturn(task);

        when(progressService.xp(childId)).thenReturn(0);
        when(progressService.levelFromXp(eq(child), anyInt()))
                .thenReturn(new ProgressService.LevelInfo(1, 0, 0, 200, 0.0));
        when(progressService.streak(eq(childId), any(LocalDate.class)))
                .thenReturn(new ProgressService.StreakInfo(0, false));

        when(familyGoalRepository.findByFamilyIdAndReachedAtIsNullAndCancelledAtIsNull(any()))
                .thenReturn(Optional.empty());

        // default: no previous TASK tx (not yet approved)
        when(pointTransactionRepository.existsByTaskIdAndType(taskId, TransactionType.TASK))
                .thenReturn(false);
        // default: first task today
        when(pointTransactionRepository.existsByChildIdAndTypeAndCreatedAtBetween(
                eq(childId), eq(TransactionType.TASK), any(), any())).thenReturn(false);

        // default badge counts
        when(pointTransactionRepository.countBonusByChildIdAndBonusKind(childId, "SELF_CHECK"))
                .thenReturn(0L);
        when(pointTransactionRepository.countBonusByChildIdAndBonusKind(childId, "NO_REMINDER"))
                .thenReturn(0L);
        when(taskRepository.countByAssignedToIdAndStatusAndKindIn(any(), any(), any()))
                .thenReturn(0L);
        when(childBadgeRepository.existsByChildIdAndBadge(any(), any())).thenReturn(false);
    }

    @Test
    void test1_allBonuses_threeTransactionsSumForty() {
        ApproveRequest req = new ApproveRequest();
        req.setOnTime(true);
        req.setSelfChecked(true);
        req.setNoReminder(true);

        ApprovalResult result = service.approve(taskId, req);

        verify(pointTransactionRepository, times(3)).save(txCaptor.capture());
        List<PointTransaction> saved = txCaptor.getAllValues();

        long sum = saved.stream().mapToInt(PointTransaction::getAmount).sum();
        assertEquals(40, sum, "Sum must be 20 + 15 + 5 = 40");

        // Verify types and bonus_kinds
        PointTransaction taskTx      = saved.get(0);
        PointTransaction selfCheckTx = saved.get(1);
        PointTransaction noRemTx     = saved.get(2);

        assertEquals(TransactionType.TASK,  taskTx.getType());
        assertNull(taskTx.getBonusKind());
        assertEquals(20, taskTx.getAmount());

        assertEquals(TransactionType.BONUS, selfCheckTx.getType());
        assertEquals("SELF_CHECK", selfCheckTx.getBonusKind());
        assertEquals(15, selfCheckTx.getAmount());

        assertEquals(TransactionType.BONUS, noRemTx.getType());
        assertEquals("NO_REMINDER", noRemTx.getBonusKind());
        assertEquals(5, noRemTx.getAmount());

        assertEquals(40, result.getAwardedPoints());
    }

    @Test
    void test2_lateLoneTask_tenPoints() {
        ApproveRequest req = new ApproveRequest();
        req.setOnTime(false);
        req.setSelfChecked(false);
        req.setNoReminder(false);

        service.approve(taskId, req);

        verify(pointTransactionRepository, times(1)).save(txCaptor.capture());
        PointTransaction tx = txCaptor.getValue();

        assertEquals(TransactionType.TASK, tx.getType());
        assertEquals(10, tx.getAmount());
        assertTrue(tx.getReason().contains("(později)"), "Reason must contain '(később)'");
    }

    @Test
    void test3_secondApproval_conflict() {
        when(pointTransactionRepository.existsByTaskIdAndType(taskId, TransactionType.TASK))
                .thenReturn(true);

        ApproveRequest req = new ApproveRequest();
        req.setOnTime(true);

        assertThrows(ConflictException.class, () -> service.approve(taskId, req));
        verify(pointTransactionRepository, never()).save(any(PointTransaction.class));
    }

    @Test
    void test4_selfCheckCountsForSherlock_noReminderCountsForSelfStarter() {
        // Scenario A: 10 SELF_CHECK → SHERLOCK, not SELF_STARTER
        when(pointTransactionRepository.countBonusByChildIdAndBonusKind(childId, "SELF_CHECK"))
                .thenReturn(10L);
        when(pointTransactionRepository.countBonusByChildIdAndBonusKind(childId, "NO_REMINDER"))
                .thenReturn(0L);
        when(childBadgeRepository.existsByChildIdAndBadge(childId, Badge.SHERLOCK)).thenReturn(false);
        when(childBadgeRepository.existsByChildIdAndBadge(childId, Badge.SELF_STARTER)).thenReturn(false);

        ApproveRequest req = new ApproveRequest();
        req.setOnTime(true);
        req.setSelfChecked(true);

        ApprovalResult resultA = service.approve(taskId, req);
        assertTrue(resultA.getNewBadges().contains(Badge.SHERLOCK), "SHERLOCK should be earned");
        assertFalse(resultA.getNewBadges().contains(Badge.SELF_STARTER), "SELF_STARTER should NOT be earned");

        // Scenario B: 10 NO_REMINDER → SELF_STARTER, not SHERLOCK (fresh task)
        UUID taskId2 = UUID.randomUUID();
        Task task2 = new Task();
        task2.setId(taskId2);
        task2.setTitle("Domácí úkol 2");
        task2.setKind(TaskKind.HOMEWORK);
        task2.setPointValue(20);
        task2.setBonusValue(15);
        task2.setLatePointValue(10);
        task2.setNoReminderBonus(5);
        task2.setStatus(TaskStatus.ASSIGNED);
        task2.setAssignedTo(child);
        task2.setFamily(family);

        when(taskService.findById(taskId2)).thenReturn(task2);
        when(pointTransactionRepository.existsByTaskIdAndType(taskId2, TransactionType.TASK))
                .thenReturn(false);
        when(pointTransactionRepository.countBonusByChildIdAndBonusKind(childId, "SELF_CHECK"))
                .thenReturn(0L);
        when(pointTransactionRepository.countBonusByChildIdAndBonusKind(childId, "NO_REMINDER"))
                .thenReturn(10L);
        when(childBadgeRepository.existsByChildIdAndBadge(childId, Badge.SHERLOCK)).thenReturn(false);
        when(childBadgeRepository.existsByChildIdAndBadge(childId, Badge.SELF_STARTER)).thenReturn(false);

        ApproveRequest req2 = new ApproveRequest();
        req2.setOnTime(true);
        req2.setNoReminder(true);

        ApprovalResult resultB = service.approve(taskId2, req2);
        assertFalse(resultB.getNewBadges().contains(Badge.SHERLOCK), "SHERLOCK should NOT be earned");
        assertTrue(resultB.getNewBadges().contains(Badge.SELF_STARTER), "SELF_STARTER should be earned");
    }
}
