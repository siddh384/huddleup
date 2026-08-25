import React from 'react'
import Image from 'next/image'
import { DashboardSearch } from '@/components/dashboard-search'
import { ExploreSports } from '@/components/explore-sports'
import { HomepageVenueGrid } from '@/components/homepage-venue-grid'
import { VenueCTA } from '@/components/venue-cta'
import { getPopularVenues } from '@/lib/actions/venues'
import { getUserCity } from '@/lib/actions/cities'

const page = async () => {
  const city = await getUserCity()

  const [popularResult] = await Promise.all([
    getPopularVenues(city ?? undefined),
  ])

  const popularVenues = popularResult.success ? popularResult.venues || [] : []

  return (
    <div>
      {/* Hero Section — full-screen 100vh, bottom of illustration visible */}
      <div data-hero className="relative -mt-16 min-h-screen">
        <Image
          src="/new_new_hero_section.png"
          alt="Sports venue park illustration"
          fill
          priority
          className="object-cover object-bottom"
          sizes="100vw"
        />
        <div className="relative flex flex-col items-center justify-center min-h-screen -translate-y-[180px] pt-16 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40">
          <div className="space-y-4 max-w-2xl text-center mb-8">
            <h1 className="font-display text-[58px] leading-[110%] tracking-[-0.05em] font-normal text-white">
              Find the venues,
              <br />
              and players nearby
            </h1>
            <p className="font-display text-[18px] leading-[130%] tracking-[-0.03em] font-normal text-white/80">
              Seamlessly explore sports venues and play
              <br />
              with sports enthusiasts just like you
            </p>
          </div>
          <DashboardSearch initialLocation="" city={city} />
        </div>
      </div>

      {/* Explore Sports — directly below hero */}
      <ExploreSports />

      {/* Popular Venues */}
      <HomepageVenueGrid
        title="Popular Venues"
        venues={popularVenues}
        emptyMessage="No venues available"
        viewAllHref="/venues?status=approved"
      />

      {/* CTA — Own a venue */}
      <VenueCTA />
    </div>
  );
}

export default page