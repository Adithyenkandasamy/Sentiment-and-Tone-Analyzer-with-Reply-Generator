"""
Sentiment & Tone Analyzer with GitHub Models

A FastAPI application that provides sentiment analysis using VADER
and advanced tone detection using GitHub Models (GPT-4o-mini).
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from database.config import init_db
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize database
init_db()

# Create FastAPI app
app = FastAPI(
    title="Sentiment Analyzer with GitHub Models",
    description="AI-powered sentiment and tone analysis for customer messages",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)