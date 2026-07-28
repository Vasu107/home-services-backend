import { prisma } from "../../config/db.js";
import { sendSms } from "../../utils/sms.js";

// ─────────────────────────────────────────────────────────
// Helper: create an in-app DB notification (never throws)
// ─────────────────────────────────────────────────────────
async function createNotification({ userId, type, title, message, link }) {
  try {
    await prisma.notification.create({
      data: { userId, type, title, message, link },
    });
  } catch (err) {
    console.error("[Notification] Failed to save DB notification:", err.message);
  }
}

export async function createBooking(req, res, next) {
  try {
    const {
      providerId,
      categoryId,
      address,
      preferredDate,
      preferredTime,
      problemDescription,
      paymentMethod,
      transactionId,
    } = req.body;

    const provider = await prisma.user.findUnique({
      where: { id: Number(providerId) },
      include: { provider: true },
    });

    if (!provider || provider.role !== "PROVIDER" || provider.provider?.status !== "APPROVED") {
      return res.status(400).json({ success: false, message: "Selected provider is not available." });
    }

    const category = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
    if (!category) return res.status(400).json({ success: false, message: "Category not found." });

    const amount = provider.provider?.serviceCharge ?? category.price;
    const isCash = paymentMethod === "CASH_ON_SERVICE";

    const booking = await prisma.booking.create({
      data: {
        customerId: req.user.id,
        providerId: Number(providerId),
        categoryId: Number(categoryId),
        address,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        preferredTime,
        problemDescription,
        amount,
        status: "PENDING",
        payment: {
          create: {
            method: paymentMethod || "CASH_ON_SERVICE",
            status: isCash ? "PENDING" : "SUCCESS",
            amount,
            transactionId: transactionId || null,
          },
        },
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        provider: { select: { id: true, name: true, phone: true } },
        category: { select: { id: true, name: true } },
        payment: true,
      },
    });

    // ── Notify PROVIDER: new booking received ──────────────────────
    const dateStr = preferredDate
      ? new Date(preferredDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "a scheduled date";

    const providerSmsBody =
      `New booking request from ${booking.customer.name} for ${booking.category.name} on ${dateStr}. ` +
      `Please login to your HomeServices dashboard to accept or decline.`;

    // Send SMS and save DB notification in parallel (non-blocking)
    Promise.all([
      sendSms(booking.provider.phone, providerSmsBody),
      createNotification({
        userId: booking.providerId,
        type: "BOOKING",
        title: "New Booking Request",
        message: `${booking.customer.name} has requested ${booking.category.name} on ${dateStr}.`,
        link: `/provider/bookings/${booking.id}`,
      }),
    ]).catch((err) => console.error("[Notify] Provider notification error:", err.message));

    return res.status(201).json({
      success: true,
      message: "Booking created successfully. Waiting for provider approval.",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}

export async function getBookings(req, res, next) {
  try {
    let where = {};
    if (req.user.role === "PROVIDER") where = { providerId: req.user.id };
    else if (req.user.role === "CUSTOMER") where = { customerId: req.user.id };
    // ADMIN: no filter — sees all

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
        category: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
}

export async function updateBookingStatus(req, res, next) {
  try {
    const { status } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        provider: { select: { id: true, name: true, phone: true } },
        category: { select: { id: true, name: true } },
      },
    });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

    if (req.user.role === "PROVIDER") {
      if (booking.providerId !== req.user.id) {
        return res.status(403).json({ success: false, message: "Unauthorized." });
      }
      const allowedStatus = ["ACCEPTED", "COMPLETED", "CANCELLED"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid booking status." });
      }
    }

    if (req.user.role === "CUSTOMER") {
      return res.status(403).json({ success: false, message: "Customers cannot update booking status." });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { status },
    });

    // ── Notify CUSTOMER: booking status changed ────────────────────
    const statusMessages = {
      ACCEPTED:  `Great news! Your booking for ${booking.category.name} has been accepted by ${booking.provider.name}. They will arrive at your scheduled time.`,
      COMPLETED: `Your booking for ${booking.category.name} has been marked as completed by ${booking.provider.name}. Thank you for using HomeServices!`,
      CANCELLED: `Your booking for ${booking.category.name} has been cancelled by ${booking.provider.name}. Please book again or choose another provider.`,
    };

    const notificationTitles = {
      ACCEPTED:  "Booking Accepted ✅",
      COMPLETED: "Service Completed 🎉",
      CANCELLED: "Booking Cancelled ❌",
    };

    const customerSmsBody = statusMessages[status] ||
      `Your booking for ${booking.category.name} status has been updated to ${status} by ${booking.provider.name}.`;

    // Send SMS and save DB notification in parallel (non-blocking)
    Promise.all([
      sendSms(booking.customer.phone, customerSmsBody),
      createNotification({
        userId: booking.customerId,
        type: "BOOKING",
        title: notificationTitles[status] || "Booking Update",
        message: customerSmsBody,
        link: `/customer/bookings/${booking.id}`,
      }),
    ]).catch((err) => console.error("[Notify] Customer notification error:", err.message));

    return res.status(200).json({
      success: true,
      message: `Booking ${status.toLowerCase()} successfully.`,
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllPayments(req, res, next) {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        booking: {
          include: {
            customer: { select: { id: true, name: true, email: true } },
            provider: { select: { id: true, name: true } },
            category: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
}

