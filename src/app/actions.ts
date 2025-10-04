'use server';

import { generatePredictedQuestions } from '@/ai/flows/generate-predicted-questions';
import { summarizeSyllabusTopics } from '@/ai/flows/summarize-syllabus-topics';
import { parsePDF } from '@/lib/pdf-parser';
import type { AnalysisResult, TopicDistribution } from '@/lib/types';

interface AnalyzeDocumentsInput {
  syllabusText: string;
  papersText: string;
}

export async function analyzeDocuments(input: AnalyzeDocumentsInput): Promise<AnalysisResult> {
  if (!input.syllabusText || !input.papersText) {
    throw new Error('Syllabus and past papers content are required.');
  }

  const { summary } = await summarizeSyllabusTopics({
    syllabusText: input.syllabusText,
  });

  if (!summary) {
    throw new Error('Failed to summarize syllabus. Please check the content.');
  }

  const predictedQuestions = await generatePredictedQuestions({
    topic: summary,
    previousQuestions: input.papersText,
  });

  const topicCounts = predictedQuestions.questions.reduce<Record<string, number>>((acc, q) => {
    acc[q.topic] = (acc[q.topic] || 0) + 1;
    return acc;
  }, {});

  const topicDistribution: TopicDistribution[] = Object.entries(topicCounts).map(([topic, count]) => ({
    topic,
    count,
  }));

  return {
    syllabusSummary: summary,
    predictedQuestions,
    topicDistribution,
  };
}

export async function parsePDFFile(fileData: ArrayBuffer): Promise<{ text: string; pages: number }> {
  try {
    const buffer = Buffer.from(fileData);
    const result = await parsePDF(buffer);
    return {
      text: result.text,
      pages: result.pages,
    };
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
