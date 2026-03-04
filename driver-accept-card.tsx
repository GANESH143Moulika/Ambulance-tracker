'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Phone, Star, MapPin, Clock, Navigation, Check, X, Loader2 } from 'lucide-react'
import { Ambulance, Booking } from '@/store/app-store'

interface DriverAcceptCardProps {
  booking: Booking
  ambulance: Ambulance
  onAccept: () => Promise<void>
  onReject: () => Promise<void>
}

export default function DriverAcceptCard({
  booking,
  ambulance,
  onAccept,
  onReject
}: DriverAcceptCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [action, setAction] = useState<'accept' | 'reject' | null>(null)

  const handleAction = async (accept: boolean) => {
    setIsLoading(true)
    setAction(accept ? 'accept' : 'reject')
    try {
      if (accept) {
        await onAccept()
      } else {
        await onReject()
      }
    } catch (error) {
      console.error('Failed to respond:', error)
    } finally {
      setIsLoading(false)
      setAction(null)
    }
  }

  return (
    <Card className="border-2 border-green-500 overflow-hidden">
      <div className="bg-green-500 text-white p-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          <span className="font-bold text-lg">Driver Found!</span>
        </div>
      </div>
      
      <CardContent className="p-4">
        {/* Driver Info */}
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16 border-2 border-green-500">
            <AvatarImage src={ambulance.driverPhoto || ''} />
            <AvatarFallback className="bg-green-100 text-green-700 text-xl font-bold">
              {ambulance.driverName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{ambulance.driverName}</h3>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Verified
              </Badge>
            </div>
            <p className="text-gray-500">{ambulance.vehicleNumber}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold">{ambulance.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-gray-400">({ambulance.totalRides} rides)</span>
            </div>
          </div>
        </div>

        {/* Pickup Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 bg-green-50 rounded-lg p-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-green-800">Pickup Location</p>
              <p className="text-sm text-green-600">{booking.pickupAddress || 'Location pending'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <span>Distance: {booking.distance} km</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Navigation className="h-4 w-4 text-purple-600" />
            </div>
            <span>Emergency: {booking.emergencyType}</span>
          </div>
        </div>

        {booking.notes && (
          <div className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800 mb-4">
            <p className="font-medium mb-1">Additional Notes:</p>
            <p className="text-yellow-700">{booking.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 h-12" 
            onClick={() => handleAction(false)}
            disabled={isLoading}
          >
            {isLoading && action === 'reject' ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <X className="h-5 w-5 mr-2" />
            )}
            Decline
          </Button>
          <Button 
            className="flex-1 h-12 bg-green-600 hover:bg-green-700" 
            onClick={() => handleAction(true)}
            disabled={isLoading}
          >
            {isLoading && action === 'accept' ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Check className="h-5 w-5 mr-2" />
            )}
            Accept Ride
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
