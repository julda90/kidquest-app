package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.model.Child;
import com.KidQuest.kidquest_app.repository.ChildRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ChildService {
    private final ChildRepository childRepository;

    public ChildService(ChildRepository childRepository) {
        this.childRepository = childRepository;
    }


    public List<Child> findAllByFamilyId(UUID familyId){
        return childRepository.findByFamilyId(familyId);
    }

    public Child findById(UUID id){
        return childRepository.findById(id).orElseThrow(() -> new RuntimeException("Child Not Found with id:" + id));
    }
    public Child create(Child child){
        return childRepository.save(child);
    }
    public Child update(UUID id, Child updatedChild){
        Child existingChild = findById(id);
        existingChild.setName(updatedChild.getName());
        existingChild.setAvatar(updatedChild.getAvatar());
        existingChild.setAge(updatedChild.getAge());
        return childRepository.save(existingChild);
    }
    public void deleteById(UUID id){
        findById(id);
        childRepository.deleteById(id);
    }
}
