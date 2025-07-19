
'use server';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { membershipPlanZodSchema } from '@/lib/types';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const plansFromDb = await prisma.membershipPlan.findMany();
    
    const parsedPlans = [];
    for (const plan of plansFromDb) {
      let parsedTiers = [];
      
      // Safely parse priceTiers, ensuring it's always an array.
      if (typeof plan.priceTiers === 'string' && plan.priceTiers.trim().startsWith('[')) {
        try {
          parsedTiers = JSON.parse(plan.priceTiers);
        } catch (e) {
          console.error(`Failed to parse priceTiers for plan ${plan.id}:`, e);
          parsedTiers = []; // Default to empty array on parsing error
        }
      } else if (Array.isArray(plan.priceTiers)) {
        parsedTiers = plan.priceTiers; // Already in correct format
      }

      // Explicitly construct the response object to ensure all fields are present
      // and prevent corrupted data from being sent to the client.
      const planResponse = {
        id: plan.id,
        title: plan.title,
        description: plan.description,
        accessType: plan.accessType,
        price: plan.price,
        classCount: plan.classCount,
        validityType: plan.validityType,
        durationValue: plan.durationValue,
        durationUnit: plan.durationUnit,
        validityMonths: plan.validityMonths,
        monthlyStartType: plan.monthlyStartType,
        startDate: plan.startDate,
        endDate: plan.endDate,
        features: plan.features,
        isPopular: plan.isPopular,
        visibility: plan.visibility,
        allowedClasses: plan.allowedClasses,
        priceTiers: parsedTiers, // Use the safely parsed value
      };

      parsedPlans.push(planResponse);
    }

    return NextResponse.json(parsedPlans);
  } catch (error) {
    console.error('[API_GET_MEMBERSHIPS_ERROR]', error);
    return NextResponse.json({ error: 'Error interno del servidor al obtener los planes.', details: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const validatedData = membershipPlanZodSchema.parse(json);

    const dataToCreate: any = { ...validatedData };
    
    if (validatedData.priceTiers && Array.isArray(validatedData.priceTiers) && validatedData.priceTiers.length > 0) {
      dataToCreate.priceTiers = JSON.stringify(validatedData.priceTiers);
    } else {
      dataToCreate.priceTiers = Prisma.JsonNull;
    }
    
    const newPlan = await prisma.membershipPlan.create({
      data: dataToCreate,
    });

    const response = {
        ...newPlan,
        priceTiers: (newPlan.priceTiers && typeof newPlan.priceTiers === 'string')
            ? JSON.parse(newPlan.priceTiers)
            : []
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[API_CREATE_MEMBERSHIP_ZOD_ERROR]', { errors: error.errors });
      return NextResponse.json({ error: 'Datos de membresía inválidos.', details: error.errors }, { status: 400 });
    }
    console.error('[API_CREATE_MEMBERSHIP_ERROR]', error);
    return NextResponse.json({ error: 'Error interno del servidor al crear el plan.', details: (error as Error).message }, { status: 500 });
  }
}
