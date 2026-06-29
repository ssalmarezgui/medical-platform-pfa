package com.pfa.medical_backend.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "utilisateurs", indexes = {
    @Index(name= "idx_user_login",columnList = "LoginU"),
    @Index(name="idx_user_uuid", columnList = "uuid")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantU")
    private Integer identifiantU;

    @Column(name="uuid", unique= true, nullable = false, updatable = false)
    private String uuid = UUID.randomUUID().toString();

    @Column(name = "LoginU", unique = true, nullable = false, length = 100)
    private String loginU;

    @Column(name = "MotPasseU", nullable = false)
    @JsonIgnore
    private String motPasseU; 

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "IdentifiantR", nullable = true) // a changer a false au futur
    private Role role;

    
    // champs de sec et conformite (audit + forcebrute)

    @Column(name="account_non_locked", nullable = false)
    private boolean accountNonLocked = true;

    @Column(name="failed_login_attempts", nullable = false)
    private int failedLoginAttempts = 0;

    @Column(name="lock_time")
    private LocalDateTime locktime;
    @Column(name="last_login")
    private LocalDateTime lastlogin;





    // Relation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantS", nullable = false)
    @JsonIgnoreProperties("users") 
    private ServiceMedical service;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantM", nullable = true)
    private Medecin medecin;


}