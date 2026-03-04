import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.booking.deleteMany()
  await prisma.incident.deleteMany()
  await prisma.hospital.deleteMany()
  await prisma.ambulance.deleteMany()

  // Create hospitals in India (Delhi NCR area)
  const hospitals = await Promise.all([
    prisma.hospital.create({
      data: {
        name: 'AIIMS Delhi',
        address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029',
        latitude: 28.5672,
        longitude: 77.2100,
        phone: '+91-11-26588500'
      }
    }),
    prisma.hospital.create({
      data: {
        name: 'Fortis Hospital',
        address: 'Sector 62, Noida, Uttar Pradesh 201301',
        latitude: 28.6280,
        longitude: 77.3650,
        phone: '+91-120-4622222'
      }
    }),
    prisma.hospital.create({
      data: {
        name: 'Apollo Hospital',
        address: 'Mathura Road, Sarita Vihar, New Delhi 110076',
        latitude: 28.5300,
        longitude: 77.2700,
        phone: '+91-11-26925858'
      }
    }),
    prisma.hospital.create({
      data: {
        name: 'Max Super Speciality Hospital',
        address: '1, 2, Institutional Area, Saket, New Delhi 110017',
        latitude: 28.5270,
        longitude: 77.2150,
        phone: '+91-11-26515050'
      }
    }),
    prisma.hospital.create({
      data: {
        name: 'Medanta Hospital',
        address: 'Sector 38, Gurugram, Haryana 122001',
        latitude: 28.4500,
        longitude: 77.0400,
        phone: '+91-124-4141414'
      }
    })
  ])

  console.log(`Created ${hospitals.length} hospitals`)

  // Create sample ambulances in Delhi NCR area
  const ambulances = await Promise.all([
    prisma.ambulance.create({
      data: {
        vehicleNumber: 'DL-01-AM-1234',
        driverName: 'Rajesh Kumar',
        driverPhone: '+91-9876543210',
        driverPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
        rating: 4.8,
        totalRides: 234,
        status: 'AVAILABLE',
        latitude: 28.6139,  // Connaught Place
        longitude: 77.2090,
        speed: 0,
        heading: 0
      }
    }),
    prisma.ambulance.create({
      data: {
        vehicleNumber: 'DL-02-AM-5678',
        driverName: 'Suresh Yadav',
        driverPhone: '+91-9876543211',
        driverPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh',
        rating: 4.9,
        totalRides: 312,
        status: 'AVAILABLE',
        latitude: 28.6328,  // Civil Lines
        longitude: 77.2190,
        speed: 0,
        heading: 0
      }
    }),
    prisma.ambulance.create({
      data: {
        vehicleNumber: 'DL-03-AM-9012',
        driverName: 'Amit Singh',
        driverPhone: '+91-9876543212',
        driverPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit',
        rating: 4.7,
        totalRides: 189,
        status: 'AVAILABLE',
        latitude: 28.5700,  // South Delhi
        longitude: 77.2300,
        speed: 0,
        heading: 0
      }
    }),
    prisma.ambulance.create({
      data: {
        vehicleNumber: 'UP-16-AM-3456',
        driverName: 'Priya Sharma',
        driverPhone: '+91-9876543213',
        driverPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
        rating: 4.6,
        totalRides: 156,
        status: 'AVAILABLE',
        latitude: 28.6100,  // Noida
        longitude: 77.3500,
        speed: 0,
        heading: 0
      }
    }),
    prisma.ambulance.create({
      data: {
        vehicleNumber: 'HR-26-AM-7890',
        driverName: 'Vikram Verma',
        driverPhone: '+91-9876543214',
        driverPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
        rating: 4.9,
        totalRides: 287,
        status: 'AVAILABLE',
        latitude: 28.4800,  // Gurugram
        longitude: 77.0900,
        speed: 0,
        heading: 0
      }
    }),
    prisma.ambulance.create({
      data: {
        vehicleNumber: 'DL-04-AM-1111',
        driverName: 'Deepak Kumar',
        driverPhone: '+91-9876543215',
        driverPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Deepak',
        rating: 4.8,
        totalRides: 201,
        status: 'OUT_OF_SERVICE',
        latitude: 28.6500,
        longitude: 77.1800,
        speed: null,
        heading: null
      }
    })
  ])

  console.log(`Created ${ambulances.length} ambulances`)

  // Create sample incidents in Delhi NCR
  const incidents = await Promise.all([
    prisma.incident.create({
      data: {
        type: 'Medical Emergency',
        description: 'Patient experiencing chest pain and breathing difficulty',
        address: 'Karol Bagh, Central Delhi',
        latitude: 28.6560,
        longitude: 77.1900,
        priority: 'HIGH',
        status: 'PENDING'
      }
    }),
    prisma.incident.create({
      data: {
        type: 'Road Accident',
        description: 'Two-wheeler accident, leg injury reported',
        address: 'Dhaula Kuan, New Delhi',
        latitude: 28.5900,
        longitude: 77.1700,
        priority: 'CRITICAL',
        status: 'PENDING'
      }
    }),
    prisma.incident.create({
      data: {
        type: 'Cardiac Emergency',
        description: 'Elderly patient having heart attack symptoms',
        address: 'Lajpat Nagar, South Delhi',
        latitude: 28.5650,
        longitude: 77.2400,
        priority: 'CRITICAL',
        status: 'PENDING'
      }
    }),
    prisma.incident.create({
      data: {
        type: 'Fall Injury',
        description: 'Person fell from stairs, head injury',
        address: 'Rohini Sector 15, Delhi',
        latitude: 28.7200,
        longitude: 77.0800,
        priority: 'HIGH',
        status: 'PENDING'
      }
    }),
    prisma.incident.create({
      data: {
        type: 'Breathing Difficulty',
        description: 'Asthma attack, patient needs immediate attention',
        address: 'Sector 18, Noida',
        latitude: 28.5800,
        longitude: 77.3200,
        priority: 'HIGH',
        status: 'PENDING'
      }
    })
  ])

  console.log(`Created ${incidents.length} incidents`)
  console.log('Seed completed! All data is now in Delhi NCR, India')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
