import { prisma } from "../../config/db.js";

export async function createBooking(req, res, next) {
  try {
    const {
      providerId,
      categoryId,
      address,
      preferredDate,
      preferredTime,
      problemDescription,
    } = req.body;

    console.log("========== BOOKING DEBUG ==========");
    console.log("Logged in User:", req.user.id, req.user.role);

    console.log("ProviderId from body:", providerId);

    const provider = await prisma.user.findUnique({
      where: {
        id: Number(providerId),
      },
      include: {
        provider: true,
      },
    });

    console.log("Provider Object:", JSON.stringify(provider, null, 2));
    console.log("===================================");

    if (
      !provider ||
      provider.role !== "PROVIDER" ||
      provider.provider?.status !== "APPROVED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Selected provider is not available.",
      });
    }

    const booking = await prisma.booking.create({
      data: {
        customerId: req.user.id,
        providerId: Number(providerId),
        categoryId: Number(categoryId),
        address,
        preferredDate: preferredDate
          ? new Date(preferredDate)
          : null,
        preferredTime,
        problemDescription,

        // Booking request will remain pending
        status: "PENDING",
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Booking confirmed successfully. Waiting for provider approval.",
      data: booking,
    });
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

    const booking = await prisma.booking.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Only assigned provider can change booking status
    if (req.user.role === "PROVIDER") {
      if (booking.providerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized.",
        });
      }

      const allowedStatus = ["ACCEPTED", "COMPLETED", "CANCELLED"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking status.",
        });
      }
    }

    // Customer cannot change booking status
    if (req.user.role === "CUSTOMER") {
      return res.status(403).json({
        success: false,
        message: "Customers cannot update booking status.",
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        status,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Booking ${status.toLowerCase()} successfully.`,
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
}