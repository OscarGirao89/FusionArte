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
    message: 'Please describe your preferences in a bit more detail.',
  }),
  classSchedule: z.string().min(10, {
    message: 'Please provide some details about the available schedule.',
  }),
  conflictDetails: z.string().min(10, {
    message: 'Please explain the conflict or why you need an alternative.',
  }),
});

export function SmartSuggestion() {
  const [result, setResult] = useState<SuggestAlternativeClassesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentPreferences: 'I love energetic styles like Salsa and Hip Hop. I am an intermediate dancer.',
      classSchedule: 'Mondays: Salsa Beginner 7pm, Bachata Intermediate 8pm. Tuesdays: Hip Hop Advanced 6:30pm. Wednesdays: Salsa Intermediate 7pm.',
      conflictDetails: 'I have a work meeting next Wednesday and will miss my 7pm Intermediate Salsa class.',
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
      setError(e.message || 'An unexpected error occurred.');
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
                    <FormLabel>Your Preferences</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., I like high-energy Latin dances, intermediate level."
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Tell us what you like (styles, level, energy).
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
                    <FormLabel>Class Schedule</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide the relevant part of the schedule."
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      What classes are available?
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
                    <FormLabel>Conflict Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., I will miss my usual Wednesday Salsa class due to a work event."
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Why do you need an alternative class?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>

          <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent/90">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Thinking...
              </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Find Alternatives
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
                    AI-Powered Suggestions
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
