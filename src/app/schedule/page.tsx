'use client';
import * as React from 'react';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { danceClasses, danceLevels as allLevels, danceStyles as allStyles, users, membershipPlans } from '@/lib/data';
import type { DanceClass, StudentPayment } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Clock, User, Award, Users, CalendarDays, MapPin, Building, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { LoginRequiredDialog } from '@/components/shared/login-required-dialog';

const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const timeSlots = Array.from({ length: (22 - 9) * 2 }, (_, i) => {
    const hour = 9 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
});

function ClassListCard({ danceClass, onEnrollRequest }: { danceClass: DanceClass, onEnrollRequest: (danceClass: DanceClass) => void }) {
    const style = allStyles.find(s => s.id === danceClass.styleId);
    const level = allLevels.find(l => l.id === danceClass.levelId);
    const getTeacherNames = (ids: number[]) => users.filter(u => ids.includes(u.id)).map(t => t.name).join(', ');
    const isEvent = ['one-time', 'workshop', 'rental'].includes(danceClass.type);
   
    return (
        <Card className={cn(
            "transition-shadow hover:shadow-lg w-full flex flex-col",
            danceClass.status.startsWith('cancelled') && "opacity-60"
        )}>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-5 items-center gap-4 text-sm flex-grow">
                <div className="sm:col-span-2">
                    <p className={cn("font-bold text-base", danceClass.status.startsWith('cancelled') && "line-through")}>{danceClass.name}</p>
                    <p className="text-muted-foreground">{style?.name}</p>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                    <Award className="h-4 w-4" /> {level?.name}
                </div>
                <div className="text-muted-foreground">
                    {isEvent ? (
                        <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {danceClass.date ? format(parseISO(danceClass.date), 'PPP', { locale: es }) : 'N/A'}</div>
                    ) : (
                        <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> {danceClass.day}</div>
                    )}
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {danceClass.time}</div>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" /> {getTeacherNames(danceClass.teacherIds) || danceClass.rentalContact || 'N/A'}
                </div>
            </CardContent>
            {danceClass.type === 'recurring' && (
                <CardFooter className="p-4 pt-0">
                   <Button variant="outline" size="sm" className="w-full" onClick={() => onEnrollRequest(danceClass)}>
                       Inscribirse (Mensual)
                   </Button>
                </CardFooter>
            )}
        </Card>
    );
}

function TimeGridClassCard({ danceClass }: { danceClass: DanceClass }) {
    const style = allStyles.find(s => s.id === danceClass.styleId);
    const getTeacherNames = (ids: number[]) => users.filter(u => ids.includes(u.id)).map(t => t.name).join(', ');
    
    const getCardColor = () => {
        if (danceClass.type === 'rental') return 'bg-gray-200/50 border-gray-400 dark:bg-gray-800/50 dark:border-gray-600';
        if (danceClass.status.startsWith('cancelled')) return 'bg-red-200/30 border-red-400/50 dark:bg-red-900/20 dark:border-red-500/30 line-through';
        switch(style?.id) {
            case 'salsa': return 'bg-red-200/50 border-red-400 dark:bg-red-800/20 dark:border-red-500/50';
            case 'bachata': return 'bg-blue-200/50 border-blue-400 dark:bg-blue-800/20 dark:border-blue-500/50';
            case 'hip-hop': return 'bg-yellow-200/50 border-yellow-400 dark:bg-yellow-800/20 dark:border-yellow-500/50';
            case 'contemporaneo': return 'bg-purple-200/50 border-purple-400 dark:bg-purple-800/20 dark:border-purple-500/50';
            case 'tango': return 'bg-indigo-200/50 border-indigo-400 dark:bg-indigo-800/20 dark:border-indigo-500/50';
            case 'flamenco': return 'bg-orange-200/50 border-orange-400 dark:bg-orange-800/20 dark:border-orange-500/50';
            default: return 'bg-green-200/50 border-green-400 dark:bg-green-800/20 dark:border-green-500/50';
        }
    }
    
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn("rounded-md p-1.5 text-xs overflow-hidden border h-full m-0.5 cursor-pointer", getCardColor())}>
                        <p className="font-bold text-foreground truncate">{danceClass.name}</p>
                        <p className="text-muted-foreground truncate">{danceClass.room}</p>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="p-1 space-y-1.5 text-sm">
                        <p className="font-bold">{danceClass.name}</p>
                        <div className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /> {getTeacherNames(danceClass.teacherIds) || 'N/A'}</div>
                        <div className="flex items-center gap-2 text-muted-foreground"><Award className="h-4 w-4" /> {allLevels.find(l => l.id === danceClass.levelId)?.name || 'N/A'}</div>
                        <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> {danceClass.time} ({danceClass.duration})</div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

