package com.projectsunrise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@SpringBootApplication
public class ProjectSunriseApplication {
    public static void main(String[] args) throws IOException {
        // Load .env file as system properties before Spring Boot starts
        loadDotenv();

        SpringApplication.run(ProjectSunriseApplication.class, args);
    }

    private static void loadDotenv() {
        Path envPath = Path.of(".env");
        if (!Files.exists(envPath)) return;

        try {
            List<String> lines = Files.readAllLines(envPath);
            for (String line : lines) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) continue;
                int eq = line.indexOf('=');
                if (eq < 0) continue;
                String key = line.substring(0, eq).trim();
                String value = line.substring(eq + 1).trim();
                // Only set if not already defined as an environment variable
                if (System.getenv(key) == null) {
                    System.setProperty(key, value);
                }
            }
        } catch (IOException e) {
            System.err.println("Warning: Could not load .env file: " + e.getMessage());
        }
    }
}
