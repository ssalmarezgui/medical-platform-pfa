package com.pfa.medical_backend.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UserResponseDTO {

    private String uuid;
    private String loginU;
    private String roleU;
    private boolean accountNonLocked;
    private LocalDateTime lastlogin;
    private Integer serviceId;
    private Integer medecinId;
    
}
