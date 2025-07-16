
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { membershipPlanZodSchema } from '@/lib/types';

export async function GET() {
  try {
    const plans = await prisma.membershipPlan.findMany();
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching membership plans:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const validatedData = membershipPlanZodSchema.parse(json);

    // Prisma requires manual casting for discriminated unions on create
    // The Zod schema has already validated the structure.
    const newPlan = await prisma.membershipPlan.create({
      data: validatedData as any,
    });
    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log(error.errors);
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    console.error('Error creating membership plan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
