
'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Edit, Trash2, Tag, User, Circle, CheckCircle, Clock, CalendarIcon, Users as UsersIcon, Bell } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { TaskNote, TaskStatus } from '@/lib/types';
import { taskNotes as initialTaskNotes, users as allUsers } from '@/lib/data';
import { z } from "zod"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO }from 'date-fns';
import { es } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';

const taskNoteSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "El título es obligatorio."),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']),
  category: z.string().min(1, "La categoría es obligatoria."),
  assigneeIds: z.array(z.number()).default([]),
  dueDate: z.date().optional().nullable(),
  alertDate: z.date().optional().nullable(),
  alertTime: z.string().optional(),
  createdAt: z.string().optional(),
});

type TaskNoteFormValues = z.infer<typeof taskNoteSchema>;

const statusMap: Record<TaskStatus, { label: string; icon: React.ReactNode; color: string }> = {
  todo: { label: 'Por Hacer', icon: <Circle className="h-4 w-4" />, color: 'text-gray-500' },
  in_progress: { label: 'En Progreso', icon: <Clock className="h-4 w-4" />, color: 'text-blue-500' },
  done: { label: 'Finalizado', icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-500' },
};

function TaskCard({ task, onEdit, onDelete, onStatusChange }: { task: TaskNote; onEdit: (task: TaskNote) => void; onDelete: (taskId: string) => void; onStatusChange: (taskId: string, status: TaskStatus) => void; }) {
  const assignees = allUsers.filter(u => task.assigneeIds?.includes(u.id));
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
            <CardTitle className="text-base font-bold pr-2">{task.title}</CardTitle>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(task)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Mover a</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            {Object.entries(statusMap).map(([status, {label}]) => (
                                <DropdownMenuItem key={status} onClick={() => onStatusChange(task.id, status as TaskStatus)}>{label}</DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={e => e.preventDefault()} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => onDelete(task.id)}>Eliminar</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1">
            <Badge variant="outline">{task.category}</Badge>
            {task.dueDate && <Badge variant="secondary" className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> Vence: {format(parseISO(task.dueDate), 'PPP', { locale: es })}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground pb-4">
        {task.description}
      </CardContent>
      {(assignees.length > 0 || task.createdAt) && (
        <CardFooter className="pb-4 justify-between items-center text-xs text-muted-foreground">
            {task.createdAt && <span>Creada el {format(parseISO(task.createdAt), 'PPP', {locale: es})}</span>}
            <div className="flex -space-x-2">
                {assignees.map(assignee => (
                    <TooltipProvider key={assignee.id}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Avatar className="h-8 w-8 border-2 border-background">
                                    <AvatarImage src={assignee.avatar} alt={assignee.name} />
                                    <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent><p>Asignado a {assignee.name}</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>
        </CardFooter>
      )}
    </Card>
  );
}

export default function NotesAndTasksPage() {
    const [tasks, setTasks] = useState<TaskNote[]>(initialTaskNotes);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<TaskNote | null>(null);
    const { toast } = useToast();

    const form = useForm<TaskNoteFormValues>({
        resolver: zodResolver(taskNoteSchema),
        defaultValues: { status: 'todo', assigneeIds: [] }
    });
    
    const managementUsers = allUsers.filter(u => u.role === 'Socio' || u.role === 'Administrador' || u.role === 'Administrativo');

    const handleOpenDialog = (task: TaskNote | null = null) => {
        setEditingTask(task);
        if (task) {
            form.reset({
                ...task,
                assigneeIds: task.assigneeIds || [],
                dueDate: task.dueDate ? parseISO(task.dueDate) : null,
                alertDate: task.alertDateTime ? parseISO(task.alertDateTime) : null,
                alertTime: task.alertDateTime ? format(parseISO(task.alertDateTime), 'HH:mm') : undefined,
            });
        } else {
            form.reset({
                title: '',
                description: '',
                status: 'todo',
                category: 'General',
                assigneeIds: [],
                dueDate: null,
                alertDate: null,
            });
        }
        setIsDialogOpen(true);
    };

    const onSubmit = (data: TaskNoteFormValues) => {
        const dataToSave: TaskNote = {
            id: editingTask?.id || `task-${Date.now()}`,
            createdAt: editingTask?.createdAt || new Date().toISOString(),
            ...data,
            dueDate: data.dueDate ? data.dueDate.toISOString().split('T')[0] : undefined,
            alertDateTime: data.alertDate && data.alertTime
                ? `${format(data.alertDate, 'yyyy-MM-dd')}T${data.alertTime}:00`
                : undefined,
        };

        if (editingTask) {
            setTasks(tasks.map(t => t.id === editingTask.id ? dataToSave : t));
        } else {
            setTasks([...tasks, dataToSave]);
        }
        toast({ title: `Tarea ${editingTask ? 'actualizada' : 'creada'}`, description: `La tarea "${data.title}" ha sido guardada.` });
        setIsDialogOpen(false);
    };
    
    const handleDelete = (taskId: string) => {
        setTasks(tasks.filter(t => t.id !== taskId));
        toast({ title: "Tarea eliminada", variant: "destructive" });
    }

    const handleStatusChange = (taskId: string, status: TaskStatus) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
    };

    const columns: Record<TaskStatus, TaskNote[]> = {
        todo: tasks.filter(t => t.status === 'todo'),
        in_progress: tasks.filter(t => t.status === 'in_progress'),
        done: tasks.filter(t => t.status === 'done'),
    };

    return (
        <div className="p-4 md:p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Notas y Tareas</h1>
                <Button onClick={() => handleOpenDialog()}><PlusCircle className="mr-2 h-4 w-4" /> Añadir Tarea</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(statusMap).map(([statusKey, {label, icon}]) => (
                    <div key={statusKey} className="bg-muted/50 p-4 rounded-lg">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">{icon} {label} ({columns[statusKey as TaskStatus].length})</h2>
                        <div className="space-y-4">
                            {columns[statusKey as TaskStatus].map(task => (
                                <TaskCard key={task.id} task={task} onEdit={handleOpenDialog} onDelete={handleDelete} onStatusChange={handleStatusChange} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</DialogTitle>
                        <DialogDescription>Completa los detalles de la tarea o nota pendiente.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            
                             <FormField control={form.control} name="assigneeIds" render={({ field }) => (
                                <FormItem><FormLabel>Asignar a</FormLabel>
                                 <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start font-normal">
                                            <UsersIcon className="mr-2 h-4 w-4" />
                                            {field.value?.length > 0 ? `${field.value.length} persona(s) seleccionada(s)` : 'Seleccionar...'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-2">
                                        <div className="space-y-2">
                                            {managementUsers.map(user => (
                                                <div key={user.id} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`assignee-${user.id}`}
                                                        checked={field.value?.includes(user.id)}
                                                        onCheckedChange={checked => {
                                                            return checked
                                                                ? field.onChange([...(field.value || []), user.id])
                                                                : field.onChange((field.value || []).filter(id => id !== user.id))
                                                        }}
                                                    />
                                                    <Label htmlFor={`assignee-${user.id}`}>{user.name}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage /></FormItem>
                            )} />
                            
                            <div className="grid grid-cols-2 gap-4">
                                 <FormField control={form.control} name="category" render={({ field }) => (
                                    <FormItem><FormLabel>Categoría</FormLabel><FormControl><Input {...field} placeholder="Ej: Evento, Compras..." /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="dueDate" render={({ field }) => (
                                  <FormItem className="flex flex-col"><FormLabel>Fecha de Vencimiento</FormLabel>
                                    <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                      {field.value ? (format(field.value, "PPP", { locale: es })) : (<span>Elegir fecha</span>)}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={es}/>
                                    </PopoverContent></Popover><FormMessage />
                                  </FormItem>
                                )} />
                            </div>

                            <div className="p-4 border rounded-md space-y-3">
                                <h4 className="font-semibold flex items-center gap-2"><Bell className="h-4 w-4"/> Configurar Alerta</h4>
                                <div className="grid grid-cols-2 gap-4">
                                     <FormField control={form.control} name="alertDate" render={({ field }) => (
                                      <FormItem className="flex flex-col"><FormLabel>Fecha de Alerta</FormLabel>
                                        <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                          {field.value ? (format(field.value, "PPP", { locale: es })) : (<span>Elegir fecha</span>)}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={es}/>
                                        </PopoverContent></Popover><FormMessage />
                                      </FormItem>
                                    )} />
                                     <FormField control={form.control} name="alertTime" render={({ field }) => (
                                        <FormItem><FormLabel>Hora (HH:MM)</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                            </div>
                            
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                                <Button type="submit">Guardar</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
