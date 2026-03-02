package com.KidQuest.kidquest_app.repository;

import com.KidQuest.kidquest_app.model.Family;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FamilyRepository extends JpaRepository <Family, UUID>{
}
