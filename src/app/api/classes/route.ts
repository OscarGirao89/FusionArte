import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const classes = await prisma.danceClass.findMany();
    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newClass = await prisma.danceClass.create({
      data: {
        ...data,
        teacherIds: {
          connect: data.teacherIds.map((id: number) => ({ id })),
        },
      },
    });
    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
