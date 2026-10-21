package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.response.BadgeInfoResponse;
import com.KidQuest.kidquest_app.dto.response.ProgressResponse;
import com.KidQuest.kidquest_app.model.Badge;
import com.KidQuest.kidquest_app.model.Child;
import com.KidQuest.kidquest_app.model.ChildBadge;
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
        "elsa",      new String[]{"Sněhová vločka", "Ledový krystal", "Ledová princezna", "Strážkyně severu", "Mistryně ledu", "Ledová královna"},
        "unicorn",   new String[]{"Hvězdička", "Duhová jiskra", "Malý jednorožec", "Duhový jednorožec", "Kouzelný jednorožec", "Královna duhy"},
        "hotwheels", new String[]{"Dřevěný", "Kamenný", "Železný", "Zlatý", "Diamantový", "Netheritový krumpáč"},
        "minecraft", new String[]{"Dřevěný", "Kamenný", "Železný", "Zlatý", "Diamantový", "Netheritový krumpáč"}
    );
    private static final String[] DEFAULT_LEVEL_NAMES = {"Nováček", "Pomocník", "Šikovný", "Zkušený", "Expertní", "Mistr"};

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
                .findActiveDaysSince(childId, since)
                .stream().map(java.sql.Date::toLocalDate).collect(Collectors.toList());

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

    // ── Badge targets ─────────────────────────────────────────────────────────
    private static final Map<Badge, Integer> BADGE_TARGETS = Map.of(
        Badge.STREAK_7,     7,
        Badge.STREAK_30,    30,
        Badge.FIRST_REWARD, 1,
        Badge.EARLY_BIRD,   10,
        Badge.TEAM_PLAYER,  50
    );

    public ProgressResponse buildResponse(Child child) {
        UUID childId = child.getId();
        LocalDate today = LocalDate.now(clock);

        int balance     = balance(childId);
        LevelInfo li    = level(child);
        StreakInfo si   = streak(childId, today);
        int totalTasks  = (int) pointTransactionRepository.countTasksByChildId(childId);
        int bestDay     = pointTransactionRepository.maxTasksInAnyDay(childId);
        int longestStr  = longestStreak(childId);
        int totalRed    = (int) redemptionRepository.findByChildId(childId).size();

        // Load earned badges into a map for quick lookup
        Map<Badge, ChildBadge> earnedMap = childBadgeRepository.findByChildId(childId)
                .stream().collect(Collectors.toMap(cb -> cb.getBadge(), cb -> cb));

        // Auto-award milestone badges
        awardIfMet(child, earnedMap, Badge.STREAK_7,     si.days() >= 7);
        awardIfMet(child, earnedMap, Badge.STREAK_30,    si.days() >= 30);
        awardIfMet(child, earnedMap, Badge.FIRST_REWARD, totalRed >= 1);
        awardIfMet(child, earnedMap, Badge.EARLY_BIRD,   totalTasks >= 10);
        awardIfMet(child, earnedMap, Badge.TEAM_PLAYER,  totalTasks >= 50);

        // Build rich badge info for all badges
        List<BadgeInfoResponse> badgeInfo = Arrays.stream(Badge.values()).map(b -> {
            BadgeInfoResponse bi = new BadgeInfoResponse();
            bi.setBadge(b.name());
            ChildBadge cb = earnedMap.get(b);
            bi.setEarned(cb != null);
            if (cb != null) bi.setEarnedAt(cb.getEarnedAt());
            Integer target = BADGE_TARGETS.get(b);
            if (target != null) {
                bi.setTarget(target);
                int cur = switch (b) {
                    case STREAK_7, STREAK_30 -> si.days();
                    case FIRST_REWARD        -> totalRed;
                    case EARLY_BIRD, TEAM_PLAYER -> totalTasks;
                    default -> 0;
                };
                bi.setCurrent(Math.min(cur, target));
            }
            return bi;
        }).collect(Collectors.toList());

        List<Badge> badges = earnedMap.keySet().stream().collect(Collectors.toList());
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
        r.setBadgeInfo(badgeInfo);
        r.setChestAvailable(chestAvailable(childId, today));
        r.setPendingRedemptionPoints(pendingPts);
        r.setRecordTotalTasks(totalTasks);
        r.setRecordLongestStreak(longestStr);
        r.setRecordBestDayTasks(bestDay);
        return r;
    }

    private void awardIfMet(Child child, Map<Badge, ChildBadge> earnedMap, Badge badge, boolean condition) {
        if (condition && !earnedMap.containsKey(badge)) {
            ChildBadge cb = new ChildBadge();
            cb.setChild(child);
            cb.setBadge(badge);
            ChildBadge saved = childBadgeRepository.save(cb);
            earnedMap.put(badge, saved);
        }
    }

    private int longestStreak(UUID childId) {
        List<LocalDate> activeDays = pointTransactionRepository.findAllActiveDays(childId)
                .stream().map(java.sql.Date::toLocalDate).collect(Collectors.toList());
        if (activeDays.isEmpty()) return 0;
        List<LocalDate> sorted = activeDays.stream().sorted().toList();
        int longest = 1, current = 1;
        for (int i = 1; i < sorted.size(); i++) {
            if (sorted.get(i).minusDays(1).equals(sorted.get(i - 1))) {
                longest = Math.max(longest, ++current);
            } else {
                current = 1;
            }
        }
        return longest;
    }
}
