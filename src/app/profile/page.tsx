
'use client';

import { useAuth } from "@/context/auth-context";
import { userProfiles } from "@/components/layout/main-nav";
import { users as allUsers, membershipPlans } from '@/lib/data';
import type { StudentPayment } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, parseISO, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Printer, TicketPercent, User, Calendar, BadgeCheck, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const paymentStatusLabels: Record<StudentPayment['status'], string> = {
    paid: 'Pagado',
    pending: 'Pendiente',
    deposit: 'Adelanto',
};

export default function ProfilePage() {
    const { userRole, studentMemberships, studentPayments } = useAuth();
    const { toast } = useToast();

    if (userRole !== 'student') {
        return (
            <div className="flex flex-1 items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle>Acceso Denegado</CardTitle>
                        <CardDescription>Esta página es solo para estudiantes.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    const currentUserProfile = userProfiles[userRole];
    const student = allUsers.find(u => u.id === currentUserProfile.id);
    const membership = studentMemberships.find(m => m.userId === student?.id);
    const plan = membership ? membershipPlans.find(p => p.id === membership.planId) : null;
    const payment = membership ? studentPayments.find(p => p.studentId === student?.id && p.planId === membership.planId) : null;

    const handlePrintReceipt = () => {
        if (!student || !plan || !membership || !payment) {
            toast({
                title: "Error al imprimir",
                description: "No se pudo generar el comprobante. Asegúrate de que tienes una membresía activa.",
                variant: "destructive",
            });
            return;
        }

        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Comprobante de Membresía</title>');
            printWindow.document.write('<style>body { font-family: sans-serif; margin: 2rem; } .receipt { border: 1px solid #ccc; padding: 1.5rem; border-radius: 8px; } h1 { text-align: center; } table { width: 100%; border-collapse: collapse; margin-top: 1rem; } td { padding: 0.5rem; border-bottom: 1px solid #eee; } .status { font-weight: bold; text-transform: uppercase; } .status-paid { color: green; } .status-pending { color: orange; } .status-deposit { color: blue; }</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write('<div class="receipt">');
            printWindow.document.write('<h1>Comprobante de Membresía - FusionArte</h1>');
            printWindow.document.write('<hr>');
            printWindow.document.write('<table>');
            printWindow.document.write(`<tr><td><strong>Alumno:</strong></td><td>${student.name}</td></tr>`);
            printWindow.document.write(`<tr><td><strong>Plan:</strong></td><td>${plan.title}</td></tr>`);
            printWindow.document.write(`<tr><td><strong>Precio Total:</strong></td><td>€${payment.totalAmount.toFixed(2)}</td></tr>`);
            printWindow.document.write(`<tr><td><strong>Monto Pagado:</strong></td><td>€${payment.amountPaid.toFixed(2)}</td></tr>`);
            printWindow.document.write(`<tr><td><strong>Monto Pendiente:</strong></td><td>€${payment.amountDue.toFixed(2)}</td></tr>`);
            printWindow.document.write(`<tr><td><strong>Estado:</strong></td><td class="status status-${payment.status}">${paymentStatusLabels[payment.status]}</td></tr>`);
            printWindow.document.write(`<tr><td><strong>Fecha de Inicio:</strong></td><td>${format(parseISO(membership.startDate), 'PPP', { locale: es })}</td></tr>`);
            printWindow.document.write(`<tr><td><strong>Fecha de Vencimiento:</strong></td><td>${format(parseISO(membership.endDate), 'PPP', { locale: es })}</td></tr>`);
            if (plan.accessType === 'class_pack') {
                printWindow.document.write(`<tr><td><strong>Clases Restantes:</strong></td><td>${membership.classesRemaining || 0}</td></tr>`);
            }
            printWindow.document.write('</table>');
            printWindow.document.write('<p style="margin-top: 2rem; text-align: center; font-size: 0.8rem; color: #666;">¡Gracias por ser parte de nuestra comunidad!</p>');
            printWindow.document.write('</div>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };
    
    if (!student) return <div>Cargando...</div>;

    return (
        <div className="p-4 md:p-8 space-y-8">
             <h1 className="text-3xl font-bold tracking-tight font-headline">Mi Perfil</h1>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader className="items-center text-center">
                            <Avatar className="h-24 w-24 mb-4">
                                <AvatarImage src={student.avatar} alt={student.name}/>
                                <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="font-headline">{student.name}</CardTitle>
                            <CardDescription>{student.email}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                             <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Miembro desde {format(parseISO(student.joined), 'MMMM yyyy', {locale: es})}</div>
                             {student.dob && <div className="flex items-center gap-2"><User className="h-4 w-4" /> {format(parseISO(student.dob), 'd MMMM, yyyy', {locale: es})}</div>}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                             <div>
                                <CardTitle className="flex items-center gap-2 font-headline"><TicketPercent className="h-6 w-6 text-primary"/> Mi Membresía</CardTitle>
                                <CardDescription>El estado actual de tu plan y pagos.</CardDescription>
                             </div>
                             <Button variant="outline" size="sm" onClick={handlePrintReceipt} disabled={!membership}>
                                <Printer className="mr-2 h-4 w-4" />
                                Imprimir Comprobante
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {membership && plan && payment ? (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold">{plan.title}</h3>
                                    <div className="flex items-center gap-2">
                                        {isBefore(new Date(), parseISO(membership.endDate)) 
                                        ? <Badge><BadgeCheck className="mr-1 h-4 w-4"/>Activa</Badge>
                                        : <Badge variant="destructive"><XCircle className="mr-1 h-4 w-4"/>Expirada</Badge>
                                        }
                                        <Badge variant={payment.status === 'paid' ? 'default' : payment.status === 'pending' ? 'destructive' : 'secondary'}>
                                            {paymentStatusLabels[payment.status]}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t pt-4">
                                        <div>
                                            <p className="font-medium">Periodo de Validez</p>
                                            <p className="text-muted-foreground">{format(parseISO(membership.startDate), 'dd/MM/yy', {locale: es})} - {format(parseISO(membership.endDate), 'dd/MM/yy', {locale: es})}</p>
                                        </div>
                                         {plan.accessType === 'class_pack' && (
                                            <div>
                                                <p className="font-medium">Clases Restantes</p>
                                                <p className="text-muted-foreground">{membership.classesRemaining ?? 0} / {plan.classCount}</p>
                                            </div>
                                         )}
                                        <div>
                                            <p className="font-medium">Total Facturado</p>
                                            <p className="text-muted-foreground">€{payment.totalAmount.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium">Total Pagado</p>
                                            <p className="text-muted-foreground">€{payment.amountPaid.toFixed(2)}</p>
                                        </div>
                                        {payment.amountDue > 0 && (
                                            <div>
                                                <p className="font-medium text-destructive">Saldo Pendiente</p>
                                                <p className="text-destructive font-bold">€{payment.amountDue.toFixed(2)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No tienes una membresía activa en este momento.</p>
                                    <Button className="mt-4" onClick={() => window.location.href='/memberships'}>Ver Planes</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
             </div>
        </div>
    )
}
