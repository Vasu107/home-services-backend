import { prisma } from "../../config/db.js";


export async function getProviderDashboard(req, res, next) {
  try {
    const providerId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);


    // Build last-7-days date range
    const last7Days = [];
    for (let d = 6; d >= 0; d--) {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - d);
      last7Days.push(day);
    }
    const sevenDaysAgo = last7Days[0];

    const [
      provider,
      totalBookings,
      pendingRequests,
      acceptedBookings,
      completedBookings,
      cancelledBookings,
      todaysJobs,
      requests,
      earnings,
      revenueBookings,
    ] = await Promise.all([


      // Provider Profile
      prisma.user.findUnique({
        where: {
          id: providerId,
        },
        include: {
          provider: true,
        },
      }),


      // Total Bookings
      prisma.booking.count({
        where: {
          providerId,
        },
      }),


      // Pending Requests
      prisma.booking.count({
        where: {
          providerId,
          status: "PENDING",
        },
      }),


      // Accepted
      prisma.booking.count({
        where: {
          providerId,
          status: "ACCEPTED",
        },
      }),


      // Completed
      prisma.booking.count({
        where: {
          providerId,
          status: "COMPLETED",
        },
      }),


      // Cancelled
      prisma.booking.count({
        where: {
          providerId,
          status: "CANCELLED",
        },
      }),



      // Upcoming Jobs (today + future dates)
      prisma.booking.findMany({
        where: {
          providerId,

          preferredDate: {
            gte: today,
          },

          status: {
            in: [
              "ACCEPTED",
              "COMPLETED",
            ],
          },
        },


        include: {

          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            }
          },


          category: {
            select: {
              id: true,
              name: true,
            }
          },

          payment: {
            select: {
              status: true,
              method: true,
            }
          }

        },


        orderBy: [
          { preferredDate: "asc" },
          { preferredTime: "asc" },
        ]

      }),




      // Pending Booking Requests
      prisma.booking.findMany({

        where: {
          providerId,
          status: "PENDING",
        },


        include: {

          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            }
          },


          category: {
            select: {
              id: true,
              name: true,
            }
          }

        },


        orderBy: {
          createdAt: "desc",
        }

      }),




      // Total Earnings
      prisma.booking.aggregate({
        where: {
          providerId,
          status: "COMPLETED",
        },
        _sum: {
          amount: true,
        }
      }),

      // Last 7 days completed bookings for revenue chart
      prisma.booking.findMany({
        where: {
          providerId,
          status: "COMPLETED",
          updatedAt: { gte: sevenDaysAgo },
        },
        select: {
          amount: true,
          updatedAt: true,
        },
      }),

    ]);



    if (!provider) {

      return res.status(404).json({

        success: false,
        message: "Provider not found"

      });

    }

    if (!provider.provider) {
      return res.status(200).json({
        success: true,
        profileCompleted: false,
        message: "Please complete your profile first."
      });
    }




    const completionRate =
      totalBookings === 0
        ? 0
        : Math.round(
          (completedBookings / totalBookings) * 100
        );




    const monthlyEarnings =
      Number(
        earnings._sum.amount || 0
      );




    return res.status(200).json({

      success: true,


      data: {


        provider: {
          id: provider.id,

          name: provider.name,

          email: provider.email,

          about: provider.provider?.about || "",

          experience: provider.provider?.experienceYears || 0,

          serviceCharge: provider.provider?.serviceCharge || 0,

          availability: provider.provider?.availability || false,

          rating: provider.provider?.rating || 0,

          status: provider.provider?.status || "PENDING",

          profileCompleted: Boolean(
            provider.provider?.about &&
            provider.provider?.experienceYears &&
            provider.provider?.serviceCharge
          ),
        },



        stats: {
          monthlyEarnings,
          todayJobs: todaysJobs.filter(j => {
            const d = new Date(j.preferredDate);
            return d >= today && d < tomorrow;
          }).length,
          upcomingJobs: todaysJobs.length,
          averageRating: provider.provider?.rating || 0,
          completionRate,
          totalBookings,
          pendingRequests,
          acceptedBookings,
          completedBookings,
          cancelledBookings,
        },

        revenueByDay: last7Days.map((dayDate) => {
          const dayLabel = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dayDate.getDay()];
          const dayTotal = revenueBookings
            .filter((b) => {
              const d = new Date(b.updatedAt);
              return (
                d.getFullYear() === dayDate.getFullYear() &&
                d.getMonth() === dayDate.getMonth() &&
                d.getDate() === dayDate.getDate()
              );
            })
            .reduce((sum, b) => sum + Number(b.amount || 0), 0);
          return { day: dayLabel, amount: dayTotal };
        }),




        upcomingJobs:
          todaysJobs.map(job => ({

            id: job.id,


            customer: job.customer,


            service:
              job.category?.name,


            date:
              job.preferredDate,


            time:
              job.preferredTime,


            address:
              job.address,


            status:
              job.status,


            problem:
              job.problemDescription,

            paymentStatus:
              job.payment?.status || "PENDING",

          })),





        pendingRequests:

          requests.map(job => ({


            id: job.id,


            customer: job.customer,


            service:
              job.category?.name,


            date:
              job.preferredDate,


            time:
              job.preferredTime,


            address:
              job.address,


            problem:
              job.problemDescription,


            status:
              job.status,


          }))



      }


    });


  } catch (error) {

    next(error);

  }
}