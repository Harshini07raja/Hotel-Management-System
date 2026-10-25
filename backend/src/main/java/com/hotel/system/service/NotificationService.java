package com.hotel.system.service;

import com.hotel.system.model.Notification;
import com.hotel.system.model.NotificationType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final ShardRouter shardRouter;
    private final UniqueIdGeneratorService idGenerator;

    public NotificationService(ShardRouter shardRouter, UniqueIdGeneratorService idGenerator) {
        this.shardRouter = shardRouter;
        this.idGenerator = idGenerator;
    }

    public Notification createNotification(String guestId, NotificationType type, String title, String message, String bookingId) {
        String id = idGenerator.nextNotificationId();
        Notification notification = new Notification(id, guestId, type, title, message, bookingId);

        // Store on guest's shard
        MongoTemplate template = shardRouter.getTemplateForGuest(guestId);
        template.save(notification);
        log.info("Notification created for guest {} [type: {}, id: {}]", guestId, type, id);
        return notification;
    }

    public List<Notification> getGuestNotifications(String guestId) {
        MongoTemplate template = shardRouter.getTemplateForGuest(guestId);
        Query query = new Query(Criteria.where("guestId").is(guestId))
                .with(Sort.by(Sort.Direction.DESC, "createdAt"));
        return template.find(query, Notification.class);
    }

    public boolean markAsRead(String notificationId, String guestId) {
        MongoTemplate template = shardRouter.getTemplateForGuest(guestId);
        Notification notification = template.findById(notificationId, Notification.class);
        if (notification != null && notification.getGuestId().equals(guestId)) {
            notification.setRead(true);
            template.save(notification);
            return true;
        }
        return false;
    }
}
