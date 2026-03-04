# 🎤 SpeakCV - AI Interview & CV Platform

SpeakCV is an intelligent SaaS platform that leverages AI to help candidates build professional CVs and practice 1-on-1 interviews with a virtual HR Manager.

## 🌟 Key Features

- **AI Interviewer:** Real-time interactive interviews via voice and text.
- **Token & Subscription System:** Tiered plans (Free/Pro) with daily token reset mechanics and a simulated payment flow (Mock Checkout).
- **CV & Profile Management:** Store, track, and analyze candidate performance.

## 🛠️ Tech Stack

- **Frontend:** Next.js, Tailwind CSS
- **Backend:** Python (FastAPI)
- **Database:** MySQL
- **Infrastructure:** Docker, Docker Compose, Nginx (HTTPS)

## 🚀 Quick Start

The project is fully containerized. You can run the entire stack with a single command:

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd speakcv

# 2. Start all services (Frontend, Backend, Database)
docker compose up -d
```

The application will be available at: `http://localhost:3000`

## 📚 Project Documentation

- [Backend README](./src/backend/README.md)
- [Frontend README](./src/frontend/README.md)
