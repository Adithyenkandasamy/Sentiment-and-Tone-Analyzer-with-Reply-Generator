'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Send, Sparkles, Copy, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  analysis?: AnalysisResult;
}

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

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAnalyzing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsAnalyzing(true);

    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const analysis: AnalysisResult = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        analysis,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'text-green-600 dark:text-green-400';
      case 'negative':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😔';
      default:
        return '😐';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Sentiment Analyzer</h1>
              <p className="text-xs text-muted-foreground">
                AI-powered tone & sentiment analysis
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">
                Welcome to Sentiment Analyzer
              </h2>
              <p className="text-muted-foreground max-w-md">
                Enter a customer message below to analyze its sentiment, detect
                tone, and get professional response suggestions.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.type === 'user' ? (
                  <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl px-4 py-3 shadow-sm">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                ) : (
                  <div className="max-w-[90%] space-y-4">
                    {message.analysis && (
                      <Card className="p-5 space-y-4 shadow-sm border-0 bg-card/50">
                        {/* Sentiment Header */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-3xl">
                            {getSentimentEmoji(message.analysis.sentiment)}
                          </span>
                          <span
                            className={cn(
                              'text-lg font-semibold',
                              getSentimentColor(message.analysis.sentiment)
                            )}
                          >
                            {message.analysis.sentiment}
                          </span>
                          <div className="flex gap-1.5 ml-2">
                            {message.analysis.tone.map((tone) => (
                              <Badge
                                key={tone}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tone}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Confidence */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <span>🎯</span> Confidence
                            </span>
                            <span className="font-semibold">
                              {Math.round(message.analysis.confidence)}%
                            </span>
                          </div>
                          <Progress
                            value={message.analysis.confidence}
                            className="h-1.5"
                          />
                        </div>

                        {/* Triggers */}
                        {message.analysis.triggers.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-sm font-medium">
                              <AlertCircle className="w-4 h-4 text-yellow-600" />
                              <span>Key Observations</span>
                            </div>
                            <ul className="space-y-1.5 ml-5">
                              {message.analysis.triggers.map((trigger, idx) => (
                                <li
                                  key={idx}
                                  className="text-sm text-muted-foreground flex items-start gap-2"
                                >
                                  <span className="text-yellow-600 mt-0.5">
                                    •
                                  </span>
                                  <span>{trigger}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Suggested Reply */}
                        <div className="space-y-2 pt-2 border-t border-border/50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium flex items-center gap-1.5">
                              <span>✨</span> Suggested Reply
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleCopy(
                                  message.analysis?.reply || '',
                                  message.id
                                )
                              }
                              className="h-7 text-xs gap-1.5"
                            >
                              {copiedId === message.id ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                          <p className="text-sm leading-relaxed bg-muted/50 rounded-lg p-3">
                            {message.analysis.reply}
                          </p>
                        </div>

                        {/* Sentiment Scores */}
                        <div className="grid grid-cols-4 gap-2 pt-2">
                          {[
                            {
                              label: 'Positive',
                              value: message.analysis.realtime_score.positive,
                              color: 'text-green-600',
                            },
                            {
                              label: 'Neutral',
                              value: message.analysis.realtime_score.neutral,
                              color: 'text-gray-600',
                            },
                            {
                              label: 'Negative',
                              value: message.analysis.realtime_score.negative,
                              color: 'text-red-600',
                            },
                            {
                              label: 'Score',
                              value: message.analysis.realtime_score.compound,
                              color: 'text-blue-600',
                            },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className="text-center space-y-1"
                            >
                              <div
                                className={cn(
                                  'text-base font-bold',
                                  item.color
                                )}
                              >
                                {item.label === 'Score'
                                  ? item.value.toFixed(2)
                                  : Math.round(item.value * 100) + '%'}
                              </div>
                              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                                {item.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            ))
          )}

          {isAnalyzing && (
            <div className="flex justify-start">
              <Card className="p-5 max-w-[90%]">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Analyzing message...
                  </span>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter customer message to analyze..."
              className="min-h-[56px] max-h-32 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="lg"
              disabled={!input.trim() || isAnalyzing}
              className="px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
