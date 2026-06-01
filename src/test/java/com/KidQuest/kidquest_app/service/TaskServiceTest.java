package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.request.TaskRequest;
import com.KidQuest.kidquest_app.dto.response.TaskResponse;
import com.KidQuest.kidquest_app.exception.ResourceNotFoundException;
import com.KidQuest.kidquest_app.model.Child;
import com.KidQuest.kidquest_app.model.Family;
import com.KidQuest.kidquest_app.model.Task;
import com.KidQuest.kidquest_app.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ChildService childService;

    @Mock
    private FamilyService familyService;

    @InjectMocks
    private TaskService taskService;

    private Task task;
    private Family family;
    private Child child;
    private UUID taskId;
    private UUID childId;
    private TaskRequest taskRequest;
    private UUID familyId;
    private TaskResponse taskResponse;

    @BeforeEach
    public void setUp() {
        taskId = UUID.randomUUID();
        childId = UUID.randomUUID();
        familyId = UUID.randomUUID();
        task = new Task();
        task.setId(taskId);
        family = new Family();
        taskRequest  = new TaskRequest();
        taskResponse = new TaskResponse();
        task.setFamily(family);

    }

    @Test
    public void shouldReturnTaskByTaskId() {

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));

        assertEquals(taskService.findById(taskId),task);

    }

    @Test
    public void shouldThrowExceptionWhenTaskNotFound() {
        when(taskRepository.findById(taskId)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> taskService.findById(taskId));
    }

    @Test
    public void shouldCreateTask() {
        when(familyService.findById(familyId)).thenReturn(family);
        when(taskRepository.save(any(Task.class))).thenReturn(task);

        TaskResponse result = taskService.create(familyId, taskRequest);
        assertEquals(task.getTitle(),result.getTitle());
        verify(taskRepository).save(any(Task.class));
    }

//    @Test
//    public void shouldReturnAllByFamilyId() {
//        List<Task> taskList = Arrays.asList(task,task);
//        when(taskRepository.findAllByFamilyId(familyId)).thenReturn(taskList);
//        assertEquals(taskService.findAllByFamilyId(familyId).size(),taskList.size());
//    }

    @Test
    public void updateTask() {
        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));
        when(taskRepository.save(task)).thenReturn(task);

        TaskResponse response = taskService.updateTask(taskId, taskRequest);
        assertEquals(task.getTitle(),response.getTitle());
        verify(taskRepository).save(task);
    }




}
