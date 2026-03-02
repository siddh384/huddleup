"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Calendar,
  DollarSign,
  Users,
  Plus,
  BarChart3,
  TrendingUp,
  MapPin,
  Clock,
  Settings,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Home,
} from "lucide-react";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-current-user";
import { redirect } from "next/navigation";

// Import data table components
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// Types for our data
type OwnerStats = {
  totalVenues: number;
  totalCourts: number;
  totalRevenue: number;
  totalBookings: number;
  monthlyRevenue: number;
  monthlyBookings: number;
  venues: any[];
};

type VenueData = {
  id: string;
  name: string;
  location: string;
  status: string;
  courtsCount: number;
  totalBookings: number;
  revenue: number;
  createdAt: string;
};

// Mock data for demonstration - replace with actual API calls
const mockStats: OwnerStats = {
  totalVenues: 3,
  totalCourts: 12,
  totalRevenue: 15750,
  totalBookings: 127,
  monthlyRevenue: 3250,
  monthlyBookings: 24,
  venues: [],
};

// BookingData interface for the dashboard
interface BookingData {
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
}

// Booking columns definition
const bookingColumns: ColumnDef<BookingData>[] = [
  {
    accessorKey: "bookingDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("bookingDate"));
      return <div className="font-medium">{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "venueName",
    header: "Venue",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("venueName")}</div>
    ),
  },
  {
    accessorKey: "courtName",
    header: "Court",
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue("customerName")}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.customerEmail}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "sportName",
    header: "Sport",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {row.original.sportName || "N/A"}
      </Badge>
    ),
  },
  {
    accessorKey: "totalPrice",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount =
        typeof row.original.totalPrice === "number"
          ? row.original.totalPrice
          : 0;
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusConfig = {
        confirmed: {
          label: "Confirmed",
          variant: "default" as const,
          icon: CheckCircle,
        },
        cancelled: {
          label: "Cancelled",
          variant: "destructive" as const,
          icon: XCircle,
        },
        completed: {
          label: "Completed",
          variant: "secondary" as const,
          icon: CheckCircle,
        },
      };
      const config = statusConfig[status as keyof typeof statusConfig];
      const Icon = config?.icon;

      return (
        <Badge
          variant={config?.variant || "default"}
          className="flex items-center gap-1"
        >
          {Icon && <Icon className="h-3 w-3" />}
          {config?.label || status}
        </Badge>
      );
    },
  },
];

