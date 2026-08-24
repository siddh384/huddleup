"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateVenue, getAllSports } from "@/lib/actions/venues";
import { UploadButton } from "@/lib/uploadthing";
import { Button } from "@/components/base/buttons/button";
import { Textarea } from "@/components/base/input/textarea";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { CITIES } from "@/lib/cities";
import { AMENITIES } from "@/lib/amenities";
import { AmenityCombobox } from "@/components/amenity-combobox";

interface Sport {
  id: string;
  name: string;
}

interface Venue {
  id: string;
  name: string;
  description?: string | null;
  address: string;
  location: string;
  city?: string | null;
  images?: string[] | null;
  amenities?: string[] | null;
  venueSports?: Array<{
    sportId: string;
    sport: { id: string; name: string };
  }>;
}

interface EditVenueFormProps {
  venue: Venue;
}

export function EditVenueForm({ venue }: EditVenueFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    venue.images || [],
  );

  const [formData, setFormData] = useState({
    name: venue.name,
    description: venue.description || "",
    address: venue.address,
    location: venue.location,
    city: venue.city || "",
  });

  const [amenitiesList, setAmenitiesList] = useState<string[]>(
    venue.amenities || [],
  );

  const [selectedSports, setSelectedSports] = useState<string[]>(
    venue.venueSports?.map((vs) => vs.sportId) || [],
  );

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

  const handleSportToggle = (sportId: string) => {
    setSelectedSports((prev) =>
      prev.includes(sportId)
        ? prev.filter((id) => id !== sportId)
        : [...prev, sportId],
    );
  };

  const handleRemoveImage = (imageUrl: string) => {
    setUploadedImages((prev) => prev.filter((url) => url !== imageUrl));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Venue name is required");
      return;
    }
    if (!formData.address.trim()) {
      toast.error("Address is required");
      return;
    }
    if (!formData.location.trim()) {
      toast.error("Location is required");
      return;
    }
    if (!formData.city) {
      toast.error("Please select a city");
      return;
    }
    if (selectedSports.length === 0) {
      toast.error("Please select at least one sport");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateVenue(venue.id, {
        name: formData.name,
        description: formData.description || undefined,
        address: formData.address,
        location: formData.location,
        city: formData.city as any,
        images: uploadedImages,
        amenities: amenitiesList,
        sportIds: selectedSports,
      });

      if (result.success) {
        toast.success("Venue updated successfully!");
        router.push(`/venues/${venue.id}`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update venue");
      }
    } catch {
      toast.error("An error occurred while updating the venue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingSports) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-text-tertiary" />
        <span className="ml-2 text-body-regular text-text-tertiary">
          Loading...
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 75/25 Two-column layout */}
      <div className="grid grid-cols-1 gap-x-10 gap-y-0 lg:grid-cols-[72fr_28fr]">
        {/* ── Left Column: Venue Information ── */}
        <div className="space-y-4">
          {/* Venue Name + City */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1.5fr]">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-body-medium text-text-primary">
                Venue Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter venue name"
                required
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-body-medium text-text-primary">
                City *
              </Label>
              <Select
                value={formData.city}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, city: value }))
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-body-medium text-text-primary">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(v) =>
                setFormData((prev) => ({ ...prev, description: v }))
              }
              placeholder="Describe your venue, facilities, and what makes it special"
              rows={4}
            />
          </div>

          {/* Full Address */}
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-body-medium text-text-primary">
              Full Address *
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(v) =>
                setFormData((prev) => ({ ...prev, address: v }))
              }
              placeholder="Enter complete address with street, city, state, postal code"
              rows={1}
              isRequired
            />
          </div>

          {/* Area/Neighborhood + Amenities */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-body-medium text-text-primary">
                Area/Neighborhood *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="e.g., Alkapuri, SG Highway, Vesu"
                required
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amenities" className="text-body-medium text-text-primary">
                Amenities
              </Label>
              <AmenityCombobox
                selected={amenitiesList}
                onChange={setAmenitiesList}
                options={AMENITIES}
                placeholder="Search and select amenities..."
              />
            </div>
          </div>
        </div>

        {/* ── Right Column: Sports Available ── */}
        <div className="mt-5 lg:mt-0">
          <p className="text-body-semibold text-text-primary mb-1">
            Sports Available *
          </p>
          <p className="text-body-2-regular text-text-tertiary mb-3">
            Select all sports available at your venue
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
            {sports.map((sport) => (
              <Checkbox
                key={sport.id}
                isSelected={selectedSports.includes(sport.id)}
                onChange={() => handleSportToggle(sport.id)}
                size="sm"
              >
                {sport.name}
              </Checkbox>
            ))}
          </div>
        </div>
      </div>

      {/* ── Full-width: Venue Images ── */}
      <div className="mt-10 border-t border-border pt-8">
        <p className="text-body-semibold text-text-primary mb-1">
          Venue Images
        </p>
        <p className="text-body-2-regular text-text-tertiary mb-5">
          Upload up to 5 images (4MB max per image)
        </p>

        {uploadedImages.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-4">
            {uploadedImages.map((imageUrl, index) => (
              <div
                key={index}
                className="group relative h-24 w-36 overflow-hidden rounded-xl border border-border"
              >
                <img
                  src={imageUrl}
                  alt={`Venue image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(imageUrl)}
                  className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {uploadedImages.length < 5 && (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-border px-4 py-6">
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
                  "bg-primary text-primary-foreground hover:bg-primary/90 ut-uploading:cursor-not-allowed",
                allowedContent: "text-text-tertiary text-caption-1-regular",
              }}
            />
          </div>
        )}
      </div>

      {/* ── Bottom Actions ── */}
      <div className="mt-10 flex items-center justify-end gap-3 border-t border-border pt-5">
        <Button variant="ghost" type="button" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}