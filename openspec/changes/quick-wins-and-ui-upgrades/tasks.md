## 1. Quick Fixes (Bug & Polish)

- [ ] 1.1 Fix SupportChatWidget input background: thay `bg-blue-500` thành `bg-white text-gray-800` trong `SupportChatWidget.tsx` dòng 214
- [ ] 1.2 Thêm CSS animation classes cho chat messages (slide-in-left, slide-in-right) vào `globals.css`

## 2. Google Font & SEO

- [ ] 2.1 Cài đặt và cấu hình Be Vietnam Pro font bằng `next/font/google` trong `layout.tsx`
- [ ] 2.2 Bổ sung SEO metadata đầy đủ (Open Graph, Twitter Card, description tiếng Việt) trong `layout.tsx`

## 3. How It Works Section

- [ ] 3.1 Thêm section "Cách Hoạt Động" 3 bước vào `page.tsx` giữa Hero và Features section
- [ ] 3.2 Responsive layout: 3 cột ngang trên desktop, stack dọc trên mobile

## 4. Sidebar Grouped History

- [ ] 4.1 Tạo helper function `groupHistoriesByDate()` để nhóm lịch sử theo Hôm nay / Hôm qua / Tuần trước / Cũ hơn
- [ ] 4.2 Cập nhật rendering trong `Sidebar.tsx` để hiển thị group headers và items theo nhóm
- [ ] 4.3 Ẩn nhóm trống (không có interview)

## 5. Verification & Commit

- [ ] 5.1 Kiểm tra build thành công (`npm run build`)
- [ ] 5.2 Commit từng phần hoàn thành
