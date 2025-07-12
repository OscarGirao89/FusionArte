import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const levels = await prisma.danceLevel.findMany();
    return NextResponse.json(levels);
  } catch (error) {
    console.error('Error fetching levels:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
