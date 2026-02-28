'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

interface VenuePaginationProps {
    currentPage: number
    totalPages: number
    totalCount: number
    itemsPerPage: number
}

export function VenuePagination({
    currentPage,
    totalPages,
    totalCount,
    itemsPerPage
}: VenuePaginationProps) {
    const searchParams = useSearchParams()

    const createPageUrl = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', pageNumber.toString())
        return `/venues?${params.toString()}`
    }

    // Don't show pagination if there's only one page or no results
    if (totalPages <= 1) {
        return null
    }

    // Calculate the range of pages to show
    const getPageNumbers = () => {
        const delta = 2 // Number of pages to show on each side of current page
        const range = []
        const rangeWithDots = []

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i)
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, 'ellipsis-start')
        } else {
            rangeWithDots.push(1)
        }

        rangeWithDots.push(...range)

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('ellipsis-end', totalPages)
        } else {
            if (totalPages > 1) {
                rangeWithDots.push(totalPages)
            }
        }

        return rangeWithDots
    }

    const pageNumbers = getPageNumbers()

    // Calculate the range of items being shown
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalCount)

    return (
        <div className="space-y-4">
            {/* Results summary */}
            <div className="text-center text-sm text-muted-foreground">
                Showing {startItem}-{endItem} of {totalCount} venue{totalCount !== 1 ? 's' : ''}
            </div>

            {/* Pagination controls */}
            <Pagination>
                <PaginationContent>
                    {/* Previous button */}
                    <PaginationItem>
                        <PaginationPrevious
                            href={currentPage > 1 ? createPageUrl(currentPage - 1) : undefined}
                            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                    </PaginationItem>

                    {/* Page numbers */}
                    {pageNumbers.map((pageNumber, index) => {
                        if (pageNumber === 'ellipsis-start') {
                            return (
                                <PaginationItem key={`ellipsis-start-${index}`}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )
                        }

                        if (pageNumber === 'ellipsis-end') {
                            return (
                                <PaginationItem key={`ellipsis-end-${index}`}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )
                        }

                        const page = pageNumber as number
                        const isActive = page === currentPage

                        return (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    href={createPageUrl(page)}
                                    isActive={isActive}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        )
                    })}

                    {/* Next button */}
                    <PaginationItem>
                        <PaginationNext
                            href={currentPage < totalPages ? createPageUrl(currentPage + 1) : undefined}
                            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}
