
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        taughtClasses: true,
        enrolledClasses: true,
        memberships: true,
        payments: true,
        assignedTasks: true,
        attendanceHistory: true,
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
    
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
        return NextResponse.json({ error: 'El email ya está en uso.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const newUser = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: data.role || 'Estudiante',
            avatar: data.avatar,
        }
    });

    const { password, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
