import { prisma } from "../../config/db.js";
import { sendSms } from "../../utils/sms.js";

/**
 * GET /customer/notifications (or /provider/notifications)
 * Returns the last 50 notifications for the logged-in user.
 */
export async function getNotifications(req, res, next) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /customer/notifications/:id/read
 * Mark a single notification as read.
 */
export async function markNotificationRead(req, res, next) {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!notification || notification.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    const updated = await prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: true },
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /customer/notifications/read-all
 * Mark all notifications as read for the logged-in user.
 */
export async function markAllNotificationsRead(req, res, next) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });

    return res.status(200).json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    next(error);
  }
}
