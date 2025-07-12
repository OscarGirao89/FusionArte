
'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { danceClasses, users } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, BookCheck, Eye, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useAttendance } from '@/context/attendance-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { parse, addMinutes, subMinutes, isWithinInterval, isPast, format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, parseISO } from 'date-fns';
import { es } from "date-fns/locale";
import type { DanceClass, ClassInstance } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

const daysOfWeekMap = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function MyClassesPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const currentUserId = currentUser?.id;
  const { classInstances, generateInstancesForTeacher, confirmClass, getAttendanceForClass } = useAttendance();

  const [viewingClass, setViewingClass] = useState<ClassInstance | null>(null);
  
  useEffect(() => {
    if (currentUserId) {
        // Generate instances for the current month when the component mounts or user changes
        const today = new Date();
        const start = startOfMonth(today);
        const end = endOfMonth(today);
        generateInstancesForTeacher(currentUserId, start, end);
    }
  }, [currentUserId, generateInstancesForTeacher]);

  const myClassInstances = useMemo(() => {
    if (!currentUserId) return [];
    return classInstances.filter(c => c.teacherIds.includes(currentUserId));
  }, [currentUserId, classInstances]);
  
  const completedClassesCount = useMemo(() => {
    return myClassInstances.filter(c => c.status === 'completed').length;
  }, [myClassInstances]);

  const upcomingClasses = myClassInstances.filter(c => c.status === 'scheduled').slice(0, 3);
  
  const enrolledStudentsForViewingClass = useMemo(() => {
      if (!viewingClass) return [];
      return users.filter(u => viewingClass.enrolledStudentIds.includes(u.id));
  }, [viewingClass]);
  
  const handleViewStudents = (classInstance: ClassInstance) => {
    setViewingClass(classInstance);
  }
  
  const handleConfirmClass = useCallback((classId: string, date: string) => {
    confirmClass(classId, date);
    toast({
      title: "Clase Confirmada",
      description: "La clase ha sido marcada como impartida.",
    });
  }, [confirmClass, toast]);

  if (!currentUser) return <div>Cargando...</div>;
  
  const isWithinAttendanceWindow = (date: string, time: string, duration: string): boolean => {
      try {
          const classDateTime = parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date());
          if (isNaN(classDateTime.getTime())) return false;

          const durationInMinutes = parseInt(duration.replace(' min', ''));
          if (isNaN(durationInMinutes)) return false;

          const attendanceStart = subMinutes(classDateTime, 30);
          const attendanceEnd = addMinutes(classDateTime, durationInMinutes + 30);
          
          return isWithinInterval(new Date(), { start: attendanceStart, end: attendanceEnd });
      } catch (error) {
          console.error("Error calculating attendance window:", error);
          return false;
      }
  };

  const isClassPastTime = (date: string, time: string, duration: string): boolean => {
      try {
          const classDateTime = parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date());
          if (isNaN(classDateTime.getTime())) return false;
          
          const durationInMinutes = parseInt(duration.replace(' min', ''));
          if (isNaN(durationInMinutes)) return false;

          const classEnd = addMinutes(classDateTime, durationInMinutes);
          return isPast(classEnd);
      } catch(error) {
          console.error("Error calculating if class is past:", error);
          return false;
      }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Mis Clases</h1>
      </div>
      
        <div className="grid gap-6 mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Resumen Mensual</CardTitle>
                    <CardDescription>
                        Tienes un total de <span className="font-bold text-primary">{myClassInstances.length}</span> clases asignadas este mes.
                        Has completado <span className="font-bold text-primary">{completedClassesCount}</span> clases hasta ahora.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <h3 className="text-lg font-semibold mb-4 font-headline">Próximas Clases Destacadas</h3>
                    {upcomingClasses.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {upcomingClasses.map(c => (
                                <Card key={c.instanceId} className="flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="text-xl">{c.name}</CardTitle>
                                        <Badge variant="secondary" className="w-fit">{c.levelId}</Badge>
                                    </CardHeader>
                                    <CardContent className="flex-grow text-sm space-y-2 text-muted-foreground">
                                        <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {format(parseISO(c.date), "EEEE, dd 'de' MMMM", { locale: es })} - {c.time}</p>
                                        <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {c.room}</p>
                                        <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> {c.duration}</p>
                                    </CardContent>
                                    <CardFooter>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="w-full">
                                                        <Button variant="outline" className="w-full" disabled={!isWithinAttendanceWindow(c.date, c.time, c.duration)} onClick={() => router.push(`/my-classes/${c.id}/attendance?date=${c.date}`)}>
                                                            <Users className="mr-2 h-4 w-4" /> Pasar Lista
                                                        </Button>
                                                    </div>
                                                </TooltipTrigger>
                                                {!isWithinAttendanceWindow(c.date, c.time, c.duration) && (
                                                    <TooltipContent>
                                                        <p>La toma de asistencia se habilita 30 min antes y hasta 30 min después de la clase.</p>
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                        </TooltipProvider>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No tienes clases programadas próximamente.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Listado Completo de tus Clases (Este Mes)</CardTitle>
                    <CardDescription>Aquí puedes ver y gestionar todas las clases que impartes.</CardDescription>
                </CardHeader>
                <CardContent>
                    {myClassInstances.length > 0 ? (
                        <ul className="space-y-4">
                            {myClassInstances.map(c => {
                                const canTakeAttendance = isWithinAttendanceWindow(c.date, c.time, c.duration);
                                const hasFinished = isClassPastTime(c.date, c.time, c.duration);
                                const canConfirm = hasFinished && c.status === 'scheduled';
                                const isCompleted = c.status === 'completed';

                                return (
                                    <li key={c.instanceId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                                        <div className="flex-grow">
                                            <p className="font-bold">{c.name} - {c.levelId}</p>
                                            <p className="text-sm text-muted-foreground">{format(parseISO(c.date), "EEEE, dd 'de' MMMM", { locale: es })} a las {c.time} en {c.room}</p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <Dialog open={viewingClass?.instanceId === c.instanceId} onOpenChange={(isOpen) => !isOpen && setViewingClass(null)}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" onClick={() => handleViewStudents(c)}>
                                                      <Eye className="mr-2 h-4 w-4" /> Ver Inscritos ({c.enrolledStudentIds.length})
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Alumnos Inscritos en "{c.name}"</DialogTitle>
                                                        <DialogDescription>
                                                            Lista de alumnos para la clase del {format(parseISO(c.date), 'PPP', {locale: es})} a las {c.time}.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <ScrollArea className="max-h-80 pr-4">
                                                      <ul className="space-y-4 py-4">
                                                          {enrolledStudentsForViewingClass.length > 0 ? (
                                                              enrolledStudentsForViewingClass.map(student => (
                                                                  <li key={student.id} className="flex items-center gap-4">
                                                                      <Avatar>
                                                                          <AvatarImage src={student.avatar} alt={student.name} data-ai-hint="person face" />
                                                                          <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                                      </Avatar>
                                                                      <div>
                                                                          <p className="font-medium">{student.name}</p>
                                                                          <p className="text-sm text-muted-foreground">{student.email}</p>
                                                                      </div>
                                                                  </li>
                                                              ))
                                                          ) : (
                                                            <p className="text-sm text-muted-foreground text-center py-4">No hay alumnos inscritos en esta clase.</p>
                                                          )}
                                                      </ul>
                                                    </ScrollArea>
                                                </DialogContent>
                                            </Dialog>
                                            
                                            {isCompleted ? (
                                                <Button variant="ghost" size="sm" className="text-green-600" disabled><CheckCircle className="mr-2 h-4 w-4" /> Completada</Button>
                                            ) : canConfirm ? (
                                                <Button variant="default" size="sm" onClick={() => handleConfirmClass(c.id, c.date)}><CheckCircle className="mr-2 h-4 w-4" /> Confirmar Clase</Button>
                                            ) : (
                                                <Button variant={canTakeAttendance ? 'default' : 'secondary'} size="sm" onClick={() => router.push(`/my-classes/${c.id}/attendance?date=${c.date}`)} disabled={!canTakeAttendance}>
                                                    <BookCheck className="mr-2 h-4 w-4" /> Pasar Lista
                                                </Button>
                                            )}
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No tienes ninguna clase asignada para este mes.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
