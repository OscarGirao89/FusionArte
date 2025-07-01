
'use client';

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { danceClasses, teachers } from '@/lib/data';
import type { DanceClass } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, PlusCircle, Pencil, Trash2 } from 'lucide-react';

const classFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "El nombre es obligatorio."),
  style: z.string().min(1, "El estilo es obligatorio."),
  level: z.enum(['Principiante', 'Intermedio', 'Avanzado', 'Todos los Niveles'], {
    required_error: "Debes seleccionar un nivel."
  }),
  teacher: z.string({ required_error: "Debes seleccionar un profesor." }),
  day: z.string({ required_error: "Debes seleccionar un día." }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)."),
  room: z.string().min(1, "La sala es obligatoria."),
  duration: z.string().min(1, "La duración es obligatoria."),
});

type ClassFormValues = z.infer<typeof classFormSchema>;

const availableDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const availableLevels: DanceClass['level'][] = ['Principiante', 'Intermedio', 'Avanzado', 'Todos los Niveles'];
const availableTeachers = teachers.map(t => t.name);

export default function AdminClassesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<DanceClass | null>(null);
  const { toast } = useToast();

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: '',
      style: '',
      level: 'Principiante',
      teacher: '',
      day: 'Lunes',
      time: '19:00',
      room: '',
      duration: '60 min',
    },
  });

  const handleOpenDialog = (danceClass: DanceClass | null = null) => {
    setEditingClass(danceClass);
    if (danceClass) {
      form.reset(danceClass);
    } else {
      form.reset();
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (data: ClassFormValues) => {
    toast({
      title: `Clase ${editingClass ? 'actualizada' : 'creada'} con éxito`,
      description: `La clase "${data.name}" ha sido guardada (simulación).`,
    });
    setIsDialogOpen(false);
    setEditingClass(null);
  };
  
  const handleDelete = (classId: string) => {
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
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden sm:table-cell">Profesor</TableHead>
                  <TableHead className="hidden md:table-cell">Horario</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {danceClasses.map((danceClass) => (
                  <TableRow key={danceClass.id}>
                    <TableCell>
                      <p className="font-medium">{danceClass.name}</p>
                      <p className="text-sm text-muted-foreground">{danceClass.level}</p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{danceClass.teacher}</TableCell>
                    <TableCell className="hidden md:table-cell">{danceClass.day} - {danceClass.time}</TableCell>
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
        <DialogContent className="sm:max-w-[425px] md:sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingClass ? 'Editar Clase' : 'Añadir Nueva Clase'}</DialogTitle>
            <DialogDescription>
              {editingClass ? 'Modifica los detalles de la clase.' : 'Rellena los detalles para crear una nueva clase.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="style" render={({ field }) => (
                  <FormItem><FormLabel>Estilo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="level" render={({ field }) => (
                  <FormItem><FormLabel>Nivel</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un nivel" /></SelectTrigger></FormControl>
                    <SelectContent>{availableLevels.map(lvl => <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>)}</SelectContent>
                  </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="teacher" render={({ field }) => (
                  <FormItem><FormLabel>Profesor/a</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un profesor" /></SelectTrigger></FormControl>
                    <SelectContent>{availableTeachers.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="day" render={({ field }) => (
                  <FormItem><FormLabel>Día</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un día" /></SelectTrigger></FormControl>
                    <SelectContent>{availableDays.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}</SelectContent>
                  </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="time" render={({ field }) => (
                  <FormItem><FormLabel>Hora (HH:MM)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="room" render={({ field }) => (
                  <FormItem><FormLabel>Sala</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="duration" render={({ field }) => (
                  <FormItem><FormLabel>Duración</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
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
