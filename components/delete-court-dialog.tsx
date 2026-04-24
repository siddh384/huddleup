"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Court {
  id: string;
  name: string;
  sport: {
    name: string;
  };
}

interface DeleteCourtDialogProps {
  court: Court | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteCourtDialog({
  court,
  isOpen,
  onOpenChange,
  onSuccess,
}: DeleteCourtDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!court) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/courts/${court.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete court");
      }

      toast.success("Court deleted successfully!");
      onSuccess();
    } catch (error) {
      console.error("Error deleting court:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete court",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Court</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{court?.name}</strong> (
            {court?.sport.name})?
            <br />
            <br />
            This action cannot be undone. All bookings and related data for this
            court will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Court"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
