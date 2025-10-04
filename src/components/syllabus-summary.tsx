'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookCopy } from 'lucide-react';

interface SyllabusSummaryProps {
  summary: string;
}

export function SyllabusSummary({ summary }: SyllabusSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-lg sm:text-xl">
          <BookCopy className="text-primary w-5 h-5 sm:w-6 sm:h-6" /> Syllabus Core Concepts
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
            This summary of the syllabus was used as a topic guide for generating questions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{summary}</p>
      </CardContent>
    </Card>
  );
}
