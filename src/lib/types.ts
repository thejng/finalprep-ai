import type { GeneratePredictedQuestionsOutput } from "@/ai/flows/generate-predicted-questions";

export interface TopicDistribution {
    topic: string;
    count: number;
}

export interface AnalysisResult {
    syllabusSummary: string;
    predictedQuestions: GeneratePredictedQuestionsOutput;
    topicDistribution: TopicDistribution[];
}
