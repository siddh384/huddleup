"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateVenue, getAllSports } from "@/lib/actions/venues";
import { UploadButton } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { CITIES, type City } from "@/lib/cities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Sport {
  id: string;
  name: string;
  description?: string | null;
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
    sport: {
      id: string;
      name: string;
    };
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
    venue.images || []
  );

  const [formData, setFormData] = useState({
    name: venue.name,
    description: venue.description || "",
    address: venue.address,
    location: venue.location,
    city: (venue.city as City) || "",
    amenities: venue.amenities?.join(", ") || "",
    selectedSports: venue.venueSports?.map((vs) => vs.sportId) || [],
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
      } catch (error) {
        toast.error("Error loading sports");
      } finally {
        setLoadingSports(false);
      }
    }
    loadSports();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSportToggle = (sportId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedSports: prev.selectedSports.includes(sportId)
        ? prev.selectedSports.filter((id) => id !== sportId)
        : [...prev.selectedSports, sportId],
    }));
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

    if (formData.selectedSports.length === 0) {
      toast.error("Please select at least one sport");
      return;
    }

    setIsSubmitting(true);

    try {
      const amenitiesArray = formData.amenities
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      const result = await updateVenue(venue.id, {
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
        toast.success("Venue updated successfully!");
        router.push(`/venues/${venue.id}`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update venue");
      }
    } catch (error) {
      toast.error("An error occurred while updating the venue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingSports) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label className="pb-1.5" htmlFor="name">
                Venue Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter venue name"
                required
              />
            </div>

            <div>
              <Label className="pb-1.5" htmlFor="description">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe your venue, facilities, and what makes it special"
                rows={3}
              />
            </div>

            <div>
              <Label className="pb-1.5" htmlFor="address">
                Full Address *
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter complete address with street, city, state, postal code"
                rows={2}
                required
              />
            </div>

            <div>
              <Label className="pb-1.5" htmlFor="city">
                City <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.city}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, city: value as City }))
                }
              >
                <SelectTrigger>
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

            <div>
              <Label className="pb-1.5" htmlFor="location">
                Area/Neighborhood *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., Alkapuri, SG Highway, Vesu"
                required
              />
            </div>

            <div>
              <Label className="pb-1.5" htmlFor="amenities">
                Amenities
              </Label>
              <Input
                id="amenities"
                value={formData.amenities}
                onChange={(e) => handleInputChange("amenities", e.target.value)}
                placeholder="Separate amenities with commas (e.g., Parking, Lockers, Showers, Snack Bar)"
              />
            </div>
          </div>

          {/* Sports Selection */}
          <div>
            <Label className="pb-1.5">Sports Available *</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Select all sports that will be available at your venue
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {sports.map((sport) => (
                <div key={sport.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={sport.id}
                    checked={formData.selectedSports.includes(sport.id)}
                    onCheckedChange={() => handleSportToggle(sport.id)}
                  />
                  <Label
                    htmlFor={sport.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {sport.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label>Venue Images</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Upload up to 5 images of your venue (4MB max per image)
            </p>

            {/* Display uploaded images */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {uploadedImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Venue image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(imageUrl)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            {uploadedImages.length < 5 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
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
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                    allowedContent: "text-muted-foreground",
                  }}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
