"""
Multi-LLM Provider Support
Manages both Gemini and Ollama providers simultaneously
Allows users to choose which model to use
"""
import logging
from typing import Optional, Dict, Any
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)


class GeminiProvider:
    """Google Gemini LLM Provider"""
    
    def __init__(self):
        self.name = "gemini"
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.available = True
            logger.info("Gemini provider initialized")
        else:
            self.available = False
            logger.warning("Gemini provider not available - GEMINI_API_KEY not set")
    
    def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
    ) -> str:
        """Generate text using Gemini API"""
        if not self.available:
            raise ValueError("Gemini provider not available - API key not configured")
        
        model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            system_instruction=system_prompt,
        )

        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=max_tokens or settings.LLM_MAX_TOKENS,
                temperature=temperature if temperature is not None else settings.LLM_TEMPERATURE,
            ),
        )

        if hasattr(response, "text") and response.text:
            return response.text.strip()

        finish_reason = "unknown"
        if getattr(response, "candidates", None):
            candidate = response.candidates[0]
            finish_reason = str(getattr(candidate, "finish_reason", "unknown"))

        prompt_feedback = str(getattr(response, "prompt_feedback", "none"))
        raise ValueError(
            f"Gemini returned empty response (finish_reason={finish_reason}, prompt_feedback={prompt_feedback})"
        )


class OllamaProvider:
    """Ollama Local LLM Provider"""
    
    def __init__(self):
        self.name = "ollama"
        try:
            import ollama
            self.client = ollama.Client(host=settings.OLLAMA_BASE_URL)
            # Test connection
            self.client.list()
            self.available = True
            logger.info(f"Ollama provider initialized at {settings.OLLAMA_BASE_URL}")
        except Exception as e:
            self.available = False
            logger.warning(f"Ollama provider not available: {str(e)}")
    
    def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
    ) -> str:
        """Generate text using Ollama"""
        if not self.available:
            raise ValueError(
                f"Ollama provider not available at {settings.OLLAMA_BASE_URL}. "
                "Make sure Ollama is running: ollama serve"
            )
        
        # Build full prompt with system message
        full_prompt = prompt
        if system_prompt:
            full_prompt = f"{system_prompt}\n\n{prompt}"
        
        try:
            response = self.client.generate(
                model=settings.OLLAMA_MODEL,
                prompt=full_prompt,
                stream=False,
                options={
                    "temperature": temperature if temperature is not None else settings.LLM_TEMPERATURE,
                    "num_predict": max_tokens or settings.LLM_MAX_TOKENS,
                }
            )
            
            if response and "response" in response:
                text = response["response"].strip()
                if text:
                    return text
                raise ValueError("Ollama returned empty response")
            
            raise ValueError(f"Unexpected Ollama response format: {response}")
            
        except Exception as e:
            logger.error(f"Ollama error: {str(e)}")
            raise


class LLMProviderManager:
    """Manager for both LLM providers - allows users to choose which to use"""
    
    def __init__(self):
        self.gemini = GeminiProvider()
        self.ollama = OllamaProvider()
        self.providers = {
            "gemini": self.gemini,
            "ollama": self.ollama,
        }
    
    def get_provider(self, provider_name: Optional[str] = None):
        """
        Get a provider by name
        
        Args:
            provider_name: "gemini" or "ollama". If None, returns Gemini (default)
            
        Returns:
            Provider instance
            
        Raises:
            ValueError if provider not found or not available
        """
        if provider_name is None:
            provider_name = "gemini"
        
        provider_name = provider_name.lower()
        
        if provider_name not in self.providers:
            available = [name for name, p in self.providers.items() if p.available]
            raise ValueError(
                f"Unknown provider '{provider_name}'. "
                f"Available: {', '.join(available) if available else 'None'}"
            )
        
        provider = self.providers[provider_name]
        if not provider.available:
            raise ValueError(f"{provider_name} provider is not available")
        
        return provider
    
    def list_available_providers(self) -> Dict[str, bool]:
        """List all providers and their availability status"""
        return {name: provider.available for name, provider in self.providers.items()}
    
    def is_available(self, provider_name: str) -> bool:
        """Check if a provider is available"""
        provider_name = provider_name.lower()
        if provider_name not in self.providers:
            return False
        return self.providers[provider_name].available


# Global provider manager instance
provider_manager = LLMProviderManager()
