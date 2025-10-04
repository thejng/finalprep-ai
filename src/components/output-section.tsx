'use client';
import { AlertCircle, Lightbulb, PieChart } from 'lucide-react';
import type { AnalysisResult } from '@/lib/types';
import { PredictedQuestions } from './predicted-questions';
import { SyllabusSummary } from './syllabus-summary';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TopicDistributionChart } from './topic-distribution-chart';

interface OutputSectionProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
}

const LoadingState = () => (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(10)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 sm:h-7 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 sm:h-4 w-full" />
              <Skeleton className="h-3 sm:h-4 w-5/6 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

const InitialState = () => (
  <div className="text-center py-12 sm:py-16 border-2 border-dashed rounded-lg">
    <Lightbulb className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
    <h3 className="mt-4 text-base sm:text-lg font-medium text-muted-foreground">Awaiting Analysis</h3>
    <p className="mt-1 text-xs sm:text-sm text-muted-foreground px-4">Your predicted questions and analysis will appear here.</p>
  </div>
);

export function OutputSection({ result, isLoading, error }: OutputSectionProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Analysis Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!result) {
    return <InitialState />;
  }

  return (
    <div className="space-y-8">
      <SyllabusSummary summary={result.syllabusSummary} />
      
      <PredictedQuestions questions={result.predictedQuestions} />

      {result.topicDistribution && result.topicDistribution.length > 0 && (
        <Card id="trends">
            <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-lg sm:text-xl">
                <PieChart className="text-primary w-5 h-5 sm:w-6 sm:h-6" /> Topic Distribution
            </CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
                <TopicDistributionChart data={result.topicDistribution} />
            </CardContent>
        </Card>
      )}
    </div>
  );
}
