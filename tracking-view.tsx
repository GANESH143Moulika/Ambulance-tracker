'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Phone, 
  Star, 
  MapPin, 
  Navigation,
  CheckCircle,
  Building2,
  X,
  MessageCircle,
  Shield,
  RefreshCw
} from 'lucide-react'
import { Booking, Hospital } from '@/store/app-store'

interface TrackingViewProps {
  booking: Booking | null
  hospital: Hospital | null
  onConfirmOTP: (otp: string) => Promise<void>
  onCancel: () => void
  onUpdateStatus: (status: string) => Promise<void>
  onRefresh: () => Promise<void>
  onBookNew?: () => void
}

export default function TrackingView({
  booking,
  hospital,
  onConfirmOTP,
  onCancel,
  onUpdateStatus,
  onRefresh,
  onBookNew
}: TrackingViewProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Auto-progress simulation for demo
  useEffect(() => {
    if (!booking?.id) return
    
    if (booking.status === 'AMBULANCE_ASSIGNED') return
    
    const statusOrder = ['DRIVER_ACCEPTED', 'ARRIVING', 'ARRIVED', 'PATIENT_PICKED', 'EN_ROUTE_HOSPITAL', 'ARRIVED_HOSPITAL', 'COMPLETED']
    const currentIndex = statusOrder.indexOf(booking.status)
    
    if (currentIndex < statusOrder.length - 1 && booking.status !== 'CANCELLED') {
      let delay = 15000
      
      if (booking.status === 'ARRIVED') {
        delay = 8000
      } else if (booking.status === 'ARRIVED_HOSPITAL') {
        delay = 5000
      }
      
      const timer = setTimeout(() => {
        const nextStatus = statusOrder[currentIndex + 1]
        onUpdateStatus(nextStatus).catch(() => {
          // Silently ignore errors
        })
      }, delay)
      
      return () => clearTimeout(timer)
    }
  }, [booking?.id, booking?.status])

  if (!booking) return null

  const driver = booking.ambulance

  const getStatusMessage = () => {
    switch (booking.status) {
      case 'AMBULANCE_ASSIGNED': return 'Waiting for driver to accept...'
      case 'DRIVER_ACCEPTED': return 'Driver accepted! Coming to pick you up'
      case 'ARRIVING': return 'Driver is nearby!'
      case 'ARRIVED': return 'Driver has arrived at pickup location'
      case 'PATIENT_PICKED': return 'Patient picked up, heading to hospital'
      case 'EN_ROUTE_HOSPITAL': return 'On the way to hospital'
      case 'ARRIVED_HOSPITAL': return 'Arrived at hospital!'
      case 'COMPLETED': return 'Trip completed successfully!'
      default: return 'Processing...'
    }
  }

  const getStatusColor = () => {
    if (booking.status === 'COMPLETED') return 'bg-green-500'
    if (['AMBULANCE_ASSIGNED', 'DRIVER_ACCEPTED'].includes(booking.status)) return 'bg-yellow-500'
    if (['ARRIVING', 'ARRIVED'].includes(booking.status)) return 'bg-blue-500'
    if (['PATIENT_PICKED', 'EN_ROUTE_HOSPITAL', 'ARRIVED_HOSPITAL'].includes(booking.status)) return 'bg-purple-500'
    return 'bg-gray-500'
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Booking Status</h2>
            <p className="text-xs text-gray-500">{getStatusMessage()}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Current Status Badge */}
      <div className="bg-white border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor()}`}>
            {booking.status === 'COMPLETED' ? (
              <CheckCircle className="h-6 w-6 text-white" />
            ) : (
              <Navigation className="h-6 w-6 text-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="font-bold text-gray-800">
              {booking.status.replace(/_/g, ' ')}
            </div>
            <div className="text-sm text-gray-500">{getStatusMessage()}</div>
          </div>
        </div>
      </div>

      {/* Driver Card */}
      {driver && (
        <div className="bg-white border-b">
          <div className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-green-500">
                <AvatarImage src={driver.driverPhoto || ''} />
                <AvatarFallback className="bg-green-100 text-green-700 text-xl font-bold">
                  {driver.driverName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-gray-800">{driver.driverName}</h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <p className="text-gray-500">{driver.vehicleNumber}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{driver.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-500">{driver.totalRides}+ rides</span>
                </div>
              </div>
            </div>
            
            {/* Call/Chat Buttons */}
            <div className="flex gap-2 mt-4">
              <Button className="flex-1 bg-green-500 hover:bg-green-600">
                <Phone className="h-4 w-4 mr-2" />
                Call Driver
              </Button>
              <Button variant="outline" className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
            
            {/* Trip Info */}
            <div className="mt-4 p-4 bg-green-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Distance</p>
                    <p className="text-2xl font-bold text-green-600">{booking.distance || '0'} km</p>
                  </div>
                </div>
                <div className="text-right">
                  {booking.fare && (
                    <>
                      <p className="text-sm text-gray-500">Fare</p>
                      <p className="text-xl font-bold text-gray-800">₹{(booking.fare * 80).toFixed(0)}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hospital Info */}
      {['EN_ROUTE_HOSPITAL', 'ARRIVED_HOSPITAL'].includes(booking.status) && hospital && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-blue-800 text-lg">Heading to Hospital</h4>
                <p className="text-sm text-blue-700">{hospital.name}</p>
                <p className="text-xs text-blue-600">{hospital.address}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completed */}
      {booking.status === 'COMPLETED' && (
        <div className="bg-green-100 border-b border-green-300">
          <div className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-800">Trip Completed!</h3>
            <p className="text-green-600 mb-4">Thank you for using our service</p>
            {booking.fare && (
              <div className="bg-white rounded-xl p-4 inline-block shadow">
                <p className="text-sm text-gray-500">Total Fare</p>
                <p className="text-2xl font-bold text-gray-800">₹{(booking.fare * 80).toFixed(0)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-auto bg-white border-t p-4">
        {booking.status === 'COMPLETED' ? (
          <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg" onClick={onBookNew}>
            <Navigation className="h-5 w-5 mr-2" />
            Book New Ride
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {['AMBULANCE_ASSIGNED', 'DRIVER_ACCEPTED'].includes(booking.status) && (
              <Button variant="destructive" className="flex-1" onClick={onCancel}>
                Cancel Ride
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
