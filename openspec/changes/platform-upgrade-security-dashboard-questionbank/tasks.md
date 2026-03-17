## 1. Security Hardening (Commit 1)

- [ ] 1.1 Create `.gitignore` at project root with standard Python/Node/env exclusions
- [ ] 1.2 Create `.env.example` with all required environment variable names and placeholder values
- [ ] 1.3 Create `.env` with actual current values (SECRET_KEY, VNPAY, OPENAI, GROQ keys)
- [ ] 1.4 Update `security.py` to load SECRET_KEY from `os.getenv()` via dotenv
- [ ] 1.5 Update `payment.py` to use `settings` from `config.py` instead of hardcoded VNPAY credentials
- [ ] 1.6 Update `config.py` to also include SECRET_KEY and JWT settings
- [ ] 1.7 Verify backend starts correctly with `.env` values

## 2. Personal Dashboard — Backend (Commit 2)

- [ ] 2.1 Create `stats.py` router with `GET /api/my-stats` endpoint
- [ ] 2.2 Aggregate data from `interview_history`: total count, avg score, best score, score trend, history list
- [ ] 2.3 Register router in `main.py`

## 3. Personal Dashboard — Frontend (Commit 2)

- [ ] 3.1 Install `recharts` package
- [ ] 3.2 Add `getMyStats()` function to `api.ts`
- [ ] 3.3 Create `/dashboard/page.tsx` with score chart, summary cards, and strengths/weaknesses
- [ ] 3.4 Add Dashboard link to Sidebar navigation
- [ ] 3.5 Verify dashboard page renders correctly with chart

## 4. Company Question Bank — Backend (Commit 3)

- [ ] 4.1 Add `CompanyQuestion` model to `sql_models.py`
- [ ] 4.2 Create `questions.py` router with POST/GET endpoints + admin approve
- [ ] 4.3 Register router in `main.py`
- [ ] 4.4 Seed initial questions for popular companies (FPT, VNG, Shopee)

## 5. Company Question Bank — Frontend (Commit 3)

- [ ] 5.1 Add API functions to `api.ts` (getQuestions, submitQuestion)
- [ ] 5.2 Create `/questions/page.tsx` with company filter, question list, and submit form
- [ ] 5.3 Add Questions link to Sidebar or Landing page navigation
- [ ] 5.4 Verify full flow: view questions → submit → admin approve
