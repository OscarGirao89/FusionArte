
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { membershipPlanZodSchema } from '@/lib/types';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const plans = await prisma.membershipPlan.findMany();
    // Ensure priceTiers is always an array when sent to client
    const parsedPlans = plans.map(plan => ({
      ...plan,
      priceTiers: (plan.priceTiers && typeof plan.priceTiers === 'string') 
        ? JSON.parse(plan.priceTiers) 
        : (plan.priceTiers || []),
    }));
    return NextResponse.json(parsedPlans);
  } catch (error) {
    console.error('[API_GET_MEMBERSHIPS_ERROR]', error);
    return NextResponse.json({ error: 'Error interno del servidor al obtener los planes.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const validatedData = membershipPlanZodSchema.parse(json);

    // Prisma expects JSON fields to be passed as strings or Prisma.JsonNull
    const dataToCreate: any = { ...validatedData };
    
    if (validatedData.priceTiers && Array.isArray(validatedData.priceTiers) && validatedData.priceTiers.length > 0) {
      dataToCreate.priceTiers = JSON.stringify(validatedData.priceTiers);
    } else {
      dataToCreate.priceTiers = Prisma.JsonNull;
    }
    
    const newPlan = await prisma.membershipPlan.create({
      data: dataToCreate,
    });

    // Parse the JSON string back into an array for the response
    const response = {
        ...newPlan,
        priceTiers: (newPlan.priceTiers && typeof newPlan.priceTiers === 'string')
            ? JSON.parse(newPlan.priceTiers)
            : (newPlan.priceTiers || [])
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[API_CREATE_MEMBERSHIP_ZOD_ERROR]', error.errors);
      return NextResponse.json({ error: 'Datos de membresía inválidos.', details: error.errors }, { status: 400 });
    }
    console.error('[API_CREATE_MEMBERSHIP_ERROR]', error);
    return NextResponse.json({ error: 'Error interno del servidor al crear el plan.', details: (error as Error).message }, { status: 500 });
  }
}
