// Hospitals API - Returns list of all hospitals
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Create a fresh client for this route
const prisma = new PrismaClient();

// GET all hospitals
export async function GET() {
  try {
    const hospitals = await prisma.hospital.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(hospitals);
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    return NextResponse.json({ error: 'Failed to fetch hospitals' }, { status: 500 });
  }
}
