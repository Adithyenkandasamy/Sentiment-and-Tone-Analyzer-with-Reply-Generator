"""
CRUD Operations for Database

Provides functions to create, read, update, and delete analysis results.
"""

from sqlalchemy.orm import Session
from database.models import AnalysisResult
from typing import List, Optional


def create_analysis_result(
    db: Session,
    message: str,
    sentiment: str,
    confidence: int,
    tones: List[str],
    triggers: List[str],
    reply: str,
    realtime_score: dict
) -> AnalysisResult:
    """
    Save a new analysis result to the database
    
    Args:
        db: Database session
        message: Original customer message
        sentiment: Detected sentiment
        confidence: Confidence score
        tones: List of detected tones
        triggers: List of detected triggers
        reply: AI-generated reply
        realtime_score: VADER scores dictionary
        
    Returns:
        Created AnalysisResult instance
    """
    db_result = AnalysisResult(
        message=message,
        sentiment=sentiment,
        confidence=confidence,
        tones=tones,
        triggers=triggers,
        reply=reply,
        realtime_score=realtime_score
    )
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return db_result


def get_analysis_result(db: Session, result_id: int) -> Optional[AnalysisResult]:
    """Get a specific analysis result by ID"""
    return db.query(AnalysisResult).filter(AnalysisResult.id == result_id).first()


def get_all_analysis_results(
    db: Session,
    skip: int = 0,
    limit: int = 100
) -> List[AnalysisResult]:
    """Get all analysis results with pagination"""
    return db.query(AnalysisResult).order_by(
        AnalysisResult.created_at.desc()
    ).offset(skip).limit(limit).all()


def get_results_by_sentiment(
    db: Session,
    sentiment: str,
    skip: int = 0,
    limit: int = 100
) -> List[AnalysisResult]:
    """Get analysis results filtered by sentiment"""
    return db.query(AnalysisResult).filter(
        AnalysisResult.sentiment == sentiment
    ).order_by(
        AnalysisResult.created_at.desc()
    ).offset(skip).limit(limit).all()


def delete_analysis_result(db: Session, result_id: int) -> bool:
    """Delete an analysis result"""
    db_result = get_analysis_result(db, result_id)
    if db_result:
        db.delete(db_result)
        db.commit()
        return True
    return False
