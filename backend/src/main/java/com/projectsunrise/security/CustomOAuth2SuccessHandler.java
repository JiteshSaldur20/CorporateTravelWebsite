package com.projectsunrise.security;

import com.projectsunrise.entity.RefreshToken;
import com.projectsunrise.entity.User;
import com.projectsunrise.repository.RefreshTokenRepository;
import com.projectsunrise.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String googleId = oAuth2User.getAttribute("sub");
        String picture = oAuth2User.getAttribute("picture");

        // Link or create account
        User user = userRepository.findByGoogleId(googleId)
            .orElseGet(() -> userRepository.findByEmail(email)
                .map(existingUser -> {
                    existingUser.setGoogleId(googleId);
                    existingUser.setProfilePictureUrl(picture);
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    User newUser = User.builder()
                        .fullName(name)
                        .email(email)
                        .googleId(googleId)
                        .profilePictureUrl(picture)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .enabled(true)
                        .build();
                    // Default to USER role
                    // Will be set up during data initialization
                    return userRepository.save(newUser);
                })
            );

        String jwtToken = jwtProvider.generateToken(user.getEmail());

        // Generate refresh token
        refreshTokenRepository.deleteByUserId(user.getId());
        String refreshTokenValue = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
            .token(refreshTokenValue)
            .user(user)
            .expiryDate(LocalDateTime.now().plusDays(7))
            .revoked(false)
            .build();
        refreshTokenRepository.save(refreshToken);

        // Redirect to frontend with both tokens
        String redirectUrl = frontendUrl + "/auth/callback?token=" + jwtToken
            + "&refreshToken=" + URLEncoder.encode(refreshTokenValue, StandardCharsets.UTF_8);
        response.sendRedirect(redirectUrl);
    }
}
