package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.request.RoutineRequest;
import com.KidQuest.kidquest_app.dto.response.RoutineResponse;
import com.KidQuest.kidquest_app.dto.response.RoutineTaskResponse;
import com.KidQuest.kidquest_app.dto.response.TaskStepResponse;
import com.KidQuest.kidquest_app.exception.BadRequestException;
import com.KidQuest.kidquest_app.exception.ResourceNotFoundException;
import com.KidQuest.kidquest_app.model.*;
import com.KidQuest.kidquest_app.repository.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RoutineService {

    private static final ZoneId PRAGUE = ZoneId.of("Europe/Prague");
    private static final DateTimeFormatter HH_MM = DateTimeFormatter.ofPattern("HH:mm");

    private final RoutineRepository routineRepository;
    private final RoutineStepRepository routineStepRepository;
    private final TaskStepRepository taskStepRepository;
    private final TaskRepository taskRepository;
    private final ChildService childService;
    private final FamilyService familyService;
    private final Clock clock;

    public RoutineService(RoutineRepository routineRepository,
                          RoutineStepRepository routineStepRepository,
                          TaskStepRepository taskStepRepository,
                          TaskRepository taskRepository,
                          ChildService childService,
                          FamilyService familyService,
                          Clock clock) {
        this.routineRepository = routineRepository;
        this.routineStepRepository = routineStepRepository;
        this.taskStepRepository = taskStepRepository;
        this.taskRepository = taskRepository;
        this.childService = childService;
        this.familyService = familyService;
        this.clock = clock;
    }

    /** Returns today's routine task for a child, creating the instance if needed. Returns null if no active routine today. */
    public RoutineTaskResponse getOrCreateToday(UUID childId) {
        Child child = childService.findById(childId);

        ZonedDateTime nowPrague = ZonedDateTime.now(clock).withZoneSameInstant(PRAGUE);
        LocalDate today = nowPrague.toLocalDate();
        int todayIso = today.getDayOfWeek().getValue(); // 1=Mon, 7=Sun

        Routine routine = routineRepository.findFirstByChildIdAndActive(childId, true).orElse(null);
        if (routine == null) return null;

        boolean isActiveDay = Arrays.stream(routine.getDaysOfWeek().split(","))
                .map(String::trim)
                .anyMatch(d -> d.equals(String.valueOf(todayIso)));
        if (!isActiveDay) return null;

        Task task = taskRepository.findByRoutineIdAndAssignedToIdAndDueDateAndDeletedAtIsNull(routine.getId(), childId, today)
                .orElse(null);

        if (task == null) {
            try {
                task = createDailyTask(routine, child, today);
            } catch (DataIntegrityViolationException e) {
                task = taskRepository.findByRoutineIdAndAssignedToIdAndDueDateAndDeletedAtIsNull(routine.getId(), childId, today)
                        .orElseThrow(() -> new IllegalStateException("Race condition: routine task not found after integrity violation"));
            }
        }

        return buildRoutineTaskResponse(task, routine, nowPrague);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Task createDailyTask(Routine routine, Child child, LocalDate today) {
        Task task = new Task();
        task.setTitle(routine.getName());
        task.setKind(TaskKind.ROUTINE);
        task.setPointValue(routine.getPointValue());
        task.setAssignedTo(child);
        task.setFamily(child.getFamily());
        task.setStatus(TaskStatus.ASSIGNED);
        task.setDueDate(today);
        task.setRoutineId(routine.getId());
        task.setBonusValue(0);
        task.setNoReminderBonus(0);
        task = taskRepository.save(task);

        // Copy routine steps → task steps (snapshot)
        List<RoutineStep> routineSteps = routineStepRepository.findByRoutineIdOrderByPosition(routine.getId());
        for (RoutineStep rs : routineSteps) {
            TaskStep ts = new TaskStep();
            ts.setTask(task);
            ts.setPosition(rs.getPosition());
            ts.setLabel(rs.getLabel());
            ts.setIcon(rs.getIcon());
            taskStepRepository.save(ts);
        }
        return task;
    }

    public RoutineTaskResponse buildRoutineTaskResponse(Task task, Routine routine, ZonedDateTime nowPrague) {
        LocalTime deadlineTime = routine.getDeadline();
        ZonedDateTime deadlineZdt = ZonedDateTime.of(task.getDueDate(), deadlineTime, PRAGUE);
        boolean locked = task.getStatus() == TaskStatus.ASSIGNED
                && nowPrague.isAfter(deadlineZdt)
                && !Boolean.TRUE.equals(task.getFirstSubmittedOnTime());

        List<TaskStep> steps = taskStepRepository.findByTaskIdOrderByPosition(task.getId());
        List<TaskStepResponse> stepResponses = steps.stream().map(s -> {
            TaskStepResponse r = new TaskStepResponse();
            r.setId(s.getId());
            r.setPosition(s.getPosition());
            r.setLabel(s.getLabel());
            r.setIcon(s.getIcon());
            r.setDoneAt(s.getDoneAt());
            r.setReturned(s.isReturned());
            return r;
        }).collect(Collectors.toList());

        List<Integer> returnedPositions = steps.stream()
                .filter(TaskStep::isReturned)
                .map(TaskStep::getPosition)
                .collect(Collectors.toList());

        RoutineTaskResponse resp = new RoutineTaskResponse();
        resp.setTaskId(task.getId());
        resp.setName(task.getTitle());
        resp.setSteps(stepResponses);
        resp.setStatus(task.getStatus());
        resp.setDeadline(deadlineTime.format(HH_MM));
        resp.setLocked(locked);
        resp.setOnTimeEligible(Boolean.TRUE.equals(task.getFirstSubmittedOnTime()));
        resp.setPointValue(task.getPointValue() != null ? task.getPointValue() : 0);
        resp.setReturnedSteps(returnedPositions);
        resp.setSubmittedAt(task.getSubmittedAt());
        return resp;
    }

    /** Toggle a step's done state */
    @Transactional
    public TaskStepResponse toggleStep(UUID taskId, int position) {
        Task task = taskRepository.findByIdAndDeletedAtIsNull(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        if (task.getStatus() != TaskStatus.ASSIGNED) {
            throw new com.KidQuest.kidquest_app.exception.ConflictException("Krok nelze změnit v tomto stavu.");
        }

        ZonedDateTime nowPrague = ZonedDateTime.now(clock).withZoneSameInstant(PRAGUE);
        if (task.getDueDate() != null && task.getRoutineId() != null) {
            Routine routine = routineRepository.findById(task.getRoutineId()).orElse(null);
            if (routine != null) {
                LocalTime deadlineTime = routine.getDeadline();
                ZonedDateTime deadlineZdt = ZonedDateTime.of(task.getDueDate(), deadlineTime, PRAGUE);
                boolean locked = nowPrague.isAfter(deadlineZdt) && !Boolean.TRUE.equals(task.getFirstSubmittedOnTime());
                if (locked) {
                    throw new com.KidQuest.kidquest_app.exception.ConflictException("Rutina je uzamčena, termín vypršel.");
                }
            }
        }

        TaskStep step = taskStepRepository.findByTaskIdAndPosition(taskId, position)
                .orElseThrow(() -> new ResourceNotFoundException("Step not found at position: " + position));

        if (step.getDoneAt() != null) {
            step.setDoneAt(null);
        } else {
            step.setDoneAt(java.time.LocalDateTime.now(clock));
        }
        step.setReturned(false);
        taskStepRepository.save(step);

        TaskStepResponse r = new TaskStepResponse();
        r.setId(step.getId());
        r.setPosition(step.getPosition());
        r.setLabel(step.getLabel());
        r.setIcon(step.getIcon());
        r.setDoneAt(step.getDoneAt());
        r.setReturned(step.isReturned());
        return r;
    }

    // ── Template CRUD ──────────────────────────────────────────────────────────

    @Transactional
    public RoutineResponse create(UUID familyId, UUID childId, RoutineRequest req) {
        Child child = childService.findById(childId);
        Routine routine = new Routine();
        routine.setFamily(familyService.findById(familyId));
        routine.setChild(child);
        applyRequest(routine, req);
        routine = routineRepository.save(routine);
        saveSteps(routine, req.getSteps());
        return toResponse(routineRepository.findById(routine.getId()).orElseThrow());
    }

    @Transactional
    public RoutineResponse update(UUID routineId, RoutineRequest req) {
        Routine routine = routineRepository.findById(routineId)
                .orElseThrow(() -> new ResourceNotFoundException("Routine not found: " + routineId));
        applyRequest(routine, req);
        routineStepRepository.deleteByRoutineId(routineId);
        routine = routineRepository.save(routine);
        saveSteps(routine, req.getSteps());
        return toResponse(routineRepository.findById(routine.getId()).orElseThrow());
    }

    @Transactional
    public void delete(UUID routineId) {
        Routine routine = routineRepository.findById(routineId)
                .orElseThrow(() -> new ResourceNotFoundException("Routine not found: " + routineId));
        List<Task> tasks = taskRepository.findByRoutineIdAndAssignedToId(routineId, routine.getChild().getId());
        if (!tasks.isEmpty()) {
            throw new BadRequestException("Rutinu nelze smazat, jsou k ní přiřazeny instance úkolů.");
        }
        routineRepository.deleteById(routineId);
    }

    public List<RoutineResponse> findByFamily(UUID familyId) {
        return routineRepository.findByFamilyId(familyId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    private void applyRequest(Routine routine, RoutineRequest req) {
        if (req.getName() != null) routine.setName(req.getName());
        if (req.getDeadline() != null) routine.setDeadline(LocalTime.parse(req.getDeadline(), HH_MM));
        if (req.getDaysOfWeek() != null) routine.setDaysOfWeek(req.getDaysOfWeek());
        if (req.getPointValue() != null) routine.setPointValue(req.getPointValue());
        if (req.getActive() != null) routine.setActive(req.getActive());
    }

    private void saveSteps(Routine routine, List<RoutineRequest.StepItem> items) {
        if (items == null) return;
        for (RoutineRequest.StepItem item : items) {
            RoutineStep step = new RoutineStep();
            step.setRoutine(routine);
            step.setPosition(item.getPosition());
            step.setLabel(item.getLabel());
            step.setIcon(item.getIcon());
            routineStepRepository.save(step);
        }
    }

    public RoutineResponse toResponse(Routine routine) {
        RoutineResponse r = new RoutineResponse();
        r.setId(routine.getId());
        r.setFamilyId(routine.getFamily().getId());
        r.setChildId(routine.getChild().getId());
        r.setName(routine.getName());
        r.setDeadline(routine.getDeadline().format(HH_MM));
        r.setDaysOfWeek(routine.getDaysOfWeek());
        r.setPointValue(routine.getPointValue());
        r.setActive(routine.isActive());
        List<RoutineResponse.StepItem> steps = routineStepRepository.findByRoutineIdOrderByPosition(routine.getId())
                .stream().map(s -> {
                    RoutineResponse.StepItem si = new RoutineResponse.StepItem();
                    si.setId(s.getId());
                    si.setPosition(s.getPosition());
                    si.setLabel(s.getLabel());
                    si.setIcon(s.getIcon());
                    return si;
                }).collect(Collectors.toList());
        r.setSteps(steps);
        return r;
    }
}
