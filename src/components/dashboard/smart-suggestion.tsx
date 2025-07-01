'use client';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { suggestClassesAction } from '@/app/actions';
import type { SuggestAlternativeClassesOutput } from '@/ai/flows/smart-class-suggestion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Loader2, Sparkles } from 'lucide-react';

const formSchema = z.object({
  studentPreferences: z.string().min(10, {
    message: 'Por favor, describe tus preferencias con un poco más de detalle.',
  }),
  classSchedule: z.string().min(10, {
    message: 'Por favor, proporciona algunos detalles sobre el horario disponible.',
  }),
  conflictDetails: z.string().min(10, {
    message: 'Por favor, explica el conflicto o por qué necesitas una alternativa.',
  }),
});

export function SmartSuggestion() {
  const [result, setResult] = useState<SuggestAlternativeClassesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentPreferences: 'Me encantan los estilos enérgicos como Salsa y Hip Hop. Soy un bailarín de nivel intermedio.',
      classSchedule: 'Lunes: Salsa Principiante 19h, Bachata Intermedio 20h. Martes: Hip Hop Avanzado 18:30h. Miércoles: Salsa Intermedio 19h.',
      conflictDetails: 'Tengo una reunión de trabajo el próximo miércoles y me perderé mi clase de Salsa Intermedia de las 19h.',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await suggestClassesAction(values);
      setResult(res);
    } catch (e: any) {
      setError(e.message || 'Ocurrió un error inesperado.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
             <FormField
                control={form.control}
                name="studentPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tus Preferencias</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Me gustan los bailes latinos de alta energía, nivel intermedio."
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Dinos qué te gusta (estilos, nivel, energía).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="classSchedule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horario de Clases</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Proporciona la parte relevante del horario."
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      ¿Qué clases están disponibles?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="conflictDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detalles del Conflicto</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Me perderé mi clase habitual de Salsa del miércoles por un evento de trabajo."
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      ¿Por qué necesitas una clase alternativa?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>

          <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Pensando...
              </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Buscar Alternativas
                </>
            )}
          </Button>
        </form>
      </Form>
      
      {error && (
        <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
            <p className="font-bold">Error</p>
            <p>{error}</p>
        </div>
      )}

      {result && (
        <Card className="mt-6 bg-primary/5 border-primary/20 animate-in fade-in-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Sparkles className="h-6 w-6 text-primary"/>
                    Sugerencias con IA
                </CardTitle>
                <CardDescription>{result.reasoning}</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                    {result.suggestedClasses.split('\n').map((item, index) => item.trim() && <li key={index}>{item.replace(/^- /, '')}</li>)}
                </ul>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
