
'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { membershipPlanZodSchema } from '@/lib/types';
import { Prisma } from '@prisma/client';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json();
    const validatedData = membershipPlanZodSchema.parse(json);

    const dataToUpdate: any = { ...validatedData };

    if (validatedData.priceTiers && Array.isArray(validatedData.priceTiers)) {
      dataToUpdate.priceTiers = JSON.stringify(validatedData.priceTiers);
    } else {
      dataToUpdate.priceTiers = Prisma.JsonNull;
    }

    const updatedPlan = await prisma.membershipPlan.update({
      where: { id: params.id },
      data: dataToUpdate,
    });
    
    let parsedTiers = [];
    if (typeof updatedPlan.priceTiers === 'string') {
        try {
          parsedTiers = JSON.parse(updatedPlan.priceTiers);
        } catch (e) {
          console.error(`Failed to parse priceTiers for updated plan ${updatedPlan.id}:`, e);
          parsedTiers = [];
        }
    } else if (Array.isArray(updatedPlan.priceTiers)) {
        parsedTiers = updatedPlan.priceTiers;
    }

    const response = {
        ...updatedPlan,
        priceTiers: parsedTiers
    };
    
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[API_UPDATE_MEMBERSHIP_ZOD_ERROR]', { id: params.id, errors: error.errors });
      return NextResponse.json({ error: 'Datos de membresía inválidos.', details: error.errors }, { status: 400 });
    }
    console.error(`[API_UPDATE_MEMBERSHIP_ERROR] ID: ${params.id}`, error);
    return NextResponse.json({ error: 'Error interno del servidor al actualizar el plan.', details: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    try {
        await prisma.membershipPlan.delete({
            where: { id: params.id },
        });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`[API_DELETE_MEMBERSHIP_ERROR] ID: ${params.id}:`, error);
        return NextResponse.json({ error: 'Error interno del servidor al eliminar el plan.', details: (error as Error).message }, { status: 500 });
    }
}
