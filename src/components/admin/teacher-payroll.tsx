
'use client';

import { useState } from 'react';
import { users, danceClasses } from '@/lib/data';
import type { User } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, DollarSign, Handshake, MinusCircle, Percent, Users, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
        const teachersAndPartners = users.filter(u => u.role === 'Profesor' || u.role === 'Socio');

        const payroll = teachersAndPartners.map(user => {
            const classesTaught = danceClasses.filter(c => c.teacherIds.includes(user.id));
            let totalPay = 0;
            const paymentDetails = user.paymentDetails;
            
            const classDetails = classesTaught.map(c => {
                let classPay = 0;
                let payDescription = '';

                if (!paymentDetails) return { ...c, classPay, payDescription, isShared: false };

                const numTeachers = c.teacherIds.length || 1;
                const isShared = numTeachers > 1;

                if (c.type === 'workshop') {
                    if (c.workshopPaymentType === 'fixed') {
                        classPay = (c.workshopPaymentValue || 0) / numTeachers;
                        payDescription = `Tarifa fija de taller ${isShared ? `(dividido entre ${numTeachers})` : ''}`;
                    } else { // percentage
                        payDescription = `Porcentaje (${c.workshopPaymentValue}%)`;
                    }
                } else if (paymentDetails.type === 'per_class') {
                    if (c.status === 'completed') {
                        const durationHours = parseInt(c.duration.replace(' min', '')) / 60;
                        classPay = (durationHours * (paymentDetails.payRate || 0)) / numTeachers;
                        payDescription = `${durationHours}h a €${paymentDetails.payRate}/h ${isShared ? `(dividido entre ${numTeachers})` : ''}`;
                    } else if (c.status === 'cancelled-low-attendance') {
                        classPay = paymentDetails.cancelledClassPay / numTeachers;
                        payDescription = `Compensación ${isShared ? `(dividida entre ${numTeachers})` : ''}`;
                    }
                }
                
                totalPay += classPay;
                return { ...c, classPay, payDescription, isShared };
            });

            if (paymentDetails?.type === 'monthly') {
                totalPay = paymentDetails.monthlySalary || 0;
            }

            return {
                user,
                classes: classDetails,
                totalPay,
            }
        });
        
        const partners = payroll.filter(p => p.user.isPartner);
        const nonPartners = payroll.filter(p => !p.user.isPartner);

        return { partners, nonPartners };
    }

    const { partners, nonPartners } = calculatePay();
    
    const renderAccordion = (data: any[], title: string) => (
        <div>
            <h3 className="text-lg font-semibold my-4 flex items-center gap-2">{title === 'Socios' ? <Handshake/> : <Users/>} {title}</h3>
            <Accordion type="single" collapsible className="w-full">
                {data.map(({ user, classes, totalPay }) => (
                    <AccordionItem value={user.name} key={user.id}>
                        <AccordionTrigger>
                            <div className="flex items-center justify-between w-full pr-4">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback>{user.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm text-muted-foreground capitalize">
                                                {user.paymentDetails?.type === 'per_class' ? 'Pago por Evento' : 'Salario Mensual'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold">€{totalPay.toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">Pago total estimado</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                        {user.paymentDetails?.type !== 'monthly' ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Clase/Taller</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Pago</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {classes.map((c: any) => {
                                        const statusInfo = getStatusInfo(c.status);
                                        return (
                                            <TableRow key={c.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                      <p className="font-medium">{c.name}</p>
                                                      <Badge variant={c.isShared ? "destructive" : "secondary"}>{c.isShared ? 'Compartida' : 'Individual'}</Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground capitalize">{c.type} - {c.date ? c.date : c.day}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <div className={`flex items-center gap-2 text-sm ${statusInfo.color}`}>
                                                        {statusInfo.icon} {statusInfo.text}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <p className="font-mono font-semibold">
                                                    {c.workshopPaymentType === 'percentage' 
                                                            ? <span className="flex items-center justify-end gap-1"><Percent className="h-3 w-3" />{c.workshopPaymentValue}%</span>
                                                            : `€${c.classPay.toFixed(2)}`
                                                    }
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{c.payDescription}</p>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="p-4 text-sm text-muted-foreground">
                                    Este profesor tiene un salario mensual fijo de €{user.paymentDetails.monthlySalary?.toFixed(2)}.
                            </p>
                        )}
                            <div className="flex justify-end mt-4">
                                <Button size="sm"><DollarSign className="mr-2 h-4 w-4" /> Marcar como Pagado</Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nómina y Resumen de Socios</CardTitle>
        <CardDescription>Calcula el pago para profesores y socios basado en las clases del mes y su tipo de contrato.</CardDescription>
      </CardHeader>
      <CardContent>
        {partners.length > 0 && renderAccordion(partners, 'Socios')}
        {nonPartners.length > 0 && (
            <>
                <Separator className="my-6" />
                {renderAccordion(nonPartners, 'Profesores')}
            </>
        )}
      </CardContent>
    </Card>
  );
}
