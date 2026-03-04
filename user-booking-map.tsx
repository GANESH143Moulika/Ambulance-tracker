'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Ambulance, Hospital } from '@/store/app-store'

// Ambulance icon for available ones
const availableAmbulanceIcon = new L.DivIcon({
  html: `<div class="available-ambulance">
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="16" fill="#22C55E" stroke="#fff" stroke-width="2"/>
      <path d="M18 8 L18 28 M10 16 L26 16" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
    </svg>
  </div>`,
  className: 'available-ambulance-container',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
})

// Pickup location icon
const pickupIcon = new L.DivIcon({
  html: `<div class="pickup-marker">
    <div class="pickup-pulse"></div>
    <svg width="40" height="50" viewBox="0 0 40 50" fill="none">
      <path d="M20 0 C8.95 0 0 8.95 0 20 C0 35 20 50 20 50 C20 50 40 35 40 20 C40 8.95 31.05 0 20 0Z" fill="#F97316"/>
      <circle cx="20" cy="18" r="8" fill="#fff"/>
    </svg>
  </div>`,
  className: 'pickup-marker-container',
  iconSize: [40, 50],
  iconAnchor: [20, 50]
})

// Hospital icon
const hospitalIcon = new L.DivIcon({
  html: `<div class="hospital-icon">
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="#3B82F6" stroke="#fff" stroke-width="2"/>
      <rect x="14" y="8" width="4" height="16" fill="#fff"/>
      <rect x="8" y="14" width="16" height="4" fill="#fff"/>
    </svg>
  </div>`,
  className: 'hospital-icon-container',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
})

interface UserBookingMapProps {
  ambulances: Ambulance[]
  hospitals: Hospital[]
  onLocationSelect: (lat: number, lng: number, address: string) => void
  selectedLocation: { lat: number; lng: number } | null
}

// Location picker component
function LocationPicker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng
      onLocationSelect(lat, lng)
    }
  })
  return null
}

// Fit bounds helper
function FitToBounds({ ambulances, selectedLocation }: { ambulances: Ambulance[], selectedLocation: { lat: number; lng: number } | null }) {
  const map = useMap()
  
  useEffect(() => {
    if (selectedLocation) {
      map.setView([selectedLocation.lat, selectedLocation.lng], 15)
    } else if (ambulances.length > 0) {
      const bounds = L.latLngBounds(
        ambulances
          .filter(a => a.latitude && a.longitude)
          .map(a => [a.latitude!, a.longitude!])
      )
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [ambulances, selectedLocation, map])
  
  return null
}

export default function UserBookingMap({ 
  ambulances, 
  hospitals, 
  onLocationSelect,
  selectedLocation 
}: UserBookingMapProps) {
  const defaultCenter: [number, number] = [28.6139, 77.2090]
  
  // Filter available ambulances
  const availableAmbulances = useMemo(() => {
    return ambulances.filter(a => a.status === 'AVAILABLE' && a.latitude && a.longitude)
  }, [ambulances])
  
  // Handle location selection
  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    // Reverse geocode to get address (simplified)
    const addresses = [
      'Connaught Place, New Delhi',
      'Karol Bagh, Central Delhi',
      'Lajpat Nagar, South Delhi',
      'Rohini, North Delhi',
      'Noida Sector 18',
      'Dhaula Kuan, New Delhi',
      'Saket, South Delhi',
      'Gurugram Cyber City'
    ]
    const randomAddress = addresses[Math.floor(Math.random() * addresses.length)]
    onLocationSelect(lat, lng, randomAddress)
  }, [onLocationSelect])
  
  // Calculate distances to available ambulances
  const ambulancesWithDistance = useMemo(() => {
    if (!selectedLocation) return []
    
    return availableAmbulances.map(a => {
      const R = 6371
      const dLat = (a.latitude! - selectedLocation.lat) * Math.PI / 180
      const dLon = (a.longitude! - selectedLocation.lng) * Math.PI / 180
      const a1 = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(selectedLocation.lat * Math.PI / 180) * Math.cos(a.latitude! * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a1), Math.sqrt(1-a1))
      const distance = Math.round(R * c * 10) / 10
      
      return { ...a, distance }
    }).sort((a, b) => a.distance - b.distance)
  }, [availableAmbulances, selectedLocation])

  return (
    <div className="h-full w-full relative">
      <style jsx global>{`
        .available-ambulance-container, .pickup-marker-container, .hospital-icon-container {
          background: transparent !important;
          border: none !important;
        }
        .available-ambulance {
          animation: bounce 1s ease-in-out infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .pickup-marker { position: relative; }
        .pickup-pulse {
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(249, 115, 22, 0.3);
          animation: pulse 2s ease-out infinite;
          top: -5px;
          left: -10px;
        }
        @keyframes pulse {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
      
      <MapContainer
        center={defaultCenter}
        zoom={13}
        className="h-full w-full rounded-lg"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <LocationPicker onLocationSelect={handleLocationSelect} />
        <FitToBounds ambulances={availableAmbulances} selectedLocation={selectedLocation} />
        
        {/* Available Ambulance Markers */}
        {availableAmbulances.map((ambulance) => (
          <Marker
            key={ambulance.id}
            position={[ambulance.latitude!, ambulance.longitude!]}
            icon={availableAmbulanceIcon}
          >
            <Popup>
              <div className="p-2 min-w-[150px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🚑</span>
                  <span className="font-bold text-green-600">{ambulance.vehicleNumber}</span>
                </div>
                <div className="text-sm text-gray-600">{ambulance.driverName}</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-sm font-medium">{ambulance.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({ambulance.totalRides} rides)</span>
                </div>
                <div className="mt-2 text-xs text-green-600 font-medium">● Available</div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Selected Pickup Location */}
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={pickupIcon}>
            <Popup>
              <div className="p-2">
                <div className="font-bold text-orange-600">📍 Your Location</div>
                <div className="text-sm text-gray-600">Pickup point</div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Hospital Markers */}
        {hospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            position={[hospital.latitude, hospital.longitude]}
            icon={hospitalIcon}
          >
            <Popup>
              <div className="p-2">
                <div className="font-bold text-blue-600">🏥 {hospital.name}</div>
                <div className="text-xs text-gray-500">{hospital.address}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Top instruction bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <div className="bg-white rounded-xl shadow-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-xl">📍</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Tap on map to set pickup location</p>
              <p className="text-xs text-gray-500">Green markers show available ambulances</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Available ambulances nearby */}
      {selectedLocation && ambulancesWithDistance.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          <div className="bg-white rounded-2xl shadow-xl p-4">
            <h3 className="font-bold text-gray-800 mb-3">
              🚑 {ambulancesWithDistance.length} Ambulances Nearby
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {ambulancesWithDistance.slice(0, 3).map((ambulance) => (
                <div key={ambulance.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🚑</span>
                    <div>
                      <p className="font-medium text-sm">{ambulance.vehicleNumber}</p>
                      <p className="text-xs text-gray-500">{ambulance.driverName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{ambulance.distance} km</p>
                    <p className="text-xs text-gray-400">~{Math.ceil(ambulance.distance * 3)} min</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
