'use client';

import { useMemo } from 'react';
import { users, danceClasses } from '@/lib/data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, DollarSign, Handshake, MinusCircle, Percent, Users, XCircle, Shield, FileText, UserCheck, Briefcase } from 'lucide-react';
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

type TeacherPayrollProps = {
    mode: 'studio_expenses' | 'partner_income';
    partnerId?: number;
};

export function TeacherPayroll({ mode, partnerId }: TeacherPayrollProps) {
    
    const calculation = useMemo(() => {
        if (mode === 'studio_expenses') {
             const nonPartnerTeachers = users.filter(u => u.role === 'Profesor' && !u.isPartner);
             const payroll = nonPartnerTeachers.map(user => {
                 const classesTaught = danceClasses.filter(c => c.teacherIds.includes(user.id));
                 let totalPay = 0;
                 const paymentDetails = user.paymentDetails;
                 
                 const classDetails = classesTaught.map(c => {
                     let classPay = 0;
                     if (!paymentDetails) return { ...c, classPay };
                     if (paymentDetails.type === 'per_class') {
                         if (c.status === 'completed') {
                             const durationHours = parseInt(c.duration.replace(' min', '')) / 60;
                             classPay = (durationHours * (paymentDetails.payRate || 0));
                         } else if (c.status === 'cancelled-low-attendance') {
                             classPay = paymentDetails.cancelledClassPay;
                         }
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

        if (mode === 'partner_income' && partnerId) {
            const partner = users.find(u => u.id === partnerId);
            if (!partner) return null;

            const classesTaught = danceClasses.filter(c => c.teacherIds.includes(partner.id));
            let individualIncome = 0;
            let sharedIncome = 0;
            const individualClasses: any[] = [];
            const sharedClasses: any[] = [];
            const paymentDetails = partner.paymentDetails;
            
            classesTaught.forEach(c => {
                let classPay = 0;
                let payDescription = '';
                const numTeachers = c.teacherIds.length || 1;
                const isShared = numTeachers > 1;

                if (!paymentDetails) return;

                if (c.type === 'workshop') {
                    if (c.workshopPaymentType === 'fixed') {
                        classPay = (c.workshopPaymentValue || 0) / numTeachers;
                        payDescription = `Tarifa fija ${isShared ? `(dividido entre ${numTeachers})` : ''}`;
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
                        payDescription = `Compensación ${isShared ? `(dividido entre ${numTeachers})` : ''}`;
                    }
                }
                
                const classDetails = { ...c, classPay, payDescription, isShared };
                
                if (isShared) {
                    sharedIncome += classPay;
                    sharedClasses.push(classDetails);
                } else {
                    individualIncome += classPay;
                    individualClasses.push(classDetails);
                }
            });

            let totalIncome = individualIncome + sharedIncome;
            if (paymentDetails?.type === 'monthly') {
                totalIncome = paymentDetails.monthlySalary || 0;
            }

            return { partner, individualClasses, sharedClasses, individualIncome, sharedIncome, totalIncome };
        }

        return null;

    }, [mode, partnerId]);
    

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
                                            <p className="text-xs text-muted-foreground">Pago total</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Clase</TableHead><TableHead className="text-right">Pago</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                        {classes.map((c: any) => (
                                            <TableRow key={c.id}><TableCell>{c.name}</TableCell><TableCell className="text-right font-mono">€{c.classPay.toFixed(2)}</TableCell></TableRow>
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

    const PartnerIncomeView = () => {
         if (!calculation || !('partner' in calculation) || !calculation.partner) return null;
         const { partner, individualClasses, sharedClasses, individualIncome, sharedIncome, totalIncome } = calculation;

         const renderTable = (title: string, classes: any[], icon: React.ReactNode) => (
             <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg">{icon} {title}</CardTitle></CardHeader>
                <CardContent>
                    {classes.length > 0 ? (
                    <Table>
                        <TableHeader><TableRow><TableHead>Clase/Taller</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Ingreso</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {classes.map((c: any) => {
                                const statusInfo = getStatusInfo(c.status);
                                return (
                                    <TableRow key={c.id}>
                                        <TableCell>
                                            <p className="font-medium">{c.name}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{c.type} - {c.date ? c.date : c.day}</p>
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
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No hay clases en esta categoría este mes.</p>
                    )}
                </CardContent>
            </Card>
         );

        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Resumen de Ingresos de {partner.name}</CardTitle>
                        <CardDescription>Desglose de los ingresos generados por las clases y talleres impartidos.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-muted/50"><CardHeader><CardTitle className="text-base">Ingresos Individuales</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">€{individualIncome.toFixed(2)}</p></CardContent></Card>
                        <Card className="bg-muted/50"><CardHeader><CardTitle className="text-base">Ingresos Compartidos</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">€{sharedIncome.toFixed(2)}</p></CardContent></Card>
                        <Card className="bg-primary/10"><CardHeader><CardTitle className="text-base">Ingresos Totales</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-primary">€{totalIncome.toFixed(2)}</p></CardContent></Card>
                    </CardContent>
                </Card>
                {renderTable("Ingresos por Clases Individuales", individualClasses, <UserCheck />)}
                {renderTable("Ingresos por Clases Compartidas", sharedClasses, <Handshake />)}
            </div>
        )
    }

    if (mode === 'studio_expenses') return <StudioExpensesView />;
    if (mode === 'partner_income') return <PartnerIncomeView />;

    return null;
}
