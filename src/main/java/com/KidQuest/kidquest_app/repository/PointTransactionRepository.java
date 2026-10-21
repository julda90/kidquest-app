package com.KidQuest.kidquest_app.repository;

import com.KidQuest.kidquest_app.model.PointTransaction;
import com.KidQuest.kidquest_app.model.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PointTransactionRepository extends JpaRepository<PointTransaction, UUID> {

    List<PointTransaction> findByChildId(UUID childId);

    Optional<PointTransaction> findByTaskIdAndType(UUID taskId, TransactionType type);

    boolean existsByTaskIdAndType(UUID taskId, TransactionType type);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM PointTransaction t WHERE t.child.id = :childId")
    int sumBalanceByChildId(UUID childId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM PointTransaction t WHERE t.child.id = :childId AND t.type IN :types")
    int sumXpByChildId(UUID childId, List<TransactionType> types);

    /** Active task days: dates that have at least one TASK transaction for the child */
    @Query(value = "SELECT DISTINCT CAST(created_at AS DATE) FROM point_transaction " +
                   "WHERE child_id = :childId AND type = 'TASK' AND created_at >= :since",
           nativeQuery = true)
    List<java.time.LocalDate> findActiveDaysSince(UUID childId, LocalDateTime since);

    /** Count TASK transactions on a specific day for chest availability */
    @Query("SELECT COUNT(t) FROM PointTransaction t WHERE t.child.id = :childId AND t.type = 'TASK' " +
           "AND t.createdAt >= :from AND t.createdAt < :to")
    long countTaskTransactionsBetween(UUID childId, LocalDateTime from, LocalDateTime to);

    /** Check if a STREAK transaction already exists today */
    boolean existsByChildIdAndTypeAndCreatedAtBetween(UUID childId, TransactionType type, LocalDateTime from, LocalDateTime to);

    /** CHEST transactions for the current week (for idempotency check) */
    @Query("SELECT COUNT(t) FROM PointTransaction t WHERE t.child.id = :childId AND t.type = 'CHEST' " +
           "AND t.createdAt >= :from AND t.createdAt < :to")
    long countChestTransactionsBetween(UUID childId, LocalDateTime from, LocalDateTime to);

    /** Family goal progress: sum TASK + BONUS for children in a family since a date */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM PointTransaction t " +
           "WHERE t.child.family.id = :familyId AND t.type IN ('TASK', 'BONUS') AND t.createdAt >= :since")
    int sumFamilyGoalProgressSince(UUID familyId, LocalDateTime since);

    /** All days on which a child completed at least one TASK (for longest-streak computation) */
    @Query(value = "SELECT DISTINCT CAST(created_at AS DATE) FROM point_transaction " +
                   "WHERE child_id = :childId AND type = 'TASK'",
           nativeQuery = true)
    List<java.time.LocalDate> findAllActiveDays(UUID childId);

    /** Max TASK transactions completed in any single day */
    @Query(value = "SELECT COALESCE(MAX(daily_count),0) FROM " +
                   "(SELECT COUNT(*) AS daily_count FROM point_transaction " +
                   " WHERE child_id = :childId AND type = 'TASK' " +
                   " GROUP BY CAST(created_at AS DATE)) t",
           nativeQuery = true)
    int maxTasksInAnyDay(UUID childId);

    /** Total count of TASK transactions for a child */
    @Query("SELECT COUNT(t) FROM PointTransaction t WHERE t.child.id = :childId AND t.type = 'TASK'")
    long countTasksByChildId(UUID childId);
}
