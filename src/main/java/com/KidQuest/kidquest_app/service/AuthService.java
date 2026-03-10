package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.request.LoginRequest;
import com.KidQuest.kidquest_app.dto.request.RegisterRequest;
import com.KidQuest.kidquest_app.dto.response.AuthResponse;
import com.KidQuest.kidquest_app.model.AppUser;
import com.KidQuest.kidquest_app.repository.AppUserRepository;
import com.KidQuest.kidquest_app.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AppUserRepository appUserRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final AuthenticationManager authenticationManager;

    private final FamilyService familyService;

    public AuthService(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager, FamilyService familyService) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.familyService = familyService;
    }

    public AuthResponse register(RegisterRequest registerRequest) {
        AppUser appUser = new AppUser();
        appUser.setEmail(registerRequest.getEmail());
        appUser.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        appUser.setRole(registerRequest.getRole());
        if (registerRequest.getFamilyId()  != null) {
            appUser.setFamily(familyService.findById(registerRequest.getFamilyId()));
        }
        appUserRepository.save(appUser);
        return new AuthResponse(jwtService.generateToken(appUser));
    }

    public AuthResponse login(LoginRequest loginRequest) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        AppUser appUser = appUserRepository.findByEmail(loginRequest.getEmail()).orElseThrow(() -> new RuntimeException("No User found with email: " + loginRequest.getEmail()));
        String token = jwtService.generateToken(appUser);
        return new AuthResponse(token);
    }
}
