"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/base/table/table";
import { Chip } from "@/components/base/badges/chip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Trash2, Eye, Power, Loader2 } from "lucide-react";
import { CourtForm } from "./court-form";
import { DeleteCourtDialog } from "./delete-court-dialog";
import { toast } from "sonner";

interface Sport {
  id: string;
  name: string;
}

interface Court {
  id: string;
  name: string;
  sportId: string;
  pricePerHour: string;
  operatingHoursStart: string;
  operatingHoursEnd: string;
  isActive: boolean;
  sport: Sport;
}

interface CourtsTableProps {
  courts: Court[];
  availableSports: Sport[];
  venueId: string;
}

export function CourtsTable({
  courts,
  availableSports,
  venueId,
}: CourtsTableProps) {
  const router = useRouter();
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [deletingCourt, setDeletingCourt] = useState<Court | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loadingCourtId, setLoadingCourtId] = useState<string | null>(null);

  const handleToggleActive = async (court: Court) => {
    setLoadingCourtId(court.id);

    try {
      const response = await fetch(`/api/courts/${court.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !court.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update court status");
      }

      toast.success(
        `Court ${court.isActive ? "deactivated" : "activated"} successfully!`,
      );
      router.refresh();
    } catch (error) {
      console.error("Error toggling court status:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update court status",
      );
    } finally {
      setLoadingCourtId(null);
    }
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingCourt(null);
    router.refresh();
  };

  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    setDeletingCourt(null);
    router.refresh();
  };

  const formatPrice = (price: string) =>
    `₹${parseFloat(price).toFixed(0)}`;

  return (
    <>
      <Table size="sm">
        <TableHeader>
          <TableColumn
            id="name"
            isRowHeader
            className="!px-5 !py-3.5 min-w-[130px]"
          >
            Court Name
          </TableColumn>
          <TableColumn id="sport" className="!px-5 !py-3.5">
            Sport
          </TableColumn>
          <TableColumn id="price" className="!px-5 !py-3.5 tabular-nums">
            Price/Hour
          </TableColumn>
          <TableColumn
            id="hours"
            className="!px-5 !py-3.5 hidden md:table-cell"
          >
            Operating Hours
          </TableColumn>
          <TableColumn id="status" className="!px-5 !py-3.5">
            Status
          </TableColumn>
          <TableColumn id="actions" className="!px-5 !py-3.5 text-center">
            Actions
          </TableColumn>
        </TableHeader>
        <TableBody>
          {courts.map((court) => (
            <TableRow key={court.id}>
              <TableCell className="!px-5 !py-3.5 text-body-semibold">
                {court.name}
              </TableCell>
              <TableCell className="!px-5 !py-3.5">
                <Chip color="gray">{court.sport.name}</Chip>
              </TableCell>
              <TableCell className="!px-5 !py-3.5 tabular-nums">
                {formatPrice(court.pricePerHour)}
              </TableCell>
              <TableCell className="!px-5 !py-3.5 hidden md:table-cell">
                <span className="text-body-2-regular text-text-tertiary">
                  {court.operatingHoursStart} – {court.operatingHoursEnd}
                </span>
              </TableCell>
              <TableCell className="!px-5 !py-3.5">
                <span className="inline-flex items-center gap-2">
                  <Chip color={court.isActive ? "lime" : "soft"}>
                    {court.isActive ? "Active" : "Inactive"}
                  </Chip>
                </span>
              </TableCell>
              <TableCell className="!px-5 !py-3.5 text-center">
                <span className="inline-flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(court)}
                    disabled={loadingCourtId === court.id}
                    title={court.isActive ? "Deactivate" : "Activate"}
                    className={`inline-flex items-center justify-center p-1 rounded-full transition-colors ${
                      court.isActive
                        ? "text-green-500 hover:bg-green-50"
                        : "text-text-tertiary hover:bg-background-secondary"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loadingCourtId === court.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    title="Edit court"
                    onClick={() => {
                      setEditingCourt(court);
                      setIsEditDialogOpen(true);
                    }}
                    className="inline-flex items-center justify-center p-1 text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Delete court"
                    onClick={() => {
                      setDeletingCourt(court);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="inline-flex items-center justify-center p-1 text-text-tertiary hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Court Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-title-3-semibold">
              Edit Court
            </DialogTitle>
            <DialogDescription className="text-body-2-regular text-text-tertiary">
              Update the details for {editingCourt?.name}
            </DialogDescription>
          </DialogHeader>
          {editingCourt && (
            <CourtForm
              venueId={venueId}
              availableSports={availableSports}
              court={editingCourt}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Court Dialog */}
      <DeleteCourtDialog
        court={deletingCourt}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}