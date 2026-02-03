'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HistoryItem {
    id: number;
    message: string;
    sentiment: string;
    confidence: number;
    tones: string[];
    triggers: string[];
    reply: string;
    realtime_score: {
        positive: number;
        neutral: number;
        negative: number;
        compound: number;
    };
    created_at: string;
}

interface HistorySidebarProps {
    onSelectMessage: (message: string) => void;
}

export function HistorySidebar({ onSelectMessage }: HistorySidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/history?limit=50');
            if (response.ok) {
                const data = await response.json();
                setHistory(data.results || []);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment.toLowerCase()) {
            case 'positive':
                return 'bg-green-500/10 text-green-600 border-green-500/20';
            case 'negative':
                return 'bg-red-500/10 text-red-600 border-red-500/20';
            default:
                return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            if (hours === 0) {
                const minutes = Math.floor(diff / (1000 * 60));
                return minutes === 0 ? 'Just now' : `${minutes}m ago`;
            }
            return `${hours}h ago`;
        }
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <>
            {/* Toggle Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-20 right-4 z-20 gap-2"
            >
                <History className="w-4 h-4" />
                History
            </Button>

            {/* Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    'fixed top-0 right-0 h-full w-96 bg-card border-l border-border z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto',
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        <h2 className="font-semibold text-lg">Analysis History</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                        className="h-8 w-8 p-0"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="p-4 space-y-3">
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                            Loading history...
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No history yet</p>
                            <p className="text-xs mt-1">Analyzed messages will appear here</p>
                        </div>
                    ) : (
                        history.map((item) => (
                            <Card
                                key={item.id}
                                className="p-3 hover:bg-accent/50 cursor-pointer transition-colors group"
                                onClick={() => {
                                    onSelectMessage(item.message);
                                    setIsOpen(false);
                                }}
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-lg">
                                            {getSentimentEmoji(item.sentiment)}
                                        </span>
                                        <Badge
                                            className={cn(
                                                'text-xs',
                                                getSentimentColor(item.sentiment)
                                            )}
                                        >
                                            {item.sentiment}
                                        </Badge>
                                    </div>
                                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                <p className="text-sm line-clamp-2 mb-2">
                                    {item.message}
                                </p>

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{item.confidence}% confidence</span>
                                    <span>{formatDate(item.created_at)}</span>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
