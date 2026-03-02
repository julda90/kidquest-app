package com.KidQuest.kidquest_app.repository;

import com.KidQuest.kidquest_app.model.Child;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChildRepository extends JpaRepository<Child, UUID> {
    List<Child> findByFamilyId(UUID familyId);
}
