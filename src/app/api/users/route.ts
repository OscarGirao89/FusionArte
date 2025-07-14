
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { paymentDetailsSchema } from '@/lib/types';


const userCreateSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    role: z.string(),
    password: z.string().min(8),
    bio: z.string().optional().nullable(),
    specialties: z.string().optional().nullable(),
    paymentDetails: paymentDetailsSchema.optional().nullable(),
    avatar: z.string().optional().nullable(),
    isVisibleToStudents: z.boolean().optional(),
    isPartner: z.boolean().optional(),
});


export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        // Omitting related fields for general user list to improve performance
        // and avoid overly large responses. Specific user details are fetched by ID.
      }
    });
    // Omit password from the response
    const usersWithoutPassword = users.map(({ password, ...user }) => user);
    return NextResponse.json(usersWithoutPassword);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const validatedData = userCreateSchema.parse(data);
    
    const existingUser = await prisma.user.findUnique({ where: { email: validatedData.email } });
    if (existingUser) {
        return NextResponse.json({ error: 'El email ya está en uso.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    const newUser = await prisma.user.create({
        data: {
            name: validatedData.name,
            email: validatedData.email,
            password: hashedPassword,
            role: validatedData.role,
            avatar: validatedData.avatar,
            bio: validatedData.bio,
            specialties: validatedData.specialties?.split(',').map(s => s.trim()) || [],
            paymentDetails: validatedData.paymentDetails,
            isVisibleToStudents: validatedData.isVisibleToStudents,
            isPartner: validatedData.isPartner,
        }
    });

    const { password, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
     if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
