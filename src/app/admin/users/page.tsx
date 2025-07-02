
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MoreVertical, UserPlus, Pencil, Trash2 } from 'lucide-react';

const userFormSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  email: z.string().email("Email inválido."),
  role: z.enum(['Estudiante', 'Profesor', 'Administrador', 'Administrativo'], {
    required_error: "Debes seleccionar un rol."
  }),
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
    });
    
    const handleOpenDialog = (user: User | null = null) => {
        setEditingUser(user);
        if (user) {
          form.reset({
            name: user.name,
            email: user.email,
            role: user.role,
          });
        } else {
          form.reset({
            name: '',
            email: '',
            role: 'Estudiante',
          });
        }
        setIsDialogOpen(true);
      };

    const onSubmit = (data: UserFormValues) => {
        toast({
          title: `Usuario ${editingUser ? 'actualizado' : 'creado'}`,
          description: `El usuario "${data.name}" ha sido guardado (simulación).`,
        });

        if (editingUser) {
            setUsers(users.map(u => u.id === editingUser.id ? { ...editingUser, ...data } : u));
        } else {
            const newUser: User = {
                id: Math.max(...users.map(u => u.id)) + 1,
                ...data,
                joined: new Date().toISOString().split('T')[0],
                avatar: `https://placehold.co/100x100.png?text=${data.name.split(' ').map(n=>n[0]).join('')}`
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
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Modifica los detalles del usuario.' : 'Rellena los detalles para crear un nuevo usuario.'}
            </DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="role" render={({ field }) => (
                  <FormItem><FormLabel>Rol</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un rol" /></SelectTrigger></FormControl>
                    <SelectContent>{userRoles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent>
                  </Select><FormMessage /></FormItem>
                )} />

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
