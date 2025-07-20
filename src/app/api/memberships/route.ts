
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
      // 1. Create a raw object with the data from the DB
      const rawPlanData = {
        ...plan,
        priceTiers: plan.priceTiers,
      };

      // 2. Safely parse priceTiers, ensuring it's always an array.
      if (typeof rawPlanData.priceTiers === 'string') {
        try {
          rawPlanData.priceTiers = JSON.parse(rawPlanData.priceTiers);
        } catch (e) {
          console.error(`Failed to parse priceTiers for plan ${plan.id}:`, e);
          rawPlanData.priceTiers = []; // Default to empty array on parsing error
        }
      } else if (rawPlanData.priceTiers === null) {
         rawPlanData.priceTiers = []; // Handle null from DB
      }

      // 3. Validate the processed object against the Zod schema before sending it.
      const validationResult = membershipPlanZodSchema.safeParse(rawPlanData);
      
      if (validationResult.success) {
        // Only add the plan to the response if it's valid
        parsedPlans.push(validationResult.data);
      } else {
        // Log the error on the server for debugging, but don't send the corrupted plan
        console.error(`[API_GET_MEMBERSHIPS_VALIDATION_ERROR] Invalid data in DB for plan ID: ${plan.id}. Errors:`, validationResult.error.flatten());
      }
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

    // Safely parse the response to ensure consistency
    let parsedTiers = [];
    if (newPlan.priceTiers && typeof newPlan.priceTiers === 'string') {
        try {
            parsedTiers = JSON.parse(newPlan.priceTiers);
        } catch (e) {
            parsedTiers = [];
        }
    }
    
    const response = {
        ...newPlan,
        priceTiers: parsedTiers
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
