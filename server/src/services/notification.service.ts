import Notification from '../models/Notification.model';
import { NotificationType } from '../../../shared/types/enums';

interface SendNotificationParams {
  recipientId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedEntityId?: string;
  entityModel?: string;
}

class NotificationService {
  /**
   * Dispatches a notification to a specific user.
   * This is architected to allow easy extension to email/push notifications in the future.
   */
  async sendNotification(params: SendNotificationParams): Promise<void> {
    try {
      const notification = new Notification({
        recipient: params.recipientId,
        title: params.title,
        message: params.message,
        type: params.type,
        relatedEntity: params.relatedEntityId,
        entityModel: params.entityModel,
      });

      await notification.save();

      // FUTURE: Integration point for external channels
      // if (user.preferences.emailNotifications) {
      //   await emailService.send(...)
      // }
      // if (user.preferences.pushNotifications) {
      //   await pushService.send(...)
      // }

    } catch (error) {
      console.error('Failed to send notification:', error);
      // We log but generally do not throw here to prevent notification failures 
      // from crashing the primary transaction (e.g., creating a task).
    }
  }

  /**
   * Helper to dispatch multiple notifications at once (e.g., to a whole team)
   */
  async sendBulkNotifications(recipients: string[], params: Omit<SendNotificationParams, 'recipientId'>): Promise<void> {
    try {
      const notifications = recipients.map(recipientId => ({
        recipient: recipientId,
        title: params.title,
        message: params.message,
        type: params.type,
        relatedEntity: params.relatedEntityId,
        entityModel: params.entityModel,
      }));

      await Notification.insertMany(notifications);
    } catch (error) {
      console.error('Failed to send bulk notifications:', error);
    }
  }
}

export const notificationService = new NotificationService();
