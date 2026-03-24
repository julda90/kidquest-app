package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.dto.request.ChangePasswordRequest;
import com.KidQuest.kidquest_app.dto.response.AppUserResponse;
import com.KidQuest.kidquest_app.exception.BadRequestException;
import com.KidQuest.kidquest_app.exception.ResourceNotFoundException;
import com.KidQuest.kidquest_app.model.AppUser;
import com.KidQuest.kidquest_app.repository.AppUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;


@ExtendWith(MockitoExtension.class)
public class AppUserServiceTest {

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private FamilyService familyService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AppUserService appUserService;

    private UUID userId;
    private AppUser appUser;
    private ChangePasswordRequest changePasswordRequest;

    @BeforeEach
    public void setUp() {
        userId = UUID.randomUUID();
        appUser = new AppUser();
        appUser.setEmail("julian@sap.com");
        appUser.setId(userId);
        appUser.setPassword("Password");
        changePasswordRequest = new ChangePasswordRequest();

    }

    @Test
    public void shouldReturnUserById() {
        when(appUserRepository.findById(userId)).thenReturn(Optional.of(appUser));

        AppUserResponse appUserResponse = appUserService.getById(appUser.getId());

        assertEquals(userId, appUserResponse.getId());

    }

    @Test
    public void shouldThrowExceptionWhenUserNotFound() {
        when(appUserRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> appUserService.getById(userId));
    }

    @Test
    public void shouldReturnAllUsers() {
        List<AppUser> users = Arrays.asList(appUser, appUser);

        when(appUserRepository.findAll()).thenReturn(users);

        assertEquals(users.size(),appUserService.findAll().size());
    }

    @Test
    public void shouldDeleteUserById() {

        appUserService.delete(userId);

        verify(appUserRepository).deleteById(userId);

    }

    @Test
    public void shouldThrowExceptionIncorrectPassword() {
        changePasswordRequest.setCurrentPassword("wrongPasword");
        changePasswordRequest.setNewPassword("newPassword");

        when(appUserRepository.findById(userId)).thenReturn(Optional.of(appUser));

        when(passwordEncoder.matches("wrongPasword", appUser.getPassword())).thenReturn(false);

        assertThrows(BadRequestException.class, () -> appUserService.changePassword(userId, changePasswordRequest));

    }
}
