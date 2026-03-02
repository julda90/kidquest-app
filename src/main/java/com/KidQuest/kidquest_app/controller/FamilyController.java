package com.KidQuest.kidquest_app.controller;

import com.KidQuest.kidquest_app.dto.response.FamilyResponse;
import com.KidQuest.kidquest_app.model.Family;
import com.KidQuest.kidquest_app.service.FamilyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/families")
public class FamilyController {

    private final FamilyService familyService;

    public FamilyController(FamilyService familyService) {
        this.familyService = familyService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Family> findById(@PathVariable UUID id) {
        Family family = familyService.findById(id);
        return ResponseEntity.ok(family);
    }

    @GetMapping
    public ResponseEntity<List<FamilyResponse>> findAll(){
        List<FamilyResponse> families = familyService.findAll();
        return ResponseEntity.ok(families);
    }
    @PostMapping()
    public ResponseEntity<FamilyResponse> create(@RequestBody Family family){
        FamilyResponse createdFamily = familyService.create(family);
        return ResponseEntity.status(201).body(createdFamily);
    }
    @PutMapping("/{id}")
    public ResponseEntity<FamilyResponse> update(@PathVariable UUID id, @RequestBody Family family){
        FamilyResponse updatedFamily = familyService.update(family,id);
        return ResponseEntity.ok(updatedFamily);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id){
        familyService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
