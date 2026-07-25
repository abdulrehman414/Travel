import { prisma } from '@travel/db';
import type { DashboardRevenuePoint, DashboardStatsDto } from '@travel/types';

export const analyticsService = {
  async getDashboard(): Promise<DashboardStatsDto> {
    const [
      users,
      bookingsByStatus,
      revenueAgg,
      publishedPackages,
      hotels,
      pendingVisa,
      unreadContact,
      recent,
      revenueRows,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.booking.groupBy({ by: ['status'], _count: true }),
      prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      prisma.package.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
      prisma.hotel.count(),
      prisma.visaRequest.count({
        where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'ADDITIONAL_INFO'] } },
      }),
      prisma.contactMessage.count({ where: { status: 'NEW' } }),
      prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, reference: true, status: true, grandTotal: true, createdAt: true },
      }),
      prisma.$queryRaw<Array<{ month: string; total: unknown }>>`
        SELECT to_char(date_trunc('month', "paidAt"), 'YYYY-MM') AS month, SUM("amount") AS total
        FROM "Payment"
        WHERE "status" = 'PAID' AND "paidAt" >= (now() - interval '6 months')
        GROUP BY 1
        ORDER BY 1`,
    ]);

    const byStatus: Record<string, number> = {};
    let totalBookings = 0;
    for (const group of bookingsByStatus) {
      byStatus[group.status] = group._count;
      totalBookings += group._count;
    }

    const revenueByMonth: DashboardRevenuePoint[] = revenueRows.map((row) => ({
      month: row.month,
      total: Number(row.total),
    }));

    return {
      users: { total: users },
      bookings: { total: totalBookings, byStatus },
      revenue: { total: Number(revenueAgg._sum.amount ?? 0), currency: 'SAR' },
      packages: { published: publishedPackages },
      hotels: { total: hotels },
      visa: { pending: pendingVisa },
      contact: { unread: unreadContact },
      recentBookings: recent.map((booking) => ({
        id: booking.id,
        reference: booking.reference,
        status: booking.status,
        grandTotal: Number(booking.grandTotal),
        createdAt: booking.createdAt.toISOString(),
      })),
      revenueByMonth,
    };
  },
};
