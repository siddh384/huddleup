"use client";

import { useState } from "react";
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
  Edit,
} from "lucide-react";
import Link from "next/link";

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

import { UserRoleUpdater } from "@/components/user-role-updater";
import { VenueStatusUpdater } from "@/components/venue-status-updater";
import { ReportStatusUpdater } from "@/components/report-status-updater";

// Deterministic date formatter (avoids server/client locale mismatch)
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Types
export type AdminStats = {
  totalUsers: number;
  facilityOwners: number;
  admins: number;
  pendingVenues: number;
  pendingReports: number;
  recentReports: number;
};

export type UserData = {
  id: string;
  name: string;
  email: string;
  role: "user" | "facility_owner" | "admin";
  createdAt: string;
  profile?: { phoneNumber?: string; city?: string };
};

export type VenueData = {
  id: string;
  name: string;
  location: string;
  status: "pending" | "approved" | "rejected";
  description?: string;
  createdAt: string;
  owner?: { id: string; name: string; email: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  courts?: any[];
};

export type ReportData = {
  id: string;
  reason: string;
  description?: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
  reporter?: { id: string; name: string; email: string };
  reportedVenue?: { id: string; name: string; location: string };
  reportedUser?: { id: string; name: string; email: string };
};

interface AdminDashboardClientProps {
  adminStats: AdminStats;
  initialUsers: UserData[];
  initialVenues: VenueData[];
  initialReports: ReportData[];
}

// ──────────────────────────────────────────────
// Reusable DataTable
// ──────────────────────────────────────────────
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumn?: string;
  filterPlaceholder?: string;
}

function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  filterPlaceholder,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2">
        {filterColumn && (
          <Input
            placeholder={filterPlaceholder || `Filter...`}
            value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn(filterColumn)?.setFilterValue(e.target.value)}
            className="max-w-sm"
          />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((c) => c.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(v) => column.toggleVisibility(!!v)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Column definitions
// ──────────────────────────────────────────────
const userColumns: ColumnDef<UserData>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Email <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge variant={role === "admin" ? "default" : role === "facility_owner" ? "secondary" : "outline"}>
          {role.replace("_", " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
  {
    id: "actions",
    cell: ({ row }) => <UserRoleUpdater userId={row.original.id} currentRole={row.original.role} />,
  },
];

const venueColumns: ColumnDef<VenueData>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Venue <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue("name")}</div>
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {row.original.location}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.getValue("status") as string;
      return (
        <Badge variant={s === "approved" ? "default" : s === "rejected" ? "destructive" : "secondary"}>
          {s === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
          {s === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
          {s === "pending" && <Clock className="h-3 w-3 mr-1" />}
          {s}
        </Badge>
      );
    },
  },
  {
    id: "owner",
    header: "Owner",
    cell: ({ row }) => row.original.owner?.name || "Unknown",
  },
  {
    accessorKey: "createdAt",
    header: "Submitted",
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <VenueStatusUpdater venueId={row.original.id} currentStatus={row.original.status} />
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
              <Link href={`/venues/${row.original.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View venue
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/venues/${row.original.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit venue
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

const reportColumns: ColumnDef<ReportData>[] = [
  {
    accessorKey: "reason",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Reason <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const r = row.original;
      return (
        <div>
          <div className="font-medium capitalize">{r.reason.replace("_", " ")}</div>
          {r.description && <div className="text-sm text-muted-foreground line-clamp-2">{r.description}</div>}
        </div>
      );
    },
  },
  {
    id: "reporter",
    header: "Reporter",
    cell: ({ row }) => row.original.reporter?.name || "Unknown",
  },
  {
    id: "target",
    header: "Target",
    cell: ({ row }) => {
      const r = row.original;
      if (r.reportedVenue) return `Venue: ${r.reportedVenue.name}`;
      if (r.reportedUser) return `User: ${r.reportedUser.name}`;
      return "General";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.getValue("status") as string;
      return (
        <Badge variant={s === "resolved" ? "default" : s === "dismissed" ? "outline" : "secondary"}>
          {s}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Reported",
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
  {
    id: "actions",
    cell: ({ row }) => <ReportStatusUpdater reportId={row.original.id} currentStatus={row.original.status} />,
  },
];

// ──────────────────────────────────────────────
// Main client component
// ──────────────────────────────────────────────
export function AdminDashboardClient({
  adminStats,
  initialUsers,
  initialVenues,
  initialReports,
}: AdminDashboardClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b">
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                  <p className="text-muted-foreground">
                    Manage users, venues, and platform reports
                  </p>
                </div>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{adminStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600 font-medium">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facility Owners</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">{adminStats.facilityOwners}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {adminStats.admins} admin{adminStats.admins !== 1 ? "s" : ""} total
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Venues</CardTitle>
              <Building2 className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{adminStats.pendingVenues}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <Flag className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700 dark:text-red-300">{adminStats.pendingReports}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-red-600 font-medium">{adminStats.recentReports}</span> this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users ({initialUsers.length})
            </TabsTrigger>
            <TabsTrigger value="venues" className="gap-2">
              <Building2 className="h-4 w-4" />
              Venues ({initialVenues.length})
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <Flag className="h-4 w-4" />
              Reports ({initialReports.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>Manage user roles and permissions across the platform</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <DataTable columns={userColumns} data={initialUsers} filterColumn="name" filterPlaceholder="Filter users by name..." />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="venues">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Venue Management
                </CardTitle>
                <CardDescription>Review and manage venue submissions and approvals</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <DataTable columns={venueColumns} data={initialVenues} filterColumn="name" filterPlaceholder="Filter venues by name..." />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  Report Management
                </CardTitle>
                <CardDescription>Review and manage user reports about venues and platform issues</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <DataTable columns={reportColumns} data={initialReports} filterColumn="reason" filterPlaceholder="Filter reports by reason..." />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
