import { prisma } from "../../config/db.js";

export async function getCustomerDashboardStats(req, res, next) {
  try {
    const customerId = req.user.id;

    const [
      customer,
      totalBookings,
      pendingBookings,
      acceptedBookings,
      completedBookings,
      cancelledBookings,
      providersCount,
      upcomingBookings,
      recentBookings,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: {
          id: customerId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
        },
      }),

      prisma.booking.count({
        where: {
          customerId,
        },
      }),

      prisma.booking.count({
        where: {
          customerId,
          status: "PENDING",
        },
      }),

      prisma.booking.count({
        where: {
          customerId,
          status: "ACCEPTED",
        },
      }),

      prisma.booking.count({
        where: {
          customerId,
          status: "COMPLETED",
        },
      }),

      prisma.booking.count({
        where: {
          customerId,
          status: "CANCELLED",
        },
      }),

      prisma.user.count({
        where: {
          role: "PROVIDER",
        },
      }),

      prisma.booking.findMany({
        where: {
          customerId,
          status: {
            in: ["PENDING", "ACCEPTED"],
          },
        },
        include: {
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
        orderBy: {
          preferredDate: "asc",
        },
        take: 5,
      }),

      prisma.booking.findMany({
        where: {
          customerId,
        },
        include: {
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
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        customer,

        stats: {
          totalBookings,
          pendingBookings,
          acceptedBookings,
          completedBookings,
          cancelledBookings,
          providersCount,
        },

        upcomingBookings,

        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
}