import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    const updatedClass = await prisma.danceClass.update({
      where: { id: params.id },
      data: {
        ...data,
        teacherIds: {
          set: data.teacherIds.map((id: number) => ({ id })),
        },
      },
    });
    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error(`Error updating class ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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
