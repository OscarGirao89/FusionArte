
'use client';

import React, { useMemo, useEffect } from 'react';
import { users, danceClasses, membershipPlans } from '@/lib/data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, CheckCircle2, DollarSign, Handshake, MinusCircle, Percent, Users, XCircle, Shield, FileText, UserCheck, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from '@/context/auth-context';
import { useAttendance } from '@/context/attendance-context';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ClassInstance } from '@/lib/types';


const getStatusInfo = (status: string): { text: string; icon: React.ReactNode; color: string } => {
    switch (status) {
        case 'completed': return { text: 'Completada', icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-green-600' };
        case 'scheduled': return { text: 'Programada', icon: <AlertCircle className="h-4 w-4" />, color: 'text-blue-600' };
        case 'cancelled-low-attendance': return { text: 'Cancelada (pocos alumnos)', icon: <XCircle className="h-4 w-4" />, color: 'text-yellow-600' };
        case 'cancelled-teacher': return { text: 'Cancelada (profesor)', icon: <MinusCircle className="h-4 w-4" />, color: 'text-red-600' };
        default: return { text: 'Desconocido', icon: <AlertCircle className="h-4 w-4" />, color: 'text-gray-600' };
    }
}

const getStudentName = (id: number) => users.find(u => u.id === id)?.name || 'Desconocido';
const getPlanName = (id: string) => membershipPlans.find(p => p.id === id)?.title || 'Desconocido';


type TeacherPayrollProps = {
    mode: 'studio_expenses' | 'partner_income' | 'teacher_income';
    partnerId?: number | null; // For partner income
    teacherId?: number | null; // For individual teacher income
};

export const TeacherPayroll = React.memo(function TeacherPayroll({ mode, partnerId, teacherId }: TeacherPayrollProps) {
    const { generateInstancesForTeacher, classInstances } = useAttendance();

    // Generate instances for all relevant teachers when the component mounts
    useEffect(() => {
        const today = new Date();
        const start = startOfMonth(today);
        const end = endOfMonth(today);

        if (mode === 'studio_expenses') {
            const nonPartnerTeachers = users.filter(u => u.role === 'Profesor' && !u.isPartner);
            nonPartnerTeachers.forEach(teacher => generateInstancesForTeacher(teacher.id, start, end));
        } else if (mode === 'partner_income' && partnerId) {
            generateInstancesForTeacher(partnerId, start, end);
        } else if (mode === 'teacher_income' && teacherId) {
            generateInstancesForTeacher(teacherId, start, end);
        }
    }, [mode, partnerId, teacherId, generateInstancesForTeacher]);

    const calculation = useMemo(() => {
        if (mode === 'studio_expenses') {
             const nonPartnerTeachers = users.filter(u => u.role === 'Profesor' && !u.isPartner);
             const payroll = nonPartnerTeachers.map(user => {
                 const classesTaught = classInstances.filter(c => c.teacherIds.includes(user.id) && c.status === 'completed');
                 let totalPay = 0;
                 const paymentDetails = user.paymentDetails;
                 
                 const classDetails = classesTaught.map(c => {
                     let classPay = 0;
                     if (!paymentDetails) return { ...c, classPay };
                     if (paymentDetails.type === 'per_class' && c.status === 'completed') {
                         const durationHours = parseInt(c.duration.replace(' min', '')) / 60;
                         classPay = (durationHours * (paymentDetails.payRate || 0));
                     }
                     totalPay += classPay;
                     return { ...c, classPay };
                 });

                 if (paymentDetails?.type === 'monthly') {
                     totalPay = paymentDetails.monthlySalary || 0;
                 }
                 return { user, classes: classDetails, totalPay };
             });
             return { payroll };
        }

        if ((mode === 'partner_income' && partnerId) || (mode === 'teacher_income' && teacherId)) {
            const currentTeacherId = partnerId || teacherId;
            const teacher = users.find(u => u.id === currentTeacherId);
            if (!teacher) return null;

            const classesTaught = classInstances.filter(c => c.teacherIds.includes(teacher.id));
            let totalIncome = 0;
            const paymentDetails = teacher.paymentDetails;
            
            const incomeDetails = classesTaught.map(c => {
                 let classPay = 0;
                 let payDescription = '';
                 const numTeachers = c.teacherIds.length || 1;
                 
                 if (!paymentDetails) return { ...c, classPay, payDescription };

                 if (c.status === 'completed') {
                    if (c.type === 'workshop') {
                        if (c.workshopPaymentType === 'fixed') {
                            classPay = (c.workshopPaymentValue || 0) / numTeachers;
                            payDescription = `Tarifa fija dividida`;
                        } else { // percentage
                            payDescription = `Porcentaje (${c.workshopPaymentValue}%)`;
                        }
                    } else if (paymentDetails.type === 'per_class') {
                        const durationHours = parseInt(c.duration.replace(' min', '')) / 60;
                        classPay = (durationHours * (paymentDetails.payRate || 0)) / numTeachers;
                        payDescription = `${durationHours}h a €${paymentDetails.payRate}/h`;
                    }
                 } else if (c.status === 'cancelled-low-attendance') {
                     classPay = paymentDetails.cancelledClassPay / numTeachers;
                     payDescription = `Compensación por cancelación`;
                 }
                
                 if (numTeachers > 1) {
                    payDescription += ` (entre ${numTeachers})`;
                 }
                 
                 totalIncome += classPay;
                 return { ...c, classPay, payDescription };
            });

            if (paymentDetails?.type === 'monthly') {
                totalIncome = paymentDetails.monthlySalary || 0;
            }
            
            return { teacher, incomeDetails, totalIncome };
        }

        return null;

    }, [mode, partnerId, teacherId, classInstances]);
    
    const StudioExpensesView = () => {
        if (!calculation || !('payroll' in calculation)) return null;
        const { payroll } = calculation;

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Briefcase /> Nómina de Profesores (No Socios)</CardTitle>
                    <CardDescription>Pagos a realizar a profesores que no son socios del estudio. Esto se considera un egreso.</CardDescription>
                </CardHeader>
                 <CardContent>
                     <Accordion type="single" collapsible className="w-full">
                        {payroll.map(({ user, classes, totalPay }) => (
                            <AccordionItem value={user.name} key={user.id}>
                                <AccordionTrigger>
                                     <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center gap-4">
                                            <Avatar><AvatarImage src={user.avatar} alt={user.name} /><AvatarFallback>{user.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar>
                                            <div><p className="font-medium">{user.name}</p></div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-red-600">€{totalPay.toFixed(2)}</p>
                                            <p className="text-xs text-muted-foreground">Pago total del mes</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Clase</TableHead><TableHead>Fecha</TableHead><TableHead className="text-right">Pago</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                        {classes.map((c: any) => (
                                            <TableRow key={c.instanceId}><TableCell>{c.name}</TableCell><TableCell>{format(parseISO(c.date), 'PPP', {locale: es})}</TableCell><TableCell className="text-right font-mono">€{c.classPay.toFixed(2)}</TableCell></TableRow>
                                        ))}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                 </CardContent>
            </Card>
        )
    };
    
    const IncomeView = () => {
        if (!calculation || !('teacher' in calculation) || !calculation.teacher) return null;
        const { teacher, incomeDetails, totalIncome } = calculation;
        
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><DollarSign /> Resumen de Ingresos Mensuales</CardTitle>
                    <CardDescription>
                        Desglose de los ingresos generados por las clases y talleres impartidos este mes.
                    </CardDescription>
                </CardHeader>
                 <CardContent>
                    <div className="p-4 rounded-lg bg-muted/50 mb-6">
                        <p className="text-sm text-muted-foreground">Ingreso Total Estimado (este mes)</p>
                        <p className="text-3xl font-bold text-primary">€{totalIncome.toFixed(2)}</p>
                    </div>
                     <Table>
                        <TableHeader><TableRow><TableHead>Clase/Taller</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Ingreso</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {incomeDetails?.map((c: any) => {
                                const statusInfo = getStatusInfo(c.status);
                                return (
                                    <TableRow key={c.instanceId}>
                                        <TableCell>
                                            <p className="font-medium">{c.name}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{c.type} - {format(parseISO(c.date), 'PPP', { locale: es })}</p>
                                        </TableCell>
                                        <TableCell><div className={`flex items-center gap-2 text-sm ${statusInfo.color}`}>{statusInfo.icon} {statusInfo.text}</div></TableCell>
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
                 </CardContent>
            </Card>
        )
    };

    if (mode === 'studio_expenses') return <StudioExpensesView />;
    if (mode === 'partner_income') return <IncomeView />;
    if (mode === 'teacher_income') return <IncomeView />;

    return null;
});
