
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/context/auth-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogIn } from 'lucide-react';
import { LogoIcon } from '@/components/icons/logo-icon';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/context/settings-context';
import Image from 'next/image';

const loginFormSchema = z.object({
  email: z.string().email("Por favor, introduce un email válido."),
  password: z.string().min(1, "La contraseña es obligatoria."),
  role: z.enum(['student', 'teacher', 'admin', 'administrativo', 'socio']),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { settings } = useSettings();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'student',
    },
  });

  const handleLogin = (data: LoginFormValues) => {
    // In this prototype, we're not actually checking the email/password.
    // The role selector is the "key" to the simulation.
    console.log(`Simulating login for email: ${data.email} with role: ${data.role}`);
    login(data.role);
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            {settings.logoUrl ? (
                <Image src={settings.logoUrl} alt={settings.academyName} width={40} height={40} className="h-10 w-auto" />
            ) : (
                <LogoIcon className="h-10 w-10 text-primary" />
            )}
            <span className="font-bold text-3xl font-headline">{settings.academyName}</span>
          </div>
          <CardTitle className="text-2xl">Bienvenido/a de Nuevo</CardTitle>
          <CardDescription>Introduce tus datos para acceder a tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol (para simulación)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                         <SelectTrigger><SelectValue /></SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         <SelectItem value="student">Estudiante</SelectItem>
                         <SelectItem value="teacher">Profesor</SelectItem>
                         <SelectItem value="admin">Administrador</SelectItem>
                         <SelectItem value="administrativo">Administrativo</SelectItem>
                         <SelectItem value="socio">Socio</SelectItem>
                       </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar Sesión
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm">
              <p className="text-muted-foreground">¿No tienes una cuenta?{' '}
                  <Link href="/register" className="text-primary hover:underline font-medium">
                      Regístrate
                  </Link>
              </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
