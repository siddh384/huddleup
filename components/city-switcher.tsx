"use client";

import { useTransition } from "react";
import { MapPin, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CITIES, type City } from "@/lib/cities";
import { updateUserCity } from "@/lib/actions/cities";
import { toast } from "sonner";

interface CitySwitcherProps {
  currentCity: City | null;
}

export function CitySwitcher({ currentCity }: CitySwitcherProps) {
  const [isPending, startTransition] = useTransition();

  const handleCityChange = (city: City) => {
    startTransition(async () => {
      const result = await updateUserCity(city);
      if (!result.success) {
        toast.error(result.error || "Failed to update city");
      }
    });
  };

  if (!currentCity) return null;

  return (
    <Select
      value={currentCity}
      onValueChange={handleCityChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-[130px] h-9 gap-1 text-sm font-medium">
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <MapPin className="h-3.5 w-3.5" />
        )}
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CITIES.map((city) => (
          <SelectItem key={city} value={city}>
            {city}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
