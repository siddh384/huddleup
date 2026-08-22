export type VenueData = {
  id: string;
  name: string;
  location: string;
  status: string;
  courtsCount: number;
  totalBookings: number;
  revenue: number;
  createdAt: string;
};

export type BookingData = {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  paymentStatus: string;
  venueName: string;
  courtName: string;
  customerName: string;
  customerEmail: string;
  totalPrice?: number;
  sportName?: string;
};

export type OwnerStats = {
  totalVenues: number;
  totalCourts: number;
  totalRevenue: number;
  totalBookings: number;
  monthlyRevenue: number;
  monthlyBookings: number;
  venues: VenueData[];
};
