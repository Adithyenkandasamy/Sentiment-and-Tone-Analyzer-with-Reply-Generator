"""
LLM Client for Ollama

Provides advanced tone detection, trigger identification, and professional
reply generation using phi3 model via Ollama (local, unlimited, free).
"""

import json
from typing import Dict
import requests
from fastapi import HTTPException


class LLMClient:
    """Ollama client for advanced text analysis"""
    
    def __init__(self):
        """Initialize Ollama client"""
        self.base_url = "http://localhost:11434"
        self.model = "phi3"
        
        # Test connection
        try:
            response = requests.get(f"{self.base_url}/api/tags")
            if response.status_code != 200:
                raise ValueError("Ollama server not accessible")
        except Exception as e:
            raise ValueError(f"Ollama connection failed: {e}")
    
    def analyze_message(self, message: str) -> Dict:
        """
        Perform detailed message analysis using Ollama
        
        Args:
            message: Customer message to analyze
            
        Returns:
            Dict with tone, triggers, and suggested reply
        """
        prompt = f"""Analyze this customer message and respond with ONLY valid JSON in this exact format:
{{
  "tone": ["primary_tone", "secondary_tone"],
  "triggers": ["trigger1", "trigger2"],
  "reply": "a calm, empathetic, professional response (under 100 words)"
}}

CRITICAL REQUIREMENTS:
- You MUST provide exactly 2 tone descriptors
- You MUST provide exactly 2 conflict triggers (even for neutral/positive messages)
- For neutral/positive messages, identify potential concerns or observations instead of conflicts

Tone examples: Angry, Frustrated, Confused, Polite, Demanding, Appreciative, Neutral, Casual, Formal, Urgent

Trigger examples:
- Negative: "Uses aggressive language", "Demands immediate action", "Expresses dissatisfaction"
- Neutral: "Seeks general information", "Standard inquiry format", "No specific concerns raised"
- Positive: "Expresses gratitude", "Provides positive feedback", "Shows satisfaction"

Reply guidelines:
- Acknowledge their message
- Show empathy and understanding
- Offer help or next steps
- Keep professional and warm tone
- Under 100 words

Customer Message: "{message}"

Respond with JSON only (no markdown, no explanation):"""

        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json"
                },
                timeout=30
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Ollama request failed")
            
            result = response.json()
            content = result.get("response", "")
            
            # Clean potential markdown artifacts
            content = content.replace("```json", "").replace("```", "").strip()
            
            # Parse JSON
            analysis = json.loads(content)
            
            # Validate and ensure exactly 2 items in each array
            if "tone" not in analysis or len(analysis["tone"]) < 2:
                analysis["tone"] = (analysis.get("tone", []) + ["Professional", "Neutral"])[:2]
            
            if "triggers" not in analysis or len(analysis["triggers"]) < 2:
                analysis["triggers"] = (analysis.get("triggers", []) + 
                                       ["Standard customer inquiry", "No specific conflict indicators"])[:2]
            
            # Ensure exactly 2 items
            analysis["tone"] = analysis["tone"][:2]
            analysis["triggers"] = analysis["triggers"][:2]
            
            if "reply" not in analysis:
                analysis["reply"] = "Thank you for your message. We're here to help."
            
            return analysis
            
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Invalid JSON from model: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"LLM analysis failed: {str(e)}")
