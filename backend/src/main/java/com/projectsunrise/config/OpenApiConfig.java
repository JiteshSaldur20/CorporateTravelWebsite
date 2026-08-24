package com.projectsunrise.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile({"dev", "test"})
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Sunrise — Corporate Travel Booking API")
                .description("REST API for managing corporate travel bookings, approvals, payments, and policies.")
                .version("1.0.0")
                .contact(new Contact()
                    .name("Sunrise Team")
                    .email("support@sunrise.com")))
            .schemaRequirement("Bearer", new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("Paste your JWT token here (no 'Bearer ' prefix needed)"))
            .addSecurityItem(new SecurityRequirement().addList("Bearer"));
    }
}
