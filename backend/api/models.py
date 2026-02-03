"""
Pydantic Models for API Request/Response Schemas
"""

from pydantic import BaseModel
from typing import List, Dict


class MessageRequest(BaseModel):
    """Request model for message analysis"""
    message: str


class SentimentResponse(BaseModel):
    """Response model for sentiment analysis results"""
    sentiment: str
    tone: List[str]
    confidence: int
    triggers: List[str]
    reply: str
    realtime_score: Dict[str, float]
