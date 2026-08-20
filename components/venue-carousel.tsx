import React from 'react'
import { VenueCard } from '@/components/venue-card'
import { CardCarousel } from '@/components/ui/card-carousel'

interface VenueData {
  id: string
  name: string
  location: string
  price: number
  rating: number | string | null
  images: string[] | null
  venueSports: Array<{ sport: { id: string; name: string } }>
}

interface VenueCarouselProps {
  title: string
  venues: VenueData[]
  emptyMessage?: string
}

export function VenueCarousel({ title, venues, emptyMessage = 'No venues found' }: VenueCarouselProps) {
  if (venues.length === 0) {
    return (
      <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">{title}</h2>
        <div className="text-center py-6 text-gray-500 text-sm">{emptyMessage}</div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">{title}</h2>
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
              price: venue.price,
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
