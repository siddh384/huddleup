import React from 'react'
import { getCurrentUser } from '@/lib/actions/users'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { MapPin, ArrowLeft, Users, Clock, Settings, Building } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import BookingDialog from '@/components/booking-dialog'
import ReviewsSection from '@/components/reviews-section'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

// Dummy venue details (matches homepage DUMMY_VENUES ids)
const DUMMY_VENUE_DETAILS: Record<string, {
    id: string
    name: string
    location: string
    description: string
    address: string
    images: string[]
    amenities: string[]
    rating: string
    reviewCount: number
    ownerId: string
    owner: { id: string; name: string; email: string }
    venueSports: Array<{ sportId: string; sport: { id: string; name: string } }>
    courts: Array<{
        id: string
        name: string
        sport: { id: string; name: string }
        pricePerHour: string
        operatingHoursStart: string
        operatingHoursEnd: string
    }>
    reviews: Array<{
        id: string
        rating: number
        comment: string | null
        createdAt: string
        user: { id: string; name: string | null; image: string | null }
    }>
}> = {
    '1': {
        id: '1',
        name: 'City Sports Arena',
        location: 'Downtown, New York',
        description: 'A premier multi-sport facility in the heart of downtown. Perfect for football and basketball enthusiasts.',
        address: '123 Main Street, New York, NY 10001',
        images: ['/venues/venue1.png'],
        amenities: ['Parking', 'Changing Rooms', 'Cafeteria', 'WiFi', 'Air Conditioned'],
        rating: '4.8',
        reviewCount: 124,
        ownerId: 'owner-1',
        owner: { id: 'owner-1', name: 'John Smith', email: 'john@citysports.com' },
        venueSports: [
            { sportId: 's1', sport: { id: 's1', name: 'Football' } },
            { sportId: 's2', sport: { id: 's2', name: 'Basketball' } },
        ],
        courts: [
            { id: 'court-1-1', name: 'Court A', sport: { id: 's1', name: 'Football' }, pricePerHour: '50', operatingHoursStart: '09:00', operatingHoursEnd: '22:00' },
            { id: 'court-1-2', name: 'Court B', sport: { id: 's2', name: 'Basketball' }, pricePerHour: '50', operatingHoursStart: '09:00', operatingHoursEnd: '22:00' },
        ],
        reviews: [],
    },
    '2': {
        id: '2',
        name: 'Green Field Club',
        location: 'Brooklyn, New York',
        description: 'Spacious outdoor and indoor facilities for cricket and football. Ideal for weekend matches.',
        address: '456 Park Ave, Brooklyn, NY 11201',
        images: ['/venues/venue2.png'],
        amenities: ['Parking', 'Showers', 'Equipment Rental', 'Seating Area'],
        rating: '4.5',
        reviewCount: 89,
        ownerId: 'owner-2',
        owner: { id: 'owner-2', name: 'Sarah Johnson', email: 'sarah@greenfield.com' },
        venueSports: [
            { sportId: 's3', sport: { id: 's3', name: 'Cricket' } },
            { sportId: 's1', sport: { id: 's1', name: 'Football' } },
        ],
        courts: [
            { id: 'court-2-1', name: 'Cricket Pitch', sport: { id: 's3', name: 'Cricket' }, pricePerHour: '35', operatingHoursStart: '08:00', operatingHoursEnd: '20:00' },
            { id: 'court-2-2', name: 'Football Field', sport: { id: 's1', name: 'Football' }, pricePerHour: '35', operatingHoursStart: '08:00', operatingHoursEnd: '20:00' },
        ],
        reviews: [],
    },
    '3': {
        id: '3',
        name: 'Ace Tennis Courts',
        location: 'Manhattan, New York',
        description: 'Premium tennis and squash courts with professional-grade surfaces.',
        address: '789 Fifth Ave, Manhattan, NY 10022',
        images: ['/venues/venue1.png'],
        amenities: ['Pro Shop', 'Coaching', 'Parking', 'Locker Rooms'],
        rating: '4.9',
        reviewCount: 156,
        ownerId: 'owner-3',
        owner: { id: 'owner-3', name: 'Mike Davis', email: 'mike@acetennis.com' },
        venueSports: [
            { sportId: 's4', sport: { id: 's4', name: 'Tennis' } },
            { sportId: 's5', sport: { id: 's5', name: 'Squash' } },
        ],
        courts: [
            { id: 'court-3-1', name: 'Tennis Court 1', sport: { id: 's4', name: 'Tennis' }, pricePerHour: '60', operatingHoursStart: '07:00', operatingHoursEnd: '23:00' },
            { id: 'court-3-2', name: 'Squash Court A', sport: { id: 's5', name: 'Squash' }, pricePerHour: '60', operatingHoursStart: '07:00', operatingHoursEnd: '23:00' },
        ],
        reviews: [],
    },
    '4': {
        id: '4',
        name: 'Splash Aquatic Center',
        location: 'Queens, New York',
        description: 'State-of-the-art swimming facility with Olympic-size pool and training lanes.',
        address: '321 Ocean Dr, Queens, NY 11375',
        images: ['/venues/venue1.png'],
        amenities: ['Pool', 'Sauna', 'Parking', 'Swim Shop'],
        rating: '4.6',
        reviewCount: 72,
        ownerId: 'owner-4',
        owner: { id: 'owner-4', name: 'Emma Wilson', email: 'emma@splash.com' },
        venueSports: [{ sportId: 's6', sport: { id: 's6', name: 'Swimming' } }],
        courts: [
            { id: 'court-4-1', name: 'Main Pool', sport: { id: 's6', name: 'Swimming' }, pricePerHour: '40', operatingHoursStart: '06:00', operatingHoursEnd: '21:00' },
        ],
        reviews: [],
    },
    '5': {
        id: '5',
        name: 'Smash Badminton Hall',
        location: 'Bronx, New York',
        description: 'Dedicated badminton and table tennis facility with multiple courts.',
        address: '555 Sport Lane, Bronx, NY 10451',
        images: ['/venues/venue1.png'],
        amenities: ['Equipment Rental', 'Parking', 'Cafeteria'],
        rating: '4.3',
        reviewCount: 45,
        ownerId: 'owner-5',
        owner: { id: 'owner-5', name: 'David Lee', email: 'david@smash.com' },
        venueSports: [
            { sportId: 's7', sport: { id: 's7', name: 'Badminton' } },
            { sportId: 's8', sport: { id: 's8', name: 'Table Tennis' } },
        ],
        courts: [
            { id: 'court-5-1', name: 'Court 1', sport: { id: 's7', name: 'Badminton' }, pricePerHour: '25', operatingHoursStart: '09:00', operatingHoursEnd: '22:00' },
            { id: 'court-5-2', name: 'Court 2', sport: { id: 's7', name: 'Badminton' }, pricePerHour: '25', operatingHoursStart: '09:00', operatingHoursEnd: '22:00' },
        ],
        reviews: [],
    },
    '6': {
        id: '6',
        name: 'Spike Volleyball Complex',
        location: 'Staten Island, New York',
        description: 'Indoor and outdoor volleyball courts for all skill levels.',
        address: '100 Beach Rd, Staten Island, NY 10301',
        images: ['/venues/venue1.png'],
        amenities: ['Parking', 'Changing Rooms', 'Net Rental'],
        rating: '4.7',
        reviewCount: 63,
        ownerId: 'owner-6',
        owner: { id: 'owner-6', name: 'Lisa Chen', email: 'lisa@spike.com' },
        venueSports: [{ sportId: 's9', sport: { id: 's9', name: 'Volleyball' } }],
        courts: [
            { id: 'court-6-1', name: 'Indoor Court', sport: { id: 's9', name: 'Volleyball' }, pricePerHour: '45', operatingHoursStart: '10:00', operatingHoursEnd: '21:00' },
        ],
        reviews: [],
    },
    '7': {
        id: '7',
        name: 'Hoops Basketball Center',
        location: 'Jersey City, New Jersey',
        description: 'Full-size basketball courts with professional flooring.',
        address: '200 Hoops Way, Jersey City, NJ 07302',
        images: ['/venues/venue1.png'],
        amenities: ['Parking', 'Scoreboard', 'Locker Rooms'],
        rating: '4.4',
        reviewCount: 38,
        ownerId: 'owner-7',
        owner: { id: 'owner-7', name: 'James Brown', email: 'james@hoops.com' },
        venueSports: [{ sportId: 's10', sport: { id: 's10', name: 'Basketball' } }],
        courts: [
            { id: 'court-7-1', name: 'Main Court', sport: { id: 's10', name: 'Basketball' }, pricePerHour: '30', operatingHoursStart: '08:00', operatingHoursEnd: '22:00' },
        ],
        reviews: [],
    },
    '8': {
        id: '8',
        name: 'Premier Cricket Ground',
        location: 'Newark, New Jersey',
        description: 'Professional cricket ground with turf wickets and pavilion.',
        address: '888 Cricket Ave, Newark, NJ 07102',
        images: ['/venues/venue1.png'],
        amenities: ['Pavilion', 'Parking', 'Scoreboard', 'Catering'],
        rating: '4.6',
        reviewCount: 91,
        ownerId: 'owner-8',
        owner: { id: 'owner-8', name: 'Raj Patel', email: 'raj@premiercricket.com' },
        venueSports: [{ sportId: 's3', sport: { id: 's3', name: 'Cricket' } }],
        courts: [
            { id: 'court-8-1', name: 'Main Ground', sport: { id: 's3', name: 'Cricket' }, pricePerHour: '55', operatingHoursStart: '07:00', operatingHoursEnd: '19:00' },
        ],
        reviews: [],
    },
};