function WeeklySchedule({ classes }: { classes: DanceClass[] }) {
    const recurringClasses = classes.filter(c => c.type === 'recurring' && !c.isCancelledAndHidden);

    const timeToRow = (time: string) => {
        const [hour, minute] = time.split(':').map(Number);
        if (hour < 9) return 2;
        const totalMinutes = (hour - 9) * 60 + minute;
        return (totalMinutes / 30) + 2;
    };

    const durationToSpan = (duration: string) => {
        const minutes = parseInt(duration.replace(' min', ''));
        return Math.ceil(minutes / 30);
    };

    const dayToColumn = (day: string) => {
        return daysOfWeek.indexOf(day) + 2;
    }

    return (
        <div className="grid grid-cols-[auto_repeat(7,minmax(120px,1fr))] min-w-[900px] relative">
            {/* Headers */}
            <div className="sticky top-0 z-20 col-start-1 row-start-1 bg-background" />
            {daysOfWeek.map((day, i) => (
                <h2 key={day} className="font-headline text-center font-bold sticky top-0 py-2 z-20 bg-background/90 backdrop-blur-sm" style={{ gridColumn: i + 2 }}>
                    {day}
                </h2>
            ))}
            
            {/* Time Slots and Grid Lines */}
            {timeSlots.map((time, index) => (
               <React.Fragment key={time}>
                 <div className="row-start-auto col-start-1 h-12 flex items-start -mt-2.5 pr-2 sticky left-0 bg-background/90 backdrop-blur-sm z-10">
                    <span className="text-xs text-muted-foreground">{time}</span>
                </div>
                 <div className="row-start-auto col-start-2 col-span-7 border-b border-dashed" style={{ gridRow: index + 2 }}/>
               </React.Fragment>
            ))}

            {/* Classes */}
            {recurringClasses.map(c => {
                const gridRowStart = timeToRow(c.time);
                const gridRowEnd = `span ${durationToSpan(c.duration)}`;
                const gridColumn = dayToColumn(c.day);
                if (gridColumn < 2) return null;
                return (
                    <div key={c.id} style={{ gridRow: `${gridRowStart} / ${gridRowEnd}`, gridColumn }} className="p-0 z-10">
                         <TimeGridClassCard danceClass={c} />
                    </div>
                );
            })}
        </div>
    );
}

