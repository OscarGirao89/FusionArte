
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { User, PaymentDetails } from '@/lib/types';
import { useAuth } from '@/context/auth-context';

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
import { MoreVertical, UserPlus, Pencil, Trash2, ShieldCheck, Download, Printer } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { paymentDetailsSchema } from '@/lib/types';

const userRolesEnum = z.enum(['Estudiante', 'Profesor', 'Admin', 'Administrativo', 'Socio']);

const userFormSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
    email: z.string().email("Email inválido."),
    role: userRolesEnum,
    bio: z.string().optional(),
    specialties: z.string().optional(),
    paymentDetails: paymentDetailsSchema.optional(),
    avatar: z.string().optional(),
    isVisibleToStudents: z.boolean().default(false).optional(),
    isPartner: z.boolean().default(false).optional(),
  }).refine(data => {
    if ((data.role === 'Profesor' || data.role === 'Socio') && !data.paymentDetails) {
      return false; 
    }
    return true;
  }, {
    message: "Los detalles de pago son obligatorios para los profesores y socios.",
    path: ["paymentDetails"],
  });

type UserFormValues = z.infer<typeof userFormSchema>;

const roleVariant: { [key: string]: "default" | "secondary" | "destructive" } = {
    'Admin': 'destructive',
    'Socio': 'destructive',
    'Profesor': 'default',
    'Estudiante': 'secondary',
    'Administrativo': 'secondary'
}

const userRoles: z.infer<typeof userRolesEnum>[] = ['Estudiante', 'Profesor', 'Admin', 'Administrativo', 'Socio'];

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    const { userRole } = useAuth();
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                setUsers(await res.json());
            } else {
                toast({ title: "Error", description: "No se pudieron cargar los usuarios.", variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error", description: "No se pudieron cargar los usuarios.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [toast]);
    
    const canManageRoles = userRole === 'Admin' || userRole === 'Socio';
    const canCreateUser = userRole === 'Admin' || userRole === 'Socio';
    const canDeleteUser = userRole === 'Admin' || userRole === 'Socio';
    const canEditUser = (userToEdit: User) => {
        if (userRole === 'Admin' || userRole === 'Socio') {
            return true;
        }
        if (userRole === 'Administrativo') {
            return userToEdit.role === 'Estudiante' || userToEdit.role === 'Profesor';
        }
        return false;
    };


    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            isVisibleToStudents: false,
            isPartner: false,
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
            role: user.role as UserFormValues['role'],
            bio: user.bio,
            specialties: user.specialties?.join(', '),
            paymentDetails: user.paymentDetails,
            avatar: user.avatar,
            isVisibleToStudents: user.isVisibleToStudents,
            isPartner: user.isPartner,
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
            isPartner: false,
          });
        }
        setIsDialogOpen(true);
      };

    const onSubmit = async (data: UserFormValues) => {
        const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
        const method = editingUser ? 'PUT' : 'POST';

        const body = editingUser ? JSON.stringify(data) : JSON.stringify({ ...data, password: 'password123' });

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to ${method} user`);
            }

            toast({
                title: `Usuario ${editingUser ? 'actualizado' : 'creado'}`,
                description: `El usuario "${data.name}" ha sido guardado.`,
            });
            
            await fetchUsers();
        } catch (error) {
            toast({
                title: "Error",
                description: (error as Error).message,
                variant: "destructive"
            });
        } finally {
            setIsDialogOpen(false);
            setEditingUser(null);
        }
    };

    const handleDelete = async (userId: number) => {
        try {
            const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error("Failed to delete user");
            }
            toast({
                title: "Usuario eliminado",
                description: `El usuario ha sido eliminado exitosamente.`,
                variant: "destructive"
            });
            await fetchUsers();
        } catch (error) {
            toast({
                title: "Error al eliminar",
                description: (error as Error).message,
                variant: "destructive"
            });
        }
    }
    
    const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                form.setValue('avatar', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleExportCSV = () => {
        const headers = ["ID", "Nombre", "Email", "Rol", "Fecha de Ingreso"];
        const csvRows = [headers.join(',')];
        
        users.forEach(user => {
          const row = [
            user.id,
            `"${user.name}"`,
            user.email,
            user.role,
            user.joined
          ].map(field => (typeof field === 'string' ? field.replace(/"/g, '""') : field)).join(',');
          csvRows.push(row);
        });
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'usuarios_fusionarte.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="p-4 md:p-8 space-y-4">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-10 w-48" />
                </div>
                <Card>
                    <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

  return (
    <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-2 no-print">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Usuarios</h1>
            <div className="flex items-center gap-2">
                {canManageRoles && (
                    <Button variant="outline" onClick={() => router.push('/admin/roles')}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Gestionar Roles
                    </Button>
                )}
                {canCreateUser && (
                    <Button onClick={() => handleOpenDialog()}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Añadir Usuario
                    </Button>
                )}
            </div>
        </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div>
              <CardTitle>Usuarios Registrados</CardTitle>
              <CardDescription>Aquí puedes ver y gestionar todos los usuarios de la plataforma.</CardDescription>
            </div>
            <div className="flex gap-2 flex-shrink-0 flex-wrap no-print">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" /> Exportar CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Imprimir
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden sm:table-cell">Rol</TableHead>
                  <TableHead className="hidden md:table-cell">Fecha de Ingreso</TableHead>
                  <TableHead className="no-print">
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
                      <Badge variant={roleVariant[user.role as keyof typeof roleVariant] || 'secondary'}>{user.role}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{new Date(user.joined).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell className="no-print">
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Acciones</span>
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDialog(user)} disabled={!canEditUser(user)}>
                                  <Pencil className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                               {canDeleteUser && (
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
                               )}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal={true}>
        <DialogContent className="sm:max-w-2xl no-print">
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
                             <Button type="button" variant="outline" onClick={() => avatarInputRef.current?.click()}>
                                Subir Foto
                             </Button>
                            <input
                                type="file"
                                ref={avatarInputRef}
                                className="hidden"
                                accept="image/png, image/jpeg, image/gif"
                                onChange={handleAvatarFileChange}
                            />
                        </div>
                    </div>
                    <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem className="md:col-span-2"><FormLabel>Rol</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un rol" /></SelectTrigger></FormControl>
                        <SelectContent>{userRoles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                    )} />
                </div>

                {(watchedRole === 'Profesor' || watchedRole === 'Socio') && (
                    <div className="space-y-4 p-4 border rounded-md">
                        <h3 className="text-lg font-medium">Detalles del Profesor/Socio</h3>
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
                        <FormField control={form.control} name="isPartner" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Socio de la Academia</FormLabel>
                                    <FormDescription>
                                        Marcar si el profesor es socio. Esto afectará a los cálculos financieros.
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
