'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Ambulance, Incident } from '@/store/app-store'

// Fix for default marker icons in Leaflet with Next.js
const ambulanceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const movingAmbulanceIcon = new L.DivIcon({
  html: `<div class="ambulance-marker">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="6" width="20" height="12" rx="2" fill="#22c55e"/>
      <rect x="4" y="8" width="6" height="4" rx="1" fill="#fff"/>
      <rect x="12" y="8" width="8" height="8" rx="1" fill="#fff"/>
      <circle cx="6" cy="18" r="2" fill="#333"/>
      <circle cx="18" cy="18" r="2" fill="#333"/>
      <rect x="14" y="10" width="1.5" height="4" fill="#22c55e"/>
      <rect x="12.5" y="11.5" width="4" height="1.5" fill="#22c55e"/>
    </svg>
  </div>`,
  className: 'ambulance-icon-wrapper',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
})

const incidentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const criticalIncidentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Component to handle map view changes
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  
  return null
}

// Animated ambulance marker that moves along a path
function AnimatedAmbulance({ 
  ambulance, 
  isActive 
}: { 
  ambulance: Ambulance
  isActive: boolean 
}) {
  const [position, setPosition] = useState<[number, number] | null>(
    ambulance.latitude && ambulance.longitude 
      ? [ambulance.latitude, ambulance.longitude] 
      : null
  )
  
  // Simulate movement for active ambulances
  useEffect(() => {
    if (!isActive || !ambulance.latitude || !ambulance.longitude) return
    
    const startPos: [number, number] = [ambulance.latitude, ambulance.longitude]
    let progress = 0
    
    const interval = setInterval(() => {
      progress += 0.01
      // Small random movement simulation
      const newLat = startPos[0] + Math.sin(progress * 2) * 0.001
      const newLng = startPos[1] + Math.cos(progress * 3) * 0.001
      setPosition([newLat, newLng])
    }, 500)
    
    return () => clearInterval(interval)
  }, [ambulance, isActive])
  
  if (!position) return null
  
  return (
    <Marker
      position={position}
      icon={movingAmbulanceIcon}
    >
      <Popup>
        <div className="p-1">
          <h3 className="font-bold text-green-700">{ambulance.vehicleNumber}</h3>
          <p className="text-sm"><strong>Driver:</strong> {ambulance.driverName}</p>
          <p className="text-sm"><strong>Status:</strong> {ambulance.status}</p>
        </div>
      </Popup>
    </Marker>
  )
}

interface MapComponentProps {
  ambulances: Ambulance[]
  incidents: Incident[]
  selectedAmbulance: Ambulance | null
  onSelectAmbulance: (ambulance: Ambulance | null) => void
  selectedIncident: Incident | null
  onSelectIncident: (incident: Incident | null) => void
}

export default function MapComponent({
  ambulances,
  incidents,
  selectedAmbulance,
  onSelectAmbulance,
  selectedIncident,
  onSelectIncident
}: MapComponentProps) {
  // Default center (Delhi, India)
  const defaultCenter: [number, number] = [28.6139, 77.2090]
  
  // Calculate map center based on selection
  const mapCenter = useMemo((): [number, number] => {
    if (selectedAmbulance?.latitude && selectedAmbulance?.longitude) {
      return [selectedAmbulance.latitude, selectedAmbulance.longitude]
    }
    if (selectedIncident?.latitude && selectedIncident?.longitude) {
      return [selectedIncident.latitude, selectedIncident.longitude]
    }
    // If there are ambulances with locations, center on the first one
    const ambulanceWithLocation = ambulances.find(a => a.latitude && a.longitude)
    if (ambulanceWithLocation) {
      return [ambulanceWithLocation.latitude!, ambulanceWithLocation.longitude!]
    }
    return defaultCenter
  }, [selectedAmbulance, selectedIncident, ambulances])

  // Get active ambulances (en route or transporting)
  const activeAmbulances = useMemo(() => {
    return ambulances.filter(a => 
      ['EN_ROUTE_TO_PICKUP', 'TRANSPORTING'].includes(a.status) && 
      a.latitude && 
      a.longitude
    )
  }, [ambulances])

  // Get stationary ambulances
  const stationaryAmbulances = useMemo(() => {
    return ambulances.filter(a => 
      !['EN_ROUTE_TO_PICKUP', 'TRANSPORTING'].includes(a.status) && 
      a.latitude && 
      a.longitude
    )
  }, [ambulances])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'text-green-600'
      case 'EN_ROUTE_TO_PICKUP': return 'text-blue-600'
      case 'AT_PICKUP': return 'text-yellow-600'
      case 'TRANSPORTING': return 'text-purple-600'
      case 'OUT_OF_SERVICE': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600'
      case 'HIGH': return 'text-orange-600'
      case 'MEDIUM': return 'text-yellow-600'
      default: return 'text-green-600'
    }
  }

  return (
    <>
      <style jsx global>{`
        .ambulance-icon-wrapper {
          background: transparent !important;
          border: none !important;
        }
        .ambulance-marker {
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        scrollWheelZoom={true}
      >
        <MapController center={mapCenter} zoom={13} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Active ambulances with animation */}
        {activeAmbulances.map((ambulance) => (
          <AnimatedAmbulance 
            key={ambulance.id} 
            ambulance={ambulance} 
            isActive={true} 
          />
        ))}
        
        {/* Stationary ambulance markers */}
        {stationaryAmbulances.map((ambulance) => (
          <Marker
            key={ambulance.id}
            position={[ambulance.latitude!, ambulance.longitude!]}
            icon={ambulanceIcon}
            eventHandlers={{
              click: () => onSelectAmbulance(ambulance)
            }}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-green-700">{ambulance.vehicleNumber}</h3>
                <p className="text-sm"><strong>Driver:</strong> {ambulance.driverName}</p>
                <p className="text-sm"><strong>Status:</strong> <span className={getStatusColor(ambulance.status)}>{ambulance.status.replace(/_/g, ' ')}</span></p>
                <p className="text-sm"><strong>Speed:</strong> {ambulance.speed ? `${ambulance.speed} km/h` : 'N/A'}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Incident markers */}
        {incidents
          .filter(i => !['RESOLVED', 'CANCELLED'].includes(i.status))
          .map((incident) => {
            if (!incident.latitude || !incident.longitude) return null
            
            const icon = incident.priority === 'CRITICAL' || incident.priority === 'HIGH' 
              ? criticalIncidentIcon 
              : incidentIcon
            
            return (
              <Marker
                key={incident.id}
                position={[incident.latitude, incident.longitude]}
                icon={icon}
                eventHandlers={{
                  click: () => onSelectIncident(incident)
                }}
              >
                <Popup>
                  <div className="p-1">
                    <h3 className="font-bold text-red-700">{incident.type}</h3>
                    <p className="text-sm"><strong>Priority:</strong> <span className={getPriorityColor(incident.priority)}>{incident.priority}</span></p>
                    <p className="text-sm"><strong>Status:</strong> {incident.status}</p>
                    {incident.address && <p className="text-sm"><strong>Address:</strong> {incident.address}</p>}
                    {incident.description && <p className="text-sm"><strong>Description:</strong> {incident.description}</p>}
                  </div>
                </Popup>
              </Marker>
            )
          })}
      </MapContainer>
    </>
  )
}
