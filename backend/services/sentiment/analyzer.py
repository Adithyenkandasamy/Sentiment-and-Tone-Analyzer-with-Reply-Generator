"""
VADER Sentiment Analysis Service

Provides real-time sentiment scoring using VADER (Valence Aware Dictionary
and sEntiment Reasoner), optimized for social media and customer service text.
"""

from typing import Dict
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


class SentimentAnalyzer:
    """VADER-based sentiment analyzer for real-time predictions"""
    
    def __init__(self):
        """Initialize VADER sentiment analyzer"""
        self.vader = SentimentIntensityAnalyzer()
    
    def analyze(self, text: str) -> Dict:
        """
        Analyze sentiment of text using VADER
        
        Args:
            text: Text to analyze
            
        Returns:
            Dict with sentiment, confidence, and detailed scores
        """
        scores = self.vader.polarity_scores(text)
        compound = scores['compound']
        
        # Determine sentiment based on compound score
        if compound >= 0.05:
            sentiment = "Positive"
        elif compound <= -0.05:
            sentiment = "Negative"
        else:
            sentiment = "Neutral"
        
        # Calculate confidence (0-100%)
        confidence = int(min(abs(compound) * 100, 100))
        
        return {
            "sentiment": sentiment,
            "confidence": max(confidence, 50),  # Minimum 50% confidence
            "scores": scores
        }
