## 1. Backend: Rate Limiting & Quota

- [ ] 1.1 Thêm endpoint `GET /api/support/quota/{user_id}` trả về `{ remaining, limit }` dựa trên plan và số tin nhắn hôm nay
- [ ] 1.2 Thêm rate limit check trong WebSocket handler: đếm tin nhắn user gửi hôm nay, reject nếu free user >= 5 tin

## 2. Backend: Auto-Reply & Unread Count

- [ ] 2.1 Thêm auto-reply logic trong WebSocket handler: khi `len(admin_connections) == 0`, tạo system message và gửi cho user
- [ ] 2.2 Thêm endpoint `GET /api/support/unread-count/{user_id}` trả về số tin admin gửi mà user chưa đọc

## 3. Frontend: Gỡ Pro Gate & Rate Limit UI

- [ ] 3.1 Gỡ điều kiện `plan === "pro"` ở useEffect (dòng 34) và render body (dòng 160)
- [ ] 3.2 Thêm UI hiển thị remaining quota cho free user, hiện CTA "Nâng cấp Pro" khi hết lượt
- [ ] 3.3 Thêm guest login prompt khi click icon mà chưa đăng nhập

## 4. Frontend: Unread Badge & Auto-Reply

- [ ] 4.1 Thêm polling 30s cho unread count, hiển thị badge đỏ trên icon chat
- [ ] 4.2 Track auto-reply-sent state để chỉ hiện 1 lần/session
- [ ] 4.3 Mark messages as read khi mở widget (gọi API mark-read)

## 5. Verification & Commit

- [ ] 5.1 Build check (`npm run build`)
- [ ] 5.2 Commit backend changes
- [ ] 5.3 Commit frontend changes
