import React from 'react'
import Link from 'next/link'
import { getAllSports } from '@/lib/actions/venues'

const SPORT_ICONS: Record<string, string> = {
  Cricket: '🏏',
  Football: '⚽',
  Badminton: '🏸',
  Tennis: '🎾',
  Pickleball: '🏓',
  Basketball: '🏀',
  Volleyball: '🏐',
  Swimming: '🏊',
}

export async function ExploreBySport() {
  const result = await getAllSports()
  if (!result.success || !result.sports || result.sports.length === 0) {
    return null
  }

  const sports = result.sports

  return (
    <section className="px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Explore by Sport</h2>
      <div className="flex flex-wrap gap-3">
        {sports.map((sport) => (
          <Link
            key={sport.id}
            href={`/venues?sport=${sport.id}&status=approved`}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5"
          >
            <span className="text-lg leading-none">{SPORT_ICONS[sport.name] || '•'}</span>
            {sport.name}
          </Link>
        ))}
      </div>
    </section>
  )
}