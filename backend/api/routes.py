"""
FastAPI Routes for Sentiment Analysis API
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from api.models import MessageRequest, SentimentResponse
from services.sentiment.analyzer import SentimentAnalyzer
from services.llm.client import LLMClient
from database.config import get_db
from database import crud
import os


router = APIRouter()

# Initialize services
sentiment_analyzer = SentimentAnalyzer()
llm_client = None

# Initialize LLM client if Ollama is available
try:
    llm_client = LLMClient()
except ValueError as e:
    print(f"Warning: Ollama not available. {e}")
    llm_client = None


@router.post("/api/analyze", response_model=SentimentResponse)
async def analyze_message(request: MessageRequest, db: Session = Depends(get_db)):
    """
    Analyze a customer message for sentiment, tone, and triggers
    
    Combines VADER sentiment analysis with LLM-based tone detection
    """
    message = request.message.strip()
    
    # Validation
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    if len(message) > 5000:
        raise HTTPException(status_code=400, detail="Message too long (max 5000 characters)")
    
    try:
        # 1. Get real-time sentiment using VADER
        vader_result = sentiment_analyzer.analyze(message)
        
        # 2. Get detailed analysis using LLM
        if llm_client:
            llm_analysis = llm_client.analyze_message(message)
        else:
            # Fallback if LLM not available
            llm_analysis = {
                "tone": ["Professional", "Neutral"],
                "triggers": ["LLM service unavailable", "Using fallback response"],
                "reply": "Thank you for your message. We're here to help."
            }
        
        # 3. Combine results
        response = SentimentResponse(
            sentiment=vader_result["sentiment"],
            tone=llm_analysis.get("tone", ["Professional"])[:2],
            confidence=vader_result["confidence"],
            triggers=llm_analysis.get("triggers", ["No specific triggers detected", "Standard inquiry"])[:2],
            reply=llm_analysis.get("reply", "Thank you for your message. We're here to help."),
            realtime_score={
                "positive": round(vader_result["scores"]["pos"], 2),
                "neutral": round(vader_result["scores"]["neu"], 2),
                "negative": round(vader_result["scores"]["neg"], 2),
                "compound": round(vader_result["scores"]["compound"], 2)
            }
        )
        
        # 4. Save to database
        try:
            crud.create_analysis_result(
                db=db,
                message=message,
                sentiment=response.sentiment,
                confidence=response.confidence,
                tones=response.tone,
                triggers=response.triggers,
                reply=response.reply,
                realtime_score=response.realtime_score
            )
        except Exception as db_error:
            # Log error but don't fail the request
            print(f"Database save error: {db_error}")
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        # Fallback on any error
        vader_result = sentiment_analyzer.analyze(message)
        return SentimentResponse(
            sentiment=vader_result["sentiment"],
            tone=["Professional"],
            confidence=vader_result["confidence"],
            triggers=["Analysis service temporarily unavailable", "Please retry"],
            reply="Thank you for reaching out. We value your feedback and will respond as soon as possible.",
            realtime_score={
                "positive": round(vader_result["scores"]["pos"], 2),
                "neutral": round(vader_result["scores"]["neu"], 2),
                "negative": round(vader_result["scores"]["neg"], 2),
                "compound": round(vader_result["scores"]["compound"], 2)
            }
        )


@router.get("/")
async def root():
    """API status endpoint"""
    return {
        "status": "API Running",
        "model": "Ollama (phi3)",
        "sentiment_engine": "VADER",
        "llm_available": bool(llm_client)
    }


@router.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "ollama_running": bool(llm_client),
        "llm_model": "phi3" if llm_client else None
    }


@router.get("/api/history")
async def get_history(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get analysis history with pagination"""
    results = crud.get_all_analysis_results(db, skip=skip, limit=limit)
    return {
        "count": len(results),
        "results": [result.to_dict() for result in results]
    }


@router.get("/api/history/{result_id}")
async def get_analysis_by_id(result_id: int, db: Session = Depends(get_db)):
    """Get a specific analysis result by ID"""
    result = crud.get_analysis_result(db, result_id)
    if not result:
        raise HTTPException(status_code=404, detail="Analysis result not found")
    return result.to_dict()


@router.get("/api/history/sentiment/{sentiment}")
async def get_by_sentiment(
    sentiment: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get analysis results filtered by sentiment (Positive, Negative, Neutral)"""
    results = crud.get_results_by_sentiment(db, sentiment, skip=skip, limit=limit)
    return {
        "sentiment": sentiment,
        "count": len(results),
        "results": [result.to_dict() for result in results]
    }
