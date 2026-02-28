'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { MapPin } from 'lucide-react'

interface DashboardSearchProps {
    initialLocation?: string
}

export function DashboardSearch({ initialLocation = '' }: DashboardSearchProps) {
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
        <form onSubmit={handleSubmit} className="relative mb-8 w-full max-w-xl">
            <div className="relative flex items-center bg-white rounded-full shadow-lg border border-gray-200 px-4 py-3 hover:shadow-xl transition-shadow duration-200">
                <MapPin className="text-gray-400 h-5 w-5 mr-3" />
                <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search destinations"
                    className="flex-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent text-lg font-medium pr-4"
                />
                <button 
                    type="submit"
                    className="flex items-center justify-center bg-primary hover:bg-primary/80 rounded-full p-3 transition-colors duration-200"
                >
                    <Search className="text-white h-5 w-5" />
                </button>
            </div>
        </form>
    )
}
