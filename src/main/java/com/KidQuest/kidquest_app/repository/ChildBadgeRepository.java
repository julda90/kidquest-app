package com.KidQuest.kidquest_app.repository;

import com.KidQuest.kidquest_app.model.Badge;
import com.KidQuest.kidquest_app.model.ChildBadge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChildBadgeRepository extends JpaRepository<ChildBadge, UUID> {

    List<ChildBadge> findByChildId(UUID childId);

    Optional<ChildBadge> findByChildIdAndBadge(UUID childId, Badge badge);

    boolean existsByChildIdAndBadge(UUID childId, Badge badge);
}
