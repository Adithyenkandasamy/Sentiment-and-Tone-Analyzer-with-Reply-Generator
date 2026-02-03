'use client';

import { Card } from '@/components/ui/card';

interface SentimentBreakdownProps {
  realtime_score: {
    positive: number;
    neutral: number;
    negative: number;
    compound: number;
  };
}

export function SentimentBreakdown({
  realtime_score,
}: SentimentBreakdownProps) {
  const items = [
    {
      label: 'Positive',
      emoji: '😄',
      value: realtime_score.positive,
      bgColor: 'bg-success',
      percentage: true,
    },
    {
      label: 'Neutral',
      emoji: '😐',
      value: realtime_score.neutral,
      bgColor: 'bg-warning',
      percentage: true,
    },
    {
      label: 'Negative',
      emoji: '😞',
      value: realtime_score.negative,
      bgColor: 'bg-destructive',
      percentage: true,
    },
    {
      label: 'Compound',
      emoji: '📊',
      value: realtime_score.compound,
      bgColor: 'bg-primary',
      percentage: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <Card
          key={item.label}
          className="p-4 flex flex-col gap-3 animate-float-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce-in">{item.emoji}</span>
            <p className="text-xs font-medium text-muted-foreground">
              {item.label}
            </p>
          </div>
          <div
            className={`text-3xl font-bold ${item.bgColor} bg-clip-text text-transparent animate-pulse`}
          >
            {item.percentage
              ? `${Math.round(item.value * 100)}%`
              : item.value.toFixed(2)}
          </div>
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${item.bgColor} transition-all duration-700 rounded-full`}
              style={{
                width: item.percentage
                  ? `${Math.round(item.value * 100)}%`
                  : `${Math.min((item.value + 1) / 2 * 100, 100)}%`,
              }}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
