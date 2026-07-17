package com.pfa.medical_backend.services;

import java.util.List;

import com.pfa.medical_backend.dto.UserRequestDTO;
import com.pfa.medical_backend.dto.UserResponseDTO;
import com.pfa.medical_backend.entities.User;

public interface UserService {
    UserResponseDTO createUser(UserRequestDTO dto);
    UserResponseDTO getUserByUuid(String uuid);
    List<UserResponseDTO> getAllUsers();
    void registerFailedAttempt(String loginU);
    void resetFailedAttempts(String loginU);
    void lockUser(User user);

    List<UserResponseDTO> getPendingUsers();
    UserResponseDTO approveUser(String uuid);

    UserResponseDTO toggleUserStatus(String uuid);


}

