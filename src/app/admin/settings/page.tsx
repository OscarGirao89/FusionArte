
'use client';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/context/settings-context";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const heroSlideSchema = z.object({
  id: z.string().optional(),
  heroTitle: z.string().min(1, "El título es obligatorio."),
  heroSubtitle: z.string().optional(),
  heroDescription: z.string().optional(),
  heroButtonText: z.string().min(1, "El texto del botón es obligatorio."),
  heroButtonLink: z.string().url("Debe ser una URL válida.").or(z.literal('')),
  heroImageUrl: z.string().optional(),
});

const scheduleImageSchema = z.object({
    id: z.string().optional(),
    url: z.string().min(1, "La URL de la imagen no puede estar vacía."),
    alt: z.string().optional(),
});

const settingsFormSchema = z.object({
  academyName: z.string().min(1, "El nombre de la academia es obligatorio."),
  contactEmail: z.string().email("Introduce un email válido."),
  address: z.string().optional(),
  phone: z.string().optional(),
  whatsappPhone: z.string().optional(),
  welcomeMessage: z.string().optional(),
  enableNewSignups: z.boolean(),
  maintenanceMode: z.boolean(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  instagramUrl: z.string().url("URL de Instagram inválida.").or(z.literal('')).optional(),
  facebookUrl: z.string().url("URL de Facebook inválida.").or(z.literal('')).optional(),
  tiktokUrl: z.string().url("URL de TikTok inválida.").or(z.literal('')).optional(),
  openingHours: z.string().optional(),
  
  registrationEmailMessage: z.string().optional(),
  membershipEmailMessage: z.string().optional(),

  aboutUsTitle: z.string().min(1, "El título es obligatorio."),
  aboutUsStory: z.string().min(1, "La historia es obligatoria."),
  aboutUsMission: z.string().min(1, "La misión es obligatoria."),
  aboutUsVision: z.string().min(1, "La visión es obligatoria."),
  aboutUsValues: z.string().min(1, "Los valores son obligatorios."),
  aboutUsTeamTitle: z.string().min(1, "El título del equipo es obligatorio."),
  aboutUsTeamDescription: z.string().min(1, "La descripción del equipo es obligatoria."),

  heroSlides: z.array(heroSlideSchema).min(1, "Debe haber al menos una diapositiva."),
  scheduleImages: z.array(scheduleImageSchema).optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function AdminSettingsPage() {
    const { settings, updateSettings, isLoading } = useSettings();
    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        values: settings || undefined,
        mode: "onChange",
    });

    const { fields: heroFields, append: appendHero, remove: removeHero } = useFieldArray({
        control: form.control,
        name: "heroSlides",
    });

    const { fields: scheduleImageFields, append: appendScheduleImage, remove: removeScheduleImage } = useFieldArray({
        control: form.control,
        name: "scheduleImages",
    });

    useEffect(() => {
        if(settings) {
            form.reset({ ...settings, scheduleImages: settings.scheduleImages || [] });
        }
    }, [settings, form]);
    
    const watchedLogo = form.watch('logoUrl');
    const watchedFavicon = form.watch('faviconUrl');

    async function handlePartialSubmit(data: Partial<SettingsFormValues>) {
        await updateSettings(data);
        toast({
            title: "Configuración Guardada",
            description: "Tus cambios han sido guardados exitosamente.",
        });
    }

    const handleImageClick = (ref: React.RefObject<HTMLInputElement>) => {
        ref.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fieldName: any) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                form.setValue(fieldName, reader.result as string, { shouldDirty: true, shouldValidate: true });
            };
            reader.readAsDataURL(file);
        }
    };
    
    if (isLoading || !settings) {
        return <div>Cargando configuración...</div>
    }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-8">Configuración</h1>
      <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Identidad Visual</CardTitle>
                    <CardDescription>Gestiona el logo y el ícono de tu academia.</CardDescription>
                </CardHeader>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(data => handlePartialSubmit({ logoUrl: data.logoUrl, faviconUrl: data.faviconUrl }))}>
                    <CardContent className="grid md:grid-cols-2 gap-8">
                        <FormField control={form.control} name="logoUrl" render={() => (
                            <FormItem>
                                <FormLabel>Logo de la Academia</FormLabel>
                                <FormControl>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-20 w-20 rounded-md cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleImageClick(logoInputRef)}>
                                            <AvatarImage src={watchedLogo} className="object-contain" />
                                            <AvatarFallback className="rounded-md">{settings.academyName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <Button type="button" variant="outline" onClick={() => handleImageClick(logoInputRef)}>Subir Logo</Button>
                                        <input type="file" ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logoUrl')} className="hidden" accept="image/png, image/jpeg, image/gif, image/svg+xml" />
                                    </div>
                                </FormControl>
                                <FormDescription>Haz clic en el logo o en el botón para subir una nueva imagen (PNG, JPG, SVG).</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="faviconUrl" render={() => (
                            <FormItem>
                                <FormLabel>Ícono del Navegador (Favicon)</FormLabel>
                                <FormControl>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-20 w-20 rounded-md cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleImageClick(faviconInputRef)}>
                                            <AvatarImage src={watchedFavicon} className="object-contain" />
                                            <AvatarFallback className="rounded-md">ICO</AvatarFallback>
                                        </Avatar>
                                        <Button type="button" variant="outline" onClick={() => handleImageClick(faviconInputRef)}>Subir Ícono</Button>
                                        <input type="file" ref={faviconInputRef} onChange={(e) => handleFileChange(e, 'faviconUrl')} className="hidden" accept="image/png, image/x-icon, image/svg+xml" />
                                    </div>
                                </FormControl>
                                <FormDescription>Sube un ícono (ICO, PNG, SVG) para la pestaña del navegador.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                    <CardFooter><Button type="submit" disabled={form.formState.isSubmitting}>Guardar Identidad Visual</Button></CardFooter>
                </form>
                </Form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Ajustes Generales</CardTitle>
                    <CardDescription>Configura los ajustes generales de la academia.</CardDescription>
                </CardHeader>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(data => handlePartialSubmit({ academyName: data.academyName, welcomeMessage: data.welcomeMessage }))}>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="academyName" render={({ field }) => (
                            <FormItem><FormLabel>Nombre de la Academia</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="welcomeMessage" render={({ field }) => (
                            <FormItem><FormLabel>Mensaje de Bienvenida</FormLabel><FormControl><Textarea {...field} /></FormControl><FormDescription>Este mensaje podría aparecer en el dashboard.</FormDescription><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                    <CardFooter><Button type="submit" disabled={form.formState.isSubmitting}>Guardar Ajustes Generales</Button></CardFooter>
                </form>
                </Form>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Datos de Contacto y Horarios</CardTitle>
                    <CardDescription>Esta información se mostrará en las páginas públicas.</CardDescription>
                </CardHeader>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(data => handlePartialSubmit({ contactEmail: data.contactEmail, phone: data.phone, whatsappPhone: data.whatsappPhone, address: data.address, openingHours: data.openingHours, instagramUrl: data.instagramUrl, facebookUrl: data.facebookUrl, tiktokUrl: data.tiktokUrl }))}>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="contactEmail" render={({ field }) => (
                                <FormItem><FormLabel>Email de Contacto</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="whatsappPhone" render={({ field }) => (
                            <FormItem><FormLabel>Teléfono para WhatsApp</FormLabel><FormControl><Input placeholder="+34600123456" {...field} /></FormControl><FormDescription>Introduce el número completo con el código de país para el enlace de WhatsApp.</FormDescription><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input placeholder="Calle, Ciudad, Código Postal" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="openingHours" render={({ field }) => (
                            <FormItem><FormLabel>Horario de Atención</FormLabel><FormControl><Textarea placeholder="Lunes a Viernes: 10:00 - 22:00..." {...field} /></FormControl><FormDescription>Usa saltos de línea para separar los días. Se mostrará en la página de contacto.</FormDescription><FormMessage /></FormItem>
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
                    <CardFooter><Button type="submit" disabled={form.formState.isSubmitting}>Guardar Datos de Contacto</Button></CardFooter>
                </form>
                </Form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Plantillas de Email</CardTitle>
                    <CardDescription>Personaliza los mensajes automáticos que se envían a los usuarios.</CardDescription>
                </CardHeader>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(data => handlePartialSubmit({ registrationEmailMessage: data.registrationEmailMessage, membershipEmailMessage: data.membershipEmailMessage }))}>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="registrationEmailMessage" render={({ field }) => (
                            <FormItem><FormLabel>Mensaje de Bienvenida (Registro)</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormDescription>Este mensaje se enviará a los nuevos usuarios al registrarse. Usa {'{{name}}'} para insertar el nombre del usuario.</FormDescription><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="membershipEmailMessage" render={({ field }) => (
                            <FormItem><FormLabel>Mensaje de Agradecimiento (Membresía)</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormDescription>Este mensaje se incluirá en el email de confirmación de compra de membresía.</FormDescription><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                    <CardFooter><Button type="submit" disabled={form.formState.isSubmitting}>Guardar Plantillas de Email</Button></CardFooter>
                </form>
                </Form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Ajustes de la Aplicación</CardTitle>
                    <CardDescription>Controla el comportamiento de la aplicación.</CardDescription>
                </CardHeader>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(data => handlePartialSubmit({ enableNewSignups: data.enableNewSignups, maintenanceMode: data.maintenanceMode }))}>
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
                    <CardFooter><Button type="submit" disabled={form.formState.isSubmitting}>Guardar Ajustes de Aplicación</Button></CardFooter>
                </form>
                </Form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Página 'Acerca de Nosotros'</CardTitle>
                    <CardDescription>Gestiona el contenido que se muestra en la página "Acerca de Nosotros".</CardDescription>
                </CardHeader>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(data => handlePartialSubmit({ aboutUsTitle: data.aboutUsTitle, aboutUsStory: data.aboutUsStory, aboutUsMission: data.aboutUsMission, aboutUsVision: data.aboutUsVision, aboutUsValues: data.aboutUsValues, aboutUsTeamTitle: data.aboutUsTeamTitle, aboutUsTeamDescription: data.aboutUsTeamDescription }))}>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="aboutUsTitle" render={({ field }) => (<FormItem><FormLabel>Título Principal ("Nuestra Historia")</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="aboutUsStory" render={({ field }) => (<FormItem><FormLabel>Párrafo de la Historia</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="aboutUsMission" render={({ field }) => (<FormItem><FormLabel>Texto de Misión</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="aboutUsVision" render={({ field }) => (<FormItem><FormLabel>Texto de Visión</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="aboutUsValues" render={({ field }) => (<FormItem><FormLabel>Texto de Valores</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="aboutUsTeamTitle" render={({ field }) => (<FormItem><FormLabel>Título de la Sección de Equipo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="aboutUsTeamDescription" render={({ field }) => (<FormItem><FormLabel>Descripción de la Sección de Equipo</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </CardContent>
                    <CardFooter><Button type="submit" disabled={form.formState.isSubmitting}>Guardar Contenido 'Acerca de'</Button></CardFooter>
                </form>
                </Form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Diapositivas de la Página Principal</CardTitle>
                    <CardDescription>Gestiona el contenido del carrusel en la página de inicio. Añade, edita o elimina diapositivas.</CardDescription>
                </CardHeader>
                 <Form {...form}>
                <form onSubmit={form.handleSubmit(data => handlePartialSubmit({ heroSlides: data.heroSlides }))}>
                    <CardContent className="space-y-6">
                    <div className="space-y-4">
                        {heroFields.map((field, index) => {
                        const heroImageInputRef = React.createRef<HTMLInputElement>();
                        const watchedHeroImage = form.watch(`heroSlides.${index}.heroImageUrl`);
                        return (
                            <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold">Diapositiva {index + 1}</h4>
                                    {heroFields.length > 1 && (
                                    <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeHero(index)}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                    )}
                                </div>
                                <Separator />
                                <FormField control={form.control} name={`heroSlides.${index}.heroTitle`} render={({ field }) => (<FormItem><FormLabel>Título Principal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name={`heroSlides.${index}.heroSubtitle`} render={({ field }) => (<FormItem><FormLabel>Subtítulo</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Texto más pequeño que aparece sobre el título.</FormDescription><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name={`heroSlides.${index}.heroDescription`} render={({ field }) => (<FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name={`heroSlides.${index}.heroButtonText`} render={({ field }) => (<FormItem><FormLabel>Texto del Botón</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name={`heroSlides.${index}.heroButtonLink`} render={({ field }) => (<FormItem><FormLabel>Enlace del Botón</FormLabel><FormControl><Input {...field} placeholder="/schedule" /></FormControl><FormMessage /></FormItem> )} />
                                </div>
                                <FormField
                                    control={form.control}
                                    name={`heroSlides.${index}.heroImageUrl`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Imagen Principal</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-4">
                                                    <Image src={watchedHeroImage || "https://placehold.co/800x1200.png"} alt={form.getValues(`heroSlides.${index}.heroTitle`) || "Imagen de portada"} width={100} height={150} className="object-contain border rounded-md" />
                                                    <Button type="button" variant="outline" onClick={() => handleImageClick(heroImageInputRef)}>Subir Imagen</Button>
                                                    <input type="file" ref={heroImageInputRef} onChange={(e) => handleFileChange(e, `heroSlides.${index}.heroImageUrl`)} className="hidden" accept="image/png, image/jpeg, image/gif" />
                                                </div>
                                            </FormControl>
                                            <FormDescription>Imagen grande que aparece en la diapositiva. Se recomienda una imagen vertical (ej: 800x1200px).</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )
                        })}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendHero({ heroTitle: "Nuevo Título", heroButtonText: "Saber Más", heroButtonLink: "/", heroImageUrl: "https://placehold.co/800x1200.png"})}>
                        <PlusCircle className="mr-2" /> Añadir Diapositiva
                    </Button>
                    <FormMessage>{form.formState.errors.heroSlides?.message}</FormMessage>
                    </CardContent>
                    <CardFooter><Button type="submit" disabled={form.formState.isSubmitting}>Guardar Diapositivas</Button></CardFooter>
                </form>
                </Form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Imágenes de Horarios</CardTitle>
                    <CardDescription>Sube imágenes de tus horarios para mostrarlas en la página de "Clases y Horarios". Puedes subir hasta 3.</CardDescription>
                </CardHeader>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(data => handlePartialSubmit({ scheduleImages: data.scheduleImages }))}>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            {scheduleImageFields.map((field, index) => {
                                const imageInputRef = React.createRef<HTMLInputElement>();
                                const watchedImage = form.watch(`scheduleImages.${index}.url`);
                                return (
                                    <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-semibold">Imagen de Horario {index + 1}</h4>
                                            <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeScheduleImage(index)}>
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name={`scheduleImages.${index}.url`}
                                            render={() => (
                                                <FormItem>
                                                    <FormLabel className="sr-only">URL de la Imagen</FormLabel>
                                                    <FormControl>
                                                        <div className="flex items-center gap-4">
                                                            <Image src={watchedImage || "https://placehold.co/600x400.png"} alt={form.getValues(`scheduleImages.${index}.alt`) || `Horario ${index + 1}`} width={200} height={150} className="object-contain border rounded-md" />
                                                            <Button type="button" variant="outline" onClick={() => handleImageClick(imageInputRef)}>Cambiar Imagen</Button>
                                                            <input type="file" ref={imageInputRef} onChange={(e) => handleFileChange(e, `scheduleImages.${index}.url`)} className="hidden" accept="image/png, image/jpeg, image/gif" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField control={form.control} name={`scheduleImages.${index}.alt`} render={({ field }) => (<FormItem><FormLabel>Texto Alternativo (Alt)</FormLabel><FormControl><Input {...field} placeholder="Ej: Horario de Clases de Salsa y Bachata" /></FormControl><FormMessage /></FormItem> )} />
                                    </div>
                                )
                            })}
                        </div>
                        {scheduleImageFields.length < 3 && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => appendScheduleImage({ url: "https://placehold.co/600x400.png", alt: "" })}
                            >
                                <PlusCircle className="mr-2" />
                                Añadir Imagen de Horario
                            </Button>
                        )}
                    </CardContent>
                    <CardFooter><Button type="submit" disabled={form.formState.isSubmitting}>Guardar Imágenes de Horario</Button></CardFooter>
                </form>
                </Form>
            </Card>
      </div>
    </div>
  );
}
