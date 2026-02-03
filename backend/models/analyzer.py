from typing import Dict, Optional
from utils.llm_client import LLMClient
import re


class SentimentAnalyzer:
    """
    Sentiment and tone analyzer using LLM for advanced analysis
    """
    
    def __init__(self):
        self.llm_client = LLMClient()
        self.sentiment_map = {
            "positive": ["happy", "excited", "grateful", "satisfied", "optimistic"],
            "negative": ["angry", "sad", "frustrated", "disappointed", "anxious"],
            "neutral": ["calm", "indifferent", "professional", "matter-of-fact"]
        }
    
    async def analyze(self, message: str, generate_reply: bool = False) -> Dict:
        """
        Analyze sentiment, tone, and optionally generate a reply
        
        Args:
            message: The text message to analyze
            generate_reply: Whether to generate a suggested reply
            
        Returns:
            Dictionary containing sentiment analysis results
        """
        # Get sentiment analysis from LLM
        analysis_prompt = self._create_analysis_prompt(message)
        analysis_result = await self.llm_client.get_completion(analysis_prompt)
        
        # Parse the analysis result
        parsed_result = self._parse_analysis(analysis_result)
        
        # Generate reply if requested
        suggested_reply = None
        if generate_reply:
            reply_prompt = self._create_reply_prompt(message, parsed_result)
            suggested_reply = await self.llm_client.get_completion(reply_prompt)
        
        return {
            "sentiment": parsed_result["sentiment"],
            "confidence": parsed_result["confidence"],
            "tone": parsed_result["tone"],
            "emotions": parsed_result["emotions"],
            "suggested_reply": suggested_reply
        }
    
    def _create_analysis_prompt(self, message: str) -> str:
        """Create prompt for sentiment and tone analysis"""
        return f"""Analyze the following message for sentiment and tone:

Message: "{message}"

Provide a detailed analysis in the following format:
- Sentiment: [positive/negative/neutral]
- Confidence: [0.0-1.0]
- Tone: [brief description of tone, e.g., "professional", "casual", "aggressive", "friendly"]
- Emotions: [list primary emotions detected: happy, sad, angry, fearful, surprised, disgusted]

Format your response EXACTLY as:
SENTIMENT: [value]
CONFIDENCE: [value]
TONE: [value]
EMOTIONS: [emotion1:0.X, emotion2:0.Y, ...]
"""
    
    def _create_reply_prompt(self, message: str, analysis: Dict) -> str:
        """Create prompt for generating an appropriate reply"""
        sentiment = analysis["sentiment"]
        tone = analysis["tone"]
        
        return f"""Given the following message with {sentiment} sentiment and {tone} tone:

Message: "{message}"

Generate a professionally appropriate, empathetic reply that:
1. Acknowledges the sender's sentiment
2. Matches or appropriately responds to their tone
3. Is concise and clear (2-3 sentences)
4. Shows understanding and professionalism

Reply:"""
    
    def _parse_analysis(self, analysis_text: str) -> Dict:
        """Parse the LLM analysis response into structured data"""
        try:
            # Extract sentiment
            sentiment_match = re.search(r'SENTIMENT:\s*(\w+)', analysis_text, re.IGNORECASE)
            sentiment = sentiment_match.group(1).lower() if sentiment_match else "neutral"
            
            # Extract confidence
            confidence_match = re.search(r'CONFIDENCE:\s*([\d.]+)', analysis_text, re.IGNORECASE)
            confidence = float(confidence_match.group(1)) if confidence_match else 0.75
            
            # Extract tone
            tone_match = re.search(r'TONE:\s*([^\n]+)', analysis_text, re.IGNORECASE)
            tone = tone_match.group(1).strip() if tone_match else "neutral"
            
            # Extract emotions
            emotions_match = re.search(r'EMOTIONS:\s*([^\n]+)', analysis_text, re.IGNORECASE)
            emotions = {}
            if emotions_match:
                emotions_str = emotions_match.group(1)
                # Parse emotion:value pairs
                for emotion_pair in emotions_str.split(','):
                    if ':' in emotion_pair:
                        emotion, value = emotion_pair.split(':')
                        emotions[emotion.strip()] = float(value.strip())
            
            # Default emotions if none found
            if not emotions:
                emotions = {"neutral": 0.5}
            
            return {
                "sentiment": sentiment,
                "confidence": min(max(confidence, 0.0), 1.0),  # Clamp between 0 and 1
                "tone": tone,
                "emotions": emotions
            }
        except Exception as e:
            # Return default values if parsing fails
            return {
                "sentiment": "neutral",
                "confidence": 0.5,
                "tone": "unclear",
                "emotions": {"neutral": 0.5}
            }
