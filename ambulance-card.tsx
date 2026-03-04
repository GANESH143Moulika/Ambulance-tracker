'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Ambulance, MapPin, Phone, Clock, Car, Trash2 } from 'lucide-react'
import { Ambulance as AmbulanceType } from '@/store/ambulance-store'

interface AmbulanceCardProps {
  ambulance: AmbulanceType
  isSelected: boolean
  onSelect: () => void
  onDelete: (id: string) => void
  isDeleting: boolean
}

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800 border-green-200',
  ON_DUTY: 'bg-blue-100 text-blue-800 border-blue-200',
  EN_ROUTE: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  AT_SCENE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  TRANSPORTING: 'bg-purple-100 text-purple-800 border-purple-200',
  OUT_OF_SERVICE: 'bg-red-100 text-red-800 border-red-200'
}

export default function AmbulanceCard({
  ambulance,
  isSelected,
  onSelect,
  onDelete,
  isDeleting
}: AmbulanceCardProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            <span>{ambulance.vehicleNumber}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(ambulance.id)
            }}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge className={statusColors[ambulance.status]} variant="outline">
            {ambulance.status.replace(/_/g, ' ')}
          </Badge>
          {ambulance.speed && (
            <span className="text-sm text-muted-foreground">
              {ambulance.speed} km/h
            </span>
          )}
        </div>
        
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Ambulance className="h-4 w-4" />
            <span>{ambulance.driverName}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{ambulance.driverPhone}</span>
          </div>
          
          {ambulance.latitude && ambulance.longitude && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {ambulance.latitude.toFixed(4)}, {ambulance.longitude.toFixed(4)}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last update: {formatTime(ambulance.lastUpdate)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
