'use client'

import React, { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function ScrollRow({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hasOverflow, setHasOverflow] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const check = () => setHasOverflow(el.scrollWidth > el.clientWidth)

    check()
    const observer = new ResizeObserver(check)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const cardWidth = 160
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth',
    })
  }

  const showArrows = hasOverflow && isDesktop

  return (
    <div className="relative">
      {showArrows && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 size-7 md:size-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors -ml-2 md:-ml-3"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-600" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-none py-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {children}
      </div>

      {showArrows && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 size-7 md:size-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors -mr-2 md:-mr-3"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-600" />
        </button>
      )}
    </div>
  )
}