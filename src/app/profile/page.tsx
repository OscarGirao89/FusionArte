
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAuth } from "@/context/auth-context";
import { membershipPlans, danceClasses as allDanceClasses, users } from '@/lib/data';
import type { StudentPayment, DanceClass } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, parseISO, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Printer, TicketPercent, User, Calendar, BadgeCheck, XCircle, Clock, Pencil, Save, HandHelping, CalendarClock, Sparkles, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Overview } from '@/components/dashboard/overview';
import { UpcomingClasses } from '@/components/dashboard/upcoming-classes';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/settings-context';
import Image from 'next/image';

const paymentStatusLabels: Record<StudentPayment['status'], string> = {
    paid: 'Pagado',
    pending: 'Pendiente',
    deposit: 'Adelanto',
};

const profileFormSchema = z.object({
  name: z.string().min(3, "El nombre es obligatorio."),
  email: z.string().email("Email inválido."),
  mobile: z.string().optional(),
  avatar: z.string().optional(),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
    const { userRole, currentUser, updateCurrentUser, studentMemberships, studentPayments } = useAuth();
    const { settings } = useSettings();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
    });

    useEffect(() => {
      if (currentUser) {
        form.reset({
          name: currentUser.name || '',
          email: currentUser.email || '',
          mobile: currentUser.mobile || '',
          avatar: currentUser.avatar || '',
        });
      }
    }, [currentUser, form]);

    const membership = currentUser ? studentMemberships.find(m => m.userId === currentUser.id) : null;
    const plan = membership ? membershipPlans.find(p => p.id === membership.planId) : null;
    const payment = currentUser ? studentPayments.find(p => p.studentId === currentUser.id && p.planId === membership?.planId) : null;
    const isMembershipActive = membership ? isBefore(new Date(), parseISO(membership.endDate)) : false;
    
    const myEnrolledClasses = useMemo(() => {
        if (!currentUser) return [];
        return allDanceClasses.filter(c => c.enrolledStudentIds.includes(currentUser.id));
    }, [currentUser]);

    const suggestedClasses = useMemo(() => {
        if (!currentUser) return [];
        const enrolledClassIds = new Set(myEnrolledClasses.map(c => c.id));
        const enrolledStyleIds = new Set(myEnrolledClasses.map(c => c.styleId));

        return allDanceClasses
            .filter(c => 
                !enrolledClassIds.has(c.id) &&
                enrolledStyleIds.has(c.styleId) &&
                c.type === 'recurring' &&
                c.status === 'scheduled'
            )
            .slice(0, 3);
    }, [currentUser, myEnrolledClasses]);

    const popularStylesData = [
        { name: 'Salsa', total: 420 },
        { name: 'Bachata', total: 510 },
        { name: 'M-Zouk', total: 280 },
        { name: 'Aeroyoga', total: 150 },
        { name: 'Elongación', total: 350 },
    ];

    const popularStylesConfig = {
        total: { label: 'Inscripciones', color: 'hsl(var(--chart-2))' },
    };

    const onSubmit = (data: ProfileFormValues) => {
        if (currentUser) {
            updateCurrentUser(data);
            setIsEditing(false);
            toast({ title: "Perfil actualizado", description: "Tus datos han sido guardados." });
        }
    }

    const handleAvatarClick = () => {
        if (isEditing) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newAvatar = reader.result as string;
                form.setValue('avatar', newAvatar, { shouldDirty: true });
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePrintReceipt = () => {
         if (!currentUser || !plan || !membership || !payment) {
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
            printWindow.document.write('<style>body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 2rem; color: #333; } .receipt { border: 1px solid #e2e8f0; padding: 2rem; border-radius: 0.5rem; max-width: 800px; margin: auto; } .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; } .header h1 { font-size: 1.5rem; margin: 0; color: #673AB7; } .header img { max-width: 120px; max-height: 50px; } table { width: 100%; border-collapse: collapse; margin-top: 1rem; } th, td { padding: 0.75rem 0.5rem; text-align: left; border-bottom: 1px solid #e2e8f0; } th { background-color: #f7fafc; font-weight: 600; } .status { font-weight: bold; text-transform: uppercase; } .status-paid { color: #22c55e; } .status-pending { color: #f97316; } .status-deposit { color: #3b82f6; } .footer { margin-top: 2rem; text-align: center; font-size: 0.8rem; color: #64748b; }</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write('<div class="receipt">');
            printWindow.document.write('<div class="header">');
            printWindow.document.write(`<h1>Comprobante de Membresía</h1>`);
            if (settings.logoUrl) {
                printWindow.document.write(`<img src="${settings.logoUrl}" alt="${settings.academyName}" />`);
            } else {
                 printWindow.document.write(`<h2>${settings.academyName}</h2>`);
            }
            printWindow.document.write('</div>');
            printWindow.document.write('<table>');
            printWindow.document.write(`<tr><td><strong>Alumno:</strong></td><td>${currentUser.name}</td></tr>`);
            printWindow.document.write(`<tr><td><strong>Plan:</strong></td><td>${plan.title}</td></tr>`);
            printWindow.document.write(`<tr><td><strong>Precio Total:</strong></td><td>€${payment.totalAmount.toFixed(2)}</td></tr>`);
            printWindow.document.write(`<tr><td><strong>Monto Pagado:</strong></td><td>€${payment.amountPaid.toFixed(2)}</td></tr>`);
            printWindow.document.write(`<tr><td><strong>Monto Pendiente:</strong></td><td>€${payment.amountDue.toFixed(2)}</td></tr>`);
            printWindow.document.write(`<tr><td><strong>Estado:</strong></td><td class="status status-${payment.status}">${paymentStatusLabels[payment.status]}</td></tr>`);
            printWindow.document.write(`<tr><td><strong>Fecha de Inicio:</strong></td><td>${format(parseISO(membership.startDate), 'PPP', { locale: es })}</td></tr>`);
            printWindow.document.write(`<tr><td><strong>Vencimiento:</strong></td><td>${format(parseISO(membership.endDate), 'PPP', { locale: es })}</td></tr>`);
            if (plan.accessType === 'class_pack') {
                printWindow.document.write(`<tr><td><strong>Clases Restantes:</strong></td><td>${membership.classesRemaining || 0}</td></tr>`);
            }
            printWindow.document.write('</table>');
            printWindow.document.write('<p class="footer">¡Gracias por ser parte de nuestra comunidad!</p>');
            printWindow.document.write('</div>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };
    
    if (!currentUser) {
        return <div>Cargando...</div>;
    }
    
    const watchedAvatar = form.watch('avatar');

    // Student View
    if (userRole === 'student') {
        return (
            <div className="p-4 md:p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Panel de Estudiante</h1>
                    <p className="text-lg text-muted-foreground">Bienvenido/a de nuevo, {currentUser.name.split(' ')[0]}.</p>
                </div>
                
                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="details">Mi Perfil y Membresía</TabsTrigger>
                        <TabsTrigger value="dashboard">Mi Actividad</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="dashboard" className="mt-6 space-y-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Membresía</CardTitle>
                                    <HandHelping className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{isMembershipActive ? plan?.title : 'Inactiva'}</div>
                                    {isMembershipActive && <p className="text-xs text-muted-foreground">Expira el {format(parseISO(membership.endDate), 'PPP', {locale: es})}</p>}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Clases Restantes</CardTitle>
                                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {plan?.accessType === 'class_pack' ? membership?.classesRemaining : '∞'}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {plan?.accessType === 'class_pack' ? `de tu bono de ${plan.classCount}` : (isMembershipActive ? 'Clases ilimitadas' : 'N/A')}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                                <CardHeader><CardTitle className="text-sm font-medium">Mis Próximas Clases</CardTitle></CardHeader>
                                <CardContent>
                                    <UpcomingClasses classes={myEnrolledClasses} />
                                </CardContent>
                            </Card>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader><CardTitle className="font-headline">Popularidad de Estilos</CardTitle></CardHeader>
                                <CardContent className="pl-2">
                                    <Overview data={popularStylesData} config={popularStylesConfig} categoryKey="name" dataKey="total"/>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent"/> Clases que podrían interesarte</CardTitle></CardHeader>
                                <CardContent>
                                {suggestedClasses.length > 0 ? (
                                    <div className="space-y-4">
                                        {suggestedClasses.map((c) => {
                                            const teacher = users.find(u => u.id === c.teacherIds[0]);
                                            return (
                                                <div key={c.id} className="flex items-center">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={teacher?.avatar} alt={teacher?.name} />
                                                        <AvatarFallback>{teacher?.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="ml-4 space-y-1">
                                                        <p className="text-sm font-medium leading-none">{c.name} ({c.levelId})</p>
                                                        <p className="text-sm text-muted-foreground">{c.day} a las {c.time}</p>
                                                    </div>
                                                    <Button size="sm" variant="ghost" className="ml-auto" onClick={() => router.push('/schedule')}><UserPlus className="mr-2 h-4 w-4" /> Inscribirse</Button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center text-sm text-muted-foreground py-8">
                                        <p>¡Sigue así! Estás inscrito/a en todas las clases de tus estilos preferidos.</p>
                                    </div>
                                )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="details" className="mt-6">
                        <Form {...form}>
                            <form id="profile-edit-form" onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-1">
                                    <Card>
                                        <CardHeader>
                                            <div className="flex w-full items-start justify-between">
                                                <CardTitle className="font-headline text-xl">Mis Datos</CardTitle>
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(!isEditing)}>
                                                    {isEditing ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                                                    <span className="sr-only">{isEditing ? 'Guardar' : 'Editar'}</span>
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-col items-center text-center -mt-4 mb-6">
                                                <Avatar className={cn("h-24 w-24 mb-4", isEditing && "cursor-pointer hover:opacity-80 transition-opacity")} onClick={handleAvatarClick}>
                                                    <AvatarImage src={watchedAvatar} alt={currentUser.name}/>
                                                    <AvatarFallback>{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                </Avatar>
                                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/gif" />
                                            </div>
                                            <div className="text-sm text-muted-foreground space-y-2">
                                                <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Miembro desde {format(parseISO(currentUser.joined), 'MMMM yyyy', {locale: es})}</div>
                                                {isEditing ? (
                                                    <div className="space-y-4 pt-4">
                                                        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                        <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                        <FormField control={form.control} name="mobile" render={({ field }) => ( <FormItem><FormLabel>Móvil</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                    </div>
                                                ) : (
                                                    <>
                                                    <div><p className="font-medium text-foreground">{form.getValues('name')}</p></div>
                                                    <div><p className="font-medium text-foreground">{form.getValues('email')}</p></div>
                                                    {currentUser.mobile && <div className="flex items-center gap-2"><p className="font-medium text-foreground">{currentUser.mobile}</p></div>}
                                                    {currentUser.dob && <div className="flex items-center gap-2">{format(parseISO(currentUser.dob), 'd MMMM, yyyy', {locale: es})}</div>}
                                                    </>
                                                )}
                                            </div>
                                        </CardContent>
                                        {isEditing && ( <CardFooter><Button type="submit" form="profile-edit-form" className="w-full">Guardar Cambios</Button></CardFooter> )}
                                    </Card>
                                </div>
                                <div className="lg:col-span-2">
                                    <Card className="flex flex-col">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 font-headline"><TicketPercent className="h-6 w-6 text-primary"/> Detalles de Membresía</CardTitle>
                                            <CardDescription>El estado actual de tu plan y pagos.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            {membership && plan && payment ? (
                                                <div className="space-y-4">
                                                    <h3 className="text-xl font-semibold">{plan.title}</h3>
                                                    <div className="flex items-center gap-2">
                                                        {isMembershipActive ? <Badge><BadgeCheck className="mr-1 h-4 w-4"/>Activa</Badge> : <Badge variant="destructive"><XCircle className="mr-1 h-4 w-4"/>Expirada</Badge>}
                                                        <Badge variant={payment.status === 'paid' ? 'default' : payment.status === 'pending' ? 'destructive' : 'secondary'}>{paymentStatusLabels[payment.status]}</Badge>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t pt-4">
                                                        <div><p className="font-medium">Periodo de Validez</p><p className="text-muted-foreground">{format(parseISO(membership.startDate), 'dd/MM/yy', {locale: es})} - {format(parseISO(membership.endDate), 'dd/MM/yy', {locale: es})}</p></div>
                                                        {plan.accessType === 'class_pack' && (<div><p className="font-medium">Clases Restantes</p><p className="text-muted-foreground">{membership.classesRemaining ?? 0} / {plan.classCount}</p></div>)}
                                                        <div><p className="font-medium">Total Facturado</p><p className="text-muted-foreground">€{payment.totalAmount.toFixed(2)}</p></div>
                                                        <div><p className="font-medium">Total Pagado</p><p className="text-muted-foreground">€{payment.amountPaid.toFixed(2)}</p></div>
                                                        {payment.amountDue > 0 && (<div><p className="font-medium text-destructive">Saldo Pendiente</p><p className="text-destructive font-bold">€{payment.amountDue.toFixed(2)}</p></div>)}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8"><p className="text-muted-foreground">No tienes una membresía activa en este momento.</p><Button className="mt-4" onClick={() => router.push('/memberships')}>Ver Planes</Button></div>
                                            )}
                                        </CardContent>
                                        <CardFooter>
                                            <Button variant="outline" size="sm" onClick={handlePrintReceipt} disabled={!membership}><Printer className="mr-2 h-4 w-4" />Imprimir Comprobante</Button>
                                        </CardFooter>
                                    </Card>
                                </div>
                            </form>
                        </Form>
                    </TabsContent>
                </Tabs>
            </div>
        )
    }

    // Generic View for other roles
    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Mi Perfil</h1>
            </div>
            <Form {...form}>
                <form id="profile-edit-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex w-full items-start justify-between">
                                <CardTitle className="font-headline">Mis Datos</CardTitle>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(!isEditing)}>
                                    {isEditing ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                                    <span className="sr-only">{isEditing ? 'Guardar' : 'Editar'}</span>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="items-center text-center">
                            <div className="relative inline-block">
                                <Avatar className={cn("h-24 w-24 mb-4", isEditing && "cursor-pointer hover:opacity-80 transition-opacity")} onClick={handleAvatarClick}>
                                    <AvatarImage src={watchedAvatar} alt={currentUser.name}/>
                                    <AvatarFallback>{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                {isEditing && (
                                    <div className="absolute bottom-4 right-0 bg-secondary text-secondary-foreground rounded-full p-1.5 border-2 border-background">
                                        <Pencil size={16} />
                                    </div>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/gif" />
                            <h2 className="text-xl font-bold font-headline">{form.getValues('name')}</h2>
                            <p className="text-sm text-muted-foreground">{currentUser.role}</p>

                            {isEditing ? (
                                <div className="space-y-4 pt-6 text-left">
                                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name="mobile" render={({ field }) => ( <FormItem><FormLabel>Móvil</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                </div>
                            ) : (
                                <div className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-left">
                                    <div><p className="font-medium text-muted-foreground">Nombre</p><p className="text-foreground">{currentUser.name}</p></div>
                                    <div><p className="font-medium text-muted-foreground">Email</p><p className="text-foreground">{currentUser.email}</p></div>
                                    <div><p className="font-medium text-muted-foreground">Móvil</p><p className="text-foreground">{currentUser.mobile || 'No especificado'}</p></div>
                                    <div><p className="font-medium text-muted-foreground">Miembro desde</p><p className="text-foreground">{format(parseISO(currentUser.joined), 'd MMMM, yyyy', {locale: es})}</p></div>
                                </div>
                            )}
                        </CardContent>
                        
                        {isEditing && (
                            <CardFooter>
                                <Button type="submit" form="profile-edit-form" className="w-full">Guardar Cambios</Button>
                            </CardFooter>
                        )}
                    </Card>
                </form>
            </Form>
        </div>
    );
}
