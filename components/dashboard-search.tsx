'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { CitySwitcher } from '@/components/city-switcher'
import { type City } from '@/lib/cities'

interface DashboardSearchProps {
    initialLocation?: string
    city?: City | null
}

export function DashboardSearch({ initialLocation = '', city }: DashboardSearchProps) {
    const [searchValue, setSearchValue] = useState(initialLocation)
    const router = useRouter()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchValue.trim()) {
            router.push(`/venues?location=${encodeURIComponent(searchValue.trim())}&status=approved`)
        } else {
            router.push('/venues?status=approved')
        }
    }

    return (
      <form onSubmit={handleSubmit} className="relative w-full max-w-[500px]">
        <div className="relative flex items-center bg-white rounded-full border border-gray-200/70 shadow-[0_4px_16px_rgba(0,0,0,0.10)] px-3.5 h-[54px] transition-all duration-200 gap-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400">
          {city && (
            <>
              <CitySwitcher
                currentCity={city}
                className="text-gray-900 font-medium border-0 shadow-none bg-transparent p-0 h-auto min-w-0 w-[125px] shrink-0 [&_svg]:text-gray-400"
              />
              <span className="w-px h-6 bg-gray-200/70 shrink-0" />
            </>
          )}
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search destinations"
            className="flex-1 outline-none text-gray-900 placeholder:text-gray-500 bg-transparent text-[15px] min-w-0"
          />
          <button
            type="submit"
            className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 active:scale-95 rounded-full size-[38px] transition-all duration-200 shrink-0"
          >
            <Search className="text-white h-[18px] w-[18px]" />
          </button>
        </div>
      </form>
    );
}