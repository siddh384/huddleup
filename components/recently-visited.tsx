'use client'

import React, { useEffect, useState } from 'react'
import { VenueCard } from '@/components/venue-card'
import { CardCarousel } from '@/components/ui/card-carousel'
import { getVenuesByIds } from '@/lib/actions/venues'

interface VenueData {
  id: string
  name: string
  location: string
  rating: number | string | null
  images: string[] | null
  venueSports: Array<{ sport: { id: string; name: string } }>
}

const RECENTLY_VISITED_KEY = 'huddleup_recently_visited'
const MAX_RECENTLY_VISITED = 10

export function getRecentlyVisitedIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENTLY_VISITED_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function addRecentlyVisited(venueId: string): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getRecentlyVisitedIds()
    const updated = [venueId, ...existing.filter((id) => id !== venueId)].slice(
      0,
      MAX_RECENTLY_VISITED
    )
    localStorage.setItem(RECENTLY_VISITED_KEY, JSON.stringify(updated))
  } catch {
    // localStorage not available
  }
}

export function RecentlyVisited() {
  const [venues, setVenues] = useState<VenueData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentlyVisited() {
      const ids = getRecentlyVisitedIds()
      if (ids.length === 0) {
        setLoading(false)
        return
      }

      const result = await getVenuesByIds(ids)
      if (result.success && result.venues) {
        setVenues(result.venues)
      }
      setLoading(false)
    }

    fetchRecentlyVisited()
  }, [])

  if (loading) {
    return (
      <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Recently Visited</h2>
        <div className="text-center py-6 text-gray-500 text-sm">Loading...</div>
      </div>
    )
  }

  if (venues.length === 0) {
    return (
      <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Recently Visited</h2>
        <div className="text-center py-6 text-gray-500 text-sm">
          Visit some venues to see them here!
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Recently Visited</h2>
      <CardCarousel
        title=""
        subtitle=""
        autoplayDelay={4000}
        showPagination={true}
        showNavigation={true}
        showBadge={true}
      >
        {venues.map((venue) => (
          <VenueCard
            key={venue.id}
            venue={{
              id: venue.id,
              name: venue.name,
              location: venue.location,
              rating: venue.rating,
              images: venue.images,
              venueSports: venue.venueSports,
              status: 'approved',
            }}
            variant="compact"
          />
        ))}
      </CardCarousel>
    </div>
  )
}
