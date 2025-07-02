
'use client';

import { useState } from 'react';
import { users, danceClasses } from '@/lib/data';
import type { User } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, DollarSign, MinusCircle, XCircle } from 'lucide-react';

const getStatusInfo = (status: string): { text: string; icon: React.ReactNode; color: string } => {
    switch (status) {
        case 'completed': return { text: 'Completada', icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-green-600' };
        case 'scheduled': return { text: 'Programada', icon: <AlertCircle className="h-4 w-4" />, color: 'text-blue-600' };
        case 'cancelled-low-attendance': return { text: 'Cancelada (pocos alumnos)', icon: <XCircle className="h-4 w-4" />, color: 'text-yellow-600' };
        case 'cancelled-teacher': return { text: 'Cancelada (profesor)', icon: <MinusCircle className="h-4 w-4" />, color: 'text-red-600' };
        default: return { text: 'Desconocido', icon: <AlertCircle className="h-4 w-4" />, color: 'text-gray-600' };
    }
}

export function TeacherPayroll() {
    
    const calculatePay = () => {
        const teachers = users.filter(u => u.role === 'Profesor');

        const payroll = teachers.map(teacher => {
            const classesTaught = danceClasses.filter(c => c.teacher === teacher.name);
            let totalPay = 0;
            const paymentDetails = teacher.paymentDetails;
            
            const classDetails = classesTaught.map(c => {
                let classPay = 0;
                if (!paymentDetails) return { ...c, classPay };

                if (paymentDetails.type === 'per_class') {
                    if (c.status === 'completed') {
                        const durationHours = parseInt(c.duration.replace(' min', '')) / 60;
                        classPay = durationHours * (paymentDetails.payRate || 0);
                    } else if (c.status === 'cancelled-low-attendance') {
                        classPay = paymentDetails.cancelledClassPay;
                    }
                    totalPay += classPay;
                }
                return { ...c, classPay };
            });

            if (paymentDetails?.type === 'monthly') {
                totalPay = paymentDetails.monthlySalary || 0;
            }

            return {
                teacher,
                classes: classDetails,
                totalPay,
            }
        });
        return payroll;
    }

    const payrollData = calculatePay();
    
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nómina de Profesores (Simulación)</CardTitle>
        <CardDescription>Calcula el pago pendiente para cada profesor basado en las clases impartidas este mes y su tipo de contrato.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
            {payrollData.map(({ teacher, classes, totalPay }) => (
                <AccordionItem value={teacher.name} key={teacher.id}>
                    <AccordionTrigger>
                        <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={teacher.avatar} alt={teacher.name} />
                                    <AvatarFallback>{teacher.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{teacher.name}</p>
                                    <p className="text-sm text-muted-foreground capitalize">
                                        {teacher.paymentDetails?.type === 'per_class' ? 'Pago por Clase' : 'Salario Mensual'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold">€{totalPay.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">Pago total estimado</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                       {teacher.paymentDetails?.type === 'per_class' ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Clase</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Pago</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {classes.map(c => {
                                    const statusInfo = getStatusInfo(c.status);
                                    return (
                                        <TableRow key={c.id}>
                                            <TableCell>
                                                <p className="font-medium">{c.name}</p>
                                                <p className="text-xs text-muted-foreground">{c.day}, {c.time}</p>
                                            </TableCell>
                                            <TableCell>
                                                <div className={`flex items-center gap-2 text-sm ${statusInfo.color}`}>
                                                    {statusInfo.icon} {statusInfo.text}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">€{c.classPay.toFixed(2)}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                       ) : (
                           <p className="p-4 text-sm text-muted-foreground">
                               Este profesor tiene un salario mensual fijo de €{teacher.paymentDetails.monthlySalary?.toFixed(2)}.
                           </p>
                       )}
                         <div className="flex justify-end mt-4">
                            <Button size="sm"><DollarSign className="mr-2 h-4 w-4" /> Marcar como Pagado</Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
