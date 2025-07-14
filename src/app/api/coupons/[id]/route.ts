import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const couponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive(),
  expirationDate: z.string().optional().nullable(),
  usageLimit: z.number().int().min(1).optional().nullable(),
  status: z.enum(['active', 'inactive']),
  applicableTo: z.enum(['all_memberships', 'specific_memberships', 'all_classes', 'specific_classes']),
  specificPlanIds: z.array(z.string()).optional(),
  specificClassIds: z.array(z.string()).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const validatedData = couponSchema.parse(data);
    const couponData = {
        ...validatedData,
        expirationDate: validatedData.expirationDate ? new Date(validatedData.expirationDate) : null,
        usageLimit: validatedData.usageLimit,
    };
    const updatedCoupon = await prisma.coupon.update({
      where: { id: params.id },
      data: couponData,
    });
    return NextResponse.json(updatedCoupon);
  } catch (error) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(`Error updating coupon ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.coupon.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting coupon ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
