
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const priceTierSchema = z.object({
  classCount: z.coerce.number().int().min(1),
  price: z.coerce.number().min(0)
});

const baseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  features: z.array(z.string()),
  isPopular: z.boolean().default(false),
  durationUnit: z.enum(['days', 'weeks', 'months']),
  durationValue: z.coerce.number().int().min(1),
  visibility: z.enum(['public', 'unlisted']).default('public'),
  allowedClasses: z.array(z.string()).optional().default([]),
});

const formSchema = z.discriminatedUnion("accessType", [
  z.object({ accessType: z.literal("unlimited"), price: z.coerce.number().min(0) }).merge(baseSchema),
  z.object({ accessType: z.literal("class_pack"), price: z.coerce.number().min(0), classCount: z.coerce.number().int().min(1) }).merge(baseSchema),
  z.object({ accessType: z.literal("trial_class"), price: z.coerce.number().min(0), classCount: z.coerce.number().int().min(1) }).merge(baseSchema),
  z.object({ accessType: z.literal("course_pass"), price: z.coerce.number().min(0) }).merge(baseSchema),
  z.object({ accessType: z.literal("custom_pack"), priceTiersJson: z.array(priceTierSchema).min(1) }).merge(baseSchema)
]);

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json();
    const validatedData = formSchema.parse(json);

    const updatedPlan = await prisma.membershipPlan.update({
      where: { id: params.id },
      data: validatedData,
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
