'use server';

/**
 * @fileOverview Summarizes the core concepts of each section of a syllabus using generative AI.
 *
 * - summarizeSyllabusTopics - A function that handles the syllabus topic summarization process.
 * - SummarizeSyllabusTopicsInput - The input type for the summarizeSyllabusTopics function.
 * - SummarizeSyllabusTopicsOutput - The return type for the summarizeSyllabusTopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSyllabusTopicsInputSchema = z.object({
  syllabusText: z
    .string()
    .describe('The text content of the syllabus to be summarized.'),
});
export type SummarizeSyllabusTopicsInput = z.infer<
  typeof SummarizeSyllabusTopicsInputSchema
>;

const SummarizeSyllabusTopicsOutputSchema = z.object({
  summary: z
    .string()
    .describe('A summary of the core concepts of each section in the syllabus.'),
  progress: z
    .string()
    .describe('A short, one-sentence summary of the flow execution.'),
});
export type SummarizeSyllabusTopicsOutput = z.infer<
  typeof SummarizeSyllabusTopicsOutputSchema
>;

export async function summarizeSyllabusTopics(
  input: SummarizeSyllabusTopicsInput
): Promise<SummarizeSyllabusTopicsOutput> {
  return summarizeSyllabusTopicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSyllabusTopicsPrompt',
  input: {schema: SummarizeSyllabusTopicsInputSchema},
  output: {schema: SummarizeSyllabusTopicsOutputSchema},
  prompt: `You are an expert academic assistant. Your task is to summarize the core concepts of each section of a given syllabus.

Syllabus Text: {{{syllabusText}}}

Provide a concise summary of the main topics covered in the syllabus, highlighting key areas of study and focus.`,
});

const summarizeSyllabusTopicsFlow = ai.defineFlow(
  {
    name: 'summarizeSyllabusTopicsFlow',
    inputSchema: SummarizeSyllabusTopicsInputSchema,
    outputSchema: SummarizeSyllabusTopicsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      ...output!,
      progress: 'The syllabus topics have been summarized using the Gemini API.',
    };
  }
);
