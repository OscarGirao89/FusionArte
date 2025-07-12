'use client';

import { useState } from 'react';
import { danceClasses, users } from '@/lib/data';
import { useAttendance } from '@/context/attendance-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Calendar, Check, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/context/auth-context';

type AttendanceSheetProps = {
  classId: string;
  date: string; // YYYY-MM-DD
  userRole: UserRole | null;
};

export function AttendanceSheet({ classId, date, userRole }: AttendanceSheetProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { recordAttendance, getAttendanceForClass } = useAttendance();
  
  const danceClass = danceClasses.find((c) => c.id === classId);
  const enrolledStudents = users.filter((u) => danceClass?.enrolledStudentIds.includes(u.id));

  const initialAttendance = getAttendanceForClass(classId, date);
  const [attendance, setAttendance] = useState<Record<number, boolean>>(() => {
    if (initialAttendance && initialAttendance.studentStatus) {
       return Object.fromEntries(initialAttendance.studentStatus.map(s => [s.studentId, s.present]));
    }
    // Default to all present if no record exists
    return enrolledStudents.reduce((acc, student) => ({ ...acc, [student.id]: true }), {});
  });

  if (!danceClass) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold">Clase no encontrada</h1>
        <p className="text-muted-foreground">No se pudo encontrar la clase que estás buscando.</p>
        <Button onClick={() => router.back()} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
    );
  }

  const handleAttendanceChange = (studentId: number, isPresent: boolean) => {
    setAttendance((prev) => ({ ...prev, [studentId]: isPresent }));
  };

  const handleSaveAttendance = () => {
    const studentStatus = Object.entries(attendance).map(([studentId, present]) => ({
      studentId: Number(studentId),
      present,
    }));
    
    recordAttendance(classId, date, studentStatus);

    toast({
      title: 'Asistencia Guardada',
      description: `La asistencia para la clase del ${format(parseISO(date), 'PPP', {locale: es})} ha sido guardada.`,
    });
    router.back();
  };
  
  const backUrl = userRole === 'admin' ? '/admin/classes' : '/my-classes';

  return (
    <div className="p-4 md:p-8">
      <Button variant="ghost" onClick={() => router.push(backUrl)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al listado de clases
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline">{danceClass.name}</CardTitle>
          <CardDescription className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(parseISO(date), 'EEEE, d \'de\' MMMM', {locale: es})}
            </span>
             <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {danceClass.time}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Marca la casilla para los alumnos que asistieron a la clase.
          </p>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Presente</TableHead>
                  <TableHead>Nombre del Alumno</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrolledStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Checkbox
                        checked={attendance[student.id] ?? true}
                        onCheckedChange={(checked) => handleAttendanceChange(student.id, !!checked)}
                        aria-label={`Marcar asistencia para ${student.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{student.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleSaveAttendance}>
                <Check className="mr-2 h-4 w-4" />
                Guardar Asistencia
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
