
'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Edit, Trash2, Tag, User, Circle, CheckCircle, Clock } from 'lucide-react';
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

const taskNoteSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "El título es obligatorio."),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']),
  category: z.string().min(1, "La categoría es obligatoria."),
  assigneeId: z.coerce.number().optional().nullable(),
});

type TaskNoteFormValues = z.infer<typeof taskNoteSchema>;

const statusMap: Record<TaskStatus, { label: string; icon: React.ReactNode; color: string }> = {
  todo: { label: 'Por Hacer', icon: <Circle className="h-4 w-4" />, color: 'text-gray-500' },
  in_progress: { label: 'En Progreso', icon: <Clock className="h-4 w-4" />, color: 'text-blue-500' },
  done: { label: 'Finalizado', icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-500' },
};

function TaskCard({ task, onEdit, onDelete, onStatusChange }: { task: TaskNote; onEdit: (task: TaskNote) => void; onDelete: (taskId: string) => void; onStatusChange: (taskId: string, status: TaskStatus) => void; }) {
  const assignee = task.assigneeId ? allUsers.find(u => u.id === task.assigneeId) : null;
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
            <CardTitle className="text-base font-bold">{task.title}</CardTitle>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-4 w-4" /></Button>
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
        <CardDescription className="text-xs pt-1"><Badge variant="outline">{task.category}</Badge></CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground pb-4">
        {task.description}
      </CardContent>
      {assignee && (
        <CardFooter className="pb-4">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={assignee.avatar} alt={assignee.name} />
                            <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </TooltipTrigger>
                    <TooltipContent><p>Asignado a {assignee.name}</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
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
        defaultValues: { status: 'todo' }
    });
    
    const taskCategories = useMemo(() => Array.from(new Set(tasks.map(t => t.category))), [tasks]);
    const managementUsers = allUsers.filter(u => u.role === 'Socio' || u.role === 'Administrador' || u.role === 'Administrativo');

    const handleOpenDialog = (task: TaskNote | null = null) => {
        setEditingTask(task);
        if (task) {
            form.reset({
                ...task,
                assigneeId: task.assigneeId ?? null
            });
        } else {
            form.reset({
                title: '',
                description: '',
                status: 'todo',
                category: 'General',
                assigneeId: null,
            });
        }
        setIsDialogOpen(true);
    };

    const onSubmit = (data: TaskNoteFormValues) => {
        const dataToSave: TaskNote = {
            id: editingTask?.id || `task-${Date.now()}`,
            ...data,
            assigneeId: data.assigneeId || undefined,
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</DialogTitle>
                        <DialogDescription>Completa los detalles de la tarea o nota pendiente.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                 <FormField control={form.control} name="category" render={({ field }) => (
                                    <FormItem><FormLabel>Categoría</FormLabel><FormControl><Input {...field} placeholder="Ej: Evento, Compras..." /></FormControl><FormMessage /></FormItem>
                                )} />
                                 <FormField control={form.control} name="assigneeId" render={({ field }) => (
                                    <FormItem><FormLabel>Asignar a</FormLabel>
                                        <Select onValueChange={(val) => field.onChange(val === 'none' ? null : val)} value={String(field.value) ?? 'none'}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">Sin asignar</SelectItem>
                                                {managementUsers.map(user => (
                                                    <SelectItem key={user.id} value={String(user.id)}>{user.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    <FormMessage /></FormItem>
                                )} />
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
