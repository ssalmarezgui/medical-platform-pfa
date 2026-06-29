package com.pfa.medical_backend.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "permissions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Permission {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "IdentifiantPer")
    private Integer identifiantPer;


    @Column(name = "NomPermission", unique = true, nullable = false, length = 50)
    private String nomPermission;
}
