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
  Settings,
  Users,
  Building2,
  Flag,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Shield,
  UserCheck,
  Eye,
  MoreHorizontal,
  ArrowUpDown,
  ChevronDown,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import action components
import { UserRoleUpdater } from "@/components/user-role-updater";
import { VenueStatusUpdater } from "@/components/venue-status-updater";
import { ReportStatusUpdater } from "@/components/report-status-updater";

// Types for our data
type AdminStats = {
  totalUsers: number;
  facilityOwners: number;
  admins: number;
  pendingVenues: number;
  pendingReports: number;
  recentReports: number;
};

type UserData = {
  id: string;
  name: string;
  email: string;
  role: "user" | "facility_owner" | "admin";
  createdAt: string;
  profile?: {
    phoneNumber?: string;
    city?: string;
  };
};

type VenueData = {
  id: string;
  name: string;
  location: string;
  status: "pending" | "approved" | "rejected";
  description?: string;
  createdAt: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  courts?: any[];
};

type ReportData = {
  id: string;
  reason: string;
  description?: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
  reporter?: {
    id: string;
    name: string;
    email: string;
  };
  reportedVenue?: {
    id: string;
    name: string;
    location: string;
  };
  reportedUser?: {
    id: string;
    name: string;
    email: string;
  };
};

