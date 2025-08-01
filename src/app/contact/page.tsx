
'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Mail, MapPin, Phone } from "lucide-react"
import { useSettings } from "@/context/settings-context"
import { TikTokIcon } from "@/components/icons/tiktok-icon"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

const contactFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.string().email("Introduce un email válido."),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres."),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
    const { settings, isLoading } = useSettings();
    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: "",
            email: "",
            message: "",
        },
    });

    if (isLoading || !settings) {
        return (
             <div className="p-8 space-y-8">
                <Skeleton className="h-24 w-full" />
                <div className="grid md:grid-cols-2 gap-8">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        )
    }

    const whatsAppUrl = settings.whatsappPhone ? `https://wa.me/${settings.whatsappPhone.replace(/\D/g, '')}` : '';

    function onSubmit(data: ContactFormValues) {
        toast({
            title: "Mensaje Enviado (Simulación)",
            description: `Gracias por tu mensaje, ${data.name}. Nos pondremos en contacto contigo pronto.`,
        });
        console.log("Simulating form submission:", data);
        form.reset();
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="text-center space-y-2 mb-12">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">Contáctanos</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    ¿Tienes preguntas? ¿Quieres saber más? Estamos aquí para ayudarte.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Nuestros Datos</CardTitle>
                            <CardDescription>Encuéntranos o ponte en contacto directo.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center gap-4">
                                <MapPin className="h-6 w-6 text-primary flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">Dirección</p>
                                    <p className="text-muted-foreground">{settings.address || 'No especificada'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone className="h-6 w-6 text-primary flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">Teléfono</p>
                                    <p className="text-muted-foreground">{settings.phone || 'No especificado'}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-4">
                                <Mail className="h-6 w-6 text-primary flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">Email</p>
                                    <p className="text-muted-foreground">{settings.contactEmail}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Horario de Atención</CardTitle>
                        </CardHeader>
                        <CardContent>
                             {settings.openingHours?.split('\n').map((line, index) => (
                                <p key={index} className="text-muted-foreground">{line}</p>
                             ))}
                        </CardContent>
                    </Card>
                </div>
                <div>
                     {whatsAppUrl && (
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle>¿Prefieres WhatsApp?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button asChild className="w-full">
                                    <Link href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="mr-2"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.273-.099-.471-.148-.67.148-.198.297-.768.967-.941 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.521-.075-.148-.67-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.203 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                                        Chatea con Nosotros
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                     <Card>
                        <CardHeader>
                            <CardTitle>Envíanos un Mensaje</CardTitle>
                            <CardDescription>Rellena el formulario y te responderemos lo antes posible.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="email" render={({ field }) => (
                                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="message" render={({ field }) => (
                                        <FormItem><FormLabel>Mensaje</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <Button type="submit" className="w-full">Enviar Mensaje</Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
