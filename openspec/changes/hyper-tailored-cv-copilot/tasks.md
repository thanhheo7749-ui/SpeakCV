## 1. Backend — Pydantic Model & API Endpoint

- [ ] 1.1 Thêm model `CVTailorRequest` vào `src/backend/app/models.py` với fields: `master_cv_json` (dict) và `jd_text` (str)
- [ ] 1.2 Thêm constant `CV_TAILOR_SYSTEM_PROMPT` vào `src/backend/app/routers/cv.py` với guardrails: không bịa kinh nghiệm, chỉ reorder + keyword tuning, temperature=0.3
- [ ] 1.3 Thêm endpoint `POST /api/cv/tailor` vào `src/backend/app/routers/cv.py`: validate input, truncate JD nếu >5000 chars, gọi `call_ai_chat()` với `response_format=json_object`, validate output với `CVMakeoverData`, trả về `{ cv_data, tailor_summary }`

## 2. Frontend — TailorJDModal Component

- [ ] 2.1 Tạo component `TailorJDModal.tsx` trong `src/frontend/components/Modals/` với: textarea nhập JD, nút "Tối ưu ngay", loading state, hiển thị `tailor_summary` khi có kết quả, nút xác nhận / hủy
- [ ] 2.2 Style TailorJDModal bằng Tailwind CSS phù hợp dark mode theme hiện tại (bg-slate-900, border-slate-700, etc.)

## 3. Frontend — Tích hợp vào CV Builder

- [ ] 3.1 Thêm nút "Tối ưu theo JD" vào header bar của `GenCVModal.tsx` (cạnh nút "Tải xuống PDF"), với icon phù hợp từ lucide-react
- [ ] 3.2 Thêm state `showTailorModal` vào GenCVModal, render `TailorJDModal` khi true
- [ ] 3.3 Viết function `serializeCvDataForBackend()` trong GenCVModal: convert frontend `cvData` state sang `CVMakeoverData` JSON format (experiences→experience, educations→education, etc.)
- [ ] 3.4 Viết function `handleTailorResult()`: nhận kết quả từ TailorJDModal, parse CV JSON mới, set vào `setCvData()` — reuse logic parse tương tự `draft_cv_data` (lines 186-276)

## 4. Export & Wiring

- [ ] 4.1 Export `TailorJDModal` trong `src/frontend/components/Modals/index.ts`
- [ ] 4.2 Kiểm tra import paths và đảm bảo GenCVModal import TailorJDModal đúng

## 5. Testing & Verification

- [ ] 5.1 Test backend: gọi `/api/cv/tailor` với sample CV JSON + JD text, verify response schema đúng CVMakeoverData
- [ ] 5.2 Test frontend: mở CV Builder → bấm "Tối ưu theo JD" → nhập JD → verify kết quả hiển thị đúng trong preview
- [ ] 5.3 Test guardrails: verify AI không thêm company/skill mới không có trong CV gốc