// User columns definition
const userColumns: ColumnDef<UserData>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.getValue("email")}
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const roleConfig = {
        admin: { label: "Admin", variant: "default" as const, icon: Shield },
        facility_owner: {
          label: "Facility Owner",
          variant: "secondary" as const,
          icon: Building2,
        },
        user: { label: "User", variant: "outline" as const, icon: UserCheck },
      };
      const config = roleConfig[role as keyof typeof roleConfig];
      const Icon = config?.icon;

      return (
        <Badge
          variant={config?.variant || "outline"}
          className="flex items-center gap-1 w-fit"
        >
          {Icon && <Icon className="h-3 w-3" />}
          {config?.label || role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Joined
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div className="text-sm">{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2">
          <UserRoleUpdater userId={user.id} currentRole={user.role} />
        </div>
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
    accessorKey: "owner",
    header: "Owner",
    cell: ({ row }) => {
      const owner = row.original.owner;
      return owner ? (
        <div>
          <div className="font-medium text-sm">{owner.name}</div>
          <div className="text-xs text-muted-foreground">{owner.email}</div>
        </div>
      ) : (
        <span className="text-muted-foreground">No owner</span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div className="text-sm">{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const venue = row.original;
      return (
        <div className="flex items-center gap-2">
          <VenueStatusUpdater venueId={venue.id} currentStatus={venue.status} />
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

// Report columns definition
const reportColumns: ColumnDef<ReportData>[] = [
  {
    accessorKey: "reason",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Reason
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("reason")}</div>
    ),
  },
  {
    accessorKey: "reporter",
    header: "Reporter",
    cell: ({ row }) => {
      const reporter = row.original.reporter;
      return reporter ? (
        <div>
          <div className="font-medium text-sm">{reporter.name}</div>
          <div className="text-xs text-muted-foreground">{reporter.email}</div>
        </div>
      ) : (
        <span className="text-muted-foreground">Unknown</span>
      );
    },
  },
  {
    accessorKey: "reportedVenue",
    header: "Target",
    cell: ({ row }) => {
      const venue = row.original.reportedVenue;
      const user = row.original.reportedUser;

      if (venue) {
        return (
          <div>
            <div className="font-medium text-sm text-blue-600">
              Venue: {venue.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {venue.location}
            </div>
          </div>
        );
      } else if (user) {
        return (
          <div>
            <div className="font-medium text-sm text-purple-600">
              User: {user.name}
            </div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
        );
      } else {
        return <span className="text-muted-foreground">Unknown</span>;
      }
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusConfig = {
        pending: {
          label: "Pending",
          variant: "secondary" as const,
          icon: Clock,
        },
        resolved: {
          label: "Resolved",
          variant: "default" as const,
          icon: CheckCircle,
        },
        dismissed: {
          label: "Dismissed",
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
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div className="text-sm">{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const report = row.original;
      return (
        <div className="flex items-center gap-2">
          <ReportStatusUpdater
            reportId={report.id}
            currentStatus={report.status}
          />
        </div>
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

export default function AdminDashboard() {
  const { data: user, isLoading } = useCurrentUser();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    facilityOwners: 0,
    admins: 0,
    pendingVenues: 0,
    pendingReports: 0,
    recentReports: 0,
  });

  const [users, setUsers] = useState<UserData[]>([]);
  const [venues, setVenues] = useState<VenueData[]>([]);
  const [reports, setReports] = useState<ReportData[]>([]);

  const [usersLoading, setUsersLoading] = useState(true);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch all data in parallel
        const [
          usersResponse,
          venuesResponse,
          reportsResponse,
          reportsStatsResponse,
        ] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/venues?status=pending"),
          fetch("/api/admin/reports?status=pending"),
          fetch("/api/admin/reports?statsOnly=true"),
        ]);

        // Process users data
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          if (usersData.success && usersData.users) {
            setUsers(usersData.users);

            // Calculate user stats
            const totalUsers = usersData.users.length;
            const facilityOwners = usersData.users.filter(
              (u: UserData) => u.role === "facility_owner",
            ).length;
            const admins = usersData.users.filter(
              (u: UserData) => u.role === "admin",
            ).length;

            setStats((prev) => ({
              ...prev,
              totalUsers,
              facilityOwners,
              admins,
            }));
          }
        }
        setUsersLoading(false);

        // Process venues data
        if (venuesResponse.ok) {
          const venuesData = await venuesResponse.json();
          if (venuesData.success && venuesData.venues) {
            setVenues(venuesData.venues);
            setStats((prev) => ({
              ...prev,
              pendingVenues: venuesData.venues.length,
            }));
          }
        }
        setVenuesLoading(false);

        // Process reports data
        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json();
          if (reportsData.success && reportsData.reports) {
            setReports(reportsData.reports);
            setStats((prev) => ({
              ...prev,
              pendingReports: reportsData.reports.length,
            }));
          }
        }

        // Process reports stats
        if (reportsStatsResponse.ok) {
          const statsData = await reportsStatsResponse.json();
          if (statsData.success && statsData.stats) {
            setStats((prev) => ({
              ...prev,
              recentReports: statsData.stats.recentReports || 0,
            }));
          }
        }
        setReportsLoading(false);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setUsersLoading(false);
        setVenuesLoading(false);
        setReportsLoading(false);
      }
    };

    if (user && user.role === "admin") {
      fetchAdminData();
    }
  }, [user]);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && user && user.role !== "admin") {
      redirect("/");
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
          <h2 className="text-2xl font-semibold">Loading Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Please wait while we load your admin data...
          </p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                Admin Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage users, venues, and platform operations
              </p>
            </div>
            <div>
              <Button
                asChild
                variant="outline"
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
          <h2 className="text-2xl font-semibold mb-6">Platform Overview</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalUsers}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {stats.facilityOwners} facility owners
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Venues
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.pendingVenues}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Awaiting approval
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Reports
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <Flag className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {stats.pendingReports}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {stats.recentReports} in last 7 days
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Admins
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.admins}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Platform administrators
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs for different management views */}
        <Tabs defaultValue="venues" className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Platform Management</h2>
            <TabsList className="grid w-full max-w-md grid-cols-3 shadow-md">
              <TabsTrigger
                value="venues"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Venues
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Reports
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Users
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="venues" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Venue Management
                </CardTitle>
                <CardDescription className="text-base">
                  Review and approve venue submissions from facility owners
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

          <TabsContent value="reports" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  Report Management
                </CardTitle>
                <CardDescription className="text-base">
                  Review and manage user reports about venues and platform
                  issues
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {reportsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <span className="ml-4 text-lg">Loading reports...</span>
                  </div>
                ) : (
                  <DataTable
                    columns={reportColumns}
                    data={reports}
                    filterColumn="reason"
                    filterPlaceholder="Filter reports by reason..."
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription className="text-base">
                  Manage user roles and permissions across the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <span className="ml-4 text-lg">Loading users...</span>
                  </div>
                ) : (
                  <DataTable
                    columns={userColumns}
                    data={users}
                    filterColumn="name"
                    filterPlaceholder="Filter users by name..."
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
