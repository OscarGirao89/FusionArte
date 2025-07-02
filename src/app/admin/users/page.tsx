
'use client';

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { users as initialUsers } from '@/lib/data';
import type { User } from '@/lib/types';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { MoreVertical, UserPlus, Pencil, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

const paymentDetailsSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("per_class"),
    payRate: z.coerce.number().min(0, "La tarifa por hora debe ser un número positivo."),
    cancelledClassPay: z.coerce.number().min(0, "El valor no puede ser negativo."),
  }),
  z.object({
    type: z.literal("monthly"),
    monthlySalary: z.coerce.number().min(0, "El salario mensual debe ser un número positivo."),
    cancelledClassPay: z.coerce.number().min(0, "El valor no puede ser negativo."),
  }),
  z.object({
    type: z.literal("percentage"),
    payRate: z.coerce.number().min(0, "El porcentaje debe ser un número positivo."),
    cancelledClassPay: z.coerce.number().min(0, "El valor no puede ser negativo."),
  })
]);


const userFormSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
    email: z.string().email("Email inválido."),
    role: z.enum(['Estudiante', 'Profesor', 'Administrador', 'Administrativo']),
    bio: z.string().optional(),
    specialties: z.string().optional(),
    paymentDetails: paymentDetailsSchema.optional(),
    avatar: z.string().optional(),
    isVisibleToStudents: z.boolean().default(false).optional(),
  }).refine(data => {
    if (data.role === 'Profesor' && !data.paymentDetails) {
      return false; // Professor must have payment details
    }
    return true;
  }, {
    message: "Los detalles de pago son obligatorios para los profesores.",
    path: ["paymentDetails"],
  });

type UserFormValues = z.infer<typeof userFormSchema>;

const roleVariant: { [key: string]: "default" | "secondary" | "destructive" } = {
    'Administrador': 'destructive',
    'Profesor': 'default',
    'Estudiante': 'secondary',
    'Administrativo': 'secondary'
}

