package com.pfa.medical_backend;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
public class MedicalBackendApplication {

    private static final Logger logger = LoggerFactory.getLogger(MedicalBackendApplication.class);

    public static void main(String[] args) {
        loadLocalEnvFile();
        
        SpringApplication.run(MedicalBackendApplication.class, args);
    }

    private static void loadLocalEnvFile() {
        try {
            if (Files.exists(Paths.get(".env"))) {
                List<String> lines = Files.readAllLines(Paths.get(".env"));
                for (String line : lines) {
                    String trimmed = line.trim();
                    if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                        continue;
                    }
                    String[] parts = trimmed.split("=", 2);
                    if (parts.length == 2) {
                        String key = parts[0].trim();
                        String value = parts[1].trim();
                        System.setProperty(key, value);
                    }
                }
                logger.info("[SYSTEM .ENV] Variables de configuration chargées avec succès depuis .env local.");
            } else {
                logger.info("[SYSTEM .ENV] Aucun fichier .env trouvé. Utilisation de l'environnement Cloud de production.");
            }
        } catch (IOException e) {
            logger.error("[SYSTEM .ENV] Impossible de charger le fichier .env : {}", e.getMessage());
        }
    }
}