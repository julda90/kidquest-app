package com.KidQuest.kidquest_app.controller;

import com.KidQuest.kidquest_app.dto.request.ChangePasswordRequest;
import com.KidQuest.kidquest_app.dto.request.CreateUserRequest;
import com.KidQuest.kidquest_app.dto.request.UpdateUserRequest;
import com.KidQuest.kidquest_app.dto.response.AppUserResponse;
import com.KidQuest.kidquest_app.service.AppUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class AppUserController {

    private final AppUserService appUserService;

    public AppUserController(AppUserService appUserService) {
        this.appUserService = appUserService;
    }

    @GetMapping
    public ResponseEntity<List<AppUserResponse>> findAll(){
        List<AppUserResponse> users = appUserService.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppUserResponse> findById(@PathVariable UUID id){
        return ResponseEntity.ok(appUserService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppUserResponse> update(@PathVariable UUID id,@RequestBody() UpdateUserRequest updateUserRequest) {
        AppUserResponse updatedUser = appUserService.update(id, updateUserRequest);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        appUserService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<Void> changePassword(@PathVariable UUID id, @RequestBody ChangePasswordRequest changePasswordRequest) {
        appUserService.changePassword(id, changePasswordRequest);
        return ResponseEntity.noContent().build();
    }
    @PostMapping
    public ResponseEntity<AppUserResponse> create(@RequestBody CreateUserRequest createUserRequest) {
        AppUserResponse createdUser = appUserService.create(createUserRequest);
        return ResponseEntity.status(201).body(createdUser);
    }
}
