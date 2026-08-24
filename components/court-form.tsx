"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Sport {
  id: string;
  name: string;
}

interface CourtFormProps {
  venueId: string;
  availableSports: Sport[];
  court?: {
    id: string;
    name: string;
    sportId: string;
    pricePerHour: string;
    operatingHoursStart: string;
    operatingHoursEnd: string;
  };
  onSuccess?: () => void;
}

export function CourtForm({
  venueId,
  availableSports,
  court,
  onSuccess,
}: CourtFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: court?.name || "",
    sportId: court?.sportId || "",
    pricePerHour: court?.pricePerHour || "",
    operatingHoursStart: court?.operatingHoursStart || "09:00",
    operatingHoursEnd: court?.operatingHoursEnd || "22:00",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Court name is required");
      return false;
    }
    if (!formData.sportId) {
      toast.error("Please select a sport");
      return false;
    }
    if (!formData.pricePerHour || parseFloat(formData.pricePerHour) <= 0) {
      toast.error("Please enter a valid price per hour");
      return false;
    }
    if (formData.operatingHoursStart >= formData.operatingHoursEnd) {
      toast.error("Start time must be before end time");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const url = court ? `/api/courts/${court.id}` : "/api/courts";
      const method = court ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          venueId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save court");
      }

      toast.success(
        court ? "Court updated successfully!" : "Court created successfully!",
      );

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
        if (!court) {
          setFormData({
            name: "",
            sportId: "",
            pricePerHour: "",
            operatingHoursStart: "09:00",
            operatingHoursEnd: "22:00",
          });
        }
      }
    } catch (error) {
      console.error("Error saving court:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save court",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2">
        {/* Court Name — wider, spans full width */}
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="name" className="text-body-medium text-text-primary">
            Court Name *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g. Court 1, Main Court"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
            className="h-10"
          />
        </div>

        {/* Sport */}
        <div className="space-y-2">
          <Label htmlFor="sport" className="text-body-medium text-text-primary">
            Sport *
          </Label>
          <Select
            value={formData.sportId}
            onValueChange={(value) => handleInputChange("sportId", value)}
            required
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select sport" />
            </SelectTrigger>
            <SelectContent>
              {availableSports.map((sport) => (
                <SelectItem key={sport.id} value={sport.id}>
                  {sport.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Per Hour */}
        <div className="space-y-2">
          <Label htmlFor="price" className="text-body-medium text-text-primary">
            Price (per hour) *
          </Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 500"
            value={formData.pricePerHour}
            onChange={(e) => handleInputChange("pricePerHour", e.target.value)}
            required
            className="h-10"
          />
        </div>

        {/* Opening Time */}
        <div className="space-y-2">
          <Label
            htmlFor="startTime"
            className="text-body-medium text-text-primary"
          >
            Opening Time *
          </Label>
          <Select
            value={formData.operatingHoursStart}
            onValueChange={(value) =>
              handleInputChange("operatingHoursStart", value)
            }
            required
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select opening time" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Closing Time */}
        <div className="space-y-2">
          <Label
            htmlFor="endTime"
            className="text-body-medium text-text-primary"
          >
            Closing Time *
          </Label>
          <Select
            value={formData.operatingHoursEnd}
            onValueChange={(value) =>
              handleInputChange("operatingHoursEnd", value)
            }
            required
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select closing time" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submit button — bottom-left */}
      <div className="flex justify-start mt-5">
        <Button type="submit" disabled={isLoading} variant="primary">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {court ? "Updating..." : "Creating..."}
            </>
          ) : court ? (
            "Update Court"
          ) : (
            "Create Court"
          )}
        </Button>
      </div>
    </form>
  );
}