package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.model.Family;
import com.KidQuest.kidquest_app.repository.FamilyRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FamilyService {

    private final FamilyRepository familyRepository;

    public FamilyService(FamilyRepository familyRepository) {
        this.familyRepository = familyRepository;
    }

    public List<Family> findAll(){
        return familyRepository.findAll();
    }

    public Family findById(UUID id){
        Optional<Family> family = familyRepository.findById(id);
        return family.orElseThrow(() -> new RuntimeException("Family with this id does not exist:" + id.toString()));
    }

    public Family create(Family family){
        return familyRepository.save(family);
    }

    public Family update(Family updatedFamily, UUID id){
    Family existing = findById(id);
    existing.setName(updatedFamily.getName());
    return familyRepository.save(existing);
    }

    public void deleteById(UUID id){
        findById(id);
        familyRepository.deleteById(id);
    }
}
