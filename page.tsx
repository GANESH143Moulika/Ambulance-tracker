'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  AlertTriangle, 
  Activity, 
  MapPin,
  RefreshCw,
  Car,
  Radio,
  User,
  Shield,
  Star,
  Building2,
  Navigation,
  Phone,
  Clock,
  CheckCircle
} from 'lucide-react'
import { useAppStore, Ambulance, Incident, Hospital, Booking } from '@/store/app-store'
import AmbulanceCard from '@/components/ambulance/ambulance-card'
import IncidentCard from '@/components/ambulance/incident-card'
import AddAmbulanceDialog from '@/components/ambulance/add-ambulance-dialog'
import AddIncidentDialog from '@/components/ambulance/add-incident-dialog'
import DispatchDialog from '@/components/ambulance/dispatch-dialog'
import RequestAmbulanceDialog from '@/components/booking/request-ambulance-dialog'
import TrackingView from '@/components/booking/tracking-view'
import TrackingMap from '@/components/booking/tracking-map'
import DriverAcceptCard from '@/components/booking/driver-accept-card'
import { toast } from 'sonner'

export default function AmbulanceTrackerDashboard() {
  const {
    ambulances,
    incidents,
    hospitals,
    currentBooking,
    selectedAmbulance,
    selectedIncident,
    viewMode,
    setAmbulances,
    setIncidents,
    setHospitals,
    setCurrentBooking,
    setSelectedAmbulance,
    setSelectedIncident,
    setViewMode
  } = useAppStore()

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false)
  const [incidentToDispatch, setIncidentToDispatch] = useState<Incident | null>(null)
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)
  const [selectedPickupLocation, setSelectedPickupLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)

  // Fetch data on mount
  useEffect(() => {
    fetchAmbulances()
    fetchIncidents()
    fetchHospitals()
  }, [])

  // Poll for booking updates when tracking
  useEffect(() => {
    if (!currentBooking) return
    
    const interval = setInterval(() => {
      fetchBookingUpdate()
    }, 3000)
    
    return () => clearInterval(interval)
  }, [currentBooking])

  const fetchAmbulances = async () => {
    try {
      const response = await fetch('/api/ambulances')
      if (response.ok) {
        const data = await response.json()
        setAmbulances(data)
      }
    } catch (error) {
      console.error('Failed to fetch ambulances:', error)
    }
  }

  const fetchIncidents = async () => {
    try {
      const response = await fetch('/api/incidents')
      if (response.ok) {
        const data = await response.json()
        setIncidents(data)
      }
    } catch (error) {
      console.error('Failed to fetch incidents:', error)
    }
  }

  const fetchHospitals = async () => {
    try {
      const response = await fetch('/api/hospitals')
      if (response.ok) {
        const data = await response.json()
        setHospitals(data)
      }
    } catch (error) {
      console.error('Failed to fetch hospitals:', error)
    }
  }

  const fetchBookingUpdate = async () => {
    if (!currentBooking?.id) return
    try {
      const response = await fetch(`/api/bookings/${currentBooking.id}`)
      if (response.ok) {
        const data = await response.json()
        setCurrentBooking(data)
      } else if (response.status === 404) {
        // Booking no longer exists, clear state
        setCurrentBooking(null)
        setSelectedPickupLocation(null)
        toast.info('Session reset. Ready for new booking.')
      }
    } catch (error) {
      // Silently ignore fetch errors (network issues, etc.)
      console.error('Failed to fetch booking update:', error)
    }
  }

  // Get available ambulances for dispatch
  const availableAmbulances = useMemo(() => {
    return ambulances.filter(a => a.status === 'AVAILABLE')
  }, [ambulances])

  // Get active incidents
  const activeIncidents = useMemo(() => {
    return incidents.filter(i => !['RESOLVED', 'CANCELLED'].includes(i.status))
  }, [incidents])

  // Stats
  const stats = useMemo(() => ({
    totalAmbulances: ambulances.length,
    availableAmbulances: ambulances.filter(a => a.status === 'AVAILABLE').length,
    onDutyAmbulances: ambulances.filter(a => ['EN_ROUTE_TO_PICKUP', 'TRANSPORTING'].includes(a.status)).length,
    activeIncidents: activeIncidents.length
  }), [ambulances, activeIncidents])

  // Get current hospital for booking
  const currentHospital = useMemo(() => {
    if (!currentBooking?.hospitalId) return hospitals[0]
    return hospitals.find(h => h.id === currentBooking.hospitalId) || hospitals[0]
  }, [currentBooking, hospitals])

  // Admin actions
  const handleAddAmbulance = async (data: { vehicleNumber: string; driverName: string; driverPhone: string; status?: string }) => {
    try {
      await fetch('/api/ambulances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      toast.success('Ambulance added successfully')
      fetchAmbulances()
    } catch (error) {
      toast.error('Failed to add ambulance')
      throw error
    }
  }

  const handleDeleteAmbulance = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ambulance?')) return
    setDeletingId(id)
    try {
      await fetch(`/api/ambulances/${id}`, { method: 'DELETE' })
      toast.success('Ambulance deleted')
      if (selectedAmbulance?.id === id) {
        setSelectedAmbulance(null)
      }
      fetchAmbulances()
    } catch (error) {
      toast.error('Failed to delete ambulance')
    } finally {
      setDeletingId(null)
    }
  }

  const handleAddIncident = async (data: { type: string; description?: string; address?: string; latitude?: number; longitude?: number; priority?: string }) => {
    try {
      await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      toast.success('Incident created successfully')
      fetchIncidents()
    } catch (error) {
      toast.error('Failed to create incident')
      throw error
    }
  }

  const handleOpenDispatch = (incident: Incident) => {
    setIncidentToDispatch(incident)
    setDispatchDialogOpen(true)
  }

  const handleDispatch = async (incidentId: string, ambulanceId: string, hospitalId?: string) => {
    try {
      const response = await fetch(`/api/incidents/${incidentId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ambulanceId, hospitalId })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to dispatch ambulance')
      }
      const data = await response.json()
      toast.success('Ambulance dispatched! Switching to live tracking...')
      fetchAmbulances()
      fetchIncidents()
      
      // Switch to user mode and show tracking
      if (data.booking) {
        setCurrentBooking(data.booking)
        setViewMode('user')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to dispatch ambulance')
      throw error
    }
  }

  const handleStatusChange = async (ambulanceId: string, status: string) => {
    try {
      await fetch(`/api/ambulances/${ambulanceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      toast.success('Status updated')
      fetchAmbulances()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  // User actions
  const handleRequestAmbulance = async (data: {
    patientName: string
    patientPhone: string
    pickupAddress: string
    pickupLatitude: number
    pickupLongitude: number
    emergencyType: string
    notes?: string
    hospitalId?: string
  }) => {
    setIsRequesting(true)
    try {
      // Create booking
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!bookingResponse.ok) {
        const error = await bookingResponse.json()
        throw new Error(error.error || 'Failed to create booking')
      }

      const booking = await bookingResponse.json()

      if (!booking.id) {
        throw new Error('Failed to get booking ID')
      }

      // Find nearest ambulance
      const assignResponse = await fetch('/api/bookings/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id })
      })

      if (!assignResponse.ok) {
        const error = await assignResponse.json()
        throw new Error(error.error || 'No ambulances available')
      }

      const updatedBooking = await assignResponse.json()
      setCurrentBooking(updatedBooking)
      toast.success('Ambulance requested! Finding nearest driver...')
      fetchAmbulances()
    } catch (error: any) {
      toast.error(error.message || 'Failed to request ambulance')
      throw error
    } finally {
      setIsRequesting(false)
    }
  }

  const handleDriverResponse = async (accept: boolean) => {
    if (!currentBooking) return
    try {
      const response = await fetch(`/api/bookings/${currentBooking.id}/driver-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          accept, 
          ambulanceId: currentBooking.ambulanceId 
        })
      })
      
      if (accept) {
        toast.success('Driver accepted! On the way to pickup.')
        fetchBookingUpdate()
      } else {
        toast.error('Driver declined. Finding another ambulance...')
        setCurrentBooking(null)
      }
    } catch (error) {
      toast.error('Failed to respond')
    }
  }

  const handleConfirmOTP = async (otp: string) => {
    if (!currentBooking) return
    try {
      const response = await fetch(`/api/bookings/${currentBooking.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Invalid OTP')
      }
      
      toast.success('Ride started! Heading to hospital.')
      fetchBookingUpdate()
    } catch (error: any) {
      toast.error(error.message || 'Failed to confirm')
      throw error
    }
  }

  const handleUpdateBookingStatus = async (status: string) => {
    if (!currentBooking?.id) return
    try {
      const response = await fetch(`/api/bookings/${currentBooking.id}/track`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) {
        // If booking not found or error, clear the current booking
        if (response.status === 404) {
          setCurrentBooking(null)
          setSelectedPickupLocation(null)
        }
        return
      }
      
      fetchBookingUpdate()
    } catch (error) {
      // Silently ignore network errors
      console.error('Failed to update status:', error)
    }
  }

  // Determine route display for tracking
  const trackingRoute = useMemo(() => {
    if (!currentBooking) return 'pickup'
    if (['PATIENT_PICKED', 'EN_ROUTE_HOSPITAL', 'ARRIVED_HOSPITAL'].includes(currentBooking.status)) {
      return 'hospital'
    }
    return 'pickup'
  }, [currentBooking])

  // Check if trip is completed
  const isTripCompleted = useMemo(() => {
    return currentBooking?.status === 'COMPLETED'
  }, [currentBooking?.status])

  // Handle book new ride
  const handleBookNewRide = useCallback(() => {
    setCurrentBooking(null)
    setSelectedPickupLocation(null)
    fetchAmbulances()
    fetchIncidents()
    toast.success('Ready for new booking!')
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Radio className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Ambulance Tracker</h1>
                <p className="text-sm text-muted-foreground">Real-time emergency response system</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Mode Switch */}
              <div className="flex items-center gap-2 border rounded-lg p-2">
                <Label htmlFor="mode-switch" className="flex items-center gap-1 text-sm cursor-pointer">
                  <Shield className="h-4 w-4" />
                  Admin
                </Label>
                <Switch
                  id="mode-switch"
                  checked={viewMode === 'user'}
                  onCheckedChange={(checked) => setViewMode(checked ? 'user' : 'admin')}
                />
                <Label htmlFor="mode-switch" className="flex items-center gap-1 text-sm cursor-pointer">
                  <User className="h-4 w-4" />
                  User
                </Label>
              </div>
              
              {viewMode === 'admin' ? (
                <>
                  <AddAmbulanceDialog onAdd={handleAddAmbulance} />
                  <AddIncidentDialog onAdd={handleAddIncident} />
                </>
              ) : (
                !currentBooking && (
                  <Button onClick={() => setRequestDialogOpen(true)} className="gap-2">
                    <Navigation className="h-4 w-4" />
                    Request Ambulance
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      {viewMode === 'admin' && (
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{stats.totalAmbulances}</span>
                <span className="text-muted-foreground">Total</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="font-medium">{stats.availableAmbulances}</span>
                <span className="text-muted-foreground">Available</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="font-medium">{stats.onDutyAmbulances}</span>
                <span className="text-muted-foreground">On Duty</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="font-medium">{stats.activeIncidents}</span>
                <span className="text-muted-foreground">Active Incidents</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {viewMode === 'admin' ? (
          // Admin View
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Panel - Lists */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <Tabs defaultValue="ambulances" className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ambulances" className="gap-2">
                    <Car className="h-4 w-4" />
                    Ambulances ({ambulances.length})
                  </TabsTrigger>
                  <TabsTrigger value="incidents" className="gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Incidents ({activeIncidents.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="ambulances" className="flex-1 mt-4">
                  <ScrollArea className="h-[calc(100vh-340px)] pr-4">
                    <div className="space-y-3">
                      {ambulances.length === 0 ? (
                        <Card>
                          <CardContent className="py-8 text-center text-muted-foreground">
                            <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No ambulances registered</p>
                          </CardContent>
                        </Card>
                      ) : (
                        ambulances.map((ambulance) => (
                          <AmbulanceCard
                            key={ambulance.id}
                            ambulance={ambulance}
                            isSelected={selectedAmbulance?.id === ambulance.id}
                            onSelect={() => setSelectedAmbulance(
                              selectedAmbulance?.id === ambulance.id ? null : ambulance
                            )}
                            onDelete={handleDeleteAmbulance}
                            isDeleting={deletingId === ambulance.id}
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="incidents" className="flex-1 mt-4">
                  <ScrollArea className="h-[calc(100vh-340px)] pr-4">
                    <div className="space-y-3">
                      {activeIncidents.length === 0 ? (
                        <Card>
                          <CardContent className="py-8 text-center text-muted-foreground">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No active incidents</p>
                          </CardContent>
                        </Card>
                      ) : (
                        activeIncidents.map((incident) => (
                          <IncidentCard
                            key={incident.id}
                            incident={incident}
                            isSelected={selectedIncident?.id === incident.id}
                            onSelect={() => setSelectedIncident(
                              selectedIncident?.id === incident.id ? null : incident
                            )}
                            onDispatch={handleOpenDispatch}
                            availableAmbulances={availableAmbulances}
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Panel - Details */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Selected Item Details */}
              {(selectedAmbulance || selectedIncident) && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      {selectedAmbulance ? 'Ambulance Details' : 'Incident Details'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedAmbulance && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Vehicle</p>
                            <p className="font-medium">{selectedAmbulance.vehicleNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Driver</p>
                            <p className="font-medium">{selectedAmbulance.driverName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-medium">{selectedAmbulance.driverPhone}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Rating</p>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{selectedAmbulance.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">Status:</p>
                          <Select value={selectedAmbulance.status} onValueChange={(value) => handleStatusChange(selectedAmbulance.id, value)}>
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AVAILABLE">Available</SelectItem>
                              <SelectItem value="EN_ROUTE_TO_PICKUP">En Route to Pickup</SelectItem>
                              <SelectItem value="AT_PICKUP">At Pickup</SelectItem>
                              <SelectItem value="TRANSPORTING">Transporting</SelectItem>
                              <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                    {selectedIncident && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Type</p>
                            <p className="font-medium">{selectedIncident.type}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Priority</p>
                            <Badge variant={selectedIncident.priority === 'CRITICAL' ? 'destructive' : 'default'}>
                              {selectedIncident.priority}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <p className="font-medium">{selectedIncident.status.replace(/_/g, ' ')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Address</p>
                            <p className="font-medium">{selectedIncident.address || 'N/A'}</p>
                          </div>
                        </div>
                        {selectedIncident.status === 'PENDING' && availableAmbulances.length > 0 && (
                          <Button onClick={() => handleOpenDispatch(selectedIncident)}>
                            Dispatch Ambulance
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Ambulances List View */}
              <Card className="flex-1">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Available Ambulances
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => { fetchAmbulances(); fetchIncidents() }}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ambulances.map((amb) => (
                      <div key={amb.id} className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer"
                        onClick={() => setSelectedAmbulance(amb)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              amb.status === 'AVAILABLE' ? 'bg-green-100 text-green-600' :
                              amb.status === 'OUT_OF_SERVICE' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              🚑
                            </div>
                            <div>
                              <p className="font-medium">{amb.vehicleNumber}</p>
                              <p className="text-sm text-muted-foreground">{amb.driverName}</p>
                            </div>
                          </div>
                          <Badge variant={amb.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                            {amb.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // User View
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Tracking View */}
            <Card className="min-h-[500px]">
              <CardContent className="p-0 h-full">
                {currentBooking ? (
                  currentBooking.status === 'AMBULANCE_ASSIGNED' ? (
                    // Waiting for driver to accept
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
                      <div className="text-center p-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                          <Car className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Finding Driver...</h3>
                        <p className="text-gray-500 mb-6">Please wait while we connect you with a nearby driver</p>
                        <div className="flex justify-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <TrackingMap
                      ambulance={currentBooking.ambulance}
                      booking={currentBooking}
                      hospital={currentHospital}
                      showRoute={trackingRoute}
                      isCompleted={isTripCompleted}
                    />
                  )
                ) : (
                  // No booking - show booking form
                  <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white p-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                      <Navigation className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Book an Ambulance</h3>
                    <p className="text-gray-500 text-center mb-6">Click the button below to request an ambulance</p>
                    <Button 
                      onClick={() => setRequestDialogOpen(true)}
                      className="bg-green-600 hover:bg-green-700 h-12 px-8 text-lg"
                    >
                      🚑 Request Ambulance
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booking / Tracking View */}
            <Card className="min-h-[500px]">
              <CardContent className="p-0 h-full">
                {currentBooking ? (
                  currentBooking.status === 'AMBULANCE_ASSIGNED' && currentBooking.ambulance ? (
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-4">Driver Request</h3>
                      <DriverAcceptCard
                        booking={currentBooking}
                        ambulance={currentBooking.ambulance}
                        onAccept={() => handleDriverResponse(true)}
                        onReject={() => handleDriverResponse(false)}
                      />
                    </div>
                  ) : (
                    <TrackingView
                      booking={currentBooking}
                      hospital={currentHospital}
                      onConfirmOTP={handleConfirmOTP}
                      onCancel={() => setCurrentBooking(null)}
                      onUpdateStatus={handleUpdateBookingStatus}
                      onRefresh={fetchBookingUpdate}
                      onBookNew={handleBookNewRide}
                    />
                  )
                ) : (
                  <div className="h-full flex flex-col">
                    {/* Booking Form */}
                    <div className="p-4 border-b">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Navigation className="h-5 w-5 text-green-600" />
                        Book Ambulance
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Fill in the details to request an ambulance
                      </p>
                    </div>
                    
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                      {/* Nearby Ambulances */}
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          Nearby Available Ambulances
                        </h4>
                        {ambulances
                          .filter(a => a.status === 'AVAILABLE')
                          .slice(0, 3)
                          .map((ambulance) => (
                            <div key={ambulance.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                  <span className="text-lg">🚑</span>
                                </div>
                                <div>
                                  <p className="font-medium">{ambulance.vehicleNumber}</p>
                                  <p className="text-sm text-muted-foreground">{ambulance.driverName}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{ambulance.rating.toFixed(1)}</span>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Hospitals */}
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Nearby Hospitals
                        </h4>
                        {hospitals.slice(0, 3).map((h) => (
                          <div key={h.id} className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-lg">🏥</span>
                              </div>
                              <div>
                                <p className="font-medium">{h.name}</p>
                                <p className="text-sm text-muted-foreground">{h.address}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Book Button */}
                    <div className="p-4 border-t">
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
                        onClick={() => setRequestDialogOpen(true)}
                      >
                        🚑 Book Ambulance Now
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Ambulance Tracker System</p>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span>Live tracking active</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Dialogs */}
      <DispatchDialog
        open={dispatchDialogOpen}
        onOpenChange={setDispatchDialogOpen}
        incident={incidentToDispatch}
        availableAmbulances={availableAmbulances}
        hospitals={hospitals}
        onDispatch={handleDispatch}
      />

      <RequestAmbulanceDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        hospitals={hospitals}
        onRequest={handleRequestAmbulance}
      />
    </div>
  )
}
