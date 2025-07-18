
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

    if (validatedData.priceTiersJson) {
      dataToUpdate.priceTiersJson = validatedData.priceTiersJson as Prisma.JsonValue;
    }

    const updatedPlan = await prisma.membershipPlan.update({
      where: { id: params.id },
      data: dataToUpdate,
    });
    return NextResponse.json(updatedPlan);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log(error.errors);
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    console.error('Error updating membership plan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
        console.error(`Error deleting membership plan ${params.id}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
