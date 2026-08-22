"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RiCheckLine, RiLoader4Line } from "@remixicon/react";
import { updateUserProfile, updateUserInfo } from "@/lib/actions/users";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Textarea } from "@/components/base/input/textarea";
import { SelectItem } from "@/components/base/select/select";
import { SelectField } from "@/components/base/select/select-field";
import { toast } from "sonner";
import { CITIES } from "@/lib/cities";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  createdAt: Date;
};

type Profile = {
  id: string;
  userId: string;
  phoneNumber?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  preferences?: {
    favoritesSports?: string[];
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  } | null;
} | null;

interface ProfileFormProps {
  user: User;
  profile: Profile;
}

type FieldErrors = Partial<Record<"name" | "email" | "city", string>>;

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phoneNumber: profile?.phoneNumber || "",
    gender: profile?.gender || "",
    address: profile?.address || "",
    city: profile?.city || "",
    state: profile?.state || "",
    zipCode: profile?.zipCode || "",
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: FieldErrors = {};
    if (!formData.name.trim()) {
      nextErrors.name = "Name is required.";
    }
    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!formData.city) {
      nextErrors.city = "Select your city.";
    }

    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const userResult = await updateUserInfo({
        name: formData.name,
        email: formData.email,
      });

      if (!userResult.success) {
        toast.error(userResult.error || "Failed to update user info");
        return;
      }

      const profileResult = await updateUserProfile({
        phoneNumber: formData.phoneNumber || null,
        gender: formData.gender || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zipCode: formData.zipCode || null,
      });

      if (!profileResult.success) {
        toast.error(profileResult.error || "Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-0 py-0 shadow-lg">
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
          {/* Account */}
          <section className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-title-3-semibold">Account</h2>
              <p className="text-body-2-regular text-muted-foreground">
                Your identity across bookings and reviews.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 md:gap-x-6">
              <Input
                label="Full name"
                value={formData.name}
                onChange={(value) => handleInputChange("name", value)}
                isRequired
                isInvalid={!!errors.name}
                hint={errors.name}
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(value) => handleInputChange("email", value)}
                isRequired
                isInvalid={!!errors.email}
                hint={errors.email}
              />
            </div>
          </section>

          {/* Contact */}
          <section className="space-y-5 border-t pt-8 sm:pt-10">
            <div className="space-y-1">
              <h2 className="text-title-3-semibold">Contact</h2>
              <p className="text-body-2-regular text-muted-foreground">
                Optional details that help venues reach you.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 md:gap-x-6">
              <Input
                label="Phone number"
                placeholder="Optional"
                value={formData.phoneNumber}
                onChange={(value) => handleInputChange("phoneNumber", value)}
              />
              <SelectField
                label="Gender"
                placeholder="Select gender"
                selectedKey={formData.gender || null}
                onSelectionChange={(key) =>
                  handleInputChange("gender", String(key))
                }
              >
                <SelectItem id="male">Male</SelectItem>
                <SelectItem id="female">Female</SelectItem>
                <SelectItem id="other">Other</SelectItem>
                <SelectItem id="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectField>
              <div className="md:col-span-2">
                <Textarea
                  label="Address"
                  placeholder="Optional"
                  value={formData.address}
                  onChange={(value) => handleInputChange("address", value)}
                  rows={2}
                />
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="space-y-5 border-t pt-8 sm:pt-10">
            <div className="space-y-1">
              <h2 className="text-title-3-semibold">Location</h2>
              <p className="text-body-2-regular text-muted-foreground">
                Used to show you venues nearby.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3 md:gap-x-6">
              <SelectField
                label="City"
                placeholder="Select your city"
                selectedKey={formData.city || null}
                onSelectionChange={(key) => handleInputChange("city", String(key))}
                isRequired
                isInvalid={!!errors.city}
                hint={errors.city}
              >
                {CITIES.map((city) => (
                  <SelectItem key={city} id={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectField>
              <Input
                label="State"
                placeholder="Optional"
                value={formData.state}
                onChange={(value) => handleInputChange("state", value)}
              />
              <Input
                label="Zip code"
                placeholder="Optional"
                value={formData.zipCode}
                onChange={(value) => handleInputChange("zipCode", value)}
              />
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end border-t pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              leadingIcon={RiCheckLine}
            >
              {isSubmitting ? (
                <>
                  <RiLoader4Line className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
