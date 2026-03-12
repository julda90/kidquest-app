package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.request.ChangePasswordRequest;
import com.KidQuest.kidquest_app.dto.request.CreateUserRequest;
import com.KidQuest.kidquest_app.dto.request.UpdateUserRequest;
import com.KidQuest.kidquest_app.dto.response.AppUserResponse;
import com.KidQuest.kidquest_app.model.AppUser;
import com.KidQuest.kidquest_app.repository.AppUserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;


@Service
public class AppUserService {

    private final AppUserRepository appUserRepository;
    private final FamilyService familyService;
    private final PasswordEncoder passwordEncoder;

    public AppUserService(AppUserRepository appUserRepository, FamilyService familyService, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.familyService = familyService;
        this.passwordEncoder = passwordEncoder;
    }

    private AppUser findById(UUID id) {
        return appUserRepository.findById(id).orElseThrow(()->new RuntimeException("No user with id: "+ id));
    }

    public AppUserResponse getById(UUID id) {
        return response(findById(id));
    }

    public List<AppUserResponse> findAll() {
        return appUserRepository.findAll()
                .stream()
                .map(this::response)
                .toList();
    }

    public AppUserResponse update(UUID id, UpdateUserRequest updateUserRequest) {
        AppUser existing = findById(id);
        existing.setRole(updateUserRequest.getRole());
        existing.setEmail(updateUserRequest.getEmail());
        if (updateUserRequest.getFamilyId() != null) {
            existing.setFamily(familyService.findById(updateUserRequest.getFamilyId()));
        }
        return response(appUserRepository.save(existing));
    }

    public AppUserResponse create(CreateUserRequest createUserRequest){
        AppUser appUser = new AppUser();
        appUser.setEmail(createUserRequest.getEmail());
        appUser.setRole(createUserRequest.getRole());
        appUser.setFamily(familyService.findById(createUserRequest.getFamilyId()));
        appUser.setPassword(passwordEncoder.encode(createUserRequest.getPassword()));
        return response(appUserRepository.save(appUser));
    }

    public void delete(UUID id) {
        appUserRepository.deleteById(id);
    }

    public void changePassword(UUID id, ChangePasswordRequest  changePasswordRequest) {
        AppUser existing = findById(id);
        if (!passwordEncoder.matches(changePasswordRequest.getCurrentPassword(),existing.getPassword())) {
            throw new RuntimeException("Passwords don't match");
        }
        existing.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        appUserRepository.save(existing);
    }

    public AppUserResponse response(AppUser appUser) {
        AppUserResponse appUserResponse = new AppUserResponse();
        appUserResponse.setId(appUser.getId());
        appUserResponse.setEmail(appUser.getEmail());
        appUserResponse.setRole(appUser.getRole());
        if (appUser.getFamily() != null) {
            appUserResponse.setFamilyId(appUser.getFamily().getId());
        }
        appUserResponse.setCreatedAt(appUser.getCreatedAt());
        appUserResponse.setUpdatedAt(appUser.getUpdatedAt());
        return appUserResponse;
    }

}
