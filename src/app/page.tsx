'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { InputSection } from '@/components/input-section';
import { OutputSection } from '@/components/output-section';
import { analyzeDocuments } from '@/app/actions';
import type { AnalysisResult } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalysis = async (syllabusText: string, papersText: string) => {
    if (!syllabusText || !papersText) {
      toast({
        variant: 'destructive',
        title: 'Missing Content',
        description: 'Please provide both syllabus and past papers content.',
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeDocuments({ syllabusText, papersText });
      if (result && result.predictedQuestions.questions) {
        setAnalysisResult(result);
      } else {
        throw new Error('Analysis returned no result or no questions.');
      }
    } catch (e: any) {
      console.error(e);
      const errorMessage = e.message || 'An unexpected error occurred during analysis.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 sm:gap-8">
        <InputSection onAnalyze={handleAnalysis} isLoading={isLoading} />
        <OutputSection result={analysisResult} isLoading={isLoading} error={error} />
      </div>
    </MainLayout>
  );
}
