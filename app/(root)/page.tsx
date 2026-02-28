import React from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { DashboardSearch } from '@/components/dashboard-search'
import { VenueCard } from '@/components/venue-card'
import { CardCarousel } from '@/components/ui/card-carousel'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

// Sport name to UUID mapping
const SPORT_UUID_MAP: Record<string, string> = {
  'squash': '256b9b2d-cae5-45b6-93be-179f98552412',
  'pickleball': '3f51c1f6-71c7-4356-92c5-6fb12a4ca3af',
  'tennis': 'ab7649a4-7e8c-4e87-b750-6b89180eadfe',
  'cricket': '4ea57b25-fba7-49bc-8434-8c9ae383706c',
  'volleyball': 'f1b0335b-db67-4df9-9053-868f26fa2628',
  'football': '933b451e-d65b-4347-a513-b193794c2e23',
  'swimming': 'cec42a87-92ce-47a3-aab4-c9c3b3537225'
}

// Dummy venues data
const DUMMY_VENUES = [
  {
    id: '1',
    name: 'City Sports Arena',
    location: 'Downtown, New York',
    price: 50,
    rating: 4.8,
    images: ['/venues/venue1.png'],
    sports: ['Football', 'Basketball'],
    status: 'approved',
  },
  {
    id: '2',
    name: 'Green Field Club',
    location: 'Brooklyn, New York',
    price: 35,
    rating: 4.5,
    images: ['/venues/venue2.png'],
    sports: ['Cricket', 'Football'],
    status: 'approved',
  },
  {
    id: '3',
    name: 'Ace Tennis Courts',
    location: 'Manhattan, New York',
    price: 60,
    rating: 4.9,
    images: ['/venues/venue1.png'],
    sports: ['Tennis', 'Squash'],
    status: 'approved',
  },
  {
    id: '4',
    name: 'Splash Aquatic Center',
    location: 'Queens, New York',
    price: 40,
    rating: 4.6,
    images: ['/venues/venue1.png'],
    sports: ['Swimming'],
    status: 'approved',
  },
  {
    id: '5',
    name: 'Smash Badminton Hall',
    location: 'Bronx, New York',
    price: 25,
    rating: 4.3,
    images: ['/venues/venue1.png'],
    sports: ['Badminton', 'Table Tennis'],
    status: 'approved',
  },
  {
    id: '6',
    name: 'Spike Volleyball Complex',
    location: 'Staten Island, New York',
    price: 45,
    rating: 4.7,
    images: ['/venues/venue1.png'],
    sports: ['Volleyball'],
    status: 'approved',
  },
  {
    id: '7',
    name: 'Hoops Basketball Center',
    location: 'Jersey City, New Jersey',
    price: 30,
    rating: 4.4,
    images: ['/venues/venue1.png'],
    sports: ['Basketball'],
    status: 'approved',
  },
  {
    id: '8',
    name: 'Premier Cricket Ground',
    location: 'Newark, New Jersey',
    price: 55,
    rating: 4.6,
    images: ['/venues/venue1.png'],
    sports: ['Cricket'],
    status: 'approved',
  },
]

