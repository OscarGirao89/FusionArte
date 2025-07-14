
'use server';
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const taskNoteUpdateSchema = z.object({
  title: z.string().min(1, "El título es obligatorio.").optional(),
  description: z.string().optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.string().min(1, "La categoría es obligatoria.").optional(),
  assigneeIds: z.array(z.number()).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  alertDateTime: z.string().optional().nullable(),
}).partial();

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const json = await request.json();
        const data = taskNoteUpdateSchema.parse(json);

        const dataToUpdate: Prisma.TaskNoteUpdateInput = {};
        if (data.title) dataToUpdate.title = data.title;
        if (data.description) dataToUpdate.description = data.description;
        if (data.status) dataToUpdate.status = data.status;
        if (data.priority) dataToUpdate.priority = data.priority;
        if (data.category) dataToUpdate.category = data.category;
        if (data.dueDate) dataToUpdate.dueDate = data.dueDate;
        if (data.alertDateTime !== undefined) dataToUpdate.alertDateTime = data.alertDateTime;

        if (data.assigneeIds) {
            dataToUpdate.assignees = {
                set: data.assigneeIds.map(id => ({ id })),
            };
        }

        const updatedTask = await prisma.taskNote.update({
            where: { id: params.id },
            data: dataToUpdate,
        });

        return NextResponse.json(updatedTask);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
        }
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.taskNote.delete({
            where: { id: params.id },
        });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`Error deleting task ${params.id}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
