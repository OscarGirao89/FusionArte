
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { paymentDetailsSchema } from '@/lib/types';


const userUpdateSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(3),
    email: z.string().email(),
    mobile: z.string().optional().nullable(),
    dob: z.string().optional().nullable(),
    role: z.string().optional(), // Role might not always be updated from student page
    
    // Membership fields
    membershipPlanId: z.string().optional().nullable(),
    membershipStartDate: z.date().optional().nullable(),
    membershipEndDate: z.date().optional().nullable(),
    membershipClassesRemaining: z.number().optional().nullable(),

    // Teacher/Admin specific fields that might come from other forms
    bio: z.string().optional().nullable(),
    specialties: z.string().optional().nullable(),
    avatar: z.string().optional().nullable(),
    isVisibleToStudents: z.boolean().optional(),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres.").optional().or(z.literal('')),
    paymentDetails: paymentDetailsSchema.nullable().optional(),
});


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const json = await request.json();
    if (json.membershipStartDate) json.membershipStartDate = new Date(json.membershipStartDate);
    if (json.membershipEndDate) json.membershipEndDate = new Date(json.membershipEndDate);
    const validatedData = userUpdateSchema.parse(json);

    const dataToUpdate: any = {
        name: validatedData.name,
        email: validatedData.email,
        mobile: validatedData.mobile,
        dob: validatedData.dob,
        bio: validatedData.bio,
        specialties: validatedData.specialties?.split(',').map(s => s.trim()),
        avatar: validatedData.avatar,
        isVisibleToStudents: validatedData.isVisibleToStudents,
    };
    
    if (validatedData.role) {
      dataToUpdate.role = validatedData.role;
      dataToUpdate.isPartner = validatedData.role === 'Socio';
    }

    if (validatedData.password && validatedData.password.length > 0) {
        dataToUpdate.password = await bcrypt.hash(validatedData.password, 10);
    }
    
    // Only include paymentDetailsJson if it's not null/undefined
    if (validatedData.paymentDetails) {
        dataToUpdate.paymentDetailsJson = validatedData.paymentDetails;
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      // 1. Update user profile data
      const user = await tx.user.update({
        where: { id: userId },
        data: dataToUpdate,
      });

      const planId = validatedData.membershipPlanId;
      const startDate = validatedData.membershipStartDate;
      const endDate = validatedData.membershipEndDate;

      // 2. Manage student membership: Delete any existing, then create if a new plan is provided.
      // This is safer than upsert with compound keys.
      await tx.studentMembership.deleteMany({
        where: { userId: userId },
      });

      if (planId && planId !== 'none' && startDate && endDate) {
        // Create the new membership record
        await tx.studentMembership.create({
          data: {
            userId: userId,
            planId: planId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            classesRemaining: validatedData.membershipClassesRemaining,
          }
        });
      }
      
      return user;
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation Error:', error.errors);
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
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }
    
    // Use transaction to delete user and related data
    await prisma.$transaction(async (tx) => {
      
      await tx.studentMembership.deleteMany({ where: { userId } });
      await tx.studentPayment.deleteMany({ where: { studentId: userId } });
      
      // You may need to handle other relations like taughtClasses, enrolledClasses etc.
      // For now, we assume cascade deletes or manual cleanup is handled elsewhere if needed.
      // The relation to TaskNote assignees is handled by the database schema.
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting user ${params.id}:`, error);
    // Prisma error for foreign key constraint can be caught here
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