const userRoles: User['role'][] = ['Estudiante', 'Profesor', 'Administrador', 'Administrativo'];

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { toast } = useToast();

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            paymentDetails: {
                type: 'per_class',
                payRate: 20,
                cancelledClassPay: 8,
            },
            isVisibleToStudents: false,
        }
    });

    const watchedRole = form.watch('role');
    const watchedPaymentType = form.watch('paymentDetails.type');
    const watchedAvatar = form.watch('avatar');
    const watchedName = form.watch('name');
    
    const handleOpenDialog = (user: User | null = null) => {
        setEditingUser(user);
        if (user) {
          form.reset({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            bio: user.bio,
            specialties: user.specialties?.join(', '),
            paymentDetails: user.paymentDetails || { type: 'per_class', payRate: 20, cancelledClassPay: 8 },
            avatar: user.avatar,
            isVisibleToStudents: user.isVisibleToStudents
          });
        } else {
          form.reset({
            name: '',
            email: '',
            role: 'Estudiante',
            bio: '',
            specialties: '',
            paymentDetails: { type: 'per_class', payRate: 20, cancelledClassPay: 8 },
            avatar: '',
            isVisibleToStudents: false,
          });
        }
        setIsDialogOpen(true);
      };

    const onSubmit = (data: UserFormValues) => {
        toast({
          title: `Usuario ${editingUser ? 'actualizado' : 'creado'}`,
          description: `El usuario "${data.name}" ha sido guardado (simulación).`,
        });

        const dataToSave: Omit<User, 'id' | 'joined'> & { id?: number } = {
            name: data.name,
            email: data.email,
            role: data.role,
            avatar: data.avatar || `https://placehold.co/100x100.png?text=${data.name.split(' ').map(n=>n[0]).join('')}`,
        };

        if (data.role === 'Profesor') {
            dataToSave.bio = data.bio;
            dataToSave.specialties = data.specialties?.split(',').map(s => s.trim());
            dataToSave.paymentDetails = data.paymentDetails;
            dataToSave.isVisibleToStudents = data.isVisibleToStudents;
        }

        if (editingUser) {
            setUsers(users.map(u => u.id === editingUser.id ? { ...editingUser, ...dataToSave } : u));
        } else {
            const newUser: User = {
                id: Math.max(...users.map(u => u.id)) + 1,
                ...dataToSave,
                joined: new Date().toISOString().split('T')[0],
            };
            setUsers([...users, newUser]);
        }
        setIsDialogOpen(false);
        setEditingUser(null);
    };

    const handleDelete = (userId: number) => {
        setUsers(users.filter(u => u.id !== userId));
        toast({
            title: "Usuario eliminado",
            description: `El usuario ha sido eliminado exitosamente (simulación).`,
            variant: "destructive"
        });
    }

  return (
    <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Usuarios</h1>
            <Button onClick={() => handleOpenDialog()}>
                <UserPlus className="mr-2 h-4 w-4" />
                Añadir Usuario
            </Button>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Usuarios Registrados</CardTitle>
          <CardDescription>Aquí puedes ver y gestionar todos los usuarios de la plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden sm:table-cell">Rol</TableHead>
                <TableHead className="hidden md:table-cell">Fecha de Ingreso</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person face" />
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={roleVariant[user.role] || 'secondary'}>{user.role}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{user.joined}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Acciones</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(user)}>
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
                                      Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(user.id)}>Eliminar</AlertDialogAction>
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
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Modifica los detalles del usuario.' : 'Rellena los detalles para crear un nuevo usuario.'}
            </DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <div className="md:col-span-2 space-y-2">
                        <Label>Foto de Perfil</Label>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={watchedAvatar || undefined} data-ai-hint="person face" />
                                <AvatarFallback>
                                    {(watchedName || ' ').split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <FormItem className="flex-grow">
                                <FormLabel className="sr-only">Subir foto</FormLabel>
                                <FormControl>
                                    <Input
                                        type="file"
                                        accept="image/png, image/jpeg, image/gif"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    form.setValue('avatar', reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage>{form.formState.errors.avatar?.message}</FormMessage>
                            </FormItem>
                        </div>
                    </div>
                    <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem className="md:col-span-2"><FormLabel>Rol</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un rol" /></SelectTrigger></FormControl>
                        <SelectContent>{userRoles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                    )} />
                </div>

                {watchedRole === 'Profesor' && (
                    <div className="space-y-4 p-4 border rounded-md">
                        <h3 className="text-lg font-medium">Detalles del Profesor</h3>
                        <FormField control={form.control} name="bio" render={({ field }) => (
                            <FormItem><FormLabel>Biografía</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="specialties" render={({ field }) => (
                            <FormItem><FormLabel>Especialidades</FormLabel><FormControl><Input {...field} placeholder="Salsa, Bachata, etc." /></FormControl><FormDescription>Separadas por comas.</FormDescription><FormMessage /></FormItem>
                        )} />
                        
                        <div className="space-y-2 p-3 border rounded-md">
                           <FormLabel>Detalles de Pago</FormLabel>
                            <FormField control={form.control} name="paymentDetails.type" render={({ field }) => (
                                <FormItem><FormLabel>Tipo de Pago</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="per_class">Por Clase/Hora</SelectItem>
                                        <SelectItem value="monthly">Mensual</SelectItem>
                                        <SelectItem value="percentage">Porcentaje</SelectItem>
                                    </SelectContent>
                                </Select><FormMessage /></FormItem>
                            )} />
                            {watchedPaymentType === 'per_class' && (
                                <FormField control={form.control} name="paymentDetails.payRate" render={({ field }) => (
                                    <FormItem><FormLabel>Tarifa por Hora (€)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            )}
                             {watchedPaymentType === 'monthly' && (
                                <FormField control={form.control} name="paymentDetails.monthlySalary" render={({ field }) => (
                                    <FormItem><FormLabel>Salario Mensual (€)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            )}
                             {watchedPaymentType === 'percentage' && (
                                <FormField control={form.control} name="paymentDetails.payRate" render={({ field }) => (
                                    <FormItem><FormLabel>Porcentaje (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            )}
                             <FormField control={form.control} name="paymentDetails.cancelledClassPay" render={({ field }) => (
                                <FormItem><FormLabel>Pago por Clase Cancelada (€)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>Poner 0 si no se paga.</FormDescription><FormMessage /></FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="isVisibleToStudents" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Visible para Alumnos</FormLabel>
                                    <FormDescription>
                                        Si se activa, el perfil de este profesor aparecerá en la página pública de profesores.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )} />
                         <FormMessage>{form.formState.errors.paymentDetails?.message}</FormMessage>
                    </div>
                )}


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

    