package com.projectsunrise.service;

import com.projectsunrise.entity.EmailNotification;
import com.projectsunrise.repository.EmailNotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final EmailNotificationRepository emailNotificationRepository;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Async
    @Transactional
    public void sendPasswordResetEmail(String to, String token) {
        String resetUrl = frontendUrl + "/auth/reset-password?token=" + token;

        EmailNotification email = EmailNotification.builder()
            .recipientEmail(to)
            .subject("Sunrise - Password Reset Request")
            .body(buildPasswordResetBody(resetUrl))
            .status(EmailNotification.EmailStatus.PENDING)
            .build();

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Sunrise - Password Reset Request");
            message.setText("Click the link to reset your password: " + resetUrl +
                          "\n\nThis link will expire in 1 hour.");

            mailSender.send(message);

            email.setStatus(EmailNotification.EmailStatus.SENT);
            email.setDeliveredAt(java.time.LocalDateTime.now());
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", to, e.getMessage());
            email.setStatus(EmailNotification.EmailStatus.FAILED);
            email.setErrorMessage(e.getMessage());
        }

        emailNotificationRepository.save(email);
    }

    @Async
    @Transactional
    public void sendNotificationEmail(String to, String subject, String body) {
        EmailNotification email = EmailNotification.builder()
            .recipientEmail(to)
            .subject(subject)
            .body(body)
            .status(EmailNotification.EmailStatus.PENDING)
            .build();

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

            email.setStatus(EmailNotification.EmailStatus.SENT);
            email.setDeliveredAt(java.time.LocalDateTime.now());
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            email.setStatus(EmailNotification.EmailStatus.FAILED);
            email.setErrorMessage(e.getMessage());
        }

        emailNotificationRepository.save(email);
    }

    private String buildPasswordResetBody(String resetUrl) {
        return "You requested a password reset for your Sunrise account.\n\n" +
               "Click the link below to reset your password:\n" + resetUrl + "\n\n" +
               "This link will expire in 1 hour.\n" +
               "If you did not request a password reset, please ignore this email.";
    }
}
