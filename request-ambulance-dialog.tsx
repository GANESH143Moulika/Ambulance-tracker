'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Phone, MapPin, AlertCircle, Building2 } from 'lucide-react'
import { Hospital } from '@/store/app-store'

interface RequestAmbulanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hospitals: Hospital[]
  onRequest: (data: {
    patientName: string
    patientPhone: string
    pickupAddress: string
    pickupLatitude: number
    pickupLongitude: number
    emergencyType: string
    notes?: string
    hospitalId?: string
  }) => Promise<void>
}

const emergencyTypes = [
  'Medical Emergency',
  'Cardiac Emergency',
  'Respiratory Emergency',
  'Trauma/Accident',
  'Stroke',
  'Pregnancy Emergency',
  'Other'
]

export default function RequestAmbulanceDialog({
  open,
  onOpenChange,
  hospitals,
  onRequest
}: RequestAmbulanceDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    pickupAddress: '',
    emergencyType: '',
    notes: '',
    hospitalId: ''
  })

  // Default Delhi coordinates
  const defaultLat = 28.6139
  const defaultLng = 77.2090

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onRequest({
        patientName: formData.patientName,
        patientPhone: formData.patientPhone,
        pickupAddress: formData.pickupAddress,
        pickupLatitude: defaultLat + (Math.random() - 0.5) * 0.02, // Slight random offset
        pickupLongitude: defaultLng + (Math.random() - 0.5) * 0.02,
        emergencyType: formData.emergencyType,
        notes: formData.notes || undefined,
        hospitalId: formData.hospitalId || undefined
      })
      onOpenChange(false)
      setFormData({
        patientName: '',
        patientPhone: '',
        pickupAddress: '',
        emergencyType: '',
        notes: '',
        hospitalId: ''
      })
    } catch (error) {
      console.error('Failed to request ambulance:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Request Ambulance
          </DialogTitle>
          <DialogDescription>
            Fill in the details below. We'll find the nearest available ambulance for you.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="patientName">Patient Name</Label>
            <Input
              id="patientName"
              placeholder="Enter patient name"
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="patientPhone">Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="patientPhone"
                placeholder="+1-555-0123"
                value={formData.patientPhone}
                onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="pickupAddress">Pickup Address *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="pickupAddress"
                placeholder="Enter pickup location"
                value={formData.pickupAddress}
                onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="emergencyType">Emergency Type *</Label>
            <Select
              value={formData.emergencyType}
              onValueChange={(value) => setFormData({ ...formData, emergencyType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select emergency type" />
              </SelectTrigger>
              <SelectContent>
                {emergencyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="hospitalId">Preferred Hospital (Optional)</Label>
            <Select
              value={formData.hospitalId}
              onValueChange={(value) => setFormData({ ...formData, hospitalId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select hospital" />
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
          
          <div className="grid gap-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.patientPhone || !formData.pickupAddress || !formData.emergencyType} className="flex-1">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Request Ambulance
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
