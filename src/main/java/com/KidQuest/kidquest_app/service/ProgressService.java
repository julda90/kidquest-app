package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.response.BadgeInfoResponse;
import com.KidQuest.kidquest_app.dto.response.ProgressResponse;
import com.KidQuest.kidquest_app.exception.BadRequestException;
import com.KidQuest.kidquest_app.model.Badge;
import com.KidQuest.kidquest_app.model.Child;
import com.KidQuest.kidquest_app.model.ChildBadge;
import com.KidQuest.kidquest_app.model.PointTransaction;
import com.KidQuest.kidquest_app.model.RewardTier;
import com.KidQuest.kidquest_app.model.TaskKind;
import com.KidQuest.kidquest_app.model.TransactionType;
import com.KidQuest.kidquest_app.repository.ChildBadgeRepository;
import com.KidQuest.kidquest_app.repository.FamilyGoalRepository;
import com.KidQuest.kidquest_app.repository.PointTransactionRepository;
import com.KidQuest.kidquest_app.repository.RewardRedemptionRepository;
import com.KidQuest.kidquest_app.repository.TaskRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
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

    // Points awarded when a badge is earned, by rarity tier.
    public static final int BADGE_BOUNTY_COMMON    = 25;
    public static final int BADGE_BOUNTY_RARE      = 75;
    public static final int BADGE_BOUNTY_LEGENDARY = 250;

    public static int badgeBounty(Badge badge) {
        return switch (badge.tier()) {
            case COMMON    -> BADGE_BOUNTY_COMMON;
            case RARE      -> BADGE_BOUNTY_RARE;
            case LEGENDARY -> BADGE_BOUNTY_LEGENDARY;
        };
    }

    /**
     * Streak bonus paid on the first task of each active day. Scales with the
     * current streak length so long, hard-won streaks feel more rewarding than
     * a fresh 3-day one.
     */
    public static int streakBonus(int days) {
        if (days >= 30) return 25;
        if (days >= 14) return 15;
        if (days >= 7)  return 10;
        return 5;
    }

    // Badges a parent awards by hand — subjective or real-world achievements
    // with no automatic condition.
    public static final Set<Badge> MANUAL_BADGES = Set.of(
            Badge.PET_GUARDIAN, Badge.GAME_DAY, Badge.CHEF, Badge.BIRTHDAY, Badge.FAMILY_CAPTAIN);

    // Loaded from catalog/levels.json at startup
    private int[] THRESHOLDS_STANDARD;
    private int[] THRESHOLDS_YOUNG;
    private int PRESTIGE_STEP_STANDARD;
    private int PRESTIGE_STEP_YOUNG;

    private final PointTransactionRepository pointTransactionRepository;
    private final ChildBadgeRepository childBadgeRepository;
    private final RewardRedemptionRepository redemptionRepository;
    private final FamilyGoalRepository familyGoalRepository;
    private final TaskRepository taskRepository;
    private final Clock clock;
    private final ObjectMapper objectMapper;

    public ProgressService(PointTransactionRepository pointTransactionRepository,
                           ChildBadgeRepository childBadgeRepository,
                           RewardRedemptionRepository redemptionRepository,
                           FamilyGoalRepository familyGoalRepository,
                           TaskRepository taskRepository,
                           Clock clock,
                           ObjectMapper objectMapper) {
        this.pointTransactionRepository = pointTransactionRepository;
        this.childBadgeRepository = childBadgeRepository;
        this.redemptionRepository = redemptionRepository;
        this.familyGoalRepository = familyGoalRepository;
        this.taskRepository = taskRepository;
        this.clock = clock;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void loadLevels() {
        try (InputStream is = new ClassPathResource("catalog/levels.json").getInputStream()) {
            JsonNode root = objectMapper.readTree(is);
            JsonNode std = root.get("standard");
            JsonNode yng = root.get("young");
            THRESHOLDS_STANDARD = new int[std.size()];
            for (int i = 0; i < std.size(); i++) THRESHOLDS_STANDARD[i] = std.get(i).asInt();
            THRESHOLDS_YOUNG = new int[yng.size()];
            for (int i = 0; i < yng.size(); i++) THRESHOLDS_YOUNG[i] = yng.get(i).asInt();
            PRESTIGE_STEP_STANDARD = root.get("prestigeStep").get("standard").asInt();
            PRESTIGE_STEP_YOUNG    = root.get("prestigeStep").get("young").asInt();
        } catch (Exception e) {
            throw new RuntimeException("Failed to load catalog/levels.json", e);
        }
    }

    public int balance(UUID childId) {
        return pointTransactionRepository.sumBalanceByChildId(childId);
    }

    public int xp(UUID childId) {
        return pointTransactionRepository.sumXpByChildId(childId, XP_TYPES);
    }

    /** Level info: 1-based level (1–12), prestige stars, XP and progress. */
    public record LevelInfo(int level, int maxLevel, int prestigeStars, int xp,
                            int currentThreshold, Integer nextThreshold, double progressPct) {}

    /** Compute level from a known XP value without querying the DB. */
    public LevelInfo levelFromXp(Child child, int currentXp) {
        boolean young = child.getAge() != null && child.getAge() < 6;
        int[] thresholds = young ? THRESHOLDS_YOUNG : THRESHOLDS_STANDARD;
        int maxLevel = thresholds.length; // 12
        int prestigeStep = young ? PRESTIGE_STEP_YOUNG : PRESTIGE_STEP_STANDARD;

        int topThreshold = thresholds[maxLevel - 1];

        if (currentXp >= topThreshold) {
            // Prestige: player stays at level 12, stars accumulate
            int overXp = currentXp - topThreshold;
            int prestigeStars = overXp / prestigeStep + 1;
            int intoStep = overXp % prestigeStep;
            double pct = (double) intoStep / prestigeStep * 100.0;
            return new LevelInfo(maxLevel, maxLevel, prestigeStars, currentXp,
                    topThreshold, null, pct);
        }

        int lvl = 0;
        for (int i = maxLevel - 1; i >= 0; i--) {
            if (currentXp >= thresholds[i]) { lvl = i; break; }
        }

        int currentThreshold = thresholds[lvl];
        Integer nextThreshold = (lvl + 1 < maxLevel) ? thresholds[lvl + 1] : null;
        double pct;
        if (nextThreshold != null && nextThreshold > currentThreshold) {
            pct = (double)(currentXp - currentThreshold) / (nextThreshold - currentThreshold) * 100.0;
        } else {
            pct = 100.0;
        }
        return new LevelInfo(lvl + 1, maxLevel, 0, currentXp,
                currentThreshold, nextThreshold, Math.min(100.0, pct));
    }

    public LevelInfo level(Child child) {
        return levelFromXp(child, xp(child.getId()));
    }

    private static final Map<String, String[]> LEVEL_NAMES_MAP = Map.of(
        "elsa",      new String[]{
            "Sněhová vločka", "Ledový krystal", "Zimní víla", "Ledová princezna",
            "Strážkyně severu", "Paní ledového hradu", "Mistryně sněhu", "Ledový drak",
            "Polární záře", "Věčná zima", "Hvězdný led", "Ledová královna"},
        "unicorn",   new String[]{
            "Hvězdička", "Duhová jiskra", "Pastelová perlička", "Malý jednorožec",
            "Duhový jednorožec", "Křídlatý jednorožec", "Stříbrný roh", "Kouzelný jednorožec",
            "Zlatý jednorožec", "Hvězdný jednorožec", "Duhový drak", "Královna duhy"},
        "minecraft", new String[]{
            "Dřevěný meč", "Kamenný meč", "Zlatý meč", "Železný meč",
            "Diamantový meč", "Netheritový meč", "Průzkumník", "Hrdina Netheru",
            "Ender bojovník", "Drakobijce", "Strážce konců", "Netheritový král"},
        "racer",     new String[]{
            "Chodec", "Kolo", "Skútr", "Závodní kolo",
            "Motorkář", "Závodní auto", "Dragster", "Turbo závodník",
            "Supersport", "Formule", "Hypercarro", "Šampion okruhu"}
    );
    private static final String[] DEFAULT_LEVEL_NAMES = {
        "Nováček", "Učedník", "Pomocník", "Šikovný",
        "Zkušený", "Zručný", "Pokročilý", "Expertní",
        "Mistr", "Velmistr", "Legenda", "Hrdina"
    };

    public static String levelName(String avatar, int level) {
        String[] names = LEVEL_NAMES_MAP.getOrDefault(avatar, DEFAULT_LEVEL_NAMES);
        return names[Math.min(level - 1, names.length - 1)];
    }

    /** Streak info using Europe/Prague time zone. */
    public record StreakInfo(int days, boolean jokerUsedThisWeek) {}

    public StreakInfo streak(UUID childId, LocalDate today) {
        // Fetch active days in the last 90 days (routine tasks use due_date)
        LocalDateTime since = today.minusDays(90).atStartOfDay();
        List<LocalDate> activeDays = pointTransactionRepository
                .findActiveDaysRoutineAwareSince(childId, since)
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
    private static final Map<Badge, Integer> BADGE_TARGETS = Map.ofEntries(
        Map.entry(Badge.STREAK_7,              7),
        Map.entry(Badge.STREAK_14,            14),
        Map.entry(Badge.STREAK_30,            30),
        Map.entry(Badge.STREAK_60,            60),
        Map.entry(Badge.FIRST_REWARD,          1),
        Map.entry(Badge.EARLY_BIRD,           10),
        Map.entry(Badge.ROUTINE_STREAK_14,    14),
        Map.entry(Badge.ROUTINE_30_ONTIME,    30),
        Map.entry(Badge.TEAM_PLAYER,          50),
        Map.entry(Badge.TASK_100,            100),
        Map.entry(Badge.TASK_250,            250),
        Map.entry(Badge.TASK_500,            500),
        Map.entry(Badge.SHERLOCK,             10),
        Map.entry(Badge.SELF_STARTER,         10),
        Map.entry(Badge.HOMEWORK_NO_REMIND_10,10),
        Map.entry(Badge.HOMEWORK_CLEAN_5,      5),
        Map.entry(Badge.HOMEWORK_PERFECT_20,  20),
        Map.entry(Badge.VARIETY_ALL,           8),
        Map.entry(Badge.VARIETY_WEEK,          5),
        Map.entry(Badge.SAVER_1000,         1000),
        Map.entry(Badge.MEGA_REWARD,           1),
        Map.entry(Badge.FAMILY_5,              5),
        Map.entry(Badge.FAMILY_20,            20),
        Map.entry(Badge.COLLECTOR_5,           5),
        Map.entry(Badge.XMAS_15,             15),
        Map.entry(Badge.EASTER_10,            10),
        Map.entry(Badge.SUMMER_30,           30)
    );

    // Lower milestone targets for young children (<6), mirroring how level
    // thresholds scale by age. Only count-based milestones scale; streaks and
    // seasonal badges stay age-neutral.
    private static final Map<Badge, Integer> BADGE_TARGETS_YOUNG = Map.of(
        Badge.TASK_100,     50,
        Badge.TASK_250,    150,
        Badge.TASK_500,    300,
        Badge.TEAM_PLAYER,  25,
        Badge.EARLY_BIRD,    5
    );

    /** Milestone target for a badge, scaled down for young children (&lt;6). */
    public static Integer badgeTarget(Badge badge, boolean young) {
        if (young && BADGE_TARGETS_YOUNG.containsKey(badge)) {
            return BADGE_TARGETS_YOUNG.get(badge);
        }
        return BADGE_TARGETS.get(badge);
    }

    public ProgressResponse buildResponse(Child child) {
        UUID childId = child.getId();
        LocalDate today = LocalDate.now(clock);
        boolean young   = child.getAge() != null && child.getAge() < 6;

        int balance     = balance(childId);
        LevelInfo li    = level(child);
        StreakInfo si   = streak(childId, today);
        int totalTasks  = (int) pointTransactionRepository.countTasksByChildId(childId);
        int bestDay     = pointTransactionRepository.maxTasksInAnyDay(childId);
        int longestStr  = longestStreak(childId);
        int totalRed    = (int) redemptionRepository.findByChildId(childId).size();
        long selfCheckCount   = pointTransactionRepository.countBonusByChildIdAndBonusKind(childId, "SELF_CHECK");
        long noReminderCount  = pointTransactionRepository.countBonusByChildIdAndBonusKind(childId, "NO_REMINDER");
        long routineApprovals = pointTransactionRepository.countRoutineTaskTransactions(childId);
        long completedFamilyGoals = familyGoalRepository.countCompletedByFamilyId(child.getFamily().getId());
        long distinctKinds        = taskRepository.countDistinctNonRoutineKindsByChildId(childId);
        long tasksInDecember      = pointTransactionRepository.countTasksInMonths(childId, List.of(12));
        long tasksInSummer        = pointTransactionRepository.countTasksInMonths(childId, List.of(7, 8));
        long tasksInEaster        = pointTransactionRepository.countTasksInMonths(childId, List.of(3, 4));
        long homeworkSelfCheck    = pointTransactionRepository
                .countBonusByChildIdAndBonusKindAndTaskKind(childId, "SELF_CHECK", TaskKind.HOMEWORK);
        long homeworkNoRemind     = pointTransactionRepository
                .countBonusByChildIdAndBonusKindAndTaskKind(childId, "NO_REMINDER", TaskKind.HOMEWORK);
        long megaRewards          = redemptionRepository.countRedeemedByChildIdAndTier(childId, RewardTier.MEGA);
        long varietyWeek          = taskRepository
                .countDistinctNonRoutineKindsByChildIdSince(childId, today.minusDays(7).atStartOfDay());

        // Load earned badges into a map for quick lookup
        Map<Badge, ChildBadge> earnedMap = childBadgeRepository.findByChildId(childId)
                .stream().collect(Collectors.toMap(cb -> cb.getBadge(), cb -> cb));

        // Auto-award milestone badges
        awardIfMet(child, earnedMap, Badge.STREAK_7,             si.days() >= 7);
        awardIfMet(child, earnedMap, Badge.STREAK_14,            si.days() >= 14);
        awardIfMet(child, earnedMap, Badge.STREAK_30,            si.days() >= 30);
        awardIfMet(child, earnedMap, Badge.STREAK_60,            si.days() >= 60);
        awardIfMet(child, earnedMap, Badge.FIRST_REWARD,         totalRed >= 1);
        awardIfMet(child, earnedMap, Badge.COLLECTOR_5,          totalRed >= 5);
        awardIfMet(child, earnedMap, Badge.EARLY_BIRD,           routineApprovals >= badgeTarget(Badge.EARLY_BIRD, young));
        awardIfMet(child, earnedMap, Badge.ROUTINE_STREAK_14,    routineApprovals >= 14);
        awardIfMet(child, earnedMap, Badge.ROUTINE_30_ONTIME,    routineApprovals >= 30);
        awardIfMet(child, earnedMap, Badge.TEAM_PLAYER,          totalTasks >= badgeTarget(Badge.TEAM_PLAYER, young));
        awardIfMet(child, earnedMap, Badge.TASK_100,             totalTasks >= badgeTarget(Badge.TASK_100, young));
        awardIfMet(child, earnedMap, Badge.TASK_250,             totalTasks >= badgeTarget(Badge.TASK_250, young));
        awardIfMet(child, earnedMap, Badge.TASK_500,             totalTasks >= badgeTarget(Badge.TASK_500, young));
        awardIfMet(child, earnedMap, Badge.SELF_STARTER,         noReminderCount >= 10);
        awardIfMet(child, earnedMap, Badge.HOMEWORK_NO_REMIND_10, homeworkNoRemind >= 10);
        awardIfMet(child, earnedMap, Badge.HOMEWORK_CLEAN_5,     homeworkSelfCheck >= 5);
        awardIfMet(child, earnedMap, Badge.HOMEWORK_PERFECT_20,  homeworkSelfCheck >= 20);
        awardIfMet(child, earnedMap, Badge.VARIETY_ALL,          distinctKinds >= 8);
        awardIfMet(child, earnedMap, Badge.VARIETY_WEEK,         varietyWeek >= 5);
        awardIfMet(child, earnedMap, Badge.SAVER_1000,           balance >= 1000);
        awardIfMet(child, earnedMap, Badge.MEGA_REWARD,          megaRewards >= 1);
        awardIfMet(child, earnedMap, Badge.FAMILY_5,             completedFamilyGoals >= 5);
        awardIfMet(child, earnedMap, Badge.FAMILY_20,            completedFamilyGoals >= 20);
        awardIfMet(child, earnedMap, Badge.XMAS_15,              tasksInDecember >= 15);
        awardIfMet(child, earnedMap, Badge.EASTER_10,            tasksInEaster >= 10);
        awardIfMet(child, earnedMap, Badge.SUMMER_30,            tasksInSummer >= 30);

        // Build rich badge info for all badges
        List<BadgeInfoResponse> badgeInfo = Arrays.stream(Badge.values()).map(b -> {
            BadgeInfoResponse bi = new BadgeInfoResponse();
            bi.setBadge(b.name());
            ChildBadge cb = earnedMap.get(b);
            bi.setEarned(cb != null);
            if (cb != null) bi.setEarnedAt(cb.getEarnedAt());
            Integer target = badgeTarget(b, young);
            if (target != null) {
                bi.setTarget(target);
                int cur = switch (b) {
                    case STREAK_7, STREAK_14, STREAK_30, STREAK_60 -> si.days();
                    case FIRST_REWARD, COLLECTOR_5                 -> totalRed;
                    case EARLY_BIRD, ROUTINE_STREAK_14,
                         ROUTINE_30_ONTIME                         -> (int) routineApprovals;
                    case TEAM_PLAYER, TASK_100,
                         TASK_250, TASK_500                        -> totalTasks;
                    case SHERLOCK                                   -> (int) selfCheckCount;
                    case SELF_STARTER                              -> (int) noReminderCount;
                    case HOMEWORK_NO_REMIND_10                     -> (int) homeworkNoRemind;
                    case HOMEWORK_CLEAN_5, HOMEWORK_PERFECT_20     -> (int) homeworkSelfCheck;
                    case VARIETY_ALL                               -> (int) distinctKinds;
                    case VARIETY_WEEK                              -> (int) varietyWeek;
                    case SAVER_1000                                -> balance;
                    case MEGA_REWARD                               -> (int) megaRewards;
                    case FAMILY_5, FAMILY_20                       -> (int) completedFamilyGoals;
                    case XMAS_15                                   -> (int) tasksInDecember;
                    case EASTER_10                                 -> (int) tasksInEaster;
                    case SUMMER_30                                 -> (int) tasksInSummer;
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
        r.setMaxLevel(li.maxLevel());
        r.setPrestigeStars(li.prestigeStars());
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
        r.setSelectedAvatarLevel(child.getSelectedAvatarLevel());
        r.setSelectedLandscapeLevel(child.getSelectedLandscapeLevel());
        return r;
    }

    private void awardIfMet(Child child, Map<Badge, ChildBadge> earnedMap, Badge badge, boolean condition) {
        if (condition && !earnedMap.containsKey(badge)) {
            earnedMap.put(badge, grantBadge(child, badge));
        }
    }

    /**
     * Record a newly-earned badge and pay out its rarity bounty as a BONUS
     * transaction (counts toward both balance and XP). Callers must ensure the
     * badge is not already earned.
     */
    public ChildBadge grantBadge(Child child, Badge badge) {
        ChildBadge cb = new ChildBadge();
        cb.setChild(child);
        cb.setBadge(badge);
        ChildBadge saved = childBadgeRepository.save(cb);

        int bounty = badgeBounty(badge);
        if (bounty > 0) {
            PointTransaction tx = new PointTransaction();
            tx.setChild(child);
            tx.setAmount(bounty);
            tx.setReason("🏅 Nový odznak");
            tx.setType(TransactionType.BONUS);
            tx.setBonusKind("BADGE");
            pointTransactionRepository.save(tx);
        }
        return saved;
    }

    /**
     * Award a parent-grantable badge by hand. Rejects badges that have an
     * automatic condition, and is a no-op (returns false) if already earned.
     */
    public boolean grantBadgeManually(Child child, Badge badge) {
        if (!MANUAL_BADGES.contains(badge)) {
            throw new BadRequestException("Odznak " + badge + " nelze udělit ručně.");
        }
        if (childBadgeRepository.existsByChildIdAndBadge(child.getId(), badge)) {
            return false;
        }
        grantBadge(child, badge);
        return true;
    }

    private int longestStreak(UUID childId) {
        List<LocalDate> activeDays = pointTransactionRepository.findAllActiveDaysRoutineAware(childId)
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
