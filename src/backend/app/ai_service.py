"""
AI Service Module — Centralized AI API calls.
Primary: OpenAI (newapi.ccfilm.online)
"""

import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

OPENAI_BASE_URL = "https://newapi.ccfilm.online/v1/chat/completions"


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


def call_ai_chat(
    messages: list,
    model: str = "gpt-4o-mini",
    temperature: float = 0.7,
    max_tokens: int = None,
    response_format: dict = None,
    timeout: int = 90,
) -> str:
    """
    Call AI using OpenAI.
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
            raise Exception("OpenAI service failed: " + str(e))

    raise Exception("No AI API keys configured (OPENAI_API_KEY is missing).")


def call_ai_chat_stream(
    messages: list,
    model: str = "gpt-4o",
    temperature: float = 0.7,
    timeout: int = 90,
):
    """
    Generator that yields text chunks using OpenAI streaming.
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
            yield f"\n\n**Error: OpenAI streaming failed.** {str(e)}"
            return

    else:
        yield "\n\n**Error: No AI API keys configured (OPENAI_API_KEY is missing).**"
