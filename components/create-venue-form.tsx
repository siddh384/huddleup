"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  RiAddLine,
  RiCloseLine,
  RiLoader4Line,
} from "@remixicon/react";
import { createVenue, getAllSports } from "@/lib/actions/venues";
import { UploadButton } from "@/lib/uploadthing";
import { Card, CardContent } from "@/components/ui/card";
import { Button, ButtonLink } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Textarea } from "@/components/base/input/textarea";
import { SelectItem } from "@/components/base/select/select";
import { SelectField } from "@/components/base/select/select-field";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Chip } from "@/components/base/badges/chip";
import { toast } from "sonner";
import { CITIES, type City } from "@/lib/cities";

interface Sport {
  id: string;
  name: string;
  description?: string | null;
}

type FieldErrors = Partial<
  Record<"name" | "address" | "location" | "city" | "sports", string>
>;

export function CreateVenueForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    location: "",
    city: "" as City | "",
    amenities: "",
    selectedSports: [] as string[],
  });

  // Load sports on component mount
  useEffect(() => {
    async function loadSports() {
      try {
        const result = await getAllSports();
        if (result.success && result.sports) {
          setSports(result.sports);
        } else {
          toast.error("Failed to load sports");
        }
      } catch {
        toast.error("Error loading sports");
      } finally {
        setLoadingSports(false);
      }
    }
    loadSports();
  }, []);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSportToggle = (sportId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedSports: prev.selectedSports.includes(sportId)
        ? prev.selectedSports.filter((id) => id !== sportId)
        : [...prev.selectedSports, sportId],
    }));
    setErrors((prev) => ({ ...prev, sports: undefined }));
  };

  const handleRemoveImage = (imageUrl: string) => {
    setUploadedImages((prev) => prev.filter((url) => url !== imageUrl));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: FieldErrors = {};
    if (!formData.name.trim()) {
      nextErrors.name = "Venue name is required.";
    }
    if (!formData.address.trim()) {
      nextErrors.address = "Full address is required.";
    }
    if (!formData.location.trim()) {
      nextErrors.location = "Area or neighborhood is required.";
    }
    if (!formData.city) {
      nextErrors.city = "Select a city.";
    }
    if (formData.selectedSports.length === 0) {
      nextErrors.sports = "Select at least one sport.";
    }

    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const amenitiesArray = formData.amenities
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      const result = await createVenue({
        name: formData.name,
        description: formData.description || undefined,
        address: formData.address,
        location: formData.location,
        city: formData.city as City,
        images: uploadedImages,
        amenities: amenitiesArray,
        sportIds: formData.selectedSports,
      });

      if (result.success) {
        toast.success(
          "Venue created successfully! It will be reviewed by an admin.",
        );

        // Reset form
        setFormData({
          name: "",
          description: "",
          address: "",
          location: "",
          city: "",
          amenities: "",
          selectedSports: [],
        });
        setUploadedImages([]);
        setErrors({});

        // Redirect to dashboard
        router.push("/");
      } else {
        toast.error(result.error || "Failed to create venue");
      }
    } catch {
      toast.error("An error occurred while creating the venue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingSports) {
    return (
      <Card className="w-full border-0 py-0 shadow-lg">
        <CardContent className="flex items-center justify-center gap-2.5 py-16">
          <RiLoader4Line className="size-5 animate-spin text-muted-foreground" />
          <span className="text-body-regular text-muted-foreground">
            Loading sports…
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-0 py-0 shadow-lg">
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
          {/* Venue details */}
          <section className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-title-3-semibold">Venue details</h2>
              <p className="text-body-2-regular text-muted-foreground">
                The basics players see when they find your venue.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 md:gap-x-6">
              <Input
                label="Venue name"
                placeholder="e.g., Sunrise Sports Arena"
                value={formData.name}
                onChange={(value) => handleInputChange("name", value)}
                isRequired
                isInvalid={!!errors.name}
                hint={errors.name}
              />
              <SelectField
                label="City"
                placeholder="Select city"
                selectedKey={formData.city || null}
                onSelectionChange={(key) => {
                  handleInputChange("city", String(key));
                }}
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
              <div className="md:col-span-2">
                <Textarea
                  label="Description"
                  placeholder="Describe your venue, facilities, and what makes it special"
                  value={formData.description}
                  onChange={(value) => handleInputChange("description", value)}
                  rows={4}
                />
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="space-y-5 border-t pt-8 sm:pt-10">
            <div className="space-y-1">
              <h2 className="text-title-3-semibold">Location</h2>
              <p className="text-body-2-regular text-muted-foreground">
                Where players will find you, and what is on site.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 md:gap-x-6">
              <div className="md:col-span-2">
                <Textarea
                  label="Full address"
                  placeholder="Street, area, city, state, postal code"
                  value={formData.address}
                  onChange={(value) => handleInputChange("address", value)}
                  rows={2}
                  isRequired
                  isInvalid={!!errors.address}
                  hint={errors.address}
                />
              </div>
              <Input
                label="Area / neighborhood"
                placeholder="e.g., Alkapuri, SG Highway, Vesu"
                value={formData.location}
                onChange={(value) => handleInputChange("location", value)}
                isRequired
                isInvalid={!!errors.location}
                hint={errors.location}
              />
              <Input
                label="Amenities"
                placeholder="Parking, Lockers, Showers, Snack Bar"
                value={formData.amenities}
                onChange={(value) => handleInputChange("amenities", value)}
                hint="Separate amenities with commas."
              />
            </div>
          </section>

          {/* Sports */}
          <section className="space-y-5 border-t pt-8 sm:pt-10">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="flex items-center gap-0.5 text-title-3-semibold">
                  Sports available
                  <span className="text-body-medium text-text-error-primary">
                    *
                  </span>
                </h2>
                <p className="text-body-2-regular text-muted-foreground">
                  Select all sports that will be available at your venue.
                </p>
              </div>
              {formData.selectedSports.length > 0 && (
                <Chip variant="caption" color="blue">
                  {formData.selectedSports.length} selected
                </Chip>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 xl:grid-cols-4">
              {sports.map((sport) => (
                <Checkbox
                  key={sport.id}
                  isSelected={formData.selectedSports.includes(sport.id)}
                  onChange={() => handleSportToggle(sport.id)}
                >
                  {sport.name}
                </Checkbox>
              ))}
            </div>
            {errors.sports && (
              <p className="pt-px text-caption-1-medium text-text-error-primary">
                {errors.sports}
              </p>
            )}
          </section>

          {/* Photos */}
          <section className="space-y-5 border-t pt-8 sm:pt-10">
            <div className="space-y-1">
              <h2 className="text-title-3-semibold">Photos</h2>
              <p className="text-body-2-regular text-muted-foreground">
                Upload up to 5 images of your venue (4MB max per image).
              </p>
            </div>

            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {uploadedImages.map((imageUrl, index) => (
                  <div key={index} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={`Venue image ${index + 1}`}
                      className="h-20 w-full rounded-xl object-cover"
                    />
                    <Button
                      type="button"
                      iconOnly
                      variant="ghost"
                      size="xs"
                      leadingIcon={RiCloseLine}
                      aria-label={`Remove image ${index + 1}`}
                      onClick={() => handleRemoveImage(imageUrl)}
                      className="absolute right-1.5 top-1.5 bg-black/55 text-white hover:bg-black/75"
                    />
                  </div>
                ))}
              </div>
            )}

            {uploadedImages.length < 5 && (
              <div className="flex justify-center rounded-2lg border border-dashed border-border-button-default bg-background-secondary-default p-6">
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res.length > 0) {
                      const newImages = res.map((file) => file.url);
                      setUploadedImages((prev) => [...prev, ...newImages]);
                      toast.success(
                        `${res.length} image(s) uploaded successfully!`,
                      );
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`Upload failed: ${error.message}`);
                  }}
                  appearance={{
                    button:
                      "ut-button:h-9 ut-button:rounded-2lg ut-button:bg-accent-600 ut-button:px-4 ut-button:text-body-medium ut-button:font-medium ut-button:text-white ut-button:hover:bg-accent-500",
                    allowedContent:
                      "text-caption-1-regular text-muted-foreground",
                  }}
                />
              </div>
            )}
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <ButtonLink href="/" variant="secondary">
              Cancel
            </ButtonLink>
            <Button
              type="submit"
              disabled={isSubmitting}
              leadingIcon={RiAddLine}
            >
              {isSubmitting ? (
                <>
                  <RiLoader4Line className="size-4 animate-spin" />
                  Creating venue…
                </>
              ) : (
                "Create venue"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
