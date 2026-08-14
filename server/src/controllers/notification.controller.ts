import { Request, Response } from 'express';
import Notification from '../models/Notification.model';
import { sendSuccess, sendError } from '../utils/response';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: req.user?.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ recipient: req.user?.id });
    const unreadCount = await Notification.countDocuments({ recipient: req.user?.id, read: false });

    sendSuccess(res, {
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    }, 'Notifications retrieved successfully', 200);

  } catch (error) {
    console.error('getNotifications error:', error);
    sendError(res, 'Error retrieving notifications', 500);
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const unreadCount = await Notification.countDocuments({ recipient: req.user?.id, read: false });
    sendSuccess(res, { unreadCount }, 'Unread count retrieved', 200);
  } catch (error) {
    console.error('getUnreadCount error:', error);
    sendError(res, 'Error retrieving unread count', 500);
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user?.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return sendError(res, 'Notification not found', 404);
    }

    sendSuccess(res, { notification }, 'Notification marked as read', 200);
  } catch (error) {
    console.error('markAsRead error:', error);
    sendError(res, 'Error marking notification as read', 500);
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    await Notification.updateMany(
      { recipient: req.user?.id, read: false },
      { read: true }
    );
    sendSuccess(res, null, 'All notifications marked as read', 200);
  } catch (error) {
    console.error('markAllAsRead error:', error);
    sendError(res, 'Error marking all notifications as read', 500);
  }
};
