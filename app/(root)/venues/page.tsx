import React, { Suspense, use } from 'react'
import { getVenues, getAllSports } from '@/lib/actions/venues'
import { getCurrentUser } from '@/lib/actions/users'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { VenueFilters } from '@/components/venue-filters'
import { VenueGrid } from '@/components/venue-grid'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

interface VenuesPageProps {
    searchParams: Promise<{
        page?: string
        search?: string
        sport?: string
        location?: string
        rating?: string
        status?: 'pending' | 'approved' | 'rejected'
    }>
}

const VenuesPage = async ({ searchParams }: VenuesPageProps) => {
    const resolvedSearchParams = await searchParams
    const page = Number(resolvedSearchParams.page) || 1
    const searchQuery = resolvedSearchParams.search || ''
    const sportFilter = resolvedSearchParams.sport || ''
    const locationFilter = resolvedSearchParams.location || ''
    const ratingFilter = resolvedSearchParams.rating || ''
    const status = resolvedSearchParams.status || 'approved'

    const [userResult, venuesResult, sportsResult] = await Promise.all([
        getCurrentUser(),
        getVenues({
            page,
            pageSize: 12,
            searchQuery,
            sportFilter,
            locationFilter,
            ratingFilter,
            status
        }),
        getAllSports()
    ])

    const isAdmin = userResult.success && userResult.user?.role === 'admin'
    const canCreateVenue = userResult.success && userResult.user &&
        (userResult.user.role === 'facility_owner' || userResult.user.role === 'admin')

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}


            <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
                    {/* Desktop Sidebar - Filters (hidden on mobile) */}
                    <div className="hidden lg:block w-80 shrink-0">
                        <VenueFilters
                            sports={sportsResult.success ? (sportsResult.sports || []) : []}
                            currentSearch={searchQuery}
                            currentSport={sportFilter}
                            currentLocation={locationFilter}
                            currentRating={ratingFilter}
                            showStatusFilter={isAdmin}
                            currentStatus={status}
                            isMobile={false}
                        />
                    </div>

                    {/* Mobile Filters - Shown as drawer trigger on mobile */}
                    <div className="lg:hidden">
                        <VenueFilters
                            sports={sportsResult.success ? (sportsResult.sports || []) : []}
                            currentSearch={searchQuery}
                            currentSport={sportFilter}
                            currentLocation={locationFilter}
                            currentRating={ratingFilter}
                            showStatusFilter={isAdmin}
                            currentStatus={status}
                            isMobile={true}
                        />
                    </div>

                    {/* Content Area - Venue Cards */}
                    <div className="flex-1 w-full">
                        {venuesResult.success && venuesResult.venues && venuesResult.venues.length > 0 ? (
                            <VenueGrid
                                venues={venuesResult.venues}
                                isNext={venuesResult.isNext}
                                currentPage={page}
                                totalPages={venuesResult.totalPages}
                                totalCount={venuesResult.totalCount}
                                isAdmin={isAdmin}
                                canManageVenues={canCreateVenue}
                            />
                        ) : (
                            <Card className="p-8 text-center">
                                <div className="text-muted-foreground">
                                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <h3 className="text-lg font-medium mb-2">No venues found</h3>
                                    <p className="mb-4">
                                        {searchQuery || sportFilter || locationFilter
                                            ? 'Try adjusting your filters to find more venues.'
                                            : 'No venues are available at the moment.'
                                        }
                                    </p>
                                    {canCreateVenue && (
                                        <Link href="/create-venue">
                                            <Button>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create First Venue
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VenuesPage