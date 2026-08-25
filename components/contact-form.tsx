"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createReport } from "@/lib/actions/reports";
import { Button } from "@/components/base/buttons/button";
import { Textarea } from "@/components/base/input/textarea";
import { SelectField } from "@/components/base/select/select-field";
import { SelectItem } from "@/components/base/select/select";
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
      <div className="rounded-3xl border border-status-lime-background bg-status-lime-background p-5">
        <div className="flex items-start gap-3">
          <CheckCircle className="size-5 shrink-0 text-status-lime-text mt-0.5" />
          <div className="min-w-0">
            <h3 className="text-headline-semibold text-status-lime-text">
              Report Submitted Successfully
            </h3>
            <p className="text-body-regular text-status-lime-text mt-1">
              Thank you for your feedback. We&apos;ll review your report and
              take appropriate action. You can track the status in the
              &ldquo;My Reports&rdquo; tab.
            </p>
            <Button
              onClick={() => setSubmitted(false)}
              variant="secondary"
              size="small"
              className="mt-3"
            >
              Submit Another Report
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-2lg bg-status-rose-background px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="size-4 shrink-0 text-status-rose-text mt-0.5" />
            <p className="text-body-regular text-status-rose-text">
              {error}
            </p>
          </div>
        </div>
      )}

      <SelectField
        label="Venue *"
        isRequired
        selectedKey={formData.venueId || undefined}
        onSelectionChange={(key) =>
          setFormData((prev) => ({ ...prev, venueId: key as string }))
        }
        renderValue={({ isPlaceholder, selectedText }) =>
          isPlaceholder ? (
            <span className="text-text-tertiary">Select a venue to report</span>
          ) : (
            <span>{selectedText}</span>
          )
        }
      >
        {venues.length === 0 ? (
          <SelectItem id="no-venues" isDisabled>
            No venues available
          </SelectItem>
        ) : (
          venues.map((venue) => (
            <SelectItem key={venue.id} id={venue.id}>
              {venue.name} - {venue.location}
            </SelectItem>
          ))
        )}
      </SelectField>

      <SelectField
        label="Reason for Report *"
        isRequired
        selectedKey={formData.reason || undefined}
        onSelectionChange={(key) =>
          setFormData((prev) => ({ ...prev, reason: key as string }))
        }
        renderValue={({ isPlaceholder, selectedText }) =>
          isPlaceholder ? (
            <span className="text-text-tertiary">Select a reason</span>
          ) : (
            <span>{selectedText}</span>
          )
        }
      >
        {reportReasons.map((reason) => (
          <SelectItem key={reason} id={reason}>
            {reason}
          </SelectItem>
        ))}
      </SelectField>

      <Textarea
        label="Description"
        placeholder="Please provide additional details about the issue..."
        value={formData.description}
        onChange={(value) =>
          setFormData((prev) => ({ ...prev, description: value }))
        }
        rows={5}
        hint="Optional: Provide specific details to help us understand and address the issue."
      />

      <Button
        type="submit"
        disabled={isSubmitting || !formData.venueId || !formData.reason}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Submitting Report...
          </>
        ) : (
          "Submit Report"
        )}
      </Button>

      <p className="text-body-2-regular text-text-tertiary text-center">
        Reports are reviewed by our admin team. We&apos;ll investigate all
        legitimate concerns and take appropriate action to maintain platform
        quality.
      </p>
    </form>
  );
}