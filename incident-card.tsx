'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, MapPin, Clock, Car, User } from 'lucide-react'
import { Incident, Ambulance } from '@/store/ambulance-store'

interface IncidentCardProps {
  incident: Incident
  isSelected: boolean
  onSelect: () => void
  onDispatch: (incident: Incident) => void
  availableAmbulances: Ambulance[]
}

const priorityColors: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  LOW: 'bg-green-100 text-green-800 border-green-200'
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-800 border-gray-200',
  DISPATCHED: 'bg-blue-100 text-blue-800 border-blue-200',
  EN_ROUTE: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  ON_SCENE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  TRANSPORTING: 'bg-purple-100 text-purple-800 border-purple-200',
  RESOLVED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200'
}

export default function IncidentCard({
  incident,
  isSelected,
  onSelect,
  onDispatch,
  availableAmbulances
}: IncidentCardProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isActive = !['RESOLVED', 'CANCELLED'].includes(incident.status)

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      } ${!isActive ? 'opacity-60' : ''}`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${incident.priority === 'CRITICAL' ? 'text-red-500' : 'text-orange-500'}`} />
            <span>{incident.type}</span>
          </div>
          <div className="flex gap-1">
            <Badge className={priorityColors[incident.priority]} variant="outline">
              {incident.priority}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge className={statusColors[incident.status]} variant="outline">
            {incident.status.replace(/_/g, ' ')}
          </Badge>
          {isActive && incident.status === 'PENDING' && availableAmbulances.length > 0 && (
            <Button 
              size="sm" 
              variant="default"
              onClick={(e) => {
                e.stopPropagation()
                onDispatch(incident)
              }}
            >
              Dispatch
            </Button>
          )}
        </div>
        
        <div className="space-y-1.5 text-sm">
          {incident.description && (
            <p className="text-muted-foreground line-clamp-2">
              {incident.description}
            </p>
          )}
          
          {incident.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{incident.address}</span>
            </div>
          )}
          
          {incident.assignedAmbulance && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Car className="h-4 w-4" />
              <span>{incident.assignedAmbulance.vehicleNumber}</span>
              <User className="h-3 w-3 ml-1" />
              <span>{incident.assignedAmbulance.driverName}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Created: {formatTime(incident.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
