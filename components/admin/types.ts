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
  city: string;
  status: "pending" | "approved" | "rejected";
  isActive: boolean;
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

// Deterministic date formatter (avoids server/client locale mismatch)
export const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};
