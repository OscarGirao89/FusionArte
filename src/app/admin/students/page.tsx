'use client';

import { useState } from 'react';
import { users as allUsers, membershipPlans, studentMemberships as allStudentMemberships } from '@/lib/data';
import type { User, StudentMembership, MembershipPlan } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, PlusCircle } from 'lucide-react';


export default function AdminStudentsPage() {
    const students = allUsers.filter(u => u.role === 'Estudiante');

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
                        <Button variant="ghost" size="icon">
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
  );
}
