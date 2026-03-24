package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.request.ChildRequest;
import com.KidQuest.kidquest_app.dto.response.ChildResponse;
import com.KidQuest.kidquest_app.exception.ResourceNotFoundException;
import com.KidQuest.kidquest_app.model.Child;
import com.KidQuest.kidquest_app.model.Family;
import com.KidQuest.kidquest_app.repository.ChildRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ChildServiceTest {

    @Mock
    private ChildRepository childRepository;

    @Mock
    private FamilyService familyService;

    @InjectMocks
    private ChildService childService;

    private Child child;
    private UUID childId;
    private Family family;
    private UUID familyId;
    private ChildRequest childRequest;
    private ChildResponse childResponse;

    @BeforeEach
    public void setUp() {
        child = new Child();
        family = new Family();
        childRequest = new ChildRequest();
        child.setFamily(family);
        childId = UUID.randomUUID();
        familyId = UUID.randomUUID();
        family.setId(familyId);
        child.setId(childId);
        childRequest.setName("name");
    }

    @Test
    public void shouldReturnChildById(){
        when(childRepository.findById(childId)).thenReturn(Optional.of(child));

        assertEquals(childService.findById(child.getId()), child);

    }

    @Test
    public void shouldReturnChildByFamilyId(){
        List<Child> children = Arrays.asList(child,child);

        when(childRepository.findByFamilyId(family.getId())).thenReturn(children);

        assertEquals(childService.findAllByFamilyId(familyId).size(), children.size());
    }

    @Test
    public void shouldThrowExceptionWhenChildNotFound(){
        when(childRepository.findById(childId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> childService.findById(childId));
    }

    @Test
    public void shouldCreateChild(){
        when(familyService.findById(familyId)).thenReturn(family);

        when(childRepository.save(any(Child.class))).thenReturn(child);

        childResponse = childService.create(childRequest, familyId);

        assertEquals(childResponse.getName(), child.getName());

        verify(childRepository).save(any(Child.class));
    }

    @Test
    public void shouldUpdateChild(){
        when(childRepository.findById(childId)).thenReturn(Optional.of(child));
        when(childRepository.save(child)).thenReturn(child);
        childResponse = childService.update(childId, childRequest);
        assertEquals(childResponse.getName(), child.getName());
    }

    @Test
    public void shouldDeleteChild(){
        when(childRepository.findById(childId)).thenReturn(Optional.of(child));
        childService.deleteById(childId);

        verify(childRepository).deleteById(childId);
    }

}
