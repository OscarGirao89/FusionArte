
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
import { useSettings } from "@/context/settings-context";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const settingsFormSchema = z.object({
  academyName: z.string().min(1, "El nombre de la academia es obligatorio."),
  contactEmail: z.string().email("Introduce un email válido."),
  address: z.string().optional(),
  phone: z.string().optional(),
  welcomeMessage: z.string().optional(),
  enableNewSignups: z.boolean(),
  maintenanceMode: z.boolean(),
  logoUrl: z.string().optional(),
  instagramUrl: z.string().url("URL de Instagram inválida.").or(z.literal('')).optional(),
  facebookUrl: z.string().url("URL de Facebook inválida.").or(z.literal('')).optional(),
  tiktokUrl: z.string().url("URL de TikTok inválida.").or(z.literal('')).optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function AdminSettingsPage() {
    const { settings, updateSettings } = useSettings();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: settings,
        mode: "onChange",
    });

    useEffect(() => {
        form.reset(settings);
    }, [settings, form]);
    
    const watchedLogo = form.watch('logoUrl');

    function onSubmit(data: SettingsFormValues) {
        updateSettings(data);
        toast({
            title: "Configuración Guardada",
            description: "Tus cambios han sido guardados exitosamente.",
        });
    }

    const handleLogoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                form.setValue('logoUrl', reader.result as string, { shouldDirty: true });
            };
            reader.readAsDataURL(file);
        }
    };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-8">Configuración</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Identidad Visual</CardTitle>
                    <CardDescription>Gestiona el logo de tu academia.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="logoUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Logo de la Academia</FormLabel>
                                <FormControl>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-20 w-20 rounded-md cursor-pointer hover:opacity-80 transition-opacity" onClick={handleLogoClick}>
                                            <AvatarImage src={watchedLogo} className="object-contain" />
                                            <AvatarFallback className="rounded-md">{settings.academyName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <Button type="button" variant="outline" onClick={handleLogoClick}>Subir Logo</Button>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/gif, image/svg+xml" />
                                    </div>
                                </FormControl>
                                <FormDescription>Haz clic en el logo o en el botón para subir una nueva imagen (PNG, JPG, SVG).</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Ajustes Generales</CardTitle>
                    <CardDescription>Configura los ajustes generales de la academia de baile FusionArte.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField control={form.control} name="academyName" render={({ field }) => (
                        <FormItem><FormLabel>Nombre de la Academia</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="welcomeMessage" render={({ field }) => (
                        <FormItem><FormLabel>Mensaje de Bienvenida</FormLabel><FormControl><Textarea {...field} /></FormControl><FormDescription>Este mensaje podría aparecer en el dashboard.</FormDescription><FormMessage /></FormItem>
                     )} />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Datos de Contacto y Redes Sociales</CardTitle>
                    <CardDescription>Esta información se mostrará en las páginas públicas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="contactEmail" render={({ field }) => (
                            <FormItem><FormLabel>Email de Contacto</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                     <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input placeholder="Calle, Ciudad, Código Postal" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="instagramUrl" render={({ field }) => (
                            <FormItem><FormLabel>Instagram URL</FormLabel><FormControl><Input placeholder="https://instagram.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="facebookUrl" render={({ field }) => (
                            <FormItem><FormLabel>Facebook URL</FormLabel><FormControl><Input placeholder="https://facebook.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="tiktokUrl" render={({ field }) => (
                            <FormItem><FormLabel>TikTok URL</FormLabel><FormControl><Input placeholder="https://tiktok.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Ajustes de la Aplicación</CardTitle>
                    <CardDescription>Controla el comportamiento de la aplicación.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField control={form.control} name="enableNewSignups" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5"><FormLabel>Permitir Nuevos Registros</FormLabel><FormDescription>Activa esta opción para permitir que nuevos usuarios se registren.</FormDescription></div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="maintenanceMode" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5"><FormLabel>Modo Mantenimiento</FormLabel><FormDescription>Desactiva el acceso a la aplicación para todos los usuarios excepto administradores.</FormDescription></div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )} />
                </CardContent>
            </Card>
            
            <CardFooter className="border-t px-0 py-4">
                <Button type="submit">Guardar Cambios</Button>
            </CardFooter>
        </form>
      </Form>
    </div>
  );
}
