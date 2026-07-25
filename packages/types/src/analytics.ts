import type { BookingStatus, Currency } from './enums';

export interface DashboardRecentBooking {
  id: string;
  reference: string;
  status: BookingStatus;
  grandTotal: number;
  createdAt: string;
}

export interface DashboardRevenuePoint {
  month: string;
  total: number;
}

export interface DashboardStatsDto {
  users: { total: number };
  bookings: { total: number; byStatus: Record<string, number> };
  revenue: { total: number; currency: Currency };
  packages: { published: number };
  hotels: { total: number };
  visa: { pending: number };
  contact: { unread: number };
  recentBookings: DashboardRecentBooking[];
  revenueByMonth: DashboardRevenuePoint[];
}
