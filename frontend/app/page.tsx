'use client';

import { useRef, useEffect, useState } from 'react';
import { MessageInput } from '@/components/message-input';
import { ResultsDisplay } from '@/components/results-display';
import { SentimentBreakdown } from '@/components/sentiment-breakdown';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  sentiment: string;
  tone: string[];
  confidence: number;
  triggers: string[];
  reply: string;
  realtime_score: {
    positive: number;
    neutral: number;
    negative: number;
    compound: number;
  };
}

export default function Dashboard() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleAnalyze = async (message: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 'Failed to analyze message'
        );
      }

      const data = await response.json();
      setResult(data);

      // Smooth scroll to results after a short delay
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('[Dashboard] Error:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to analyze message. Make sure the FastAPI backend is running.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-pretty flex items-center gap-3">
            <span className="animate-spin-emoji text-5xl">🤖</span>
            AI Sentiment & Tone Analyzer
          </h1>
          <p className="mt-4 text-muted-foreground text-pretty flex items-start gap-2">
            <span className="text-2xl mt-1 animate-bounce">✨</span>
            <span>
              Analyze customer service messages to understand sentiment, identify
              potential conflicts, and get professional response suggestions
            </span>
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Input Section */}
        <section>
          <MessageInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        </section>

        {/* Results Section */}
        {(result || isLoading) && (
          <section ref={resultsRef} className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="animate-pulse-emoji text-3xl">📊</span>
                Analysis Results
              </h2>
              <ResultsDisplay result={result} isLoading={isLoading} />
            </div>

            {result && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="animate-bounce text-3xl">📈</span>
                  Sentiment Breakdown
                </h2>
                <SentimentBreakdown
                  realtime_score={result.realtime_score}
                />
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
