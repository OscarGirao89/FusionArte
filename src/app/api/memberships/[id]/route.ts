
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
    // We parse with the base schema first
    const validatedData = membershipPlanZodSchema.parse(json);

    // Prepare data for Prisma, ensuring JSON fields are handled correctly
    const dataToUpdate: any = { ...validatedData };

    if (validatedData.priceTiersJson) {
      dataToUpdate.priceTiersJson = JSON.stringify(validatedData.priceTiersJson);
    }

    const updatedPlan = await prisma.membershipPlan.update({
      where: { id: params.id },
      data: dataToUpdate,
    });
    return NextResponse.json(updatedPlan);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[API_UPDATE_MEMBERSHIP_ZOD_ERROR]', { id: params.id, errors: error.errors });
      return NextResponse.json({ error: 'Datos de membresía inválidos', details: error.errors }, { status: 400 });
    }
    console.error(`[API_UPDATE_MEMBERSHIP_ERROR] ID: ${params.id}`, error);
    return NextResponse.json({ error: 'Error interno del servidor al actualizar el plan.' }, { status: 500 });
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
        return NextResponse.json({ error: 'Error interno del servidor al eliminar el plan.' }, { status: 500 });
    }
}
