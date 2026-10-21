package com.KidQuest.kidquest_app.controller;

import com.KidQuest.kidquest_app.dto.request.ChildRequest;
import com.KidQuest.kidquest_app.dto.response.ChildResponse;
import com.KidQuest.kidquest_app.dto.response.EarningRateResponse;
import com.KidQuest.kidquest_app.dto.response.ProgressResponse;
import com.KidQuest.kidquest_app.exception.BadRequestException;
import com.KidQuest.kidquest_app.model.Child;
import com.KidQuest.kidquest_app.model.PointTransaction;
import com.KidQuest.kidquest_app.model.TransactionType;
import com.KidQuest.kidquest_app.repository.PointTransactionRepository;
import com.KidQuest.kidquest_app.service.ChildService;
import com.KidQuest.kidquest_app.service.ProgressService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/children")
public class ChildController {

    private final ChildService childService;
    private final ProgressService progressService;
    private final PointTransactionRepository pointTransactionRepository;
    private final Clock clock;

    public ChildController(ChildService childService, ProgressService progressService,
                           PointTransactionRepository pointTransactionRepository, Clock clock) {
        this.childService = childService;
        this.progressService = progressService;
        this.pointTransactionRepository = pointTransactionRepository;
        this.clock = clock;
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
    public ResponseEntity<ChildResponse> create(@PathVariable UUID familyId, @RequestBody @Valid ChildRequest childRequest) {
        ChildResponse createdChild = childService.create(childRequest, familyId);
        return ResponseEntity.status(201).body(createdChild);
    }
    @PutMapping("/{id}")
    public ResponseEntity<ChildResponse> update(@PathVariable UUID id, @RequestBody @Valid ChildRequest childRequest) {
        ChildResponse updatedChild =  childService.update(id, childRequest);
        return ResponseEntity.ok(updatedChild);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        childService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/skin")
    public ResponseEntity<ChildResponse> updateSkin(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String skin = body.get("skin");
        if (skin == null || skin.isBlank()) throw new BadRequestException("skin is required");
        return ResponseEntity.ok(childService.updateSkin(id, skin));
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<ProgressResponse> getProgress(@PathVariable UUID id) {
        return ResponseEntity.ok(progressService.buildResponse(childService.findById(id)));
    }

    @GetMapping("/family/{familyId}/earning-rate")
    public ResponseEntity<List<EarningRateResponse>> getEarningRate(
            @PathVariable UUID familyId,
            @RequestParam(defaultValue = "14") int days) {
        LocalDate since = LocalDate.now(clock).minusDays(days);
        java.time.LocalDateTime sinceDateTime = since.atStartOfDay();
        List<EarningRateResponse> rates = childService.findAllByFamilyId(familyId).stream()
                .map(child -> {
                    int total = pointTransactionRepository.sumTaskBonusSince(child.getId(), sinceDateTime);
                    double avg = days > 0 ? (double) total / days : 0;
                    return new EarningRateResponse(child.getId(), avg);
                }).toList();
        return ResponseEntity.ok(rates);
    }

    @PostMapping("/{id}/chest/open")
    public ResponseEntity<Map<String, Object>> openChest(@PathVariable UUID id) {
        Child child = childService.findById(id);
        LocalDate today = LocalDate.now(clock);
        if (!progressService.chestAvailable(child.getId(), today)) {
            throw new BadRequestException("Chest is not available yet. Complete 3 tasks today and it unlocks once per week.");
        }
        PointTransaction tx = new PointTransaction();
        tx.setChild(child);
        tx.setAmount(ProgressService.CHEST_BONUS);
        tx.setType(TransactionType.CHEST);
        tx.setReason("Pokladnice");
        pointTransactionRepository.save(tx);
        return ResponseEntity.ok(Map.of("awardedPoints", ProgressService.CHEST_BONUS));
    }
}
