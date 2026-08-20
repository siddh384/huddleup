import React from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { DashboardSearch } from '@/components/dashboard-search'
import { VenueCard } from '@/components/venue-card'
import { CardCarousel } from '@/components/ui/card-carousel'
import { RecentlyVisited } from '@/components/recently-visited'
import { VenueCarousel } from '@/components/venue-carousel'
import { getPopularVenues, getRecommendedVenues } from '@/lib/actions/venues'
import { getUserCity } from '@/lib/actions/cities'

const page = async () => {
  const city = await getUserCity()

  const [popularResult, recommendedResult] = await Promise.all([
    getPopularVenues(city ?? undefined),
    getRecommendedVenues(city ?? undefined),
  ])

  const popularVenues = popularResult.success ? popularResult.venues || [] : []
  const recommendedVenues = recommendedResult.success ? recommendedResult.venues || [] : []

  return (
    <div>
      {/* Hero Section */}
      <div className="relative min-h-[600px] border-b">
        <Image
          src="/football-hero-section.webp"
          alt="Court"
          fill
          className="object-cover brightness-70"
        />
        <div className="relative flex flex-col items-center justify-center min-h-[600px] px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40">
          <DashboardSearch initialLocation="" />
          <div className="space-y-4 max-w-xl text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-white">
              FIND VENUES & PLAYERS NEARBY
            </h1>
            <p className="text-sm sm:text-base leading-relaxed text-white px-4">
              Seamlessly explore sports venues and play with
              <span className="hidden sm:inline"><br /></span>
              <span className="sm:hidden"> </span>
              sports enthusiasts just like you
            </p>
          </div>
        </div>
      </div>

      {/* Recently Visited Section - Client component with localStorage */}
      <RecentlyVisited />

      {/* Recommended Venues Section - Top rated in user's city */}
      <VenueCarousel
        title="Recommended For You"
        venues={recommendedVenues}
        emptyMessage={city ? `No venues available in ${city} yet` : "Sign up to see recommended venues"}
      />

      {/* Popular Venues Section - All approved venues */}
      <VenueCarousel
        title="Popular Venues"
        venues={popularVenues}
        emptyMessage="No venues available"
      />
    </div>
  )
}

export default page
