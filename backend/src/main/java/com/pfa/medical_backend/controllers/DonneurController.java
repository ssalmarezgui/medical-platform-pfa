package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.entities.Donneur;
import com.pfa.medical_backend.services.DonneurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donneurs")
@CrossOrigin(origins = "*")
public class DonneurController {

    @Autowired
    private DonneurService donneurService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN')")
    public List<Donneur> getAll(@RequestParam(required = false) String type) {
        if (type != null) {
            return donneurService.getByType(type);
        }
        return donneurService.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN')")
    public ResponseEntity<Donneur> getById(@PathVariable Integer id) {
        return donneurService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN_INVESTIGATEUR')")
    public ResponseEntity<Donneur> create(@RequestBody Donneur donneur) {
        // Remarque n°10 : L'objet reçu est l'équivalent exact du patient
        return new ResponseEntity<>(donneurService.create(donneur), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN')")
    public Donneur update(@PathVariable Integer id, @RequestBody Donneur details) {
        return donneurService.update(id, details);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        donneurService.delete(id);
        return ResponseEntity.noContent().build();
    }
}