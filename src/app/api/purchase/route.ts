
'use server';
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { add } from 'date-fns';

const purchaseSchema = z.object({
  userId: z.number(),
  planId: z.string(),
  classCount: z.number().optional(), // For custom packs
  totalPrice: z.number().optional(), // For custom packs
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, planId, classCount, totalPrice } = purchaseSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 });
    }

    // Use a robust fallback for the price.
    // 1. Use `totalPrice` if it's a custom pack.
    // 2. Use `plan.price` if it's a standard plan.
    // 3. Default to 0 if neither exists (safety net).
    const finalPrice = totalPrice ?? plan.price ?? 0;
    
    const classesRemaining = classCount ?? ('classCount' in plan ? plan.classCount : undefined);

    const startDate = new Date();
    const endDate = add(startDate, {
        [plan.durationUnit]: plan.durationValue
    });

    await prisma.$transaction(async (tx) => {
      // 1. Create the invoice (StudentPayment)
      await tx.studentPayment.create({
        data: {
          studentId: userId,
          planId: planId,
          invoiceDate: startDate,
          totalAmount: finalPrice,
          status: 'pending',
          amountPaid: 0,
          amountDue: finalPrice,
          lastUpdatedBy: 'Sistema',
          lastUpdatedDate: new Date(),
        },
      });

      // 2. Delete old membership and create the new one
      await tx.studentMembership.deleteMany({
        where: { userId: userId },
      });
      
      await tx.studentMembership.create({
        data: {
          userId: userId,
          planId: planId,
          startDate: startDate,
          endDate: endDate,
          classesRemaining: classesRemaining,
        },
      });

      // In a real scenario with class selection, you would enroll the user here.
      // For now, we just assign the membership.
    });

    return NextResponse.json({ success: true, message: 'Compra realizada con éxito' });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos de solicitud inválidos', details: error.errors }, { status: 400 });
    }
    console.error('Purchase error:', error);
    return NextResponse.json({ error: 'Error interno del servidor al procesar la compra' }, { status: 500 });
  }
}
