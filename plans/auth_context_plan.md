# Kế Hoạch Triển Khai AuthContext

## 1. 80% Lên Kế Hoạch (Context Gathering & Planning)
Dựa theo quy tắc `Tái cấu trúc thực chiến` và `Strict TDD`, hiện tại `useAuth.ts` chỉ là một local hook. Nếu dùng nó ở nhiều component khác nhau, state sẽ không được đồng bộ (mỗi chỗ gọi hook sinh ra 1 state độc lập). Để khắc phục vấn đề thiết kế này, chúng ta cần Global State thông qua `React Context`.

**Phân tách tư duy (Một file - Một dòng suy nghĩ):**
- **`contexts/AuthContext.tsx`**: Chỉ lo nhiệm vụ Provider, quản lý vòng đời của token và thông tin User. 
- **`hooks/useAuth.ts`**: Chỉ lo nhiệm vụ là cổng giao tiếp (Consumer) để lấy dữ liệu từ Context.
- **`App.tsx` & `Sidebar.tsx`**: Chỉ lo phần giao diện, sử dụng cổng giao tiếp `useAuth` mà không cần truyền props (prop drilling).

## 2. 5% Thực Thi (Implementation)
- **Bước 1**: Tạo file `frontend/src/contexts/AuthContext.tsx`. Mang toàn bộ logic từ `useAuth.ts` hiện tại sang đây.
- **Bước 2**: Chỉnh sửa `frontend/src/hooks/useAuth.ts` để nó trở thành 1 wrapper cho `useContext(AuthContext)`.
- **Bước 3**: Chỉnh sửa `frontend/src/main.tsx` để bọc `<App />` trong `<AuthProvider>`.
- **Bước 4**: Cập nhật `App.tsx` và `Sidebar.tsx`. Xóa việc truyền prop `user` và `onLogout` từ `App.tsx` sang `Sidebar.tsx`. Thay vào đó `Sidebar.tsx` tự gọi `useAuth()`.

## 3. 15% Kiểm Thử (Aggressive Testing)
- Chạy `tsc -b && vite build` để phát hiện lỗi type TypeScript.
- Build lại Docker để kiểm tra luồng login/logout trên môi trường production/containerized.
- Đảm bảo data Todo bị xóa khỏi bộ nhớ khi Logout.
