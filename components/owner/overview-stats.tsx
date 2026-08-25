"use client";

import { useEffect, useState } from "react";
import { Building2, Calendar, DollarSign, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  BookingData,
  OwnerStats,
  VenueData,
} from "@/components/owner/types";

// Initial stats (zeroed out - will be updated with real data)
const initialStats: OwnerStats = {
  totalVenues: 0,
  totalCourts: 0,
  totalRevenue: 0,
  totalBookings: 0,
  monthlyRevenue: 0,
  monthlyBookings: 0,
  venues: [],
};


function buildStats(
  bookingsData: BookingData[],
  venuesData: VenueData[],
): OwnerStats {
  const totalRevenue = bookingsData
    .filter((booking) => booking.paymentStatus === "paid")
    .reduce(
      (sum, booking) =>
        sum +
        (typeof booking.totalPrice === "number" ? booking.totalPrice : 0),
      0,
    );

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyBookings = bookingsData.filter((booking) => {
    const bookingDate = new Date(booking.bookingDate);
    return (
      bookingDate.getMonth() === currentMonth &&
      bookingDate.getFullYear() === currentYear
    );
  });

  const monthlyRevenue = monthlyBookings
    .filter((booking) => booking.paymentStatus === "paid")
    .reduce(
      (sum, booking) =>
        sum +
        (typeof booking.totalPrice === "number" ? booking.totalPrice : 0),
      0,
    );

  const totalCourts = venuesData.reduce(
    (sum, venue) => sum + venue.courtsCount,
    0,
  );

  return {
    totalRevenue: Math.round(totalRevenue),
    totalVenues: venuesData.length,
    totalCourts: totalCourts,
    totalBookings: bookingsData.length,
    monthlyRevenue: Math.round(monthlyRevenue),
    monthlyBookings: monthlyBookings.length,
    venues: venuesData,
  };
}

export function OverviewStats({
  initialVenues,
}: {
  initialVenues: VenueData[];
}) {
  const [stats, setStats] = useState<OwnerStats>(initialStats);
  const [bookings, setBookings] = useState<BookingData[]>([]);

  // Initialize stats from server-provided venues
  useEffect(() => {
    setStats(buildStats(bookings, initialVenues));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch bookings client-side (API enforces role)
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/bookings/owner");
        const data = await response.json();

        if (data.success && data.bookings) {
          setBookings(data.bookings);
          setStats(buildStats(data.bookings, initialVenues));
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Revenue
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            ${stats.totalRevenue.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            +${stats.monthlyRevenue.toLocaleString()} this month
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Venues
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalVenues}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {stats.totalCourts} courts total
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Bookings
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {stats.totalBookings}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            +{stats.monthlyBookings} this month
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly Revenue
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            ${stats.monthlyRevenue.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            from {stats.monthlyBookings} bookings
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
