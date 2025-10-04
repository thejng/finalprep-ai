'use server';

/**
 * @fileOverview Predicts potential exam questions using the Gemini API based on uploaded past papers and syllabus documents.
 *
 * - generatePredictedQuestions - A function that generates predicted exam questions.
 * - GeneratePredictedQuestionsInput - The input type for the generatePredictedQuestions function.
 * - GeneratePredictedQuestionsOutput - The return type for the generatePredictedQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePredictedQuestionsInputSchema = z.object({
  topic: z.string().describe('The topic to generate questions for.'),
  previousQuestions: z.string().describe('The previously asked questions for the topic.'),
});
export type GeneratePredictedQuestionsInput = z.infer<typeof GeneratePredictedQuestionsInputSchema>;

const GeneratePredictedQuestionsOutputSchema = z.object({
  questions: z.array(z.object({
    question: z.string().describe('The predicted exam question.'),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty of the question.'),
    topic: z.string().describe('The topic of the question.'),
  })).describe('An array of 10 predicted exam questions.'),
});
export type GeneratePredictedQuestionsOutput = z.infer<typeof GeneratePredictedQuestionsOutputSchema>;

export async function generatePredictedQuestions(input: GeneratePredictedQuestionsInput): Promise<GeneratePredictedQuestionsOutput> {
  return generatePredictedQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePredictedQuestionsPrompt',
  input: {schema: GeneratePredictedQuestionsInputSchema},
  output: {schema: GeneratePredictedQuestionsOutputSchema},
  prompt: `You are an expert exam question creator. Your primary task is to analyze a list of questions from past papers to predict 10 highly probable questions for the upcoming exam. Give more weight to the past papers than the syllabus.

Follow these steps:
1.  **Prioritize Past Papers Analysis**: Deeply analyze the provided 'previousQuestions'. Your main focus should be here. Identify recurring themes, question formats (e.g., definition, problem-solving, case study), and topics that are most frequently tested. Note if past questions include numerical problems, as this is a key indicator.
2.  **Use Syllabus for Context Only**: Briefly review the 'topic' (syllabus summary) to understand the broader context, but the topics and trends from the past papers are more important. Use the syllabus mainly to correctly label the topic for the questions you generate.
3.  **Identify High-Probability Topics**: Based on your analysis of the past papers, determine which topics have the highest probability of appearing again. Focus on these high-frequency areas.
4.  **Web Search for Similar Questions**: For the high-probability topics you identified, perform a mental web search to find similar questions or recent applications. This will help you create fresh but relevant questions.
5.  **Generate Questions**: Based on your analysis, generate 10 new questions.
    *   **The mix of numerical vs. theoretical questions should strongly reflect the mix found in the 'previousQuestions'.** This is a critical instruction.
    *   Ensure a mix of difficulties: 4 Easy, 4 Medium, and 2 Hard.
    *   The questions must be clear and directly relevant to the topics found in the past papers.
    *   For each question, specify the topic it relates to.

**Past Paper Questions (Primary Source)**:
{{{previousQuestions}}}

**Syllabus Topics (Secondary Context)**:
{{{topic}}}

Generate the 10 predicted questions now.`,
});

const generatePredictedQuestionsFlow = ai.defineFlow(
  {
    name: 'generatePredictedQuestionsFlow',
    inputSchema: GeneratePredictedQuestionsInputSchema,
    outputSchema: GeneratePredictedQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
