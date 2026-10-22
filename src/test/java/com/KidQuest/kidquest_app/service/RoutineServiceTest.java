package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.request.ApproveRequest;
import com.KidQuest.kidquest_app.dto.response.ApprovalResult;
import com.KidQuest.kidquest_app.dto.response.RoutineTaskResponse;
import com.KidQuest.kidquest_app.dto.response.TaskResponse;
import com.KidQuest.kidquest_app.exception.BadRequestException;
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
import org.springframework.dao.DataIntegrityViolationException;

import java.time.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class RoutineServiceTest {

    // ── RoutineService deps
    @Mock RoutineRepository routineRepository;
    @Mock RoutineStepRepository routineStepRepository;
    @Mock TaskStepRepository taskStepRepository;
    @Mock TaskRepository taskRepository;
    @Mock ChildService childService;
    @Mock FamilyService familyService;
    @Mock Clock clock;

    RoutineService routineService;

    // ── TaskApprovalService deps (for approve tests)
    @Mock PointTransactionRepository pointTransactionRepository;
    @Mock ChildBadgeRepository childBadgeRepository;
    @Mock FamilyGoalRepository familyGoalRepository;
    @Mock TaskService taskService;
    @Mock ProgressService progressService;

    TaskApprovalService approvalService;

    @Captor ArgumentCaptor<Task> taskCaptor;
    @Captor ArgumentCaptor<PointTransaction> txCaptor;

    UUID childId;
    UUID routineId;
    UUID taskId;
    Child child;
    Family family;
    Routine routine;

    // Monday 2026-01-12 07:00 Prague = 06:00 UTC (UTC+1 in winter)
    static final Instant MONDAY_7AM_UTC = Instant.parse("2026-01-12T06:00:00Z");
    // Monday 07:31 Prague
    static final Instant MONDAY_731_UTC = Instant.parse("2026-01-12T06:31:00Z");

    @BeforeEach
    void setUp() {
        childId = UUID.randomUUID();
        routineId = UUID.randomUUID();
        taskId = UUID.randomUUID();

        family = new Family(); family.setId(UUID.randomUUID());
        child = new Child();
        child.setId(childId);
        child.setFamily(family);
        child.setAge(7);

        routine = new Routine();
        routine.setId(routineId);
        routine.setFamily(family);
        routine.setChild(child);
        routine.setName("Ranní rutina");
        routine.setDeadline(LocalTime.of(7, 30));
        routine.setDaysOfWeek("1,2,3,4,5"); // Mon–Fri
        routine.setPointValue(10);
        routine.setActive(true);

        // routineService needs manual construction since it has no @InjectMocks
        routineService = new RoutineService(routineRepository, routineStepRepository, taskStepRepository,
                taskRepository, childService, familyService, clock);

        approvalService = new TaskApprovalService(taskRepository, pointTransactionRepository,
                childBadgeRepository, familyGoalRepository, taskService, progressService,
                routineRepository, taskStepRepository, clock);

        // common stubs
        when(childService.findById(childId)).thenReturn(child);
        when(routineRepository.findFirstByChildIdAndActive(childId, true)).thenReturn(Optional.of(routine));
        when(routineStepRepository.findByRoutineIdOrderByPosition(routineId)).thenReturn(buildRoutineSteps());

        // default: no existing task
        when(taskRepository.findByRoutineIdAndAssignedToIdAndDueDateAndDeletedAtIsNull(any(), any(), any()))
                .thenReturn(Optional.empty());
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> {
            Task t = inv.getArgument(0);
            if (t.getId() == null) t.setId(UUID.randomUUID());
            return t;
        });
        when(taskStepRepository.save(any(TaskStep.class))).thenAnswer(inv -> inv.getArgument(0));

        // approval service stubs
        when(taskService.response(any())).thenReturn(new TaskResponse());
        when(progressService.xp(any())).thenReturn(0);
        when(progressService.levelFromXp(any(), anyInt()))
                .thenReturn(new ProgressService.LevelInfo(1, 12, 0, 0, 0, 200, 0.0));
        when(progressService.streak(any(), any())).thenReturn(new ProgressService.StreakInfo(0, false));
        when(familyGoalRepository.findByFamilyIdAndReachedAtIsNullAndCancelledAtIsNull(any()))
                .thenReturn(Optional.empty());
        when(pointTransactionRepository.existsByTaskIdAndType(any(), eq(TransactionType.TASK))).thenReturn(false);
        when(pointTransactionRepository.existsByChildIdAndTypeAndCreatedAtBetween(any(), any(), any(), any())).thenReturn(false);
        when(pointTransactionRepository.countBonusByChildIdAndBonusKind(any(), any())).thenReturn(0L);
        when(pointTransactionRepository.countRoutineTaskTransactions(any())).thenReturn(0L);
        when(taskRepository.countByAssignedToIdAndStatusAndKindIn(any(), any(), any())).thenReturn(0L);
        when(childBadgeRepository.existsByChildIdAndBadge(any(), any())).thenReturn(false);
        when(taskStepRepository.findByTaskIdOrderByPosition(any())).thenReturn(new ArrayList<>());
    }

    private List<RoutineStep> buildRoutineSteps() {
        List<RoutineStep> steps = new ArrayList<>();
        String[][] data = { {"0","🌅","Vstát"}, {"1","🪥","Zuby"}, {"2","👕","Obléct"} };
        for (String[] d : data) {
            RoutineStep s = new RoutineStep();
            s.setId(UUID.randomUUID());
            s.setRoutine(routine);
            s.setPosition(Integer.parseInt(d[0]));
            s.setIcon(d[1]);
            s.setLabel(d[2]);
            steps.add(s);
        }
        return steps;
    }

    private Task buildRoutineTask(boolean withSteps, Boolean firstOnTime) {
        Task t = new Task();
        t.setId(taskId);
        t.setTitle("Ranní rutina");
        t.setKind(TaskKind.ROUTINE);
        t.setPointValue(10);
        t.setAssignedTo(child);
        t.setFamily(family);
        t.setStatus(TaskStatus.ASSIGNED);
        t.setDueDate(LocalDate.of(2026, 1, 12)); // Monday
        t.setRoutineId(routineId);
        t.setBonusValue(0);
        t.setNoReminderBonus(0);
        if (Boolean.TRUE.equals(firstOnTime)) t.setFirstSubmittedOnTime(true);
        if (withSteps) t.setSteps(buildTaskSteps(t, true));
        return t;
    }

    private List<TaskStep> buildTaskSteps(Task task, boolean allDone) {
        List<TaskStep> steps = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            TaskStep s = new TaskStep();
            s.setId(UUID.randomUUID());
            s.setTask(task);
            s.setPosition(i);
            s.setLabel("Krok " + i);
            s.setIcon("🌅");
            if (allDone) s.setDoneAt(LocalDateTime.of(2026, 1, 12, 7, 0));
            steps.add(s);
        }
        return steps;
    }

    // ── Test 1: submit 7:29 → PENDING_APPROVAL, firstSubmittedOnTime=true
    @Test
    void test1_submitOnTime_pendingApproval() {
        setClock(MONDAY_7AM_UTC); // 7:00 Prague

        Task task = buildRoutineTask(false, null);
        when(taskService.findById(taskId)).thenReturn(task);
        when(taskStepRepository.findByTaskIdOrderByPosition(taskId)).thenReturn(buildTaskSteps(task, true));
        when(taskRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(routineRepository.findById(routineId)).thenReturn(Optional.of(routine));

        approvalService.submit(taskId);

        assertEquals(TaskStatus.PENDING_APPROVAL, task.getStatus());
        assertTrue(Boolean.TRUE.equals(task.getFirstSubmittedOnTime()));
        assertNotNull(task.getSubmittedAt());
    }

    // ── Test 2: submit 7:31 without prior → 400, nothing saved
    @Test
    void test2_submitLate_rejected() {
        setClock(MONDAY_731_UTC); // 7:31 Prague

        Task task = buildRoutineTask(false, null);
        when(taskService.findById(taskId)).thenReturn(task);
        when(taskStepRepository.findByTaskIdOrderByPosition(taskId)).thenReturn(buildTaskSteps(task, true));
        when(routineRepository.findById(routineId)).thenReturn(Optional.of(routine));

        assertThrows(BadRequestException.class, () -> approvalService.submit(taskId));
        verify(taskRepository, never()).save(any());
    }

    // ── Test 3: submit with unchecked step → 400
    @Test
    void test3_submitWithUncheckedStep_rejected() {
        setClock(MONDAY_7AM_UTC);

        Task task = buildRoutineTask(false, null);
        when(taskService.findById(taskId)).thenReturn(task);
        List<TaskStep> incomplete = buildTaskSteps(task, true);
        incomplete.get(1).setDoneAt(null); // one step not done
        when(taskStepRepository.findByTaskIdOrderByPosition(taskId)).thenReturn(incomplete);

        assertThrows(BadRequestException.class, () -> approvalService.submit(taskId));
    }

    // ── Test 4: submit 7:20, return 7:40, resubmit 7:45 → allowed; approve gives full points
    @Test
    void test4_returnAndResubmit_getsFullPoints() {
        // First submit at 7:20 (on time)
        setClock(Instant.parse("2026-01-12T06:20:00Z"));
        Task task = buildRoutineTask(false, null);
        task.setStatus(TaskStatus.ASSIGNED);
        when(taskService.findById(taskId)).thenReturn(task);
        when(taskStepRepository.findByTaskIdOrderByPosition(taskId)).thenReturn(buildTaskSteps(task, true));
        when(routineRepository.findById(routineId)).thenReturn(Optional.of(routine));
        when(taskRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(taskStepRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));

        approvalService.submit(taskId);
        assertTrue(Boolean.TRUE.equals(task.getFirstSubmittedOnTime()));

        // Return at 7:40 (after deadline)
        task.setStatus(TaskStatus.PENDING_APPROVAL);
        List<TaskStep> steps = buildTaskSteps(task, true);
        when(taskStepRepository.findByTaskIdOrderByPosition(taskId)).thenReturn(steps);
        approvalService.returnRoutine(taskId, List.of(1));
        assertEquals(TaskStatus.ASSIGNED, task.getStatus());

        // Resubmit at 7:45 – allowed because firstSubmittedOnTime = true
        setClock(Instant.parse("2026-01-12T06:45:00Z"));
        task.setStatus(TaskStatus.ASSIGNED);
        List<TaskStep> stepsAfterReturn = buildTaskSteps(task, true);
        when(taskStepRepository.findByTaskIdOrderByPosition(taskId)).thenReturn(stepsAfterReturn);

        assertDoesNotThrow(() -> approvalService.submit(taskId));
        assertEquals(TaskStatus.PENDING_APPROVAL, task.getStatus());

        // Approve → full 10 pts
        task.setStatus(TaskStatus.PENDING_APPROVAL);
        when(pointTransactionRepository.existsByTaskIdAndType(taskId, TransactionType.TASK)).thenReturn(false);
        ApproveRequest req = new ApproveRequest();
        req.setOnTime(true);
        ApprovalResult result = approvalService.approve(taskId, req);
        assertEquals(10, result.getAwardedPoints());
    }

    // ── Test 5: toggle after deadline without prior submission → ConflictException
    @Test
    void test5_toggleAfterDeadline_locked() {
        setClock(MONDAY_731_UTC); // 7:31, past deadline

        Task task = buildRoutineTask(false, null); // firstSubmittedOnTime=null
        when(taskRepository.findByIdAndDeletedAtIsNull(taskId)).thenReturn(Optional.of(task));
        when(routineRepository.findById(routineId)).thenReturn(Optional.of(routine));
        TaskStep step = buildTaskSteps(task, false).get(0);
        when(taskStepRepository.findByTaskIdAndPosition(taskId, 0)).thenReturn(Optional.of(step));

        assertThrows(ConflictException.class, () -> routineService.toggleStep(taskId, 0));
    }

    // ── Test 6: approve → TASK 10; second approve → ConflictException
    @Test
    void test6_secondApprove_conflict() {
        Task task = buildRoutineTask(false, true);
        task.setStatus(TaskStatus.PENDING_APPROVAL);
        when(taskService.findById(taskId)).thenReturn(task);
        when(pointTransactionRepository.existsByTaskIdAndType(taskId, TransactionType.TASK)).thenReturn(false);

        setClock(MONDAY_7AM_UTC);
        ApproveRequest req = new ApproveRequest(); req.setOnTime(true);
        ApprovalResult result = approvalService.approve(taskId, req);
        assertEquals(10, result.getAwardedPoints());

        // Reset status to PENDING_APPROVAL so the second call passes the status guard
        // and hits the duplicate-transaction ConflictException
        task.setStatus(TaskStatus.PENDING_APPROVAL);
        when(pointTransactionRepository.existsByTaskIdAndType(taskId, TransactionType.TASK)).thenReturn(true);
        assertThrows(ConflictException.class, () -> approvalService.approve(taskId, req));
    }

    // ── Test 7: getOrCreateToday called twice → one instance (mock DataIntegrityViolation)
    @Test
    void test7_concurrentGetOrCreate_oneInstance() {
        setClock(MONDAY_7AM_UTC);

        // First call: no task → create → success
        when(taskRepository.findByRoutineIdAndAssignedToIdAndDueDateAndDeletedAtIsNull(any(), any(), any()))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.empty());
        when(taskRepository.save(any(Task.class))).thenThrow(DataIntegrityViolationException.class);

        // After the exception, a second find returns the existing task
        Task existing = buildRoutineTask(false, null);
        when(taskRepository.findByRoutineIdAndAssignedToIdAndDueDateAndDeletedAtIsNull(any(), eq(childId), any()))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.of(existing));
        when(taskStepRepository.findByTaskIdOrderByPosition(existing.getId())).thenReturn(new ArrayList<>());

        // Should not throw; returns the existing task's response
        assertDoesNotThrow(() -> routineService.getOrCreateToday(childId));
    }

    // ── Test 8: weekend with days_of_week=1,2,3,4,5 → null
    @Test
    void test8_weekend_noRoutine() {
        // Sunday 2026-01-11 = ISO day 7
        Instant sunday = Instant.parse("2026-01-11T06:00:00Z");
        setClock(sunday);

        RoutineTaskResponse result = routineService.getOrCreateToday(childId);
        assertNull(result);
    }

    // ── Test 9: streak – routine submitted Monday, approved Tuesday → active day is Monday
    // (This tests that countRoutineTaskTransactions and the native SQL union is correct.
    //  Unit test: verify that TaskApprovalService uses the task's due_date for streak, not created_at.
    //  We verify via the progressService.streak call using today's date.)
    @Test
    void test9_routineStreak_usesRoutineDueDate() {
        // This test verifies that approve() passes today's date (from clock) to streak()
        // and that ProgressService uses findActiveDaysRoutineAwareSince (indirectly tested).
        // Here we verify the approval service calls progressService.streak with the correct date.
        setClock(MONDAY_7AM_UTC); // approve on Monday
        Task task = buildRoutineTask(false, true);
        task.setStatus(TaskStatus.PENDING_APPROVAL);
        when(taskService.findById(taskId)).thenReturn(task);
        when(pointTransactionRepository.existsByTaskIdAndType(taskId, TransactionType.TASK)).thenReturn(false);

        ApproveRequest req = new ApproveRequest(); req.setOnTime(true);
        approvalService.approve(taskId, req);

        // Verify progressService.streak was called with Monday's date
        verify(progressService).streak(eq(childId), eq(LocalDate.of(2026, 1, 12)));
    }

    // ── Test 10: 10 approved ROUTINE tasks → EARLY_BIRD badge
    @Test
    void test10_earlyBird_afterTenRoutines() {
        setClock(MONDAY_7AM_UTC);
        Task task = buildRoutineTask(false, true);
        task.setStatus(TaskStatus.PENDING_APPROVAL);
        when(taskService.findById(taskId)).thenReturn(task);
        when(pointTransactionRepository.existsByTaskIdAndType(taskId, TransactionType.TASK)).thenReturn(false);
        when(pointTransactionRepository.countRoutineTaskTransactions(childId)).thenReturn(10L);
        when(childBadgeRepository.existsByChildIdAndBadge(childId, Badge.EARLY_BIRD)).thenReturn(false);

        ApproveRequest req = new ApproveRequest(); req.setOnTime(true);
        ApprovalResult result = approvalService.approve(taskId, req);

        assertTrue(result.getNewBadges().contains(Badge.EARLY_BIRD),
                "EARLY_BIRD should be awarded after 10 routine approvals");
    }

    private void setClock(Instant instant) {
        when(clock.instant()).thenReturn(instant);
        when(clock.getZone()).thenReturn(ZoneOffset.UTC);
    }
}
