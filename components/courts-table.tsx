"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Clock,
  DollarSign,
} from "lucide-react";
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

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatTime = (time: string) => {
    return time;
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Court Name</TableHead>
              <TableHead>Sport</TableHead>
              <TableHead>Price/Hour</TableHead>
              <TableHead>Operating Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courts.map((court) => (
              <TableRow key={court.id}>
                <TableCell className="font-medium">{court.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{court.sport.name}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1 text-muted-foreground" />
                    {formatPrice(court.pricePerHour)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-muted-foreground" />
                    {formatTime(court.operatingHoursStart)} -{" "}
                    {formatTime(court.operatingHoursEnd)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={court.isActive ? "default" : "secondary"}>
                    {court.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Toggle Active Status */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(court)}
                      disabled={loadingCourtId === court.id}
                      title={
                        court.isActive ? "Deactivate court" : "Activate court"
                      }
                    >
                      {court.isActive ? (
                        <ToggleRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>

                    {/* Edit Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingCourt(court);
                        setIsEditDialogOpen(true);
                      }}
                      title="Edit court"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeletingCourt(court);
                        setIsDeleteDialogOpen(true);
                      }}
                      title="Delete court"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {courts.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No courts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Court Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Court</DialogTitle>
            <DialogDescription>
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
