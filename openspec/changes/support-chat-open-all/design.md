## Context

SpeakCV support chat dùng WebSocket real-time (`ConnectionManager` trong `support.py`). Backend lưu tin nhắn vào `SupportMessage` table (user_id, admin_id, message, sender_type, is_read, created_at). Frontend gate trên `plan === "pro"` ở 2 chỗ: dòng 34 (WS connect) và dòng 160 (UI render). Backend không check plan → chỉ cần sửa frontend + thêm rate limit logic.

## Goals / Non-Goals

**Goals:**
- Cho tất cả user đã đăng nhập chat được với admin
- Rate limit 5 tin/ngày cho free user (kiểm tra ở backend)
- Hiện badge đỏ cho tin chưa đọc trên icon chat
- Auto-reply khi admin offline
- Guest user thấy icon nhưng được yêu cầu đăng nhập

**Non-Goals:**
- Không thay đổi database schema
- Không thêm AI chatbot
- Không thay đổi admin panel support page
- Không thêm push notification (chỉ polling badge)

## Decisions

### 1. Rate limit: Backend-enforced, query-based
**Quyết định**: Đếm tin nhắn user gửi hôm nay bằng SQL query trên bảng `support_messages` (WHERE user_id + sender_type='user' + created_at >= today). Không tạo bảng mới.
**Lý do**: Volume tin nhắn support rất thấp, query đếm rẻ. Không cần Redis hay rate limit middleware.
**Phương án khác**: Redis counter (overkill), middleware rate limit (không phân biệt plan).

### 2. Unread badge: REST polling mỗi 30s
**Quyết định**: Thêm endpoint `GET /api/support/unread-count/{user_id}` trả về số tin admin gửi mà chưa đọc. Frontend poll mỗi 30s khi widget đóng.
**Lý do**: WebSocket chỉ active khi widget mở. Khi đóng, cần polling để biết tin mới.
**Phương án khác**: Dùng WS persistent connection (tốn tài nguyên cho feature nhỏ).

### 3. Auto-reply: Check `admin_connections` length
**Quyết định**: Khi user gửi tin, backend check `len(manager.admin_connections) == 0`. Nếu không có admin online → tự tạo 1 SupportMessage với `sender_type="system"` chứa auto-reply text.
**Lý do**: Đơn giản, chính xác (admin phải có WS connection mới được coi là online).

### 4. Guest prompt: Frontend conditional render
**Quyết định**: Nếu `!token`, click icon chat → hiện popup nhỏ "Đăng nhập để chat hỗ trợ" với nút → `/login`.
**Lý do**: Không cần backend change, chỉ conditional UI.

## Risks / Trade-offs

- **[Risk] Race condition rate limit**: User gửi 2 tin cùng lúc có thể bypass count → **Mitigation**: Kiểm tra count trước khi save, acceptable vì support chat không phải critical system.
- **[Risk] Polling overhead**: 30s polling khi widget đóng → **Mitigation**: Chỉ poll khi user đã đăng nhập, stop khi tab inactive (document.hidden).
- **[Risk] Auto-reply spam**: Nếu user gửi liên tục khi admin offline → **Mitigation**: Chỉ gửi auto-reply 1 lần/session (track bằng state frontend).
