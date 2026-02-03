from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from openai import OpenAI
import os
import json
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()  # This loads the .env file

app = FastAPI(title="Sentiment Analyzer with GitHub Models")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize
vader = SentimentIntensityAnalyzer()
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")  # ✅ FIXED: Use os.getenv, not load_dotenv

# GitHub Models client
client = OpenAI(
    base_url="https://models.inference.ai.azure.com/chat/completions",
    api_key=GITHUB_TOKEN,
)

class MessageRequest(BaseModel):
    message: str

class SentimentResponse(BaseModel):
    sentiment: str
    tone: List[str]
    confidence: int
    triggers: List[str]
    reply: str
    realtime_score: Dict[str, float]

def get_vader_sentiment(text: str) -> Dict:
    """Real-time sentiment using VADER"""
    scores = vader.polarity_scores(text)
    compound = scores['compound']
    
    if compound >= 0.05:
        sentiment = "Positive"
    elif compound <= -0.05:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"
    
    confidence = int(min(abs(compound) * 100, 100))
    
    return {
        "sentiment": sentiment,
        "confidence": max(confidence, 50),
        "scores": scores
    }

def analyze_with_github_model(message: str) -> Dict:
    """Detailed analysis using GitHub Models (OpenAI SDK)"""
    
    if not GITHUB_TOKEN:
        raise HTTPException(status_code=500, detail="GITHUB_TOKEN not set")
    
    try:
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": """You are a customer service expert. Analyze messages and respond ONLY with valid JSON.
No markdown, no code blocks, just raw JSON."""
                },
                {
                    "role": "user",
                    "content": f"""Analyze this customer message and respond with this exact JSON structure:
{{
  "tone": ["primary_tone", "secondary_tone"],
  "triggers": ["specific conflict trigger 1", "specific conflict trigger 2"],
  "reply": "a calm, empathetic, professional response (under 100 words)"
}}

Guidelines:
- Tone examples: Angry, Frustrated, Confused, Polite, Demanding, Appreciative, Neutral
- Triggers must be specific to THIS message (e.g., "Uses urgent language 'immediately'")
- Reply must: acknowledge concern, show empathy, offer solution, maintain professional tone
- Do NOT repeat aggressive phrases from the original message
- Keep reply concise and actionable

Customer Message: "{message}"

Respond with JSON only:"""
                }
            ],
            model="gpt-4o-mini",
            temperature=0.3,
            max_tokens=500
        )
        
        content = response.choices[0].message.content.strip()
        
        # Clean potential markdown artifacts
        content = content.replace("```json", "").replace("```", "").strip()
        
        # Parse JSON
        analysis = json.loads(content)
        
        # Validate structure
        if not all(key in analysis for key in ["tone", "triggers", "reply"]):
            raise ValueError("Invalid response structure")
        
        return analysis
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON from model: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/analyze", response_model=SentimentResponse)
async def analyze_message(request: MessageRequest):
    message = request.message.strip()
    
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    if len(message) > 5000:
        raise HTTPException(status_code=400, detail="Message too long (max 5000 characters)")
    
    try:
        # 1. Get real-time sentiment (VADER - instant)
        vader_result = get_vader_sentiment(message)
        
        # 2. Get detailed analysis (GitHub Models)
        llm_analysis = analyze_with_github_model(message)
        
        # 3. Combine results
        return SentimentResponse(
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
    
    except HTTPException:
        raise
    except Exception as e:
        # Fallback if GitHub Models fail
        vader_result = get_vader_sentiment(message)
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

@app.get("/")
async def root():
    return {
        "status": "API Running",
        "model": "GitHub Models (gpt-4o-mini)",
        "sentiment_engine": "VADER",
        "token_configured": bool(GITHUB_TOKEN)
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "github_token": "configured" if GITHUB_TOKEN else "missing"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)