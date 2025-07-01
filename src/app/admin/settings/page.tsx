'use client';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea";

const settingsFormSchema = z.object({
  academyName: z.string().min(1, "El nombre de la academia es obligatorio."),
  contactEmail: z.string().email("Introduce un email válido."),
  address: z.string().optional(),
  welcomeMessage: z.string().optional(),
  enableNewSignups: z.boolean(),
  maintenanceMode: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const defaultValues: Partial<SettingsFormValues> = {
  academyName: "FusionArte",
  contactEmail: "contacto@fusionarte.com",
  address: "Calle Falsa 123, Ciudad Danza, 45678",
  welcomeMessage: "¡Bienvenido a FusionArte! El lugar donde la pasión y el arte se encuentran.",
  enableNewSignups: true,
  maintenanceMode: false,
};

export default function AdminSettingsPage() {
    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues,
        mode: "onChange",
    });

    function onSubmit(data: SettingsFormValues) {
        toast({
            title: "Configuración Guardada",
            description: "Tus cambios han sido guardados exitosamente (simulación).",
        });
        console.log(data);
    }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-8">Configuración</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Ajustes Generales</CardTitle>
                    <CardDescription>Configura los ajustes generales de la academia de baile FusionArte.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="academyName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre de la Academia</FormLabel>
                                <FormControl>
                                    <Input placeholder="FusionArte" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email de Contacto</FormLabel>
                                <FormControl>
                                    <Input placeholder="contacto@fusionarte.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dirección</FormLabel>
                                <FormControl>
                                    <Input placeholder="Calle, Ciudad, Código Postal" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="welcomeMessage"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mensaje de Bienvenida</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Un mensaje para mostrar a los nuevos usuarios" {...field} />
                                </FormControl>
                                <FormDescription>Este mensaje podría aparecer en el dashboard.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Ajustes de la Aplicación</CardTitle>
                    <CardDescription>Controla el comportamiento de la aplicación.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="enableNewSignups"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel>Permitir Nuevos Registros</FormLabel>
                                <FormDescription>
                                Activa esta opción para permitir que nuevos usuarios se registren.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="maintenanceMode"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel>Modo Mantenimiento</FormLabel>
                                <FormDescription>
                                    Desactiva el acceso a la aplicación para todos los usuarios excepto administradores.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit">Guardar Cambios</Button>
                </CardFooter>
            </Card>
        </form>
      </Form>
    </div>
  );
}
