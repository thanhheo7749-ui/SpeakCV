"""
AI Service Module — Centralized AI API calls with Gemini fallback.
Primary: OpenAI (newapi.ccfilm.online)
Fallback: Google Gemini (generativelanguage.googleapis.com)
"""

import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

OPENAI_BASE_URL = "https://newapi.ccfilm.online/v1/chat/completions"

# Map OpenAI model names to Gemini equivalents
GEMINI_MODEL_MAP = {
    "gpt-4o-mini": "gemini-2.0-flash",
    "gpt-4o": "gemini-2.0-flash",
}


def _openai_to_gemini_messages(messages: list) -> list:
    """Convert OpenAI message format to Gemini contents format."""
    contents = []
    system_instruction = None

    for msg in messages:
        role = msg.get("role", "user")
        text = msg.get("content", "")

        if role == "system":
            system_instruction = text
            continue

        gemini_role = "model" if role == "assistant" else "user"
        contents.append({
            "role": gemini_role,
            "parts": [{"text": text}]
        })

    return contents, system_instruction


def _call_openai(messages, model, temperature, max_tokens, response_format=None, timeout=90):
    """Call the primary OpenAI-compatible API."""
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
    }
    if max_tokens:
        data["max_tokens"] = max_tokens
    if response_format:
        data["response_format"] = response_format

    res = requests.post(OPENAI_BASE_URL, headers=headers, json=data, timeout=timeout)

    if res.status_code == 200:
        return res.json()["choices"][0]["message"]["content"]
    else:
        raise Exception(f"OpenAI API error (status {res.status_code}): {res.text[:200]}")


def _call_gemini(messages, model, temperature, max_tokens, timeout=90):
    """Call Google Gemini API as fallback."""
    gemini_model = GEMINI_MODEL_MAP.get(model, "gemini-2.0-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:generateContent?key={GEMINI_API_KEY}"

    contents, system_instruction = _openai_to_gemini_messages(messages)

    body = {
        "contents": contents,
        "generationConfig": {
            "temperature": temperature,
        }
    }
    if max_tokens:
        body["generationConfig"]["maxOutputTokens"] = max_tokens
    if system_instruction:
        body["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }

    res = requests.post(url, json=body, timeout=timeout)

    if res.status_code == 200:
        data = res.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    else:
        raise Exception(f"Gemini API error (status {res.status_code}): {res.text[:200]}")


def call_ai_chat(
    messages: list,
    model: str = "gpt-4o-mini",
    temperature: float = 0.7,
    max_tokens: int = None,
    response_format: dict = None,
    timeout: int = 90,
) -> str:
    """
    Call AI with automatic fallback: OpenAI -> Gemini.
    Returns the AI response text.
    """
    # --- Try OpenAI first ---
    if OPENAI_API_KEY:
        try:
            print(f"🔄 Trying OpenAI ({model})...")
            result = _call_openai(messages, model, temperature, max_tokens, response_format, timeout)
            print(f"✅ OpenAI responded successfully.")
            return result
        except Exception as e:
            print(f"⚠️ OpenAI failed: {e}")

    # --- Fallback to Gemini ---
    if GEMINI_API_KEY:
        try:
            print(f"🔄 Falling back to Gemini...")
            result = _call_gemini(messages, model, temperature, max_tokens, timeout)
            print(f"✅ Gemini responded successfully.")
            return result
        except Exception as e:
            print(f"❌ Gemini also failed: {e}")
            raise

    raise Exception("No AI API keys configured (both OPENAI_API_KEY and GEMINI_API_KEY are missing).")


def call_ai_chat_stream(
    messages: list,
    model: str = "gpt-4o",
    temperature: float = 0.7,
    timeout: int = 90,
):
    """
    Generator that yields text chunks. Tries OpenAI streaming first, falls back to Gemini.
    """
    # --- Try OpenAI streaming ---
    if OPENAI_API_KEY:
        try:
            print(f"🔄 Trying OpenAI streaming ({model})...")
            headers = {
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            data = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "stream": True,
            }

            res = requests.post(OPENAI_BASE_URL, headers=headers, json=data, stream=True, timeout=timeout)

            if res.status_code == 200:
                print(f"✅ OpenAI streaming started.")
                for line in res.iter_lines():
                    if line:
                        line_text = line.decode("utf-8")
                        if line_text.startswith("data: ") and line_text != "data: [DONE]":
                            try:
                                chunk_data = json.loads(line_text[6:].strip())
                                choices = chunk_data.get("choices", [])
                                if choices and len(choices) > 0:
                                    delta = choices[0].get("delta", {}).get("content", "")
                                    if delta:
                                        yield delta
                            except json.JSONDecodeError:
                                continue
                return  # Success, don't fallback
            else:
                print(f"⚠️ OpenAI streaming error (status {res.status_code})")
        except Exception as e:
            print(f"⚠️ OpenAI streaming failed: {e}")

    # --- Fallback to Gemini (non-streaming, yield full result) ---
    if GEMINI_API_KEY:
        try:
            print(f"🔄 Falling back to Gemini (non-streaming)...")
            result = _call_gemini(messages, model, temperature, max_tokens=None, timeout=timeout)
            print(f"✅ Gemini responded successfully (fallback).")
            # Yield the entire result in small chunks to simulate streaming
            chunk_size = 20
            for i in range(0, len(result), chunk_size):
                yield result[i:i + chunk_size]
            return
        except Exception as e:
            print(f"❌ Gemini fallback also failed: {e}")
            yield f"\n\n**Error: Both AI services failed.** {str(e)}"
    else:
        yield "\n\n**Error: No AI API keys configured.**"
