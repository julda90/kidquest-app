package com.KidQuest.kidquest_app.repository;

import com.KidQuest.kidquest_app.model.PointTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PointTransactionRepository extends JpaRepository<PointTransaction, UUID> {
}