const page = async () => {
  const venues = DUMMY_VENUES

  return (
    <div>
      {/* Hero Section */}
      <div className="relative min-h-[600px] border-b">
        {/* Background Image */}
        <Image
          src="/football-hero-section.webp"
          alt="Court"
          fill
          className="object-cover brightness-70"
        />

        {/* Content Overlay - Centered */}
        <div className="relative flex flex-col items-center justify-center min-h-[600px] px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40">
          {/* Search Bar */}
          <DashboardSearch initialLocation="" />

          {/* Content - Centered */}
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

      {/* Venues Section */}
      <div className="px-4 mt-8 sm:px-6 md:px-8 py-6 md:py-8">
        {/* Section Header */}
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">
                Featured Venues
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Discover and book amazing venues near you
              </p>
            </div>
            <Link href="/venues">
              <Button variant="link" className="text-sm p-0">
                See all venues &gt;
              </Button>
            </Link>
          </div>
        </div>

        {/* Venue Cards Carousel */}
        {venues.length > 0 ? (
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
                venue={venue}
                variant="compact"
              />
            ))}
          </CardCarousel>
        ) : (
          <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
            No venues available
          </div>
        )}
      </div>

      {/* Popular Sports Section */}
      <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8">
        {/* Section Header */}
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Recently Visited </h2>

        {/* Sports Carousel */}
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {[
                { name: "Badminton", image: "/sports/badminton.png" },
                { name: "Basketball", image: "/sports/basketball.png" },
                { name: "Cricket", image: "/sports/cricket.png" },
                { name: "Football", image: "/sports/football.png" },
                { name: "Pickleball", image: "/sports/pickleball.png" },
                { name: "Squash", image: "/sports/squash-s.png" },
                { name: "Swimming", image: "/sports/swimming.png" },
                { name: "Tennis", image: "/sports/tennis.png" },
                { name: "Volleyball", image: "/sports/volleyball.png" }
              ].map((sport, index) => {
                const sportKey = sport.name.toLowerCase()
                const sportUuid = SPORT_UUID_MAP[sportKey]

                const venuesUrl = sportUuid
                  ? `/venues?sport=${sportUuid}&status=approved`
                  : '/venues?status=approved'

                return (
                  <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                    <Link href={venuesUrl}>
                      <div className="relative rounded-lg overflow-hidden h-32 sm:h-40 md:h-48 cursor-pointer group">
                        <Image
                          src={sport.image}
                          alt={sport.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
                          <span className="text-white font-medium text-xs sm:text-sm">{sport.name}</span>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
            <CarouselPrevious className="left-1 sm:left-2 hidden sm:flex" />
            <CarouselNext className="right-1 sm:right-2 hidden sm:flex" />
          </Carousel>
        </div>
      </div>
      <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8">
        {/* Section Header */}
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Recommended Sports</h2>

        {/* Sports Carousel */}
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {[
                { name: "Badminton", image: "/sports/badminton.png" },
                { name: "Basketball", image: "/sports/basketball.png" },
                { name: "Cricket", image: "/sports/cricket.png" },
                { name: "Football", image: "/sports/football.png" },
                { name: "Pickleball", image: "/sports/pickleball.png" },
                { name: "Squash", image: "/sports/squash-s.png" },
                { name: "Swimming", image: "/sports/swimming.png" },
                { name: "Tennis", image: "/sports/tennis.png" },
                { name: "Volleyball", image: "/sports/volleyball.png" }
              ].map((sport, index) => {
                const sportKey = sport.name.toLowerCase()
                const sportUuid = SPORT_UUID_MAP[sportKey]

                const venuesUrl = sportUuid
                  ? `/venues?sport=${sportUuid}&status=approved`
                  : '/venues?status=approved'

                return (
                  <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                    <Link href={venuesUrl}>
                      <div className="relative rounded-lg overflow-hidden h-32 sm:h-40 md:h-48 cursor-pointer group">
                        <Image
                          src={sport.image}
                          alt={sport.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
                          <span className="text-white font-medium text-xs sm:text-sm">{sport.name}</span>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
            <CarouselPrevious className="left-1 sm:left-2 hidden sm:flex" />
            <CarouselNext className="right-1 sm:right-2 hidden sm:flex" />
          </Carousel>
        </div>
      </div>
      <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8">
        {/* Section Header */}
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Popular Sports</h2>

        {/* Sports Carousel */}
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {[
                { name: "Badminton", image: "/sports/badminton.png" },
                { name: "Basketball", image: "/sports/basketball.png" },
                { name: "Cricket", image: "/sports/cricket.png" },
                { name: "Football", image: "/sports/football.png" },
                { name: "Pickleball", image: "/sports/pickleball.png" },
                { name: "Squash", image: "/sports/squash-s.png" },
                { name: "Swimming", image: "/sports/swimming.png" },
                { name: "Tennis", image: "/sports/tennis.png" },
                { name: "Volleyball", image: "/sports/volleyball.png" }
              ].map((sport, index) => {
                const sportKey = sport.name.toLowerCase()
                const sportUuid = SPORT_UUID_MAP[sportKey]

                const venuesUrl = sportUuid
                  ? `/venues?sport=${sportUuid}&status=approved`
                  : '/venues?status=approved'

                return (
                  <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                    <Link href={venuesUrl}>
                      <div className="relative rounded-lg overflow-hidden h-32 sm:h-40 md:h-48 cursor-pointer group">
                        <Image
                          src={sport.image}
                          alt={sport.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
                          <span className="text-white font-medium text-xs sm:text-sm">{sport.name}</span>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
            <CarouselPrevious className="left-1 sm:left-2 hidden sm:flex" />
            <CarouselNext className="right-1 sm:right-2 hidden sm:flex" />
          </Carousel>
        </div>
      </div>
    </div>
  )
}

export default page