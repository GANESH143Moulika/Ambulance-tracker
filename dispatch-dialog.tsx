'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Car, Building2, MapPin, AlertTriangle } from 'lucide-react'
import { Ambulance, Incident, Hospital } from '@/store/app-store'

interface DispatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  incident: Incident | null
  availableAmbulances: Ambulance[]
  hospitals: Hospital[]
  onDispatch: (incidentId: string, ambulanceId: string, hospitalId?: string) => Promise<void>
}

export default function DispatchDialog({
  open,
  onOpenChange,
  incident,
  availableAmbulances,
  hospitals,
  onDispatch
}: DispatchDialogProps) {
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState('')
  const [selectedHospitalId, setSelectedHospitalId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDispatch = async () => {
    if (!incident || !selectedAmbulanceId) return
    setIsLoading(true)
    try {
      await onDispatch(incident.id, selectedAmbulanceId, selectedHospitalId || undefined)
      onOpenChange(false)
      setSelectedAmbulanceId('')
      setSelectedHospitalId('')
    } catch (error) {
      console.error('Failed to dispatch:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Dispatch Ambulance
          </DialogTitle>
          <DialogDescription>
            Select an available ambulance and hospital to dispatch to this incident.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Incident Info */}
          {incident && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800">{incident.type}</p>
                  {incident.address && (
                    <p className="text-sm text-orange-600">{incident.address}</p>
                  )}
                  <p className="text-xs text-orange-500 mt-1">
                    Priority: {incident.priority}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Ambulance Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Select Ambulance</Label>
            {availableAmbulances.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 border rounded-lg">
                No ambulances available for dispatch
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto border rounded-lg">
                <RadioGroup value={selectedAmbulanceId} onValueChange={setSelectedAmbulanceId}>
                  {availableAmbulances.map((ambulance) => (
                    <div
                      key={ambulance.id}
                      className={`flex items-center space-x-3 p-3 border-b last:border-b-0 cursor-pointer transition-colors ${
                        selectedAmbulanceId === ambulance.id ? 'bg-green-50' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedAmbulanceId(ambulance.id)}
                    >
                      <RadioGroupItem value={ambulance.id} id={ambulance.id} />
                      <Label htmlFor={ambulance.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{ambulance.vehicleNumber}</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Available</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {ambulance.driverName} • {ambulance.driverPhone}
                        </p>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </div>
          
          {/* Hospital Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Select Hospital (Optional)</Label>
            <Select value={selectedHospitalId} onValueChange={setSelectedHospitalId}>
              <SelectTrigger>
                <SelectValue placeholder="Auto-assign nearest hospital" />
              </SelectTrigger>
              <SelectContent>
                {(hospitals || []).map((hospital) => (
                  <SelectItem key={hospital.id} value={hospital.id}>
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {hospital.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDispatch} 
            disabled={isLoading || !selectedAmbulanceId || availableAmbulances.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Dispatch & Track
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
