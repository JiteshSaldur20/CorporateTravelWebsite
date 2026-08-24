package com.projectsunrise.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//import org.springframework.security.web.authentication.http403ForbiddenEntryPoint;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomOAuth2SuccessHandler oAuth2SuccessHandler;

    @Value("${spring.security.oauth2.client.registration.google.client-id:not-configured}")
    private String googleClientId;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Swagger / OpenAPI
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/v3/api-docs").permitAll()

                // Flight/Hotel search - accessible to authenticated users
                .requestMatchers(HttpMethod.GET, "/api/flights/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/hotels/**").authenticated()

                // Employee endpoints
                .requestMatchers("/api/bookings/**").authenticated()
                .requestMatchers("/api/policies/**").authenticated()
                .requestMatchers("/api/notifications/**").authenticated()

                // Manager/Approver endpoints
                .requestMatchers("/api/approvals/**").hasAnyRole("MANAGER", "ADMIN")

                // Admin-only payment endpoints
                .requestMatchers(HttpMethod.POST, "/api/payments/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/payments/**").authenticated()

                // Admin-only endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/dashboard/admin").hasRole("ADMIN")

                // Manager dashboard
                .requestMatchers(HttpMethod.GET, "/api/dashboard/approver").hasAnyRole("MANAGER", "ADMIN")

                // User dashboard
                .requestMatchers(HttpMethod.GET, "/api/dashboard/employee").authenticated()

                // Support - authenticated
                .requestMatchers("/api/support/**").authenticated()

                .anyRequest().authenticated()
            );

        // Only enable OAuth2 login if Google client-id is configured (not the placeholder)
        if (googleClientId != null && !googleClientId.isBlank() && !"not-configured".equals(googleClientId)) {
            http.oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2SuccessHandler)
            );
        }

        http.exceptionHandling(ex -> ex
            .authenticationEntryPoint((request, response, authException) -> {
                response.setContentType("application/json");
                response.setStatus(401);
                response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication required\",\"status\":401}");
            })
        );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
