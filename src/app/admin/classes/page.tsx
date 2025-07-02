
'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { danceClasses as initialClasses, teachers, danceStyles, danceLevels } from '@/lib/data';
import type { DanceClass, DanceStyle, DanceLevel, Teacher } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, PlusCircle, Pencil, Trash2, Calendar, Clock } from 'lucide-react';

const classFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "El nombre es obligatorio."),
  styleId: z.string({ required_error: "Debes seleccionar un estilo." }),
  levelId: z.string({ required_error: "Debes seleccionar un nivel." }),
  teacher: z.string({ required_error: "Debes seleccionar un profesor." }),
  day: z.string({ required_error: "Debes seleccionar un día." }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)."),
  room: z.string().min(1, "La sala es obligatoria."),
  duration: z.string().min(1, "La duración es obligatoria."),
  recurrence: z.enum(['one-time', 'recurring'], { required_error: "Debes seleccionar un tipo de recurrencia." }),
  recurrenceMonths: z.coerce.number().optional(),
}).refine(data => {
    if (data.recurrence === 'recurring' && (data.recurrenceMonths === undefined || data.recurrenceMonths <= 0)) {
        return false;
    }
    return true;
}, {
    message: "Para clases recurrentes, los meses deben ser mayor que 0.",
    path: ["recurrenceMonths"],
});

type ClassFormValues = z.infer<typeof classFormSchema>;

const availableDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const availableTeachers = teachers.map(t => t.name);

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<DanceClass[]>(initialClasses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<DanceClass | null>(null);
  const { toast } = useToast();

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: '',
      styleId: undefined,
      levelId: undefined,
      teacher: undefined,
      day: undefined,
      time: '19:00',
      room: '',
      duration: '60 min',
      recurrence: 'one-time',
      recurrenceMonths: 1,
    },
  });

  const recurrenceType = form.watch('recurrence');

  const getStyleName = (id: string) => danceStyles.find(s => s.id === id)?.name || id;
  const getLevelName = (id: string) => danceLevels.find(l => l.id === id)?.name || id;

  const handleOpenDialog = (danceClass: DanceClass | null = null) => {
    setEditingClass(danceClass);
    if (danceClass) {
      form.reset({
        ...danceClass,
        recurrenceMonths: danceClass.recurrenceMonths || 1,
      });
    } else {
      form.reset({
        name: '',
        styleId: undefined,
        levelId: undefined,
        teacher: undefined,
        day: undefined,
        time: '19:00',
        room: '',
        duration: '60 min',
        recurrence: 'one-time',
        recurrenceMonths: 1,
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (data: ClassFormValues) => {
    toast({
      title: `Clase ${editingClass ? 'actualizada' : 'creada'} con éxito`,
      description: `La clase "${data.name}" ha sido guardada (simulación).`,
    });
    // Lógica de simulación para añadir/editar
    if (editingClass) {
      setClasses(classes.map(c => c.id === editingClass.id ? { ...c, ...data, id: c.id, teacherAvatar: c.teacherAvatar } : c));
    } else {
      const newClass: DanceClass = {
        ...data,
        id: `clase-${Date.now()}`,
        teacherAvatar: teachers.find(t => t.name === data.teacher)?.avatar || 'https://placehold.co/100x100.png',
      };
      setClasses([...classes, newClass]);
    }
    setIsDialogOpen(false);
    setEditingClass(null);
  };
  
  const handleDelete = (classId: string) => {
    setClasses(classes.filter(c => c.id !== classId));
    toast({
      title: "Clase eliminada",
      description: `La clase ha sido eliminada exitosamente (simulación).`,
      variant: "destructive"
    });
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Clases</h1>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Clase
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Listado de Clases</CardTitle>
          <CardDescription>Añade, edita o elimina las clases ofrecidas en la academia.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clase</TableHead>
                  <TableHead className="hidden sm:table-cell">Profesor</TableHead>
                  <TableHead className="hidden md:table-cell">Horario</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((danceClass) => (
                  <TableRow key={danceClass.id}>
                    <TableCell>
                      <p className="font-medium">{danceClass.name} ({getStyleName(danceClass.styleId)})</p>
                      <p className="text-sm text-muted-foreground">{getLevelName(danceClass.levelId)}</p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{danceClass.teacher}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                           <Calendar className="h-4 w-4" /> {danceClass.day}, {danceClass.time}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                           <Clock className="h-3 w-3" /> {danceClass.recurrence === 'recurring' ? `Recurrente (${danceClass.recurrenceMonths} meses)` : 'Clase Única'}
                        </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(danceClass)}>
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Esto eliminará permanentemente la clase.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(danceClass.id)}>Eliminar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingClass ? 'Editar Clase' : 'Añadir Nueva Clase'}</DialogTitle>
            <DialogDescription>
              {editingClass ? 'Modifica los detalles de la clase.' : 'Rellena los detalles para crear una nueva clase.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Nombre de la clase</FormLabel><FormControl><Input {...field} placeholder="Ej: Salsa Lady Style" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="styleId" render={({ field }) => (
                  <FormItem><FormLabel>Estilo de Baile</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un estilo" /></SelectTrigger></FormControl>
                    <SelectContent>{danceStyles.map(style => <SelectItem key={style.id} value={style.id}>{style.name}</SelectItem>)}</SelectContent>
                  </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="levelId" render={({ field }) => (
                  <FormItem><FormLabel>Nivel</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un nivel" /></SelectTrigger></FormControl>
                    <SelectContent>{danceLevels.map(lvl => <SelectItem key={lvl.id} value={lvl.id}>{lvl.name}</SelectItem>)}</SelectContent>
                  </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="teacher" render={({ field }) => (
                  <FormItem><FormLabel>Profesor/a</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un profesor" /></SelectTrigger></FormControl>
                    <SelectContent>{availableTeachers.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="day" render={({ field }) => (
                  <FormItem><FormLabel>Día de la semana</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un día" /></SelectTrigger></FormControl>
                    <SelectContent>{availableDays.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}</SelectContent>
                  </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="time" render={({ field }) => (
                  <FormItem><FormLabel>Hora (HH:MM)</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="room" render={({ field }) => (
                  <FormItem><FormLabel>Sala</FormLabel><FormControl><Input {...field} placeholder="Ej: Estudio 1" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="duration" render={({ field }) => (
                  <FormItem><FormLabel>Duración</FormLabel><FormControl><Input {...field} placeholder="Ej: 60 min" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="recurrence" render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel>Recurrencia</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona tipo de recurrencia" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="one-time">Clase Única</SelectItem>
                      <SelectItem value="recurring">Clase Recurrente</SelectItem>
                    </SelectContent>
                  </Select><FormMessage /></FormItem>
                )} />
                {recurrenceType === 'recurring' && (
                  <FormField control={form.control} name="recurrenceMonths" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Duración de la recurrencia (meses)</FormLabel>
                      <FormControl><Input type="number" min="1" {...field} /></FormControl>
                      <FormDescription>La clase se repetirá semanalmente durante este número de meses.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar Cambios</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
