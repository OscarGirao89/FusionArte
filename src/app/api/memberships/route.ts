
'use server';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { membershipPlanZodSchema } from '@/lib/types';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const plansFromDb = await prisma.membershipPlan.findMany();
    
    const safeParsedPlans = plansFromDb.map(plan => {
      let priceTiersArray: any[] = [];
      if (typeof plan.priceTiers === 'string') {
        try {
          priceTiersArray = JSON.parse(plan.priceTiers);
        } catch (e) {
          console.error(`Error al parsear priceTiers para el plan ${plan.id}:`, e);
          priceTiersArray = [];
        }
      } else if (Array.isArray(plan.priceTiers)) {
        priceTiersArray = plan.priceTiers;
      }

      const planResponse: z.infer<typeof membershipPlanZodSchema> = {
        id: plan.id,
        title: plan.title,
        description: plan.description,
        accessType: plan.accessType as 'time_pass' | 'class_pack' | 'custom_pack',
        price: plan.price ?? undefined,
        classCount: plan.classCount ?? undefined,
        priceTiers: priceTiersArray,
        validityType: plan.validityType as 'relative' | 'monthly' | 'fixed',
        durationValue: plan.durationValue ?? undefined,
        durationUnit: plan.durationUnit as 'days' | 'weeks' | 'months' | undefined,
        validityMonths: plan.validityMonths ?? undefined,
        monthlyStartType: plan.monthlyStartType as 'from_purchase' | 'next_month' | undefined,
        startDate: plan.startDate?.toISOString(),
        endDate: plan.endDate?.toISOString(),
        features: Array.isArray(plan.features) ? plan.features : [],
        isPopular: plan.isPopular ?? false,
        visibility: plan.visibility as 'public' | 'unlisted',
        allowedClasses: Array.isArray(plan.allowedClasses) ? plan.allowedClasses : [],
      };
      
      return planResponse;
    });

    return NextResponse.json(safeParsedPlans);
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
        priceTiers: parsedTiers,
        accessType: newPlan.accessType as 'time_pass' | 'class_pack' | 'custom_pack',
        validityType: newPlan.validityType as 'relative' | 'monthly' | 'fixed',
        durationUnit: newPlan.durationUnit as 'days' | 'weeks' | 'months' | undefined,
        monthlyStartType: newPlan.monthlyStartType as 'from_purchase' | 'next_month' | undefined,
        visibility: newPlan.visibility as 'public' | 'unlisted'
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
