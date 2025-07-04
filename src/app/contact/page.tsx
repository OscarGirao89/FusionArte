
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

const contactFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.string().email("Introduce un email válido."),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres."),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
    const { settings } = useSettings();
    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: "",
            email: "",
            message: "",
        },
    });

    function onSubmit(data: ContactFormValues) {
        toast({
            title: "Mensaje Enviado",
            description: `Gracias por tu mensaje, ${data.name}. Nos pondremos en contacto contigo pronto.`,
        });
        console.log(data);
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
                            <p className="text-muted-foreground">Lunes a Viernes: 10:00 - 22:00</p>
                            <p className="text-muted-foreground">Sábados: 10:00 - 14:00</p>
                        </CardContent>
                    </Card>
                </div>
                <div>
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
