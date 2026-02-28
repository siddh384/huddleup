'use client'

import React from 'react'

import { useRouter, useSearchParams } from 'next/navigation'
import { Venue } from '@/db/schema'
import { DeleteVenueDialog } from './delete-venue-dialog'
import { VenuePagination } from './venue-pagination'
import { VenueCard } from './venue-card'

interface VenueWithRelations extends Venue {
    owner: {
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
    courts: Array<{
        id: string
        name: string
        pricePerHour: string
    }>
}

interface VenueGridProps {
    venues: VenueWithRelations[]
    isNext: boolean
    currentPage: number
    totalPages?: number
    totalCount?: number
    isAdmin?: boolean
    canManageVenues?: boolean
}

export function VenueGrid({
    venues,
    isNext,
    currentPage,
    totalPages = 1,
    totalCount = 0,
    isAdmin = false,
    canManageVenues = false
}: VenueGridProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const createPageUrl = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', pageNumber.toString())
        return `/venues?${params.toString()}`
    }



    if (venues.length === 0) {
        return null
    }



    return (
        <div className="space-y-6">
            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
                {venues.length} venue{venues.length !== 1 ? 's' : ''} found
            </div>

            {/* Venues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {venues.map((venue) => (
                    <VenueCard
                        key={venue.id}
                        venue={venue}
                        variant="grid"
                        isAdmin={isAdmin}
                        canManageVenues={canManageVenues}
                        showOwnerInfo={true}
                    />
                ))}
            </div>

            {/* Pagination */}
            <VenuePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                itemsPerPage={12}
            />
        </div>
    )
}