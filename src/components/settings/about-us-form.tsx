
'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/context/settings-context";
import type { AcademySettings } from "@/lib/types";
import { useEffect } from "react";

const formSchema = z.object({
  aboutUsTitle: z.string().optional(),
  aboutUsStory: z.string().optional(),
  aboutUsMission: z.string().optional(),
  aboutUsVision: z.string().optional(),
  aboutUsValues: z.string().optional(),
  aboutUsTeamTitle: z.string().optional(),
  aboutUsTeamDescription: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  settings: AcademySettings;
}

export function AboutUsSettingsForm({ settings }: Props) {
    const { updateSettings } = useSettings();
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            aboutUsTitle: settings.aboutUsTitle,
            aboutUsStory: settings.aboutUsStory,
            aboutUsMission: settings.aboutUsMission,
            aboutUsVision: settings.aboutUsVision,
            aboutUsValues: settings.aboutUsValues,
            aboutUsTeamTitle: settings.aboutUsTeamTitle,
            aboutUsTeamDescription: settings.aboutUsTeamDescription,
        },
    });

    useEffect(() => {
        form.reset(settings);
    }, [settings, form]);

    async function onSubmit(data: FormValues) {
        await updateSettings(data);
        toast({
            title: "Configuración Guardada",
            description: "El contenido de la página 'Acerca de' ha sido actualizado.",
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Página 'Acerca de Nosotros'</CardTitle>
                        <CardDescription>Gestiona el contenido que se muestra en la página "Acerca de Nosotros".</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="aboutUsTitle" render={({ field }) => (<FormItem><FormLabel>Título Principal ("Nuestra Historia")</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="aboutUsStory" render={({ field }) => (<FormItem><FormLabel>Párrafo de la Historia</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="aboutUsMission" render={({ field }) => (<FormItem><FormLabel>Texto de Misión</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="aboutUsVision" render={({ field }) => (<FormItem><FormLabel>Texto de Visión</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="aboutUsValues" render={({ field }) => (<FormItem><FormLabel>Texto de Valores</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="aboutUsTeamTitle" render={({ field }) => (<FormItem><FormLabel>Título de la Sección de Equipo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="aboutUsTeamDescription" render={({ field }) => (<FormItem><FormLabel>Descripción de la Sección de Equipo</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </CardContent>
                    <CardFooter><Button type="submit" disabled={form.formState.isSubmitting}>Guardar Cambios</Button></CardFooter>
                </Card>
            </form>
        </Form>
    );
}
