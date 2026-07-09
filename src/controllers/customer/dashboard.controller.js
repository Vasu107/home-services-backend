import { prisma } from "../../config/db.js";

export async function getCustomerDashboardStats(req, res, next) {
  try {
    const customerId = req.user.id;

    const [
      customer,
      upcomingBookings,
      recentBookings,
      totalBookings,
      totalSpent,
      providers,
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
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 5,
      }),

      prisma.booking.findMany({
        where: {
          customerId,
          status: "COMPLETED",
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
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),

      prisma.booking.count({
        where: {
          customerId,
        },
      }),

      prisma.booking.aggregate({
        where: {
          customerId,
          status: "COMPLETED",
        },
        _sum: {
          totalAmount: true,
        },
      }),

      prisma.user.count({
        where: {
          role: "PROVIDER",
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        customer,
        stats: {
          upcomingBookings: upcomingBookings.length,
          totalBookings,
          totalSpent: totalSpent._sum.totalAmount || 0,
          providers,
        },
        upcomingBookings,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
}