package com.projectsunrise.service;

import com.projectsunrise.dto.notification.NotificationResponse;
import com.projectsunrise.entity.Notification;
import com.projectsunrise.entity.User;
import com.projectsunrise.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public Notification createNotification(User user, String title, String message,
                                           Notification.NotificationType type,
                                           String entityType, Long entityId) {
        Notification notification = Notification.builder()
            .user(user)
            .title(title)
            .message(message)
            .type(type)
            .entityType(entityType)
            .entityId(entityId)
            .read(false)
            .build();

        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(User user, int page, int size) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size))
            .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return notificationRepository.countUnreadByUserId(user.getId());
    }

    @Transactional
    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to modify this notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(User user) {
        Page<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(
            user.getId(), PageRequest.of(0, 1000));
        unread.forEach(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
            .id(notification.getId())
            .title(notification.getTitle())
            .message(notification.getMessage())
            .type(notification.getType().name())
            .entityType(notification.getEntityType())
            .entityId(notification.getEntityId())
            .read(notification.getRead())
            .createdAt(notification.getCreatedAt())
            .build();
    }
}
