"""Optional pass-through to a real LLM (Anthropic or OpenAI).

Veridian's AI features work fully offline out of the box using the rule-based
statistical engine in insight_engine.py / nlu_chat.py. If LLM_PROVIDER and
LLM_API_KEY are set in the environment, responses are additionally polished
by a real language model. Any failure (missing key, network error, bad
response) silently falls back to the offline engine — the AI features never
hard-fail because a third-party API is unavailable.
"""
import requests

from app.core.config import settings


def is_configured() -> bool:
    return bool(settings.llm_provider and settings.llm_api_key)


def generate_llm_text(prompt: str, max_tokens: int = 500) -> str | None:
    if not is_configured():
        return None
    try:
        if settings.llm_provider == "anthropic":
            return _call_anthropic(prompt, max_tokens)
        if settings.llm_provider == "openai":
            return _call_openai(prompt, max_tokens)
    except Exception:  # noqa: BLE001 - network/LLM failures must never break the app
        return None
    return None


def _call_anthropic(prompt: str, max_tokens: int) -> str | None:
    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": settings.llm_api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": "claude-sonnet-5",
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=20,
    )
    if response.status_code != 200:
        return None
    data = response.json()
    blocks = data.get("content", [])
    text = "".join(b.get("text", "") for b in blocks if b.get("type") == "text")
    return text or None


def _call_openai(prompt: str, max_tokens: int) -> str | None:
    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {settings.llm_api_key}", "content-type": "application/json"},
        json={
            "model": "gpt-4o-mini",
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=20,
    )
    if response.status_code != 200:
        return None
    data = response.json()
    choices = data.get("choices", [])
    if not choices:
        return None
    return choices[0].get("message", {}).get("content") or None
