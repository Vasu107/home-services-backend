import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../controllers/customer/notifications.controller.js";

export const notificationsRouter = Router();

// All routes require authentication
notificationsRouter.use(authenticate);

// GET   /notifications         — fetch user's notifications
notificationsRouter.get("/", getNotifications);

// PATCH /notifications/read-all — mark all as read (must come before /:id)
notificationsRouter.patch("/read-all", markAllNotificationsRead);

// PATCH /notifications/:id/read — mark single as read
notificationsRouter.patch("/:id/read", markNotificationRead);
