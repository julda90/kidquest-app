package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.response.FamilyResponse;
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

    public List<FamilyResponse> findAll(){
        return familyRepository
                .findAll()
                .stream()
                .map(this::response)
                .toList();
    }

    public Family findById(UUID id){
        Optional<Family> family = familyRepository.findById(id);
        return family.orElseThrow(() -> new RuntimeException("Family with this id does not exist:" + id.toString()));
    }

    public FamilyResponse create(Family family){
        return response(familyRepository.save(family));
    }

    public FamilyResponse update(Family updatedFamily, UUID id){
    Family existing = findById(id);
    existing.setName(updatedFamily.getName());
    return response(familyRepository.save(existing));
    }

    public void deleteById(UUID id){
        findById(id);
        familyRepository.deleteById(id);
    }
    public FamilyResponse response(Family family){
        FamilyResponse response = new FamilyResponse();
        response.setId(family.getId());
        response.setName(family.getName());
        response.setCreatedAt(family.getCreatedAt());
        response.setUpdatedAt(family.getUpdatedAt());
        return response;
    }
}
