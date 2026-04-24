"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createVenue, getAllSports } from "@/lib/actions/venues";
import { UploadButton } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, X, Upload, ImageIcon } from "lucide-react";

interface Sport {
  id: string;
  name: string;
  description?: string | null;
}

export function CreateVenueForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    location: "",
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

      const result = await createVenue({
        name: formData.name,
        description: formData.description || undefined,
        address: formData.address,
        location: formData.location,
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
          amenities: "",
          selectedSports: [],
        });
        setUploadedImages([]);

        // Redirect to dashboard
        router.push("/");
      } else {
        toast.error(result.error || "Failed to create venue");
      }
    } catch (error) {
      toast.error("An error occurred while creating the venue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingSports) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Venue</CardTitle>
        <CardDescription>
          Fill out the details below to create your sports venue. It will be
          reviewed by an admin before being published.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              <Label className="pb-1.5" htmlFor="location">
                Location (City/Area) *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., Downtown Manhattan, Brooklyn Heights"
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
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Venue...
              </>
            ) : (
              "Create Venue"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
