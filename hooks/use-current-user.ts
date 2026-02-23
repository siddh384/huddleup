import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/axios/users";
import { signOut as authSignOut } from "@/lib/auth-client";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry since function now returns null for unauthenticated users
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await fetch("/api/user/profile");

      // If user is not authenticated, return null instead of throwing
      if (response.status === 401) {
        return null;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch profile");
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry since function now returns null for unauthenticated users
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const response = await fetch("/api/user/stats");

      // If user is not authenticated, return null instead of throwing
      if (response.status === 401) {
        return null;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch stats");
      }

      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry since function now returns null for unauthenticated users
  });
}

// Custom hook for sign out with query invalidation
export function useSignOut() {
  const queryClient = useQueryClient();

  const signOut = async (options?: Parameters<typeof authSignOut>[0]) => {
    try {
      // Call the original signOut function
      const result = await authSignOut(options);

      // Invalidate all user-related queries after successful sign out
      await queryClient.invalidateQueries({
        queryKey: ["current-user"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["user-profile"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["user-stats"],
      });

      // Optionally, you can also clear the entire cache
      // queryClient.clear();

      return result;
    } catch (error) {
      console.error("Error during sign out:", error);
      throw error;
    }
  };

  return { signOut };
}
