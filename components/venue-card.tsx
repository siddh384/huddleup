'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Star, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Venue } from '@/db/schema'
import { DeleteVenueDialog } from './delete-venue-dialog'

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
    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 hover:bg-green-200'
            case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            case 'rejected': return 'bg-red-100 text-red-800 hover:bg-red-200'
            default: return ''
        }
    }

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                className={`h-4 w-4 ${index < Math.floor(rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : index < rating
                        ? 'fill-yellow-200 text-yellow-400'
                        : 'text-gray-300'
                    }`}
            />
        ))
    }

    const isCompact = variant === 'compact'
    const imageAspectRatio = isCompact ? 'aspect-[4/3]' : 'aspect-[4/3]'
    const cardPadding = isCompact ? 'p-4' : 'p-6'
    const titleSize = isCompact ? 'text-xl font-bold' : 'text-2xl font-bold'
    const buttonSize = isCompact ? 'sm' : 'default'
    const buttonVariant = isCompact ? 'outline' : 'default'

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col p-0">
            {/* Venue Image */}
            <div className={`relative w-full ${imageAspectRatio}`}>
                {venue.images && venue.images.length > 0 ? (
                    <Image
                        src={venue.images[0]}
                        alt={venue.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                        <MapPin className="w-12 h-12" />
                    </div>
                )}

                {/* Admin Controls */}
                {isAdmin && (
                    <div className="absolute top-3 left-3 flex gap-1">
                        <Link href={`/venues/${venue.id}/edit`}>
                            <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm">
                                <Edit className="w-4 h-4" />
                            </Button>
                        </Link>
                        <DeleteVenueDialog
                            venueId={venue.id}
                            venueName={venue.name}
                        />
                    </div>
                )}
            </div>

            <CardContent className={`${cardPadding} flex flex-col flex-grow pt-0`}>
                {/* Venue Name and Location */}
                <div className="mb-2">
                    <h3 className={`${titleSize} mb-2`}>{venue.name}</h3>
                    <div className="flex items-center text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{venue.location}</span>
                    </div>

                    {/* Rating and Reviews */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                            {renderStars(Number(venue.rating) || 0)}
                        </div>
                        <span className="font-medium text-sm">{Number(venue.rating || 0).toFixed(1)}</span>
                        <span className="text-muted-foreground text-sm">
                            ({venue.reviewCount || 0} reviews)
                        </span>
                    </div>
                </div>

                {/* Sports Tags */}
                <div className={`flex flex-wrap gap-2 mb-4`}>
                    {(() => {
                        const sportsList =
                            venue.venueSports?.length
                                ? venue.venueSports.map((vs) => vs.sport.name)
                                : "sports" in venue && Array.isArray(venue.sports)
                                  ? venue.sports
                                  : []
                        return sportsList.length > 0 ? (
                            <>
                                {sportsList.slice(0, 2).map((sportName, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                        {sportName}
                                    </Badge>
                                ))}
                                {sportsList.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{sportsList.length - 2} more
                                    </Badge>
                                )}
                            </>
                        ) : (
                            <Badge variant="outline" className="text-xs">
                                Sports Available
                            </Badge>
                        )
                    })()}
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {venue.amenities && venue.amenities.length > 0 ? (
                        <>
                            {venue.amenities.slice(0, 2).map((amenity, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    {amenity}
                                </Badge>
                            ))}
                            {venue.amenities.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                    +{venue.amenities.length - 2} more
                                </Badge>
                            )}
                        </>
                    ) : (
                        <>
                            <Badge variant="secondary" className="text-xs">Air Conditioned</Badge>
                            <Badge variant="secondary" className="text-xs">Parking Available</Badge>
                        </>
                    )}
                </div>

                {/* Owner Info (Admin View) */}
                {isAdmin && venue.owner && showOwnerInfo && (
                    <div className="text-xs text-muted-foreground mb-4 p-2 bg-muted rounded">
                        Owner: {venue.owner.name} ({venue.owner.email})
                    </div>
                )}

                {/* Spacer to push button to bottom */}
                <div className="flex-grow"></div>

                {/* View Details Button */}
                <Button
                    className={`w-full mt-4 ${isCompact ? 'text-xs' : ''}`}
                    variant={buttonVariant}
                    size={buttonSize}
                    asChild
                >
                    <Link href={`/venues/${venue.id}`}>
                        View Details
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}
