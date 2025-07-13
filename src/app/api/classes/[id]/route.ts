import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const danceClass = await prisma.danceClass.findUnique({
      where: { id: params.id },
      include: {
        teachers: true,
        enrolledStudents: true,
      },
    });
    if (!danceClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }
    return NextResponse.json(danceClass);
  } catch (error) {
    console.error(`Error fetching class ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { teacherIds, enrolledStudentIds, ...classData } = data;

    const updatedClass = await prisma.danceClass.update({
      where: { id: params.id },
      data: {
        ...classData,
        teachers: teacherIds ? {
          set: teacherIds.map((id: number) => ({ id })),
        } : undefined,
        enrolledStudents: enrolledStudentIds ? {
          set: enrolledStudentIds.map((id: number) => ({ id })),
        } : undefined,
      },
      include: {
        teachers: true,
        enrolledStudents: true,
      }
    });
    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error(`Error updating class ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.danceClass.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting class ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
