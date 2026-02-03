import os
from typing import Optional
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class LLMClient:
    """
    Client for interacting with Groq/HuggingFace LLM APIs
    """
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")
        
        self.client = Groq(api_key=self.api_key)
        self.model = os.getenv("GROQ_MODEL", "mixtral-8x7b-32768")
        self.temperature = float(os.getenv("GROQ_TEMPERATURE", "0.3"))
        self.max_tokens = int(os.getenv("GROQ_MAX_TOKENS", "1024"))
    
    async def get_completion(
        self,
        prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ) -> str:
        """
        Get completion from Groq LLM
        
        Args:
            prompt: The prompt to send to the LLM
            temperature: Sampling temperature (overrides default)
            max_tokens: Maximum tokens in response (overrides default)
            
        Returns:
            The LLM's response text
        """
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert sentiment and tone analyzer. Provide accurate, concise analysis."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=temperature or self.temperature,
                max_tokens=max_tokens or self.max_tokens,
            )
            
            return chat_completion.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Error getting LLM completion: {e}")
            raise Exception(f"LLM API error: {str(e)}")
    
    async def get_streaming_completion(self, prompt: str):
        """
        Get streaming completion from Groq LLM (for future use)
        
        Args:
            prompt: The prompt to send to the LLM
            
        Yields:
            Text chunks as they are generated
        """
        try:
            stream = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert sentiment and tone analyzer. Provide accurate, concise analysis."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                stream=True,
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            print(f"Error in streaming completion: {e}")
            raise Exception(f"LLM streaming error: {str(e)}")
