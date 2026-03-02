package com.KidQuest.kidquest_app.repository;

import com.KidQuest.kidquest_app.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {
}
