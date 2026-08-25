import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function VenueCTA() {
  return (
    <section className="px-4 sm:px-6 md:px-8 py-12 md:py-16 max-w-7xl mx-auto">
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 px-6 py-10 md:px-12 md:py-12 text-center md:text-left md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Own a sports venue?</h2>
          <p className="mt-2 text-sm md:text-base text-gray-600 max-w-md">
            List your venue on HuddleUp and reach thousands of sports enthusiasts looking for places to play.
          </p>
        </div>
        <div className="mt-5 md:mt-0 shrink-0">
          <Button asChild size="lg" className="rounded-full px-6">
            <Link href="/create-venue">
              List your venue &rarr;
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}