"""
LLM Client for GitHub Models

Provides advanced tone detection, trigger identification, and professional
reply generation using GPT-4o-mini via GitHub Models (Azure OpenAI endpoint).
"""

import json
import os
from typing import Dict
from openai import OpenAI
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()   


class LLMClient:
    """GitHub Models client for advanced text analysis"""
    
    def __init__(self):
        """Initialize GitHub Models OpenAI client"""
        self.github_token = os.getenv("GITHUB_TOKEN")
        
        if not self.github_token:
            raise ValueError("GITHUB_TOKEN environment variable not set")
        
        self.client = OpenAI(
            base_url="https://models.inference.ai.azure.com",
            api_key=self.github_token,
        )
        self.model = "gpt-4o-mini"
    
    def analyze_message(self, message: str) -> Dict:
        """
        Perform detailed message analysis using LLM
        
        Args:
            message: Customer message to analyze
            
        Returns:
            Dict with tone, triggers, and suggested reply
        """
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": """You are a customer service expert. Analyze messages and respond ONLY with valid JSON.
No markdown, no code blocks, just raw JSON. You MUST always provide exactly 2 triggers."""
                    },
                    {
                        "role": "user",
                        "content": f"""Analyze this customer message and respond with this exact JSON structure:
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

Respond with JSON only (no markdown):"""
                    }
                ],
                model=self.model,
                temperature=0.3,
                max_tokens=500
            )
            
            content = response.choices[0].message.content.strip()
            
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
