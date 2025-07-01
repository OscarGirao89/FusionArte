'use server';

import { suggestAlternativeClasses } from '@/ai/flows/smart-class-suggestion';
import type { SuggestAlternativeClassesInput } from '@/ai/flows/smart-class-suggestion';

export async function suggestClassesAction(input: SuggestAlternativeClassesInput) {
  try {
    const result = await suggestAlternativeClasses(input);
    return result;
  } catch (error) {
    console.error('Error in suggestClassesAction:', error);
    throw new Error('Failed to get suggestions from AI. Please try again.');
  }
}
