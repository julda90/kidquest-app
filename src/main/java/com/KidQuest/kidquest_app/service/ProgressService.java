package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.response.ProgressResponse;
import com.KidQuest.kidquest_app.model.Badge;
import com.KidQuest.kidquest_app.model.Child;
import com.KidQuest.kidquest_app.model.TransactionType;
import com.KidQuest.kidquest_app.repository.ChildBadgeRepository;
import com.KidQuest.kidquest_app.repository.PointTransactionRepository;
import com.KidQuest.kidquest_app.repository.RewardRedemptionRepository;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.IsoFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProgressService {

    private static final List<TransactionType> XP_TYPES =
            List.of(TransactionType.TASK, TransactionType.BONUS, TransactionType.STREAK, TransactionType.CHEST);

    public static final int CHEST_BONUS  = 25;
    public static final int STREAK_BONUS = 10;

    // XP thresholds: index = level (0-based), value = XP needed to reach that level
    private static final int[] THRESHOLDS_OLDER  = {0, 200, 600, 1500, 3000, 6000};
    private static final int[] THRESHOLDS_YOUNGER = {0, 100, 300,  750, 1500, 3000};

    private final PointTransactionRepository pointTransactionRepository;
    private final ChildBadgeRepository childBadgeRepository;
    private final RewardRedemptionRepository redemptionRepository;
    private final Clock clock;

    public ProgressService(PointTransactionRepository pointTransactionRepository,
                           ChildBadgeRepository childBadgeRepository,
                           RewardRedemptionRepository redemptionRepository,
                           Clock clock) {
        this.pointTransactionRepository = pointTransactionRepository;
        this.childBadgeRepository = childBadgeRepository;
        this.redemptionRepository = redemptionRepository;
        this.clock = clock;
    }

    public int balance(UUID childId) {
        return pointTransactionRepository.sumBalanceByChildId(childId);
    }

    public int xp(UUID childId) {
        return pointTransactionRepository.sumXpByChildId(childId, XP_TYPES);
    }

    /** Level info: 1-based level number and progress toward next threshold. */
    public record LevelInfo(int level, int xp, int currentThreshold, Integer nextThreshold, double progressPct) {}

    /** Compute level from a known XP value without querying the DB. */
    public LevelInfo levelFromXp(Child child, int currentXp) {
        int[] thresholds = (child.getAge() != null && child.getAge() < 6) ? THRESHOLDS_YOUNGER : THRESHOLDS_OLDER;
        int lvl = 0;
        for (int i = thresholds.length - 1; i >= 0; i--) {
            if (currentXp >= thresholds[i]) { lvl = i; break; }
        }
        int currentThreshold = thresholds[lvl];
        Integer nextThreshold = (lvl + 1 < thresholds.length) ? thresholds[lvl + 1] : null;
        double pct = 0.0;
        if (nextThreshold != null && nextThreshold > currentThreshold) {
            pct = (double)(currentXp - currentThreshold) / (nextThreshold - currentThreshold) * 100.0;
        } else if (nextThreshold == null) {
            pct = 100.0;
        }
        return new LevelInfo(lvl + 1, currentXp, currentThreshold, nextThreshold, Math.min(100.0, pct));
    }

    public LevelInfo level(Child child) {
        return levelFromXp(child, xp(child.getId()));
    }

    private static final Map<String, String[]> LEVEL_NAMES_MAP = Map.of(
        "elsa",      new String[]{"Sněhulák", "Princezna sněhu", "Ledová kouzelnice", "Strážkyně zimy", "Královna ledu", "Elsa Mocná"},
        "unicorn",   new String[]{"Hříbě", "Jednorožec", "Kouzelný jednorožec", "Duhový jednorožec", "Světelný jednorožec", "Jednorožec hvězd"},
        "hotwheels", new String[]{"Nováček", "Řemeslník", "Stavitel", "Průzkumník", "Dobrodružec", "Mistr Craft"}
    );
    private static final String[] DEFAULT_LEVEL_NAMES = {"Začátečník", "Pomocník", "Šikovný", "Zkušený", "Expertní", "Mistr"};

    public static String levelName(String avatar, int level) {
        String[] names = LEVEL_NAMES_MAP.getOrDefault(avatar, DEFAULT_LEVEL_NAMES);
        return names[Math.min(level - 1, names.length - 1)];
    }

    /** Streak info using Europe/Prague time zone. */
    public record StreakInfo(int days, boolean jokerUsedThisWeek) {}

    public StreakInfo streak(UUID childId, LocalDate today) {
        // Fetch active days in the last 90 days
        LocalDateTime since = today.minusDays(90).atStartOfDay();
        List<LocalDate> activeDays = pointTransactionRepository
                .findActiveDaysSince(childId, since);

        Set<LocalDate> activeSet = new HashSet<>(activeDays);

        // Walk back from today (or yesterday if no task today)
        LocalDate start = activeSet.contains(today) ? today : today.minusDays(1);
        if (!activeSet.contains(start)) return new StreakInfo(0, false);

        int streakCount = 0;
        boolean jokerUsed = false;
        LocalDate cursor = start;

        while (true) {
            if (activeSet.contains(cursor)) {
                streakCount++;
                cursor = cursor.minusDays(1);
            } else {
                long missedInWeek = countMissedInWeek(activeSet, cursor, start);

                if (missedInWeek <= 1 && !jokerUsed) {
                    // Use the joker — skip this day, continue streak
                    jokerUsed = true;
                    cursor = cursor.minusDays(1);
                } else {
                    break;
                }
            }
        }

        return new StreakInfo(streakCount, jokerUsed);
    }

    private long countMissedInWeek(Set<LocalDate> activeSet, LocalDate missedDay, LocalDate streakStart) {
        LocalDate weekMon = missedDay.with(DayOfWeek.MONDAY);
        long count = 0;
        for (LocalDate d = weekMon; !d.isAfter(missedDay) && !d.isAfter(streakStart); d = d.plusDays(1)) {
            if (!activeSet.contains(d)) count++;
        }
        return count;
    }

    public boolean chestAvailable(UUID childId, LocalDate today) {
        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEnd   = today.plusDays(1).atStartOfDay();
        long tasksToday = pointTransactionRepository.countTaskTransactionsBetween(childId, dayStart, dayEnd);
        if (tasksToday < 3) return false;

        // Check no CHEST already opened this ISO week
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        LocalDate weekEnd   = weekStart.plusDays(7);
        long chestsThisWeek = pointTransactionRepository.countChestTransactionsBetween(
                childId, weekStart.atStartOfDay(), weekEnd.atStartOfDay());
        return chestsThisWeek == 0;
    }

    public ProgressResponse buildResponse(Child child) {
        UUID childId = child.getId();
        LocalDate today = LocalDate.now(clock);

        int balance  = balance(childId);
        LevelInfo li = level(child);
        StreakInfo si = streak(childId, today);

        List<Badge> badges = childBadgeRepository.findByChildId(childId)
                .stream()
                .map(cb -> cb.getBadge())
                .collect(Collectors.toList());

        int pendingPts = redemptionRepository.sumPendingCostByChildId(childId);

        ProgressResponse r = new ProgressResponse();
        r.setBalance(balance);
        r.setXp(li.xp());
        r.setLevel(li.level());
        r.setLevelName(levelName(child.getAvatar(), li.level()));
        r.setCurrentThreshold(li.currentThreshold());
        r.setNextThreshold(li.nextThreshold());
        r.setProgressPct(li.progressPct());
        r.setStreakDays(si.days());
        r.setJokerUsedThisWeek(si.jokerUsedThisWeek());
        r.setBadges(badges);
        r.setChestAvailable(chestAvailable(childId, today));
        r.setPendingRedemptionPoints(pendingPts);
        return r;
    }
}
