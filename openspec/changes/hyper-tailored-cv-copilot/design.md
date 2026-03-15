## Context

SpeakCV hiện có 3 tính năng CV:
1. **CV Builder** (`GenCVModal.tsx`): Soạn CV thủ công với 7 themes, xuất PDF.
2. **CV Makeover** (`CVMakeover.tsx`): Upload CV cũ → AI phân tích + viết lại → JSON → Builder.
3. **CV Review** (`ReviewCVModal.tsx`): Đánh giá CV theo JD, cho Markdown report.

Cả 3 đều dùng chung `ai_service.call_ai_chat()` để gọi OpenAI, và `models.CVMakeoverData` làm JSON schema. Frontend load JSON output vào `GenCVModal` qua `sessionStorage.draft_cv_data`.

Tính năng mới **Hyper-Tailored CV Copilot** sẽ hoạt động **bên trong** CV Builder — sau khi user đã có CV (thủ công hoặc từ Makeover), họ bấm nút "Tối ưu theo JD", nhập JD, và AI sẽ tái cấu trúc CV đang soạn.

## Goals / Non-Goals

**Goals:**
- Thêm nút "Tối ưu theo JD" vào header CV Builder, mở TailorJDModal.
- Backend endpoint `/api/cv/tailor` nhận CV JSON + JD text, trả về CV JSON mới.
- AI System Prompt với guardrails nghiêm ngặt: không bịa kinh nghiệm, chỉ reorder + keyword tuning.
- Reuse hoàn toàn `CVMakeoverData` schema cho output.
- Hiển thị `tailor_summary` (tóm tắt thay đổi) trong modal kết quả.

**Non-Goals:**
- KHÔNG hỗ trợ nhập JD qua URL (chỉ text paste trong v1). URL parsing có thể thêm sau.
- KHÔNG thay đổi các template/theme hiện tại.
- KHÔNG tạo system prompt phức tạp có nhiều bước (single-shot call).
- KHÔNG lưu lịch sử JD đã tailor.

## Decisions

### 1. Reuse `CVMakeoverData` schema cho output
**Quyết định**: Output của `/api/cv/tailor` sẽ dùng chính xác `CVMakeoverData` schema hiện tại (trừ field `analysis_feedback`, thay bằng `tailor_summary`).

**Lý do**: Frontend (`GenCVModal`) đã có logic parse `CVMakeoverData` JSON thành `cvData` state (lines 186-276 trong `GenCVModal.tsx`). Reuse schema giúp áp dụng kết quả mà không viết code parse mới.

**Alternatives considered**:
- Tạo schema riêng cho tailor → Tốn effort viết parse logic mới, không cần thiết.

### 2. Nút trigger nằm trong header của GenCVModal
**Quyết định**: Thêm nút "Tối ưu theo JD" ngay cạnh nút "Tải xuống PDF" trong header bar.

**Lý do**: User đang soạn CV → muốn optimize nhanh → nút phải visible, không bị ẩn trong menu con.

### 3. Overlay kết quả trực tiếp vào cvData state
**Quyết định**: Sau khi AI trả kết quả, set trực tiếp vào `setCvData()` — user thấy CV thay đổi ngay trong preview.

**Lý do**: Giống flow hiện tại của CV Makeover (dùng `sessionStorage.draft_cv_data`), nhưng đơn giản hơn vì không cần redirect — apply ngay tại chỗ.

### 4. Guardrails trong System Prompt
**Quyết định**: Dùng hướng dẫn rõ ràng trong system prompt với các quy tắc:
- "TUYỆT ĐỐI KHÔNG bịa đặt kinh nghiệm, công ty, dự án không có trong CV gốc."
- "CHỈ ĐƯỢC: Sắp xếp lại thứ tự ưu tiên, tinh chỉnh từ khóa, viết lại mô tả chuyên nghiệp hơn."
- Kèm `temperature=0.3` (thấp hơn makeover) để giảm hallucination.

**Lý do**: Đây là core value prop — user tin tưởng rằng AI không bịa. Temperature thấp + prompt rõ ràng = output an toàn hơn.

### 5. Serialize cvData → CVMakeoverData JSON trước khi gửi
**Quyết định**: Convert state `cvData` của GenCVModal (format frontend) sang format `CVMakeoverData` (format backend) trước khi POST.

**Lý do**: Frontend dùng `experiences[]`, backend dùng `experience[]`. Cần mapping function.

## Risks / Trade-offs

- **[Risk] AI vẫn có thể hallucinate nhẹ** (thêm từ khóa CV gốc không có) → Mitigation: Temperature 0.3, prompt guardrails rõ ràng, user review kết quả trước khi apply.
- **[Risk] JD quá dài gây token overflow** → Mitigation: Truncate JD ở backend (max ~3000 chars), thông báo user.
- **[Risk] Response time chậm (10-30s)** → Mitigation: Hiển thị loading animation rõ ràng trong modal, disable nút, thông báo "Đang tối ưu...".
