
'use client';

import { useState } from 'react';
import { users as allUsers, membershipPlans, studentMemberships as allStudentMemberships, danceClasses } from '@/lib/data';
import type { User, DanceClass } from '@/lib/types';
import { format, isBefore, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, PlusCircle, Ticket, List, CalendarCheck, CalendarX, Pencil, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { BirthdayCalendar } from '@/components/admin/birthday-calendar';

const studentFormSchema = z.object({
    id: z.number(),
    name: z.string().min(3, "El nombre es obligatorio."),
    email: z.string().email("Introduce un email válido."),
    mobile: z.string().optional(),
    dob: z.string().optional(), // Using string for YYYY-MM-DD format
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

export default function AdminStudentsPage() {
    const [students, setStudents] = useState<User[]>(allUsers.filter(u => u.role === 'Estudiante'));
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const { toast } = useToast();

    const form = useForm<StudentFormValues>({
        resolver: zodResolver(studentFormSchema),
    });

    const handleViewProfile = (student: User) => {
        setSelectedStudent(student);
        form.reset({
            id: student.id,
            name: student.name,
            email: student.email,
            mobile: student.mobile,
            dob: student.dob ? student.dob : undefined,
        });
        setIsEditing(false);
        setIsDetailOpen(true);
    };
    
    const onSubmit = (data: StudentFormValues) => {
        setStudents(prevStudents => 
            prevStudents.map(student => 
                student.id === data.id ? { ...student, ...data } : student
            )
        );
        toast({
            title: "Alumno actualizado",
            description: "Los datos del alumno han sido guardados."
        });
        setSelectedStudent(prev => prev ? { ...prev, ...data } : null);
        setIsEditing(false);
    }

    const getStudentMembershipInfo = (studentId: number) => {
        const membership = allStudentMemberships.find(sm => sm.userId === studentId);
        if (!membership) {
            return { planTitle: 'Sin membresía', status: 'Inactiva', statusColor: 'text-red-500' };
        }
        
        const plan = membershipPlans.find(p => p.id === membership.planId);
        const endDate = new Date(membership.endDate);
        const isActive = endDate >= new Date();

        let statusText = `Expira el ${format(endDate, 'PPP', { locale: es })}`;
        if (!isActive) {
            statusText = `Expiró el ${format(endDate, 'PPP', { locale: es })}`;
        }
        
        if(plan?.accessType === 'class_pack' && membership.classesRemaining !== undefined) {
             statusText += ` - ${membership.classesRemaining} clases restantes`;
        }

        return {
            planTitle: plan?.title || 'Plan Desconocido',
            status: statusText,
            statusColor: isActive ? 'text-green-600' : 'text-red-500',
        };
    };
    
    const getEnrolledClasses = (studentId: number): DanceClass[] => {
        return danceClasses.filter(c => c.enrolledStudentIds.includes(studentId));
    };

    const getClassNameById = (classId: string) => {
        return danceClasses.find(c => c.id === classId)?.name || 'Clase desconocida';
    }

    const currentMembership = selectedStudent ? allStudentMemberships.find(sm => sm.userId === selectedStudent.id) : null;
    const currentPlan = currentMembership ? membershipPlans.find(p => p.id === currentMembership.planId) : null;
    const enrolledClasses = selectedStudent ? getEnrolledClasses(selectedStudent.id) : [];

  return (
    <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Alumnos</h1>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Membresía a Alumno
            </Button>
        </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                <CardTitle>Alumnos Registrados</CardTitle>
                <CardDescription>Aquí puedes ver y editar los perfiles de los estudiantes.</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="hidden sm:table-cell">Membresía</TableHead>
                        <TableHead className="hidden md:table-cell">Estado</TableHead>
                        <TableHead>
                        <span className="sr-only">Acciones</span>
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {students.map((student) => {
                        const { planTitle, status, statusColor } = getStudentMembershipInfo(student.id);
                        return (
                            <TableRow key={student.id}>
                            <TableCell>
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={student.avatar} alt={student.name} data-ai-hint="person face" />
                                        <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{student.name}</p>
                                        <p className="text-sm text-muted-foreground">{student.email}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                                <Badge variant="secondary">{planTitle}</Badge>
                            </TableCell>
                            <TableCell className={`hidden md:table-cell text-sm font-medium ${statusColor}`}>{status}</TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => handleViewProfile(student)}>
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">Ver Perfil</span>
                                </Button>
                            </TableCell>
                            </TableRow>
                        )
                    })}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
            <BirthdayCalendar />
        </div>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
            {selectedStudent && (
            <>
                <DialogHeader>
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={selectedStudent.avatar} alt={selectedStudent.name} />
                                <AvatarFallback>{selectedStudent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <DialogTitle className="text-2xl font-headline">{selectedStudent.name}</DialogTitle>
                                <DialogDescription>{selectedStudent.email} - Miembro desde {format(new Date(selectedStudent.joined), 'PPP', { locale: es })}</DialogDescription>
                            </div>
                        </div>
                        <Button variant={isEditing ? "default" : "outline"} size="icon" onClick={() => setIsEditing(!isEditing)}>
                           {isEditing ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                           <span className="sr-only">{isEditing ? 'Guardar' : 'Editar'}</span>
                        </Button>
                    </div>
                </DialogHeader>
                <div className="py-4 grid gap-6 overflow-y-auto pr-4 -mr-2">
                    {isEditing ? (
                        <Form {...form}>
                            <form id="student-edit-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <div className="grid grid-cols-2 gap-4">
                                     <FormField control={form.control} name="mobile" render={({ field }) => (
                                        <FormItem><FormLabel>Móvil</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                     <FormField control={form.control} name="dob" render={({ field }) => (
                                        <FormItem><FormLabel>Fecha de Nacimiento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                                <Button type="submit" className="hidden">Guardar</Button>
                            </form>
                        </Form>
                    ) : (
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Detalles Personales</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                <div><p className="font-medium">Nombre</p><p>{selectedStudent.name}</p></div>
                                <div><p className="font-medium">Email</p><p>{selectedStudent.email}</p></div>
                                <div><p className="font-medium">Móvil</p><p>{selectedStudent.mobile || 'No especificado'}</p></div>
                                <div><p className="font-medium">Fecha de Nacimiento</p><p>{selectedStudent.dob ? format(parseISO(selectedStudent.dob), 'PPP', {locale: es}) : 'No especificado'}</p></div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Ticket className="h-5 w-5"/>
                                Membresía Actual
                            </CardTitle>
                        </CardHeader>
                        {currentPlan && currentMembership ? (
                             <CardContent className="text-sm space-y-2">
                                <p className="font-semibold text-base">{currentPlan.title}</p>
                                <div className="flex items-center gap-2">
                                    <Badge variant={isBefore(new Date(), new Date(currentMembership.endDate)) ? 'default' : 'destructive'}>
                                        {isBefore(new Date(), new Date(currentMembership.endDate)) ? 'Activa' : 'Expirada'}
                                    </Badge>
                                </div>
                                <p><span className="font-medium">Válida desde:</span> {format(new Date(currentMembership.startDate), 'PPP', { locale: es })}</p>
                                <p><span className="font-medium">Hasta:</span> {format(new Date(currentMembership.endDate), 'PPP', { locale: es })}</p>
                                {currentPlan.accessType === 'class_pack' && (
                                    <p><span className="font-medium">Clases restantes:</span> {currentMembership.classesRemaining || 0}</p>
                                )}
                            </CardContent>
                        ) : (
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Este alumno no tiene una membresía activa.</p>
                            </CardContent>
                        )}
                       
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <List className="h-5 w-5"/>
                                Clases Inscritas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {enrolledClasses.length > 0 ? (
                                <ul className="space-y-3">
                                    {enrolledClasses.map(c => (
                                        <li key={c.id} className="text-sm flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{c.name}</p>
                                                <p className="text-muted-foreground">{c.day} - {c.time} con {c.teacher}</p>
                                            </div>
                                             <Badge variant="outline">{c.levelId}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No está inscrito/a en ninguna clase actualmente.</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                         <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CalendarCheck className="h-5 w-5"/>
                                Historial de Asistencia
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedStudent.attendanceHistory && selectedStudent.attendanceHistory.length > 0 ? (
                                <ul className="space-y-3">
                                    {selectedStudent.attendanceHistory.map((att, index) => (
                                        <li key={index} className="text-sm flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{getClassNameById(att.classId)}</p>
                                                <p className="text-muted-foreground">{format(new Date(att.date), 'PPP', { locale: es })}</p>
                                            </div>
                                             <Badge variant={att.status === 'presente' ? 'default' : 'destructive'} className="capitalize">
                                                 {att.status === 'presente' ? <CalendarCheck className="mr-1 h-3 w-3" /> : <CalendarX className="mr-1 h-3 w-3" />}
                                                {att.status}
                                             </Badge>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No hay registros de asistencia.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
                 {isEditing && (
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                        <Button type="submit" form="student-edit-form">Guardar Cambios</Button>
                    </DialogFooter>
                )}
            </>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
