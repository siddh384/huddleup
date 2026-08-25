'use client'

import React from 'react'
import { MapPin, Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Venue } from '@/db/schema'

interface VenueWithRelations extends Venue {
    owner?: {
        id: string
        name: string
        email: string
    }
    venueSports: Array<{
        sport: {
            id: string
            name: string
        }
    }>
    courts?: Array<{
        id: string
        name: string
        pricePerHour: string
    }>
}

/** Simplified shape for dummy/display data (e.g. homepage carousel) */
interface VenueDisplay {
    id: string
    name: string
    location: string
    images?: string[] | null
    rating?: number | string | null
    reviewCount?: number | null
    sports?: string[]
    venueSports?: Array<{ sport: { id: string; name: string } }>
    amenities?: string[] | null
    status?: string
    owner?: { id: string; name: string; email: string }
}

interface VenueCardProps {
    venue: VenueWithRelations | VenueDisplay
    variant?: 'grid' | 'compact'
    isAdmin?: boolean
    canManageVenues?: boolean
    showOwnerInfo?: boolean
}

export function VenueCard({
    venue,
    variant = 'grid',
    isAdmin = false,
    canManageVenues = false,
    showOwnerInfo = false
}: VenueCardProps) {
    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                className={`h-3.5 w-3.5 ${index < Math.floor(rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : index < rating
                        ? 'fill-yellow-200 text-yellow-400'
                        : 'text-gray-300'
                    }`}
            />
        ))
    }

    const isCompact = variant === 'compact'

    const sportsList =
        venue.venueSports?.length
            ? venue.venueSports.map((vs) => vs.sport.name)
            : 'sports' in venue && Array.isArray(venue.sports)
              ? venue.sports
              : []

    const cardContent = (
        <div
            className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md ${isCompact ? '' : 'cursor-pointer'}`}
        >
            {/* Hero Image */}
            <div className={`relative w-full shrink-0 ${isCompact ? 'aspect-[4/3]' : 'h-[220px] sm:h-[260px] md:h-[280px]'}`}>
                {venue.images && venue.images.length > 0 ? (
                    <Image
                        src={venue.images[0]}
                        alt={venue.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes={isCompact ? '(max-width: 768px) 80vw, 33vw' : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-gray-100 text-gray-400">
                        <MapPin className="w-12 h-12" />
                    </div>
                )}

                {/* Gradient overlay at bottom of image */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
            </div>

            {/* Info Section */}
            <div className={`flex flex-1 flex-col ${isCompact ? 'gap-1.5 p-3' : 'gap-2 p-4 sm:p-5'}`}>
                {/* Venue Name */}
                <h3 className={`font-semibold leading-snug tracking-tight text-gray-900 ${isCompact ? 'text-base' : 'text-xl'}`}>
                    {venue.name}
                </h3>

                {/* Area / Location */}
                <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-sm truncate">{venue.location}</span>
                </div>

                {/* Sports Pills */}
                {sportsList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {sportsList.slice(0, isCompact ? 2 : 3).map((sportName, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                            >
                                {sportName}
                            </span>
                        ))}
                        {sportsList.length > (isCompact ? 2 : 3) && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                                +{sportsList.length - (isCompact ? 2 : 3)} more
                            </span>
                        )}
                    </div>
                )}

                {/* Rating — pinned to bottom */}
                <div className="mt-auto flex items-center gap-1.5 pt-2">
                    <div className="flex items-center gap-0.5">
                        {renderStars(Number(venue.rating) || 0)}
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                        {Number(venue.rating || 0).toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-400">
                        ({venue.reviewCount || 0})
                    </span>
                </div>
            </div>
        </div>
    )

    if (isCompact) {
        return cardContent
    }

    return (
        <Link href={`/venues/${venue.id}`} className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl">
            {cardContent}
        </Link>
    )
}
