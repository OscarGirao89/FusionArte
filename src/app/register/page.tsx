
'use client';

import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LogoIcon } from "@/components/icons/logo-icon";
import { useToast } from "@/hooks/use-toast";

const registerFormSchema = z.object({
    name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
    email: z.string().email({ message: "Por favor, introduce un email válido." }),
    password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"], // path of error
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = (data: RegisterFormValues) => {
        // In a real app, this is where you'd call your registration API.
        // For this prototype, we'll just simulate success.
        console.log("Simulating registration for:", data.email);

        toast({
            title: "¡Registro Exitoso!",
            description: "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
        });
        
        router.push('/login');
    };

    return (
        <div className="flex flex-1 items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <LogoIcon className="h-10 w-10 text-primary" />
                        <span className="font-bold text-3xl font-headline">FusionArte</span>
                    </div>
                    <CardTitle className="text-2xl">Crea tu Cuenta</CardTitle>
                    <CardDescription>Únete a nuestra comunidad y empieza a bailar.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre Completo</FormLabel>
                                    <FormControl><Input placeholder="Ana López" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl><Input type="email" placeholder="tu@email.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="password" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contraseña</FormLabel>
                                    <FormControl><Input type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmar Contraseña</FormLabel>
                                    <FormControl><Input type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Button type="submit" className="w-full">Crear Cuenta</Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="justify-center text-sm">
                    <p className="text-muted-foreground">¿Ya tienes una cuenta? <Link href="/login" className="text-primary hover:underline font-medium">Inicia Sesión</Link></p>
                </CardFooter>
            </Card>
        </div>
    );
}
