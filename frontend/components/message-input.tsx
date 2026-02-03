'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RotateCcw, Send } from 'lucide-react';

interface MessageInputProps {
  onAnalyze: (message: string) => Promise<void>;
  isLoading: boolean;
}

const SAMPLE_MESSAGES = [
  {
    value: 'angry',
    label: 'Angry Customer',
    text: 'This is absolutely ridiculous! I have been waiting for 3 hours and nobody seems to care about my issue. Your customer service is the worst I have ever experienced!',
  },
  {
    value: 'confused',
    label: 'Confused Customer',
    text: 'I am not really sure what happened but my order seems to be missing. Could you help me understand where it went? I am confused about the tracking.',
  },
  {
    value: 'positive',
    label: 'Positive Customer',
    text: 'Amazing service! You folks really went above and beyond to help me. I am very impressed with the quality and the support team. Will definitely be recommending you to my friends!',
  },
];

export function MessageInput({
  onAnalyze,
  isLoading,
}: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleAnalyze = async () => {
    if (message.trim()) {
      await onAnalyze(message);
    }
  };

  const handleLoadSample = (sample: string) => {
    const selected = SAMPLE_MESSAGES.find((s) => s.value === sample);
    if (selected) {
      setMessage(selected.text);
    }
  };

  const handleClear = () => {
    setMessage('');
  };

  const charCount = message.length;
  const maxChars = 5000;
  const isOverLimit = charCount > maxChars;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Enter Customer Message
          </label>
          <Select onValueChange={handleLoadSample}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Load sample message" />
            </SelectTrigger>
            <SelectContent>
              {SAMPLE_MESSAGES.map((sample) => (
                <SelectItem key={sample.value} value={sample.value}>
                  {sample.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter customer message..."
          className="min-h-48 resize-none"
          maxLength={maxChars}
        />

        <div className="flex items-center justify-between text-xs">
          <span className={isOverLimit ? 'text-destructive' : 'text-muted-foreground'}>
            {charCount.toLocaleString()} / {maxChars.toLocaleString()} characters
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleAnalyze}
          disabled={!message.trim() || isLoading || isOverLimit}
          size="lg"
          className="flex-1"
        >
          <Send className="h-4 w-4" />
          {isLoading ? 'Analyzing...' : 'Analyze Message'}
        </Button>
        <Button
          onClick={handleClear}
          variant="outline"
          size="lg"
          disabled={!message || isLoading}
        >
          <RotateCcw className="h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}
