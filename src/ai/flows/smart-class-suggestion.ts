'use server';

/**
 * @fileOverview AI-powered class suggestion flow.
 *
 * - suggestAlternativeClasses - A function that suggests alternative classes based on conflicts, preferences, or instructor availability.
 * - SuggestAlternativeClassesInput - The input type for the suggestAlternativeClasses function.
 * - SuggestAlternativeClassesOutput - The return type for the suggestAlternativeClasses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAlternativeClassesInputSchema = z.object({
  studentPreferences: z
    .string()
    .describe('The students dance style and level preferences.'),
  classSchedule: z
    .string()
    .describe('The current class schedule, including class times, instructors, and levels.'),
  conflictDetails: z
    .string()
    .describe('Details about the conflict, such as time conflicts or instructor unavailability.'),
});
export type SuggestAlternativeClassesInput = z.infer<
  typeof SuggestAlternativeClassesInputSchema
>;

const SuggestAlternativeClassesOutputSchema = z.object({
  suggestedClasses: z
    .string()
    .describe('A list of suggested alternative classes that fit the students preferences and availability.'),
  reasoning: z
    .string()
    .describe('The AI agents reasoning for suggesting these classes.'),
});
export type SuggestAlternativeClassesOutput = z.infer<
  typeof SuggestAlternativeClassesOutputSchema
>;

export async function suggestAlternativeClasses(
  input: SuggestAlternativeClassesInput
): Promise<SuggestAlternativeClassesOutput> {
  return suggestAlternativeClassesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAlternativeClassesPrompt',
  input: {schema: SuggestAlternativeClassesInputSchema},
  output: {schema: SuggestAlternativeClassesOutputSchema},
  prompt: `You are a helpful assistant that suggests alternative dance classes to students based on their preferences, the class schedule, and any conflicts they may have. 

  Consider the following information:

  Student Preferences: {{{studentPreferences}}}
  Class Schedule: {{{classSchedule}}}
  Conflict Details: {{{conflictDetails}}}

  Based on this information, suggest alternative classes that the student might enjoy. Explain your reasoning for suggesting these classes.
  Format the suggested classes as a list. Put the list of suggested classes in the suggestedClasses field, and your reasoning in the reasoning field.
  `,
});

const suggestAlternativeClassesFlow = ai.defineFlow(
  {
    name: 'suggestAlternativeClassesFlow',
    inputSchema: SuggestAlternativeClassesInputSchema,
    outputSchema: SuggestAlternativeClassesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

