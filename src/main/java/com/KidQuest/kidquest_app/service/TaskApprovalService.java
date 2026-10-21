package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.request.ApproveRequest;
import com.KidQuest.kidquest_app.dto.response.ApprovalResult;
import com.KidQuest.kidquest_app.exception.BadRequestException;
import com.KidQuest.kidquest_app.exception.ConflictException;
import com.KidQuest.kidquest_app.model.*;
import com.KidQuest.kidquest_app.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class TaskApprovalService {

    private final TaskRepository taskRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final ChildBadgeRepository childBadgeRepository;
    private final FamilyGoalRepository familyGoalRepository;
    private final TaskService taskService;
    private final ProgressService progressService;
    private final RoutineRepository routineRepository;
    private final TaskStepRepository taskStepRepository;
    private final Clock clock;

    public TaskApprovalService(TaskRepository taskRepository,
                               PointTransactionRepository pointTransactionRepository,
                               ChildBadgeRepository childBadgeRepository,
                               FamilyGoalRepository familyGoalRepository,
                               TaskService taskService,
                               ProgressService progressService,
                               RoutineRepository routineRepository,
                               TaskStepRepository taskStepRepository,
                               Clock clock) {
        this.taskRepository = taskRepository;
        this.pointTransactionRepository = pointTransactionRepository;
        this.childBadgeRepository = childBadgeRepository;
        this.familyGoalRepository = familyGoalRepository;
        this.taskService = taskService;
        this.progressService = progressService;
        this.routineRepository = routineRepository;
        this.taskStepRepository = taskStepRepository;
        this.clock = clock;
    }

    @Transactional
    public ApprovalResult approve(UUID taskId, ApproveRequest request) {
        Task task = taskService.findById(taskId);

        if (task.getAssignedTo() == null) {
            throw new BadRequestException("Task is not assigned to a child.");
        }
        if (task.getStatus() != TaskStatus.PENDING_APPROVAL && task.getStatus() != TaskStatus.ASSIGNED) {
            throw new BadRequestException("Task must be in PENDING_APPROVAL or ASSIGNED status to be approved.");
        }
        if (pointTransactionRepository.existsByTaskIdAndType(taskId, TransactionType.TASK)) {
            throw new ConflictException("Task has already been approved. Points were already awarded.");
        }

        LocalDateTime now = LocalDateTime.now(clock);
        LocalDate today   = now.toLocalDate();
        Child child       = task.getAssignedTo();
        UUID childId      = child.getId();

        // Capture level before any new transactions
        int xpBefore = progressService.xp(childId);
        int levelBefore = progressService.levelFromXp(child, xpBefore).level();

        // Detect if today already has a TASK transaction (for streak bonus eligibility)
        boolean firstTaskToday = !pointTransactionRepository.existsByChildIdAndTypeAndCreatedAtBetween(
                childId, TransactionType.TASK, today.atStartOfDay(), today.plusDays(1).atStartOfDay());

        task.setStatus(TaskStatus.COMPLETED);
        task.setApprovedAt(now);
        taskRepository.save(task);

        boolean onTime = request.isOnTime();
        int basePoints = task.getPointValue() != null ? task.getPointValue() : 0;
        if (!onTime && task.getLatePointValue() != null) {
            basePoints = task.getLatePointValue();
        }
        int awarded = basePoints;

        PointTransaction taskTx = new PointTransaction();
        taskTx.setChild(child);
        taskTx.setAmount(basePoints);
        taskTx.setReason(task.getTitle() + (onTime ? "" : " (později)"));
        taskTx.setType(TransactionType.TASK);
        taskTx.setTask(task);
        pointTransactionRepository.save(taskTx);

        if (request.isSelfChecked() && task.getBonusValue() != null && task.getBonusValue() > 0) {
            PointTransaction selfCheckTx = new PointTransaction();
            selfCheckTx.setChild(child);
            selfCheckTx.setAmount(task.getBonusValue());
            selfCheckTx.setReason("Detektiv chyb: " + task.getTitle());
            selfCheckTx.setType(TransactionType.BONUS);
            selfCheckTx.setBonusKind("SELF_CHECK");
            selfCheckTx.setTask(task);
            pointTransactionRepository.save(selfCheckTx);
            awarded += task.getBonusValue();
        }

        if (request.isNoReminder() && task.getNoReminderBonus() > 0) {
            PointTransaction noReminderTx = new PointTransaction();
            noReminderTx.setChild(child);
            noReminderTx.setAmount(task.getNoReminderBonus());
            noReminderTx.setReason("Bez připomínání: " + task.getTitle());
            noReminderTx.setType(TransactionType.BONUS);
            noReminderTx.setBonusKind("NO_REMINDER");
            noReminderTx.setTask(task);
            pointTransactionRepository.save(noReminderTx);
            awarded += task.getNoReminderBonus();
        }

        // Streak bonus — awarded on the first task of each new active day
        ProgressService.StreakInfo streakInfo = progressService.streak(childId, today);
        if (firstTaskToday && streakInfo.days() > 0) {
            PointTransaction streakTx = new PointTransaction();
            streakTx.setChild(child);
            streakTx.setAmount(ProgressService.STREAK_BONUS);
            streakTx.setReason("Série " + streakInfo.days() + " " + (streakInfo.days() == 1 ? "den" : "dní"));
            streakTx.setType(TransactionType.STREAK);
            pointTransactionRepository.save(streakTx);
            awarded += ProgressService.STREAK_BONUS;
        }

        // Level-up detection
        int xpAfter    = progressService.xp(childId);
        int levelAfter = progressService.levelFromXp(child, xpAfter).level();
        boolean levelUp = levelAfter > levelBefore;

        List<Badge> newBadges = evaluateBadges(task);

        boolean goalReached = updateFamilyGoal(task.getFamily().getId(), now);

        ApprovalResult result = new ApprovalResult();
        result.setTask(taskService.response(task));
        result.setAwardedPoints(awarded);
        result.setNewBadges(newBadges);
        result.setLevelUp(levelUp);
        result.setNewLevel(levelAfter);
        result.setStreakDays(streakInfo.days());
        result.setGoalReached(goalReached);
        return result;
    }

    @Transactional
    public void reject(UUID taskId) {
        Task task = taskService.findById(taskId);
        task.setStatus(TaskStatus.REJECTED);
        taskRepository.save(task);
    }

    @Transactional
    public void returnRoutine(UUID taskId, List<Integer> stepPositions) {
        Task task = taskService.findById(taskId);
        if (task.getStatus() != TaskStatus.PENDING_APPROVAL) {
            throw new BadRequestException("Vrátit lze jen rutinu ve stavu PENDING_APPROVAL.");
        }
        List<TaskStep> steps = taskStepRepository.findByTaskIdOrderByPosition(task.getId());
        for (TaskStep s : steps) {
            if (stepPositions != null && stepPositions.contains(s.getPosition())) {
                s.setDoneAt(null);
                s.setReturned(true);
            }
        }
        taskStepRepository.saveAll(steps);
        task.setStatus(TaskStatus.ASSIGNED);
        taskRepository.save(task);
    }

    @Transactional
    public void submit(UUID taskId) {
        Task task = taskService.findById(taskId);
        if (task.getStatus() != TaskStatus.ASSIGNED) {
            throw new BadRequestException("Only ASSIGNED tasks can be submitted for approval.");
        }

        if (task.getKind() == TaskKind.ROUTINE) {
            submitRoutineTask(task);
        } else {
            task.setStatus(TaskStatus.PENDING_APPROVAL);
            taskRepository.save(task);
        }
    }

    private void submitRoutineTask(Task task) {
        List<TaskStep> steps = taskStepRepository.findByTaskIdOrderByPosition(task.getId());
        boolean allDone = steps.stream().allMatch(s -> s.getDoneAt() != null);
        if (!allDone) {
            throw new BadRequestException("Ještě nemáš všechno.");
        }

        ZoneId prague = ZoneId.of("Europe/Prague");
        ZonedDateTime nowPrague = ZonedDateTime.now(clock).withZoneSameInstant(prague);
        LocalDate today = nowPrague.toLocalDate();

        Routine routine = task.getRoutineId() != null
                ? routineRepository.findById(task.getRoutineId()).orElse(null)
                : null;
        LocalTime deadlineTime = (routine != null) ? routine.getDeadline() : LocalTime.of(7, 30);
        ZonedDateTime deadlineZdt = ZonedDateTime.of(today, deadlineTime, prague);
        boolean onTime = !nowPrague.isAfter(deadlineZdt);

        if (task.getFirstSubmittedOnTime() == null) {
            if (!onTime) {
                throw new BadRequestException("Dnes už je pozdě. Zítra to dáš! ⏰");
            }
            task.setFirstSubmittedOnTime(true);
        } else if (Boolean.TRUE.equals(task.getFirstSubmittedOnTime())) {
            ZonedDateTime endOfDay = ZonedDateTime.of(today, LocalTime.of(23, 59, 59), prague);
            if (nowPrague.isAfter(endOfDay)) {
                throw new BadRequestException("Dnes už je pozdě. Zítra to dáš! ⏰");
            }
        }

        task.setSubmittedAt(LocalDateTime.now(clock));
        task.setStatus(TaskStatus.PENDING_APPROVAL);
        steps.forEach(s -> s.setReturned(false));
        taskStepRepository.saveAll(steps);
        taskRepository.save(task);
    }

    @Transactional
    public List<ApprovalResult> approveBatch(List<UUID> taskIds) {
        ApproveRequest req = new ApproveRequest();
        List<ApprovalResult> results = new ArrayList<>();
        for (UUID id : taskIds) {
            try {
                results.add(approve(id, req));
            } catch (Exception e) {
                // skip already-approved or invalid; return partial success
            }
        }
        return results;
    }

    private List<Badge> evaluateBadges(Task task) {
        if (task.getAssignedTo() == null) return List.of();

        Child child = task.getAssignedTo();
        UUID childId = child.getId();
        List<Badge> earned = new ArrayList<>();

        checkAndAwardBadge(child, Badge.LUMBERJACK,
                countCompleted(childId, List.of(TaskKind.WOOD, TaskKind.KINDLING)), 10, earned);

        checkAndAwardBadge(child, Badge.HEAD_WAITER,
                countCompleted(childId, List.of(TaskKind.TABLE)), 20, earned);

        checkAndAwardBadge(child, Badge.TIDY,
                countCompleted(childId, List.of(TaskKind.ROOM)), 20, earned);

        checkAndAwardBadge(child, Badge.LAUNDRY_PRO,
                countCompleted(childId, List.of(TaskKind.LAUNDRY)), 20, earned);

        long selfCheckCount = pointTransactionRepository.countBonusByChildIdAndBonusKind(childId, "SELF_CHECK");
        checkAndAwardBadge(child, Badge.SHERLOCK, selfCheckCount, 10, earned);

        long noReminderCount = pointTransactionRepository.countBonusByChildIdAndBonusKind(childId, "NO_REMINDER");
        checkAndAwardBadge(child, Badge.SELF_STARTER, noReminderCount, 10, earned);

        long routineApprovals = pointTransactionRepository.countRoutineTaskTransactions(childId);
        checkAndAwardBadge(child, Badge.EARLY_BIRD, routineApprovals, 10, earned);

        return earned;
    }

    private long countCompleted(UUID childId, List<TaskKind> kinds) {
        return taskRepository.countByAssignedToIdAndStatusAndKindIn(childId, TaskStatus.COMPLETED, kinds);
    }

    private void checkAndAwardBadge(Child child, Badge badge, long count, int threshold, List<Badge> earned) {
        if (count >= threshold && !childBadgeRepository.existsByChildIdAndBadge(child.getId(), badge)) {
            ChildBadge cb = new ChildBadge();
            cb.setChild(child);
            cb.setBadge(badge);
            childBadgeRepository.save(cb);
            earned.add(badge);
        }
    }

    private boolean updateFamilyGoal(UUID familyId, LocalDateTime now) {
        return familyGoalRepository
                .findByFamilyIdAndReachedAtIsNullAndCancelledAtIsNull(familyId)
                .map(goal -> {
                    int progress = pointTransactionRepository
                            .sumFamilyGoalProgressSince(familyId, goal.getCreatedAt());
                    if (progress >= goal.getTargetPoints()) {
                        goal.setReachedAt(now);
                        familyGoalRepository.save(goal);
                        return true;
                    }
                    return false;
                })
                .orElse(false);
    }
}
