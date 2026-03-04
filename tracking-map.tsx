'use client'

import { Ambulance, Booking, Hospital } from '@/store/app-store'

interface TrackingMapProps {
  ambulance?: Ambulance | null
  booking: Booking | null
  hospital: Hospital | null
  showRoute: 'pickup' | 'hospital'
  isCompleted?: boolean
}

export default function TrackingMap({
  ambulance,
  booking,
  hospital,
  showRoute,
  isCompleted
}: TrackingMapProps) {
  return (
    <div className="h-full w-full bg-gradient-to-b from-green-50 to-white flex flex-col">
      {/* Top Status Bar */}
      <div className="bg-white shadow-md px-4 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase">
              {isCompleted ? 'Trip Completed' : 'Booking Confirmed'}
            </div>
            <div className="text-lg font-bold text-gray-800">
              {isCompleted ? 'Thank you for riding!' : 
                showRoute === 'pickup' ? 'Ambulance assigned to your location' : 'Heading to hospital'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        {isCompleted ? (
          /* Completed State */
          <div className="text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              ✅
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Trip Completed!</h2>
            <p className="text-gray-500">You have arrived at {hospital?.name}</p>
            {booking?.fare && (
              <div className="mt-4 bg-white rounded-xl p-4 shadow-lg inline-block">
                <p className="text-sm text-gray-500">Total Fare</p>
                <p className="text-3xl font-bold text-gray-800">₹{(booking.fare * 80).toFixed(0)}</p>
              </div>
            )}
          </div>
        ) : (
          /* Simple Status View */
          <div className="w-full max-w-md">
            {/* Status Icon */}
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
                🚑
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                {showRoute === 'pickup' ? 'Driver Assigned' : 'On the way to Hospital'}
              </h2>
              <p className="text-gray-500 mt-1">
                {booking?.distance ? `${booking.distance} km trip` : 'Trip in progress'}
              </p>
            </div>

            {/* Driver Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                  🚑
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800 text-lg">{ambulance?.driverName || 'Driver'}</div>
                  <div className="text-sm text-gray-500">{ambulance?.vehicleNumber}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm font-medium">{ambulance?.rating.toFixed(1) || '4.8'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Fare</div>
                  <div className="text-xl font-bold text-green-600">₹{((booking?.fare || 0) * 80).toFixed(0)}</div>
                </div>
              </div>
            </div>

            {/* Hospital Info */}
            {hospital && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-xl">
                    🏥
                  </div>
                  <div>
                    <div className="font-bold text-blue-800">{hospital.name}</div>
                    <div className="text-sm text-blue-600">{hospital.address}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
