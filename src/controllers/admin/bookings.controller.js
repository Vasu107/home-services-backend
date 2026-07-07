import { prisma } from "../../config/db.js";

export async function createBooking(req, res, next) {
  try {
    const { providerId, categoryId, address, preferredDate, preferredTime, problemDescription } = req.body;
    const provider = await prisma.user.findUnique({
      where: { id: Number(providerId) },
      include: { provider: true },
    });

    if (!provider || provider.role !== "PROVIDER" || provider.provider?.status !== "APPROVED") {
      return res.status(400).json({ success: false, message: "Selected provider is not available." });
    }

    const booking = await prisma.booking.create({
      data: {
        customerId: req.user.id,
        providerId: Number(providerId),
        categoryId: Number(categoryId),
        address,
        preferredDate: preferredDate ? new Date(preferredDate) : undefined,
        preferredTime,
        problemDescription,
      },
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
}

export async function getBookings(req, res, next) {
  try {
    const where = req.user.role === "PROVIDER" ? { providerId: req.user.id } : { customerId: req.user.id };
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
        category: true,
      },
    });
    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
}

export async function updateBookingStatus(req, res, next) {
  try {
    const { status } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id: Number(req.params.id) } });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (req.user.role === "PROVIDER" && booking.providerId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Only the assigned provider can update this booking." });
    }

    if (req.user.role === "CUSTOMER" && booking.customerId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Only the booking customer can update this booking." });
    }

    const updated = await prisma.booking.update({ where: { id: booking.id }, data: { status } });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}
