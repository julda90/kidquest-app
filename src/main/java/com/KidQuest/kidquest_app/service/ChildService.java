package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.request.ChildRequest;
import com.KidQuest.kidquest_app.dto.response.ChildResponse;
import com.KidQuest.kidquest_app.model.Child;
import com.KidQuest.kidquest_app.repository.ChildRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ChildService {
    private final ChildRepository childRepository;
    private final FamilyService familyService;

    public ChildService(ChildRepository childRepository, FamilyService familyService) {
        this.childRepository = childRepository;
        this.familyService = familyService;
    }


    public List<ChildResponse> findAllByFamilyId(UUID familyId){
        return childRepository.findByFamilyId(familyId)
                .stream()
                .map(this::response)
                .toList();
    }
    public Child findById(UUID id){
        return childRepository.findById(id).orElseThrow(() -> new RuntimeException("Child Not Found with id:" + id));
    }

    public ChildResponse create(ChildRequest request, UUID familyId){
        Child child = new Child();
        child.setName(request.getName());
        child.setAge(request.getAge());
        child.setAvatar(request.getAvatar());
        child.setFamily(familyService.findById(familyId));
        return response(childRepository.save(child));
    }
    public ChildResponse update(UUID id, ChildRequest updatedChild){
        Child existingChild = findById(id);
        existingChild.setName(updatedChild.getName());
        existingChild.setAvatar(updatedChild.getAvatar());
        existingChild.setAge(updatedChild.getAge());
        return response(childRepository.save(existingChild));
    }

    public void deleteById(UUID id){
        findById(id);
        childRepository.deleteById(id);
    }
    public ChildResponse response(Child child){
        ChildResponse response = new ChildResponse();
        response.setId(child.getId());
        response.setName(child.getName());
        response.setAvatar(child.getAvatar());
        response.setAge(child.getAge());
        response.setCreatedAt(child.getCreatedAt());
        response.setUpdatedAt(child.getUpdatedAt());
        response.setFamilyId(child.getFamily().getId());
        return response;
    }

}
