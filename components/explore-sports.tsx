import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getAllSports } from '@/lib/actions/venues'
import { ScrollRow } from './explore-sports-scroll'

/** Map of known cover images. Key = the exact DB sport.name. Value = filename in /Sports-Cover/ */
const COVER_MAP: Record<string, string> = {
  'Badminton': 'badminton-cover.png',
  'Cricket': 'cricket-cover.png',
  'Football': 'football-cover.png',
  'Pickleball': 'pickleball-cover.png',
  'Snooker': 'snooker-cover.png',
  'Swimming': 'swimming-cover.png',
  'Table Tennis': 'tabletennis-cover.png',
  'Tennis': 'tennis-cover.png',
}

export async function ExploreSports() {
  const result = await getAllSports()
  if (!result.success || !result.sports || result.sports.length === 0) {
    return null
  }

  const sportsWithCovers = result.sports
    .map((sport) => ({
      id: sport.id,
      name: sport.name,
      coverPath: COVER_MAP[sport.name] ? `/Sports-Cover/${COVER_MAP[sport.name]}` : null,
    }))
    .filter((s): s is typeof s & { coverPath: string } => s.coverPath !== null)

  if (sportsWithCovers.length === 0) return null

  const cards = sportsWithCovers.map((sport) => (
    <Link
      key={sport.id}
      href={`/venues?sport=${sport.id}&status=approved`}
      className="group shrink-0"
    >
      <div className="w-[124px] sm:w-[140px]">
        <div className="aspect-[4/5] relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          <Image
            src={sport.coverPath}
            alt={sport.name}
            fill
            sizes="140px"
            className="object-cover object-center"
          />
        </div>
        <p className="mt-1.5 text-[13px] font-medium text-gray-800 leading-tight truncate">
          {sport.name}
        </p>
      </div>
    </Link>
  ))

  return (
    <section className="px-4 sm:px-6 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Explore Sports</h2>
        <p className="text-sm text-gray-500 mt-0.5">Find venues for your favorite sports</p>
      </div>
      <ScrollRow>{cards}</ScrollRow>
    </section>
  )
}