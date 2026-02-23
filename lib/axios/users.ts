// Get current user with role and profile
export const getCurrentUser = async () => {
  try {
    const response = await fetch("/api/user/me");

    // If user is not authenticated, return null instead of throwing
    if (response.status === 401) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch user");
    }

    // Return just the user object, not the wrapper with success field
    return data.user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    // Return null for network errors or other issues when user might not be authenticated
    return null;
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await fetch("/api/user/profile");

    // If user is not authenticated, return null instead of throwing
    if (response.status === 401) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch profile");
    }

    // Return just the profile object, maintaining consistency
    return data.profile || data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    // Return null for network errors or other issues when user might not be authenticated
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (profileData: {
  phoneNumber?: string;
  dateOfBirth?: string | Date;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  preferences?: {
    favoritesSports?: string[];
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  };
}) => {
  try {
    const response = await fetch("/api/user/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update profile");
    }

    return data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Get user stats
export const getUserStats = async () => {
  try {
    const response = await fetch("/api/user/stats");

    // If user is not authenticated, return null instead of throwing
    if (response.status === 401) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch stats");
    }

    // Return just the stats object, maintaining consistency
    return data.stats || data;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    // Return null for network errors or other issues when user might not be authenticated
    return null;
  }
};

// Update user role (admin only)
export const updateUserRole = async (
  userId: string,
  role: "user" | "facility_owner" | "admin",
) => {
  try {
    const response = await fetch("/api/user/update-role", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        role,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update role");
    }

    return data;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};
