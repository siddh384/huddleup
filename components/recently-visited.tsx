'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'
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

function RecentlyVisitedSkeleton() {
  return (
    <section className="px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Recently Visited</h2>
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-[270px] shrink-0 rounded-xl bg-gray-100 animate-pulse">
            <div className="aspect-[16/10] rounded-t-xl bg-gray-200" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
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
    return <RecentlyVisitedSkeleton />
  }

  if (venues.length === 0) {
    return null
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-3 w-3 ${
          index < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : index < rating
              ? 'fill-yellow-200 text-yellow-400'
              : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <section className="px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Recently Visited</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8">
        {venues.map((venue) => {
          const sportsList = venue.venueSports?.map((vs) => vs.sport.name) ?? []
          return (
            <Link
              key={venue.id}
              href={`/venues/${venue.id}`}
              className="w-[270px] shrink-0 group"
            >
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                <div className="aspect-[16/10] relative bg-gray-100">
                  {venue.images && venue.images.length > 0 ? (
                    <Image
                      src={venue.images[0]}
                      alt={venue.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      sizes="270px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      <MapPin className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-1.5">
                  <h3 className="font-semibold text-sm leading-snug text-gray-900 truncate">
                    {venue.name}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="text-xs truncate">{venue.location}</span>
                  </div>
                  {sportsList.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {sportsList.slice(0, 2).map((s, i) => (
                        <span key={i} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1 pt-0.5">
                    <div className="flex items-center gap-0.5">
                      {renderStars(Number(venue.rating) || 0)}
                    </div>
                    <span className="text-xs font-medium text-gray-800">
                      {Number(venue.rating || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}