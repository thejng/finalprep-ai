'use client';
import type { GeneratePredictedQuestionsOutput } from '@/ai/flows/generate-predicted-questions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PredictedQuestionsProps {
  questions: GeneratePredictedQuestionsOutput;
}

const difficultyColorMap: Record<string, string> = {
    Easy: 'border-green-500/50 text-green-500',
    Medium: 'border-yellow-500/50 text-yellow-500',
    Hard: 'border-red-500/50 text-red-500',
  };

const QuestionCard = ({
  question,
  difficulty,
  topic,
}: {
  question: string;
  difficulty: string;
  topic: string;
}) => (
  <Card className={`flex flex-col border-l-4 ${difficultyColorMap[difficulty]}`}>
    <CardHeader className="pb-3">
      <CardTitle className="font-headline flex items-center justify-between text-base sm:text-lg">
        <span className="truncate flex-1 mr-2">{topic}</span>
        <Badge variant="outline" className={`${difficultyColorMap[difficulty]} text-xs shrink-0`}>
          {difficulty}
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent className="flex-grow pt-0">
      <p className="font-code text-sm sm:text-base leading-relaxed">{question}</p>
    </CardContent>
  </Card>
);

export function PredictedQuestions({ questions }: PredictedQuestionsProps) {
  if (!questions || !questions.questions) return null;
  return (
    <div id="predictions" className="space-y-4">
      <h2 className="font-headline text-xl sm:text-2xl font-bold flex items-center gap-2">
        <BrainCircuit className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
        AI Predicted Questions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {questions.questions.map((q, i) => (
          <QuestionCard
            key={i}
            question={q.question}
            difficulty={q.difficulty}
            topic={q.topic}
          />
        ))}
      </div>
    </div>
  );
}
