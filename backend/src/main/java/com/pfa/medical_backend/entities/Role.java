package com.pfa.medical_backend.entities;

import java.util.Set;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity 
@Table(name="roles")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantR")
    private Integer identifiantR;

    @Column(name = "NomRole", unique = true, nullable = false, length = 50)
    private String nomRole;

    // Realtion
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "roles_permissions",
        joinColumns = @JoinColumn(name = "IdentifiantR"),
        inverseJoinColumns = @JoinColumn(name = "IdentifiantPer")
    )
    private Set <Permission> permissions;
    
}
