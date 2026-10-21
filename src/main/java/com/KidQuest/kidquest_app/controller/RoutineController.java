package com.KidQuest.kidquest_app.controller;

import com.KidQuest.kidquest_app.dto.request.RoutineRequest;
import com.KidQuest.kidquest_app.dto.response.RoutineResponse;
import com.KidQuest.kidquest_app.service.RoutineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/routines")
public class RoutineController {

    private final RoutineService routineService;

    public RoutineController(RoutineService routineService) {
        this.routineService = routineService;
    }

    @GetMapping
    public ResponseEntity<List<RoutineResponse>> list(@RequestParam UUID familyId) {
        return ResponseEntity.ok(routineService.findByFamily(familyId));
    }

    @PostMapping
    public ResponseEntity<RoutineResponse> create(@RequestParam UUID familyId, @RequestBody RoutineRequest req) {
        return ResponseEntity.status(201).body(routineService.create(familyId, req.getChildId(), req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoutineResponse> update(@PathVariable UUID id, @RequestBody RoutineRequest req) {
        return ResponseEntity.ok(routineService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        routineService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
