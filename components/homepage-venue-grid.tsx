import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'

interface VenueData {
  id: string
  name: string
  location: string
  rating: number | string | null
  images: string[] | null
  venueSports: Array<{ sport: { id: string; name: string } }>
}

interface Props {
  title: string
  venues: VenueData[]
  emptyMessage?: string
  viewAllHref?: string
}

export function HomepageVenueGrid({ title, venues, emptyMessage = 'No venues found', viewAllHref }: Props) {
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            View all &rarr;
          </Link>
        )}
      </div>

      {venues.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-sm">{emptyMessage}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {venues.map((venue) => {
            const sportsList = venue.venueSports?.map((vs) => vs.sport.name) ?? []
            return (
              <Link
                key={venue.id}
                href={`/venues/${venue.id}`}
                className="group"
              >
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                  <div className="aspect-[16/10] relative bg-gray-100">
                    {venue.images && venue.images.length > 0 ? (
                      <Image
                        src={venue.images[0]}
                        alt={venue.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
      )}
    </section>
  )
}