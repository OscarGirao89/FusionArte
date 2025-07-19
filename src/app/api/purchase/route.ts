
'use server';
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { add, startOfMonth, endOfMonth, addMonths, subDays } from 'date-fns';
import { membershipPlanZodSchema } from '@/lib/types';

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

    const planData = await prisma.membershipPlan.findUnique({ where: { id: planId } });
    if (!planData) {
      return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 });
    }
    
    // Validate the plan data with the Zod schema to ensure all fields are present and correctly typed
    const plan = membershipPlanZodSchema.parse(planData);

    const finalPrice = totalPrice ?? ('price' in plan && plan.price ? plan.price : 0);
    const classesRemaining = classCount ?? (plan.accessType === 'class_pack' ? plan.classCount : undefined);

    let startDate: Date;
    let endDate: Date;
    const now = new Date();

    if (plan.validityType === 'fixed') {
        startDate = new Date(plan.startDate!);
        endDate = new Date(plan.endDate!);
    } else if (plan.validityType === 'monthly') {
        const startMonth = plan.monthlyStartType === 'next_month' ? addMonths(now, 1) : now;
        startDate = plan.monthlyStartType === 'next_month' ? startOfMonth(startMonth) : now;
        endDate = subDays(addMonths(startDate, plan.validityMonths || 1), 1);
    } else { // relative
        startDate = now;
        endDate = add(startDate, {
            [plan.durationUnit!]: plan.durationValue!
        });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Create the invoice (StudentPayment)
      await tx.studentPayment.create({
        data: {
          studentId: userId,
          planId: planId,
          invoiceDate: now.toISOString(),
          totalAmount: finalPrice,
          status: 'pending',
          amountPaid: 0,
          amountDue: finalPrice,
          lastUpdatedBy: 'Sistema',
          lastUpdatedDate: new Date().toISOString(),
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
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          classesRemaining: classesRemaining,
        },
      });
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
