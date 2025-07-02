
'use client';

import { useState } from 'react';
import { users as allUsers, membershipPlans, studentMemberships as allStudentMemberships, danceClasses } from '@/lib/data';
import type { User, DanceClass } from '@/lib/types';
import { format, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, PlusCircle, Ticket, List, CalendarCheck, CalendarX } from 'lucide-react';


export default function AdminStudentsPage() {
    const students = allUsers.filter(u => u.role === 'Estudiante');
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const handleViewProfile = (student: User) => {
        setSelectedStudent(student);
        setIsDetailOpen(true);
    };

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
      <Card>
        <CardHeader>
          <CardTitle>Alumnos Registrados</CardTitle>
          <CardDescription>Aquí puedes ver todos los estudiantes y el estado de sus membresías.</CardDescription>
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

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
            {selectedStudent && (
            <>
                <DialogHeader>
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
                </DialogHeader>
                <div className="py-4 grid gap-6 overflow-y-auto pr-4 -mr-2">
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
            </>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
