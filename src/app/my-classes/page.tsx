
'use client';

import { useMemo, useState, useCallback } from 'react';
import { danceClasses, users } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, BookCheck, Eye, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { parse, addMinutes, subMinutes, isWithinInterval, isPast } from 'date-fns';
import type { DanceClass } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

const getDayOfWeekAsDate = (day: string) => {
    const daysOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const now = new Date();
    const classDayIndex = daysOfWeek.indexOf(day);
    if (classDayIndex === -1) return now;

    const classDate = new Date(now);
    classDate.setDate(now.getDate() - now.getDay() + classDayIndex);
    return classDate;
};

const isWithinAttendanceWindow = (day: string, time: string, duration: string): boolean => {
    const classDate = getDayOfWeekAsDate(day);
    const [hour, minute] = time.split(':').map(Number);
    classDate.setHours(hour, minute, 0, 0);

    const durationInMinutes = parseInt(duration.replace(' min', ''));
    const attendanceStart = subMinutes(classDate, 30);
    const attendanceEnd = addMinutes(classDate, durationInMinutes + 30);
    
    return isWithinInterval(new Date(), { start: attendanceStart, end: attendanceEnd });
};

const isClassPast = (day: string, time: string, duration: string): boolean => {
    const classDate = getDayOfWeekAsDate(day);
    const [hour, minute] = time.split(':').map(Number);
    classDate.setHours(hour, minute, 0, 0);

    const durationInMinutes = parseInt(duration.replace(' min', ''));
    const classEnd = addMinutes(classDate, durationInMinutes);
    return isPast(classEnd);
};

export default function MyClassesPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const currentUserId = currentUser?.id;
  
  const [allClasses, setAllClasses] = useState<DanceClass[]>(danceClasses);
  const [viewingClass, setViewingClass] = useState<DanceClass | null>(null);

  const myClasses = useMemo(() => {
    if (!currentUserId) return [];
    return allClasses.filter(c => c.teacherIds.includes(currentUserId));
  }, [currentUserId, allClasses]);
  
  const completedClassesCount = useMemo(() => {
    return myClasses.filter(c => c.status === 'completed').length;
  }, [myClasses]);

  const upcomingClasses = myClasses.filter(c => c.status === 'scheduled').slice(0, 3);
  
  const enrolledStudentsForViewingClass = useMemo(() => {
      if (!viewingClass) return [];
      return users.filter(u => viewingClass.enrolledStudentIds.includes(u.id));
  }, [viewingClass]);
  
  const handleViewStudents = (danceClass: DanceClass) => {
    setViewingClass(danceClass);
  }
  
  const handleConfirmClass = useCallback((classId: string) => {
    setAllClasses(prevClasses => prevClasses.map(c => 
      c.id === classId ? { ...c, status: 'completed' } : c
    ));
    toast({
      title: "Clase Confirmada",
      description: "La clase ha sido marcada como impartida.",
    });
  }, [toast]);

  if (!currentUser) return <div>Cargando...</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Área de Profesor</h1>
        <div className="text-right">
            <p className="font-bold text-lg">{currentUser.name}</p>
            <p className="text-sm text-muted-foreground">{currentUser.role}</p>
        </div>
      </div>
      
        <div className="grid gap-6 mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Resumen Semanal</CardTitle>
                    <CardDescription>
                        Tienes un total de <span className="font-bold text-primary">{myClasses.length}</span> clases asignadas esta semana.
                        Has completado <span className="font-bold text-primary">{completedClassesCount}</span> clases hasta ahora.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <h3 className="text-lg font-semibold mb-4 font-headline">Próximas Clases Destacadas</h3>
                    {upcomingClasses.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {upcomingClasses.map(c => (
                                <Card key={c.id} className="flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="text-xl">{c.name}</CardTitle>
                                        <Badge variant="secondary" className="w-fit">{c.levelId}</Badge>
                                    </CardHeader>
                                    <CardContent className="flex-grow text-sm space-y-2 text-muted-foreground">
                                        <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {c.day} - {c.time}</p>
                                        <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {c.room}</p>
                                        <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> {c.duration}</p>
                                    </CardContent>
                                    <CardFooter>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="w-full">
                                                        <Button variant="outline" className="w-full" disabled={!isWithinAttendanceWindow(c.day, c.time, c.duration)} onClick={() => router.push(`/my-classes/${c.id}/attendance`)}>
                                                            <Users className="mr-2 h-4 w-4" /> Pasar Lista
                                                        </Button>
                                                    </div>
                                                </TooltipTrigger>
                                                {!isWithinAttendanceWindow(c.day, c.time, c.duration) && (
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
                    <CardTitle>Listado Completo de tus Clases</CardTitle>
                    <CardDescription>Aquí puedes ver y gestionar todas las clases que impartes.</CardDescription>
                </CardHeader>
                <CardContent>
                    {myClasses.length > 0 ? (
                        <ul className="space-y-4">
                            {myClasses.map(c => {
                                const canTakeAttendance = isWithinAttendanceWindow(c.day, c.time, c.duration);
                                const hasFinished = isClassPast(c.day, c.time, c.duration);

                                const getActionButtons = () => {
                                  if (c.status === 'completed') {
                                    return <Button variant="ghost" size="sm" className="text-green-600" disabled><CheckCircle className="mr-2 h-4 w-4" /> Completada</Button>;
                                  }
                                  if (canTakeAttendance) {
                                    return <Button variant="secondary" size="sm" onClick={() => router.push(`/my-classes/${c.id}/attendance`)}><BookCheck className="mr-2 h-4 w-4" /> Pasar Lista</Button>;
                                  }
                                  if (hasFinished) {
                                    return <Button variant="default" size="sm" onClick={() => handleConfirmClass(c.id)}><CheckCircle className="mr-2 h-4 w-4" /> Confirmar Clase</Button>;
                                  }
                                  return <Button variant="secondary" size="sm" disabled><BookCheck className="mr-2 h-4 w-4" /> Pasar Lista</Button>;
                                };

                                return (
                                    <li key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                                        <div className="flex-grow">
                                            <p className="font-bold">{c.name} - {c.levelId}</p>
                                            <p className="text-sm text-muted-foreground">{c.day} a las {c.time} en {c.room}</p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <Dialog open={viewingClass?.id === c.id} onOpenChange={(isOpen) => !isOpen && setViewingClass(null)}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" onClick={() => handleViewStudents(c)}>
                                                      <Eye className="mr-2 h-4 w-4" /> Ver Inscritos ({c.enrolledStudentIds.length})
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Alumnos Inscritos en "{c.name}"</DialogTitle>
                                                        <DialogDescription>
                                                            Lista de alumnos para la clase del {c.day} a las {c.time}.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <ScrollArea className="max-h-80 pr-4">
                                                      <ul className="space-y-4 py-4">
                                                          {enrolledStudentsForViewingClass.map(student => (
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
                                                          ))}
                                                      </ul>
                                                    </ScrollArea>
                                                </DialogContent>
                                            </Dialog>

                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <div>{getActionButtons()}</div>
                                                </TooltipTrigger>
                                                {!canTakeAttendance && !hasFinished && c.status !== 'completed' && (
                                                  <TooltipContent>
                                                    <p>La asistencia solo puede tomarse durante la clase.</p>
                                                  </TooltipContent>
                                                )}
                                              </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No tienes ninguna clase asignada.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
