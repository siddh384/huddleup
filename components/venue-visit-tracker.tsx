'use client'

import { useEffect } from 'react'
import { addRecentlyVisited } from '@/components/recently-visited'

interface VenueVisitTrackerProps {
  venueId: string
}

export function VenueVisitTracker({ venueId }: VenueVisitTrackerProps) {
  useEffect(() => {
    addRecentlyVisited(venueId)
  }, [venueId])

  return null
}
