'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Search, Filter, X } from 'lucide-react'
import { Sport } from '@/db/schema'

interface VenueFiltersProps {
    sports: Sport[]
    currentSearch: string
    currentSport: string
    currentLocation: string
    currentRating?: string
    showStatusFilter?: boolean
    currentStatus?: string
    isMobile?: boolean
}

export function VenueFilters({
    sports,
    currentSearch,
    currentSport,
    currentLocation,
    currentRating = 'all',
    showStatusFilter = false,
    currentStatus = 'approved',
    isMobile = false
}: VenueFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const [filters, setFilters] = useState({
        search: currentSearch,
        sport: currentSport || 'all',
        location: currentLocation,
        rating: currentRating || 'all',
        status: currentStatus
    })
    const [selectedVenueType, setSelectedVenueType] = useState('all')

    // Local debounced state for location input to prevent navigation on every keystroke
    const [locationInput, setLocationInput] = useState(currentLocation)

    // Keep local input in sync if URL/search params change externally
    useEffect(() => {
        setLocationInput(currentLocation)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentLocation])

    const updateUrl = (newFilters: typeof filters) => {
        const params = new URLSearchParams(searchParams)

        // Update or remove parameters
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value && value.trim() !== '' && value !== 'all') {
                params.set(key, value)
            } else {
                params.delete(key)
            }
        })

        params.delete('page')

        const newUrl = params.toString() ? `/venues?${params.toString()}` : '/venues'

        startTransition(() => {
            router.push(newUrl)
        })
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        updateUrl(filters)
    }

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        updateUrl(newFilters)
    }

    // Debounce applying location filter to avoid input losing focus after first character
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (locationInput !== filters.location) {
                handleFilterChange('location', locationInput)
            }
        }, 400)
        return () => clearTimeout(timeoutId)
        // We intentionally avoid including handleFilterChange in deps to keep debounce stable
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locationInput, filters.location])

    const clearFilters = () => {
        const clearedFilters = {
            search: '',
            sport: 'all',
            location: '',
            rating: 'all',
            status: showStatusFilter ? 'approved' : currentStatus
        }
        setFilters(clearedFilters)
        setSelectedVenueType('all')
        updateUrl(clearedFilters)
    }

    const hasActiveFilters = filters.search || (filters.sport && filters.sport !== 'all') || filters.location ||
        (filters.rating && filters.rating !== 'all') || selectedVenueType !== 'all'

    const renderFiltersContent = () => (
        <div className="space-y-6">
            {/* Search by venue name */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Search Venues</label>
                <div className="relative pt-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" style={{ top: 'calc(50% + 4px)' }} />
                    <Input
                        placeholder="Search by venue name or location..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Sport Type Filter */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Sport Type</label>
                <div className="pt-2">
                    <Select value={filters.sport} onValueChange={(value) => handleFilterChange('sport', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select sport" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sports</SelectItem>
                            {sports.map((sport) => (
                                <SelectItem key={sport.id} value={sport.id}>
                                    {sport.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <div className="pt-2">
                    <Input
                        placeholder="Filter by location..."
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                    />
                </div>
            </div>

            {/* Venue Type Filter */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Venue Type</label>
                <div className="pt-2">
                    <Select value={selectedVenueType} onValueChange={setSelectedVenueType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select venue type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="indoor">Indoor</SelectItem>
                            <SelectItem value="outdoor">Outdoor</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Price Range removed */}

            {/* Status Filter (Admin only) */}
            {showStatusFilter && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <div className="pt-2">
                        <Select
                            value={filters.status}
                            onValueChange={(value) => handleFilterChange('status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {/* Rating Filter */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Rating</label>
                <div className="pt-2">
                    <Select value={filters.rating} onValueChange={(value) => handleFilterChange('rating', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select minimum rating" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Ratings</SelectItem>
                            <SelectItem value="4">4+ Stars</SelectItem>
                            <SelectItem value="3">3+ Stars</SelectItem>
                            <SelectItem value="2">2+ Stars</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>


            {/* Clear Filters Button */}
            <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
                disabled={isPending || !hasActiveFilters}
            >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
            </Button>
        </div>
    )

    // Mobile version - render as sheet trigger
    if (isMobile) {
        return (
            <div className="mb-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto">
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                            {hasActiveFilters && (
                                <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                                    Active
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle className="flex items-center gap-2 text-xl font-bold">
                                <Filter className="h-5 w-5" />
                                Filters
                            </SheetTitle>
                            <SheetDescription>
                                Filter venues by your preferences
                            </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6">
                            {renderFiltersContent()}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        )
    }

    // Desktop version - render as card
    return (
        <Card className="sticky top-24 pt-5 pb-5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-3xl font-bold">
                    <Filter className="h-7 w-7" />
                    Filters
                </CardTitle>
            </CardHeader>
            <CardContent>
                {renderFiltersContent()}
            </CardContent>
        </Card>
    )
}
