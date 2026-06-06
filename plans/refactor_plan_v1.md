# Refactor Plan V1: Modularization

## Ngữ cảnh (Context)
Hiện tại `backend/server.js` dài ~240 dòng, gánh vác cả cấu hình Express, kết nối Database, Router Authentication, và Router Todo.
Frontend `App.tsx` cũng dài ~240 dòng, gánh vác quản lý State (auth, todos, heatmap), logic fetch API, Notification, và Render UI.
Dựa theo Quy Tắc Tái Cấu Trúc Thực Chiến (MỘT FILE - MỘT DÒNG SUY NGHĨ), việc gộp chung các logic này làm vi phạm nguyên tắc Single Responsibility, dễ gây Cognitive Overload khi debug.

## Kế hoạch Refactor (80% Planning)

### 1. Backend Refactor
- **Mục tiêu:** Chia tách các Endpoint ra khỏi file gốc `server.js`.
- **Hành động:**
  - Tạo `backend/routes/auth.js`: Chứa tư duy xác thực (Login, Register).
  - Tạo `backend/routes/todos.js`: Chứa tư duy CRUD Todo (Lấy, Tạo, Sửa, Xóa, Heatmap).
  - Cập nhật `server.js`: Chỉ đóng vai trò App Config, import routes và kết nối DB.

### 2. Frontend Refactor
- **Mục tiêu:** Tách logic thao tác API và Data Management ra khỏi giao diện của `App.tsx`.
- **Hành động:**
  - Tạo Custom Hook `frontend/src/hooks/useTodos.ts`: Chứa toàn bộ tư duy về Todo (fetchData, create, update, delete, heatmap, filtered search).
  - Tạo Custom Hook `frontend/src/hooks/useAuth.ts`: Chứa tư duy lưu session user, login, logout, check token.
  - Cập nhật `App.tsx`: File này giờ đây chỉ có nhiệm vụ trình bày giao diện (Presentation/Composition) thông qua việc gọi Hooks.

## Thực thi & Test (20% Code & Test)
- Cắt dán code vào các file đích cẩn thận.
- Cập nhật các câu lệnh `require()` và `import`.
- Restart container.
- Chạy toàn bộ script kiểm thử (Ví dụ: `test_auth.js`) để đảm bảo không bị break routes.
