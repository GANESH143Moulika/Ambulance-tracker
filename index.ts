import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

interface LocationUpdate {
  ambulanceId: string
  latitude: number
  longitude: number
  speed?: number
  heading?: number
  timestamp: Date
}

interface AmbulanceStatusUpdate {
  ambulanceId: string
  status: string
  timestamp: Date
}

interface IncidentUpdate {
  incidentId: string
  status: string
  ambulanceId?: string
  timestamp: Date
}

// Store connected clients
const connectedClients = new Map<string, { id: string, type: 'dashboard' | 'ambulance' }>()

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  // Register client type
  socket.on('register', (data: { type: 'dashboard' | 'ambulance', ambulanceId?: string }) => {
    connectedClients.set(socket.id, { id: socket.id, type: data.type })
    console.log(`Client ${socket.id} registered as ${data.type}`)
    
    // Send confirmation
    socket.emit('registered', { success: true, id: socket.id })
  })

  // Handle location updates from ambulances
  socket.on('location-update', (data: LocationUpdate) => {
    console.log(`Location update from ambulance ${data.ambulanceId}:`, data.latitude, data.longitude)
    
    // Broadcast to all dashboard clients
    io.emit('ambulance-location', {
      ...data,
      timestamp: new Date()
    })
  })

  // Handle ambulance status updates
  socket.on('ambulance-status', (data: AmbulanceStatusUpdate) => {
    console.log(`Status update for ambulance ${data.ambulanceId}: ${data.status}`)
    
    // Broadcast to all clients
    io.emit('ambulance-status-changed', {
      ...data,
      timestamp: new Date()
    })
  })

  // Handle incident updates
  socket.on('incident-update', (data: IncidentUpdate) => {
    console.log(`Incident ${data.incidentId} updated: ${data.status}`)
    
    // Broadcast to all clients
    io.emit('incident-status-changed', {
      ...data,
      timestamp: new Date()
    })
  })

  // Handle new incident created
  socket.on('new-incident', (data: any) => {
    console.log(`New incident created: ${data.id}`)
    io.emit('incident-created', data)
  })

  // Handle ambulance dispatched
  socket.on('ambulance-dispatched', (data: { incidentId: string, ambulanceId: string }) => {
    console.log(`Ambulance ${data.ambulanceId} dispatched to incident ${data.incidentId}`)
    io.emit('dispatch-update', data)
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    connectedClients.delete(socket.id)
    console.log(`Client disconnected: ${socket.id}`)
  })

  // Handle errors
  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error)
  })
})

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`Tracker WebSocket server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, shutting down server...')
  httpServer.close(() => {
    console.log('Tracker WebSocket server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Received SIGINT signal, shutting down server...')
  httpServer.close(() => {
    console.log('Tracker WebSocket server closed')
    process.exit(0)
  })
})
