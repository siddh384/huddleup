'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/base/input/input'
import { Button } from '@/components/base/buttons/button'
import { SelectField } from '@/components/base/select/select-field'
import { SelectItem } from '@/components/base/select/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { RiSearchLine, RiFilter3Line, RiCloseLine } from '@remixicon/react'
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
        <div className="flex flex-col gap-5">
            {/* Search by venue name */}
            <form onSubmit={handleSearchSubmit}>
                <Input
                    label="Search"
                    placeholder="Venue name or location…"
                    leadingIcon={RiSearchLine}
                    value={filters.search}
                    onChange={(value) => setFilters({ ...filters, search: value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                />
            </form>

            {/* Sport Type Filter */}
            <SelectField
                label="Sport"
                selectedKey={filters.sport}
                onSelectionChange={(key) => handleFilterChange('sport', String(key ?? 'all'))}
            >
                <SelectItem id="all">All Sports</SelectItem>
                {sports.map((sport) => (
                    <SelectItem key={sport.id} id={sport.id}>
                        {sport.name}
                    </SelectItem>
                ))}
            </SelectField>

            {/* Area Filter */}
            <Input
                label="Area"
                placeholder="Filter by area…"
                value={locationInput}
                onChange={setLocationInput}
            />

            {/* Venue Type Filter */}
            <SelectField
                label="Venue Type"
                selectedKey={selectedVenueType}
                onSelectionChange={(key) => setSelectedVenueType(String(key ?? 'all'))}
            >
                <SelectItem id="all">All Types</SelectItem>
                <SelectItem id="indoor">Indoor</SelectItem>
                <SelectItem id="outdoor">Outdoor</SelectItem>
            </SelectField>

            {/* Status Filter (Admin only) */}
            {showStatusFilter && (
                <SelectField
                    label="Status"
                    selectedKey={filters.status}
                    onSelectionChange={(key) => handleFilterChange('status', String(key ?? 'approved'))}
                >
                    <SelectItem id="approved">Approved</SelectItem>
                    <SelectItem id="pending">Pending</SelectItem>
                    <SelectItem id="rejected">Rejected</SelectItem>
                </SelectField>
            )}

            {/* Rating Filter */}
            <SelectField
                label="Min Rating"
                selectedKey={filters.rating}
                onSelectionChange={(key) => handleFilterChange('rating', String(key ?? 'all'))}
            >
                <SelectItem id="all">All Ratings</SelectItem>
                <SelectItem id="4">4+ Stars</SelectItem>
                <SelectItem id="3">3+ Stars</SelectItem>
                <SelectItem id="2">2+ Stars</SelectItem>
            </SelectField>

            {/* Clear Filters Button */}
            <Button
                variant="secondary"
                size="small"
                leadingIcon={RiCloseLine}
                onClick={clearFilters}
                className="w-full"
                disabled={isPending || !hasActiveFilters}
            >
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
                        <Button variant="secondary" className="w-full sm:w-auto" leadingIcon={RiFilter3Line}>
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
                                <RiFilter3Line className="size-5" />
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
        <Card className="sticky top-24 rounded-2xl border-gray-200 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                    <RiFilter3Line className="size-4 text-gray-500" />
                    Filters
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                {renderFiltersContent()}
            </CardContent>
        </Card>
    )
}
