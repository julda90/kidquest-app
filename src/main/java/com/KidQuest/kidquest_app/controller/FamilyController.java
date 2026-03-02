package com.KidQuest.kidquest_app.controller;

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
    public ResponseEntity<List<Family>> findAll(){
        List<Family> families = familyService.findAll();
        return ResponseEntity.ok(families);
    }
    @PostMapping()
    public ResponseEntity<Family> create(@RequestBody Family family){
        Family createdFamily = familyService.create(family);
        return ResponseEntity.status(201).body(createdFamily);
    }
    @PutMapping("/{id}")
    public ResponseEntity<Family> update(@PathVariable UUID id, @RequestBody Family family){
        Family updatedFamily = familyService.update(family,id);
        return ResponseEntity.ok(updatedFamily);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id){
        familyService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
