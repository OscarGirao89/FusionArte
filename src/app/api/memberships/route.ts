
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { membershipPlanZodSchema } from '@/lib/types';

export async function GET() {
  try {
    const plans = await prisma.membershipPlan.findMany();
    // Ensure priceTiersJson is always an array when sent to client
    const parsedPlans = plans.map(plan => ({
      ...plan,
      priceTiersJson: plan.priceTiersJson && typeof plan.priceTiersJson === 'string' 
        ? JSON.parse(plan.priceTiersJson) 
        : (plan.priceTiersJson || []),
    }));
    return NextResponse.json(parsedPlans);
  } catch (error) {
    console.error('Error fetching membership plans:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const validatedData = membershipPlanZodSchema.parse(json);

    // Prisma expects JSON fields to be passed as strings or Prisma.JsonNull
    const dataToCreate = {
      ...validatedData,
      priceTiersJson: validatedData.priceTiersJson 
        ? (JSON.stringify(validatedData.priceTiersJson) as any)
        : undefined,
    };

    const newPlan = await prisma.membershipPlan.create({
      data: dataToCreate as any,
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
