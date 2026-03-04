# SpeakCV Backend Application

## Overview

Backend API for **SpeakCV** AI Interview & CV Platform built with FastAPI. Provides RESTful APIs for user management, AI-powered HR interview generation, and daily token management.

## Architecture

```text
src/backend/
├── routers/              # API endpoints (auth, chat, users, subscriptions)
├── models/               # Database models (MySQL mapping)
├── schemas/              # Pydantic validation schemas
├── core/                 # Configuration management & security
└── main.py               # Main application entry point
```

## Key Features

- **Authentication** - JWT-based auth with secure password hashing.
- **AI Interviewer** - Real-time conversational AI integration using OpenAI/Groq APIs.
- **Token Management** - Optimized daily token reset system using Lazy Evaluation.
- **Mock Checkout** - API endpoints to handle virtual subscription upgrades (Free to Pro).

## Tech Stack

- **FastAPI + Uvicorn** - High-performance async web framework.
- **MySQL** - Relational database for structured data storage.
- **OpenAI / Groq API** - Large Language Models (LLM) for the HR Interviewer logic.
- **JWT** - Secure stateless authentication.
- **Pydantic** - Data validation and settings management.

## Development

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Setup environment variables (Create .env file)
# Example: DATABASE_URL, OPENAI_API_KEY, GROQ_API_KEY

# 3. Run server (auto-reload at http://127.0.0.1:8000)
uvicorn main:app --reload
```

Interactive API docs (Swagger UI) available at: [http://localhost:8000/docs](http://localhost:8000/docs)

## License

MIT License - Copyright (C) 2026 SpeakCV Team.

Developed by SpeakCV Team | GitHub
