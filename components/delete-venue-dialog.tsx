'use client'

import React, { useState, useTransition } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteVenue } from '@/lib/actions/venues'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface DeleteVenueDialogProps {
    venueId: string
    venueName: string
    trigger?: React.ReactNode
}

export function DeleteVenueDialog({ venueId, venueName, trigger }: DeleteVenueDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleDelete = () => {
        startTransition(async () => {
            try {
                const result = await deleteVenue(venueId)

                if (result.success) {
                    toast.success('Venue deleted successfully')
                    setOpen(false)
                    router.refresh()
                } else {
                    toast.error(result.error || 'Failed to delete venue')
                }
            } catch (error) {
                toast.error('An unexpected error occurred')
                console.error('Error deleting venue:', error)
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            {trigger ? (
                <div onClick={() => setOpen(true)}>
                    {trigger}
                </div>
            ) : (
                <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto text-destructive hover:text-destructive/80"
                    onClick={() => setOpen(true)}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            )}

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Venue</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete "{venueName}"? This action cannot be undone.
                        All associated courts, bookings, and reviews will also be deleted.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isPending ? 'Deleting...' : 'Delete Venue'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