interface VenueDetailsPageProps {
    params: Promise<{
        id: string
    }>
}

const VenueDetailsPage = async ({ params }: VenueDetailsPageProps) => {
    const resolvedParams = await params
    const venue = DUMMY_VENUE_DETAILS[resolvedParams.id]

    if (!venue) {
        notFound()
    }

    // Get current user to check if they own this venue (for management buttons - disabled with dummy data)
    const userResult = await getCurrentUser()
    const user = userResult.success ? userResult.user : null
    const isVenueOwner = false // Dummy data: no real ownership check

    // Sport name to image mapping
    const SPORT_IMAGE_MAP: Record<string, string> = {
        'squash': '/sports/squash-s.png',
        'basketball': '/sports/basketball.png',
        'tennis': '/sports/tennis.png',
        'cricket': '/sports/cricket.png',
        'badminton': '/sports/badminton.png',
        'volleyball': '/sports/volleyball.png',
        'table tennis': '/sports/tennis.png', // Using tennis as fallback
        'football': '/sports/football.png',
        'swimming': '/sports/swimming.png'
    }

    return (
        <div className="container mx-auto p-6">
            {/* Header with Navigation */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <Link href="/venues">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Venues
                        </Button>
                    </Link>

                    {/* Management Buttons for Venue Owner */}
                    {isVenueOwner && (
                        <div className="flex items-center gap-2">
                            <Link href={`/venues/${venue.id}/courts`}>
                                <Button variant="outline" size="sm">
                                    <Building className="w-4 h-4 mr-2" />
                                    Manage Courts
                                </Button>
                            </Link>
                            <Link href={`/venues/${venue.id}/edit`}>
                                <Button variant="outline" size="sm">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Edit Venue
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content - 50/50 Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
                {/* Left Column - Image Carousel (50%) */}
                <div className="flex items-center justify-center">
                    {venue.images && venue.images.length > 0 ? (
                        <Carousel
                            className="w-full max-w-2xl"
                            opts={{
                                align: "start",
                                loop: true,
                                dragFree: true,
                                containScroll: "trimSnaps"
                            }}
                        >
                            <CarouselContent>
                                <CarouselItem>
                                    <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-black">
                                        <video
                                            src="/video.mp4"
                                            controls
                                            className="w-full h-full object-cover"
                                            playsInline
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                </CarouselItem>
                                {venue.images.map((image, index) => (
                                    <CarouselItem key={index}>
                                        <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden">
                                            <Image
                                                src={image}
                                                alt={`${venue.name} - Image ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    ) : (
                        <div className="flex items-center justify-center w-full h-96 bg-muted rounded-lg">
                            <p className="text-muted-foreground">No images available</p>
                        </div>
                    )}
                </div>

                {/* Right Column - Venue Details (50%) */}
                <div className="space-y-6">
                    {/* Venue Header */}
                    <div>
                        <h1 className="text-4xl font-bold mb-4">{venue.name}</h1>
                        <div className="flex items-center text-muted-foreground mb-4">
                            <MapPin className="w-5 h-5 mr-2" />
                            <span className="text-lg">{venue.location}</span>
                        </div>
                        {venue.description && (
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                {venue.description}
                            </p>
                        )}
                    </div>

                    {/* Location Details */}
                    <div className="space-y-3">
                        <h3 className="text-xl font-semibold flex items-center">
                            <MapPin className="w-5 h-5 mr-2" />
                            Location
                        </h3>
                        <div className="ml-7 space-y-2">
                            <div>
                                <span className="font-medium">Address: </span>
                                <span className="text-muted-foreground">{venue.address}</span>
                            </div>
                            <div>
                                <span className="font-medium">Area: </span>
                                <span className="text-muted-foreground">{venue.location}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sports Available */}
                    <div className="space-y-3">
                        <h3 className="text-xl font-semibold flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            Sports Available
                        </h3>
                        <div className="ml-7">
                            {venue.venueSports && venue.venueSports.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {venue.venueSports.map((venueSport) => (
                                        <Badge key={venueSport.sportId} variant="secondary" className="text-sm">
                                            {venueSport.sport.name}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No sports listed</p>
                            )}
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="space-y-3">
                        <h3 className="text-xl font-semibold">Amenities</h3>
                        <div className="ml-7">
                            {venue.amenities && venue.amenities.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {venue.amenities.map((amenity, index) => (
                                        <div key={index} className="flex items-center">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                            <span>{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No amenities listed</p>
                            )}
                        </div>
                    </div>



                    {/* Owner Info */}
                    <div className="space-y-3">
                        <h3 className="text-xl font-semibold">Venue Owner</h3>
                        <div className="ml-7 space-y-1">
                            <p className="font-medium">{venue.owner.name}</p>
                            <p className="text-muted-foreground">{venue.owner.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Courts Grid Section */}
            {venue.courts && venue.courts.length > 0 && (
                <div className="mt-12">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2">Available Courts</h2>
                        <p className="text-muted-foreground">Choose from our available courts and book your game</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {venue.courts.map((court) => {
                            // Get sport image based on sport name
                            const sportKey = court.sport.name.toLowerCase()
                            const sportImage = SPORT_IMAGE_MAP[sportKey] || '/court.png'

                            return (
                                <Card key={court.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col p-0">
                                    {/* Court Image */}
                                    <div className="relative w-full aspect-[4/3]">
                                        <Image
                                            src={sportImage}
                                            alt={court.sport.name}
                                            fill
                                            className="object-cover"
                                        />

                                        {/* Sport Badge */}
                                        <div className="absolute top-3 right-3">
                                            <Badge
                                                variant="secondary"
                                                className="bg-background/90 backdrop-blur-sm"
                                            >
                                                {court.sport.name}
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardContent className="p-6 flex flex-col flex-grow">
                                        {/* Court Name and Details */}
                                        <div className="mb-4">
                                            <h3 className="text-2xl font-bold mb-2">{court.name}</h3>
                                            <div className="flex items-center text-muted-foreground mb-3">
                                                <Clock className="h-4 w-4 mr-1" />
                                                <span className="text-sm">{court.operatingHoursStart} - {court.operatingHoursEnd}</span>
                                            </div>
                                        </div>

                                        {/* Price Display */}
                                        <div className="mb-4">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-bold text-primary">₹{court.pricePerHour}</span>
                                                <span className="text-sm text-muted-foreground">/hour</span>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="mb-4">
                                            <Badge variant="outline" className="text-xs">
                                                Available
                                            </Badge>
                                        </div>

                                        {/* Spacer to push button to bottom */}
                                        <div className="flex-grow"></div>

                                        {/* Book Now Button */}
                                        <BookingDialog
                                            courtId={court.id}
                                            courtName={court.name}
                                            sportName={court.sport.name}
                                            pricePerHour={court.pricePerHour}
                                            venueName={venue.name}
                                            venueLocation={venue.location}
                                        >
                                            <Button className="w-full mt-4">
                                                Book Now
                                            </Button>
                                        </BookingDialog>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Reviews Section */}
            <ReviewsSection
                venueId={venue.id}
                initialAverageRating={venue.rating}
                initialReviewCount={venue.reviewCount}
                initialReviews={venue.reviews as any}
            />
        </div>
    )
}

export default VenueDetailsPage
