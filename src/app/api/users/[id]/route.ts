
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { paymentDetailsSchema } from '@/lib/types';
import bcrypt from 'bcryptjs';

const userUpdateSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    role: z.string(),
    bio: z.string().optional().nullable(),
    specialties: z.string().optional().nullable(),
    paymentDetails: paymentDetailsSchema.optional().nullable(),
    avatar: z.string().optional().nullable(),
    isVisibleToStudents: z.boolean().optional(),
    password: z.string().min(8).optional().nullable(),
});


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(params.id, 10) },
      include: {
        taughtClasses: true,
        enrolledClasses: true,
        memberships: true,
        payments: true,
        assignedTasks: true,
        attendanceHistory: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error(`Error fetching user ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const validatedData = userUpdateSchema.parse(data);

    const dataToUpdate: any = {
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role,
        bio: validatedData.bio,
        specialties: validatedData.specialties?.split(',').map(s => s.trim()) || [],
        avatar: validatedData.avatar,
        isVisibleToStudents: validatedData.isVisibleToStudents,
        isPartner: validatedData.role === 'Socio',
        ...(validatedData.paymentDetails && { paymentDetailsJson: validatedData.paymentDetails }),
    };
    
    if (validatedData.role !== 'Profesor' && validatedData.role !== 'Socio') {
      dataToUpdate.paymentDetailsJson = null;
    }
    
    if (validatedData.password) {
        dataToUpdate.password = await bcrypt.hash(validatedData.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(params.id, 10) },
      data: dataToUpdate,
    });
    const { password, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    console.error(`Error updating user ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
