
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { membershipPlanZodSchema } from '@/lib/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json();
    const validatedData = membershipPlanZodSchema.parse(json);

    // Prisma doesn't support discriminated union updates directly in a type-safe way
    // without manual casting, so we cast to `any` to update the JSON field
    // and other properties. The zod schema ensures the data is correct.
    const updatedPlan = await prisma.membershipPlan.update({
      where: { id: params.id },
      data: validatedData as any,
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
