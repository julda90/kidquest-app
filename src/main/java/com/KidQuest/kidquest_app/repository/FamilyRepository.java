package com.KidQuest.kidquest_app.repository;

import com.KidQuest.kidquest_app.model.Family;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FamilyRepository extends JpaRepository<Family, UUID> {

    List<Family> findAllByDeletedAtIsNull();

    Optional<Family> findByIdAndDeletedAtIsNull(UUID id);
}