function CalendarEvents({ classes }: { classes: DanceClass[] }) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const singleEvents = classes.filter(c => 
        ['one-time', 'workshop', 'rental'].includes(c.type) &&
        c.date &&
        !c.isCancelledAndHidden &&
        (c.type !== 'rental' || c.isVisibleToStudents)
    );

    const eventsByDate = useMemo(() => {
        return singleEvents.reduce((acc, event) => {
            if (!event.date) return acc;
            const dateStr = format(parseISO(event.date), 'yyyy-MM-dd');
            (acc[dateStr] = acc[dateStr] || []).push(event);
            return acc;
        }, {} as Record<string, DanceClass[]>);
    }, [singleEvents]);

    const selectedDayEvents = date ? eventsByDate[format(date, 'yyyy-MM-dd')] || [] : [];

    const getTeacherNames = (ids: number[]) => users.filter(u => ids.includes(u.id)).map(t => t.name).join(', ');

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 flex justify-center">
                <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border w-full sm:w-auto"
                    locale={es}
                    modifiers={{
                       hasEvent: (day) => eventsByDate[format(day, 'yyyy-MM-dd')]
                    }}
                    modifiersStyles={{
                        hasEvent: {
                            fontWeight: 'bold',
                            color: 'hsl(var(--primary))'
                        }
                    }}
                />
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold font-headline">
                    {date ? `Eventos para ${format(date, 'PPP', { locale: es })}` : 'Selecciona un día'}
                </h3>
                {selectedDayEvents.length > 0 ? (
                    <div className="space-y-4">
                        {selectedDayEvents.map(c => {
                            const level = allLevels.find(l => l.id === c.levelId);
                            const style = allStyles.find(s => s.id === c.styleId);
                            return (
                                <Card key={c.id} className={cn(
                                    "overflow-hidden transition-shadow hover:shadow-lg bg-card/80 backdrop-blur-sm w-full",
                                    c.status.startsWith('cancelled') && "opacity-60"
                                )}>
                                  <CardHeader className="p-4 flex flex-row items-start justify-between gap-4">
                                        <div>
                                          <CardTitle className={cn("text-base font-bold", c.status.startsWith('cancelled') && "line-through")}>{c.name}</CardTitle>
                                          {c.type !== 'rental' && <CardDescription className="text-xs">{style?.name}</CardDescription>}
                                        </div>
                                        {c.type === 'rental' 
                                         ? <Badge variant="outline" className="flex items-center gap-1"><Building className="h-3 w-3" />Alquiler</Badge> 
                                         : <Badge variant="secondary">{level?.name}</Badge>}
                                  </CardHeader>
                                  <CardContent className="p-4 pt-0 text-sm space-y-2">
                                     <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> {c.time} ({c.duration})</div>
                                     <div className="flex items-center gap-2 text-muted-foreground">
                                        <User className="h-4 w-4" />
                                        {getTeacherNames(c.teacherIds) || c.rentalContact}
                                    </div>
                                     <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {c.room}</div>
                                  </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg h-full bg-muted/30">
                        <CalendarDays className="h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-4">No hay talleres ni eventos para este día.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SchedulePage() {
  const [styleFilter, setStyleFilter] = useState('Todos');
  const [levelFilter, setLevelFilter] = useState('Todos');
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [classToEnroll, setClassToEnroll] = useState<DanceClass | null>(null);

  const { userRole, isAuthenticated, addStudentPayment, userId, updateStudentMembership } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const styles = ['Todos', ...allStyles.map(s => s.name)];
  const levels = ['Todos', ...allLevels.map(l => l.name)];
  
  const handleEnrollRequest = (danceClass: DanceClass) => {
      if (!isAuthenticated) {
          setIsLoginDialogOpen(true);
          return;
      }
      if (userRole === 'student') {
        setClassToEnroll(danceClass);
      } else {
        toast({ title: "Acción no permitida", description: "Solo los estudiantes pueden inscribirse a clases.", variant: "destructive" });
      }
  };

  const confirmMonthlyEnroll = () => {
    if (!classToEnroll || !userId) return;

    const monthlyPlan = membershipPlans.find(p => p.id === 'unlimited-1');
    if (!monthlyPlan) {
        toast({ title: "Error", description: "No se encontró el plan mensual.", variant: "destructive" });
        return;
    }

    const newPayment: StudentPayment = {
        id: `inv-${Date.now()}`,
        studentId: userId,
        planId: monthlyPlan.id,
        invoiceDate: new Date().toISOString(),
        totalAmount: monthlyPlan.price,
        status: 'pending',
        amountPaid: 0,
        amountDue: monthlyPlan.price,
        lastUpdatedBy: 'Sistema',
        lastUpdatedDate: new Date().toISOString(),
    };
    addStudentPayment(newPayment);

    const membershipEndDate = new Date();
    membershipEndDate.setMonth(membershipEndDate.getMonth() + monthlyPlan.durationValue);
    
    updateStudentMembership(userId, {
        planId: monthlyPlan.id,
        startDate: new Date().toISOString(),
        endDate: membershipEndDate.toISOString(),
    });
    
    toast({
        title: "Inscripción Mensual Iniciada",
        description: "Se ha generado una factura para tu plan mensual. Revisa tu perfil.",
    });
    setClassToEnroll(null);
    router.push('/profile');
  };

  const filteredClasses = useMemo(() => {
    return danceClasses.filter(c => {
      const styleName = allStyles.find(s => s.id === c.styleId)?.name;
      const levelName = allLevels.find(l => l.id === c.levelId)?.name;
      
      const styleMatch = styleFilter === 'Todos' || styleName === styleFilter;
      const levelMatch = levelFilter === 'Todos' || levelName === levelFilter;
      
      const isVisibleRental = c.type === 'rental' && c.isVisibleToStudents;
      const isNotHiddenCancelled = !c.isCancelledAndHidden;
      
      return styleMatch && levelMatch && isNotHiddenCancelled && (c.type !== 'rental' || isVisibleRental);
    });
  }, [styleFilter, levelFilter]);


  const weeklyFilteredClasses = filteredClasses.filter(c => c.type === 'recurring');
  const eventFilteredClasses = filteredClasses.filter(c => ['one-time', 'workshop', 'rental'].includes(c.type));

  const filters = (idPrefix: string) => (
    <div className="flex flex-col md:flex-row gap-4 mb-4 p-4 bg-muted/50 rounded-lg border">
        <div className="flex-1 min-w-48 space-y-1">
            <Label htmlFor={`${idPrefix}-style-filter`}>Filtrar por Estilo</Label>
            <Select value={styleFilter} onValueChange={setStyleFilter}>
                <SelectTrigger id={`${idPrefix}-style-filter`}>
                <SelectValue placeholder="Filtrar por ritmo" />
                </SelectTrigger>
                <SelectContent>
                {styles.map(style => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>
        <div className="flex-1 min-w-48 space-y-1">
            <Label htmlFor={`${idPrefix}-level-filter`}>Filtrar por Nivel</Label>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger id={`${idPrefix}-level-filter`}>
                <SelectValue placeholder="Filtrar por nivel" />
                </SelectTrigger>
                <SelectContent>
                {levels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">Clases y Horarios</h1>
        <p className="text-lg text-muted-foreground">Encuentra tu ritmo. Explora nuestras clases regulares, talleres y eventos especiales.</p>
      </div>

      <LoginRequiredDialog isOpen={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} />
      
      <AlertDialog open={!!classToEnroll} onOpenChange={(open) => !open && setClassToEnroll(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Inscripción Mensual</AlertDialogTitle>
                <AlertDialogDescription>
                    Estás a punto de suscribirte al plan mensual "Ilimitado" para tener acceso a esta y otras clases. Se generará una factura por €{membershipPlans.find(p=>p.id === 'unlimited-1')?.price}. ¿Continuar?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmMonthlyEnroll}>Confirmar e Inscribirme</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

        <Tabs defaultValue="clases" className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:w-fit mb-8">
                <TabsTrigger value="clases">Clases</TabsTrigger>
                <TabsTrigger value="semanal">Calendario Semanal</TabsTrigger>
                <TabsTrigger value="eventos">Calendario de Eventos</TabsTrigger>
            </TabsList>

            <TabsContent value="clases">
                <Card>
                    <CardHeader>
                        <CardTitle>Listado de Clases y Eventos</CardTitle>
                        <CardDescription>Todas las actividades disponibles basadas en los filtros seleccionados.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {filters('list')}
                       {filteredClasses.length > 0 ? (
                            filteredClasses.map(c => <ClassListCard key={c.id} danceClass={c} onEnrollRequest={handleEnrollRequest} />)
                        ) : (
                             <div className="text-center py-16">
                                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-medium font-headline">No se encontraron clases</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Intenta ajustar tus filtros para encontrar otras actividades.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="semanal">
                <Card>
                    <CardHeader>
                        <CardTitle>Horario Semanal</CardTitle>
                        <CardDescription>Clases que se repiten cada semana. Pasa el cursor sobre una clase para ver los detalles.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filters('grid')}
                        {weeklyFilteredClasses.length > 0 ? (
                            <div className="relative h-[70vh] overflow-auto border rounded-lg">
                                <WeeklySchedule classes={weeklyFilteredClasses} />
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-medium font-headline">No se encontraron clases recurrentes</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Intenta ajustar tus filtros para encontrar otras clases.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="eventos">
                <Card>
                    <CardHeader>
                        <CardTitle>Calendario de Eventos</CardTitle>
                        <CardDescription>Talleres, clases únicas y alquileres de sala. Haz clic en un día para ver los eventos programados.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CalendarEvents classes={eventFilteredClasses} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
