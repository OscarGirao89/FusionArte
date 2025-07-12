import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(params.id, 10) },
      data,
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(`Error updating user ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.user.delete({
      where: { id: parseInt(params.id, 10) },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting user ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
