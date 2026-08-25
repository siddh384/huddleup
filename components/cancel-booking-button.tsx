'use client'

import React, { useState } from 'react'
import { Button } from '@/components/base/buttons/button'
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
import { cancelBooking } from '@/lib/actions/bookings'
import { useRouter } from 'next/navigation'

interface CancelBookingButtonProps {
  bookingId: string
  isDisabled?: boolean
}

export function CancelBookingButton({ bookingId, isDisabled }: CancelBookingButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCancel() {
    setLoading(true)
    const result = await cancelBooking(bookingId, 'Cancelled by user')
    setLoading(false)

    if (result.success) {
      setOpen(false)
      router.refresh()
    } else {
      alert(result.error || 'Failed to cancel booking')
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        size="small"
        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:border-red-900 dark:hover:bg-red-950 dark:hover:text-red-400"
        onClick={() => setOpen(true)}
        disabled={isDisabled}
      >
        Cancel
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Cancelling...' : 'Yes, Cancel'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