// Venue columns definition
const venueColumns: ColumnDef<VenueData>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Venue Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        {row.getValue("location")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusConfig = {
        approved: {
          label: "Approved",
          variant: "default" as const,
          icon: CheckCircle,
        },
        pending: {
          label: "Pending",
          variant: "secondary" as const,
          icon: Clock,
        },
        rejected: {
          label: "Rejected",
          variant: "destructive" as const,
          icon: XCircle,
        },
      };
      const config = statusConfig[status as keyof typeof statusConfig];
      const Icon = config?.icon;

      return (
        <Badge
          variant={config?.variant || "default"}
          className="flex items-center gap-1"
        >
          {Icon && <Icon className="h-3 w-3" />}
          {config?.label || status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "courtsCount",
    header: () => <div className="text-center">Courts</div>,
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue("courtsCount")}
      </div>
    ),
  },
  {
    accessorKey: "revenue",
    header: () => <div className="text-right">Revenue</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("revenue"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const venue = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/venues/${venue.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View venue
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/venues/${venue.id}/courts`}>
                <Settings className="mr-2 h-4 w-4" />
                Manage courts
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit venue
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete venue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Data table component
function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn = "name",
  filterPlaceholder = "Filter...",
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumn?: string;
  filterPlaceholder?: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder={filterPlaceholder}
          value={
            (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn(filterColumn)?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OwnerDashboard() {
  const { data: user, isLoading } = useCurrentUser();
  const [stats, setStats] = useState<OwnerStats>(mockStats);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [venues, setVenues] = useState<VenueData[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Fetch user's venues
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setVenuesLoading(true);
        const response = await fetch("/api/venues");
        const data = await response.json();

        if (data.success && data.venues) {
          // Transform venue data to match VenueData interface
          const transformedVenues: VenueData[] = data.venues.map(
            (venue: any) => ({
              id: venue.id,
              name: venue.name,
              location: venue.location,
              status: venue.status,
              courtsCount: venue.courts?.length || 0,
              totalBookings: 0, // TODO: Add booking count calculation
              revenue: 0, // TODO: Add revenue calculation
              createdAt: new Date(venue.createdAt).toISOString().split("T")[0],
            }),
          );
          setVenues(transformedVenues);
          // Update stats if bookings are already loaded
          if (!bookingsLoading && bookings.length > 0) {
            updateStatsFromRealData(bookings, transformedVenues);
          }
        }
      } catch (error) {
        console.error("Error fetching venues:", error);
      } finally {
        setVenuesLoading(false);
      }
    };

    if (user && (user.role === "facility_owner" || user.role === "admin")) {
      fetchVenues();
      fetchBookings();
    }
  }, [user]);

  // Fetch user's venue bookings
  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      const response = await fetch("/api/bookings/owner");
      const data = await response.json();

      if (data.success && data.bookings) {
        setBookings(data.bookings);
        // Update stats based on real data
        updateStatsFromRealData(data.bookings, venues);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setBookingsLoading(false);
    }
  };

  // Update stats from real data
  const updateStatsFromRealData = (
    bookingsData: BookingData[],
    venuesData: VenueData[],
  ) => {
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

    setStats({
      totalRevenue: Math.round(totalRevenue),
      totalVenues: venuesData.length,
      totalCourts: totalCourts,
      totalBookings: bookingsData.length,
      monthlyRevenue: Math.round(monthlyRevenue),
      monthlyBookings: monthlyBookings.length,
      venues: venuesData,
    });
  };

  // Redirect if not facility owner or admin
  useEffect(() => {
    if (
      !isLoading &&
      user &&
      user.role !== "facility_owner" &&
      user.role !== "admin"
    ) {
      redirect("/");
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
          <h2 className="text-2xl font-semibold">Loading Dashboard</h2>
          <p className="text-muted-foreground">
            Please wait while we load your data...
          </p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "facility_owner" && user.role !== "admin")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">
                Owner Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your venues, courts, and bookings efficiently
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                size="lg"
                className="shadow-md hover:shadow-lg transition-shadow"
              >
                <Link href="/create-venue">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Venue
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="shadow-md hover:shadow-lg transition-shadow"
              >
                <Link href="/">
                  <Home className="mr-2 h-5 w-5" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Overview</h2>
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
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="venues" className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Management</h2>
            <TabsList className="grid w-full max-w-md grid-cols-3 shadow-md">
              <TabsTrigger
                value="venues"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                My Venues
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Bookings
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="venues" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg">
                <CardTitle className="text-xl">Venue Management</CardTitle>
                <CardDescription className="text-base">
                  Manage your venues, courts, and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {venuesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <span className="ml-4 text-lg">Loading venues...</span>
                  </div>
                ) : (
                  <DataTable
                    columns={venueColumns}
                    data={venues}
                    filterColumn="name"
                    filterPlaceholder="Filter venues by name..."
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-t-lg">
                <CardTitle className="text-xl">Recent Bookings</CardTitle>
                <CardDescription className="text-base">
                  View and manage all bookings across your venues
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {bookingsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <span className="ml-4 text-lg">Loading bookings...</span>
                  </div>
                ) : (
                  <DataTable
                    columns={bookingColumns}
                    data={bookings}
                    filterColumn="venueName"
                    filterPlaceholder="Filter bookings by venue..."
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-t-lg">
                  <CardTitle className="text-xl">Revenue Trend</CardTitle>
                  <CardDescription className="text-base">
                    Monthly revenue over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-40 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                      <p className="text-lg font-medium">Revenue Chart</p>
                      <p className="text-sm">Coming Soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-t-lg">
                  <CardTitle className="text-xl">Booking Trends</CardTitle>
                  <CardDescription className="text-base">
                    Booking patterns and peak times
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-40 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
                    <div className="text-center">
                      <Calendar className="h-12 w-12 mx-auto mb-2 text-purple-500" />
                      <p className="text-lg font-medium">Booking Analytics</p>
                      <p className="text-sm">Coming Soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
