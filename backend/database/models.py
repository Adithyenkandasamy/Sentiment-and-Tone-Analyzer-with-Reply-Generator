"""
SQLAlchemy Database Models

Defines the database schema for storing sentiment analysis results.
"""

from sqlalchemy import Column, Integer, String, Text, JSON, DateTime
from sqlalchemy.sql import func
from database.config import Base


class AnalysisResult(Base):
    """Model for storing sentiment analysis results"""
    
    __tablename__ = "analysis_results"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Original message
    message = Column(Text, nullable=False)
    
    # Sentiment analysis results
    sentiment = Column(String(50), nullable=False)
    confidence = Column(Integer, nullable=False)
    
    # Tone and triggers (stored as JSON)
    tones = Column(JSON, nullable=False)
    triggers = Column(JSON, nullable=False)
    
    # AI-generated reply
    reply = Column(Text, nullable=False)
    
    # Detailed VADER scores (stored as JSON)
    realtime_score = Column(JSON, nullable=False)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<AnalysisResult(id={self.id}, sentiment={self.sentiment}, created_at={self.created_at})>"
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": self.id,
            "message": self.message,
            "sentiment": self.sentiment,
            "confidence": self.confidence,
            "tones": self.tones,
            "triggers": self.triggers,
            "reply": self.reply,
            "realtime_score": self.realtime_score,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
