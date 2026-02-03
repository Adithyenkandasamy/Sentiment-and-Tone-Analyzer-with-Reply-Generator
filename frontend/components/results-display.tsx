'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface ResultsDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
}

export function ResultsDisplay({ result, isLoading }: ResultsDisplayProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'bg-success text-success-foreground';
      case 'negative':
        return 'bg-destructive text-destructive-foreground';
      case 'neutral':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSentimentProgressColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'bg-success';
      case 'negative':
        return 'bg-destructive';
      case 'neutral':
        return 'bg-warning';
      default:
        return 'bg-primary';
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😔';
      case 'neutral':
        return '😐';
      default:
        return '🤔';
    }
  };

  const handleCopy = () => {
    if (result?.reply) {
      navigator.clipboard.writeText(result.reply);
      setCopied(true);
    }
  };

  if (!result && !isLoading) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Skeleton className="h-10 w-28" />
              <div className="flex gap-2 flex-wrap">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-5 w-48" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Sentiment Badge & Tone Tags */}
      <Card className="p-6 animate-slide-up">
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge
              className={cn('px-4 py-2 text-lg font-semibold flex items-center gap-2', getSentimentColor(result.sentiment))}
            >
              <span className="animate-bounce-in text-2xl">{getSentimentEmoji(result.sentiment)}</span>
              {result.sentiment}
            </Badge>
            <div className="flex gap-2 flex-wrap">
              {result.tone.map((tone, index) => (
                <Badge 
                  key={tone} 
                  variant="secondary" 
                  className="px-3 py-1 text-xs animate-float-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {tone}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Confidence Score */}
      <Card className="p-6 animate-float-up">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <span className="animate-pulse-emoji text-xl">🎯</span>
              Confidence Score
            </label>
            <span className="text-lg font-bold text-primary animate-pulse">
              {Math.round(result.confidence)}%
            </span>
          </div>
          <Progress
            value={result.confidence}
            className="h-2"
          />
        </div>
      </Card>

      {/* Conflict Triggers */}
      <Card className="p-6 animate-float-up" style={{ animationDelay: '0.1s' }}>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="animate-wiggle text-2xl">⚠️</span>
            <h3 className="font-semibold text-foreground">Potential Conflict Triggers</h3>
          </div>
          <ul className="space-y-2">
            {result.triggers.map((trigger, index) => (
              <li 
                key={index} 
                className="flex gap-3 text-sm animate-float-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className="text-xl">🚩</span>
                <span className="text-foreground">{trigger}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Suggested Reply */}
      <Card className="p-6 bg-secondary animate-float-up" style={{ animationDelay: '0.2s' }}>
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <span className="animate-spin-emoji text-2xl">✨</span>
            Suggested Professional Reply
          </h3>
          <p className="text-foreground leading-relaxed text-pretty">
            {result.reply}
          </p>
          <Button
            onClick={handleCopy}
            variant="default"
            size="sm"
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 animate-pulse-emoji" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
