"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createReport } from "@/lib/actions/reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Venue {
  id: string;
  name: string;
  location: string;
}

interface ContactFormProps {
  venues: Venue[];
}

const reportReasons = [
  "Poor facility condition",
  "Cleanliness issues",
  "Equipment problems",
  "Staff behavior",
  "Safety concerns",
  "Booking/payment issues",
  "False advertising",
  "Accessibility problems",
  "Noise disturbance",
  "Other",
];

export function ContactForm({ venues }: ContactFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    venueId: "",
    reason: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!formData.venueId || !formData.reason) {
        setError("Please select a venue and reason for your report.");
        return;
      }

      const result = await createReport({
        reportedVenueId: formData.venueId,
        reason: formData.reason,
        description: formData.description.trim() || undefined,
      });

      if (result.success) {
        setSubmitted(true);
        setFormData({ venueId: "", reason: "", description: "" });
        toast.success("Report submitted successfully!");

        // Refresh the page to update the reports list
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        setError(result.error || "Failed to submit report");
        toast.error("Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                Report Submitted Successfully
              </h3>
              <p className="text-green-700 mt-1">
                Thank you for your feedback. We&apos;ll review your report and
                take appropriate action. You can track the status in the
                &ldquo;My Reports&ldquo; tab.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setSubmitted(false)}
            variant="outline"
            className="mt-4"
          >
            Submit Another Report
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="venue">Venue *</Label>
        <Select
          value={formData.venueId}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, venueId: value }))
          }
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a venue to report" />
          </SelectTrigger>
          <SelectContent>
            {venues.length === 0 ? (
              <SelectItem value="no-venues" disabled>
                No venues available
              </SelectItem>
            ) : (
              venues.map((venue) => (
                <SelectItem key={venue.id} value={venue.id}>
                  {venue.name} - {venue.location}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Report *</Label>
        <Select
          value={formData.reason}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, reason: value }))
          }
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            {reportReasons.map((reason) => (
              <SelectItem key={reason} value={reason}>
                {reason}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Please provide additional details about the issue..."
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={5}
          className="resize-none"
        />
        <p className="text-sm text-gray-500">
          Optional: Provide specific details to help us understand and address
          the issue.
        </p>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !formData.venueId || !formData.reason}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting Report...
          </>
        ) : (
          "Submit Report"
        )}
      </Button>

      <p className="text-sm text-gray-500 text-center">
        Reports are reviewed by our admin team. We&apos;ll investigate all
        legitimate concerns and take appropriate action to maintain platform
        quality.
      </p>
    </form>
  );
}
