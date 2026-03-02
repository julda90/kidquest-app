package com.KidQuest.kidquest_app.controller;

import com.KidQuest.kidquest_app.dto.request.ChildRequest;
import com.KidQuest.kidquest_app.dto.response.ChildResponse;
import com.KidQuest.kidquest_app.model.Child;
import com.KidQuest.kidquest_app.service.ChildService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/children")
public class ChildController {

    private final ChildService childService;

    public ChildController(ChildService childService) {
        this.childService = childService;
    }

    @GetMapping("/family/{familyId}")
    public ResponseEntity<List<ChildResponse>> getChildren(@PathVariable UUID familyId) {
        List<ChildResponse> children = childService.findAllByFamilyId(familyId);
        return ResponseEntity.ok().body(children);
    }
    @GetMapping("/{id}")
    public ResponseEntity<ChildResponse> getChild(@PathVariable UUID id) {
        ChildResponse child = childService.response(childService.findById(id));
        return ResponseEntity.ok().body(child);
    }
    @PostMapping("/family/{familyId}")
    public ResponseEntity<ChildResponse> create(@PathVariable UUID familyId, @RequestBody ChildRequest childRequest) {
        ChildResponse createdChild = childService.create(childRequest, familyId);
        return ResponseEntity.status(201).body(createdChild);
    }
    @PutMapping("/{id}")
    public ResponseEntity<ChildResponse> update(@PathVariable UUID id, @RequestBody ChildRequest childRequest) {
        ChildResponse updatedChild =  childService.update(id, childRequest);
        return ResponseEntity.ok(updatedChild);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        childService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
