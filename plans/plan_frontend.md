# Kế hoạch Triển khai: React Frontend với TailwindCSS

Kế hoạch này vạch ra thiết kế giao diện, cấu trúc thư mục và tích hợp TailwindCSS cho phần Frontend.

---

## 1. Giao diện Người dùng (UI/UX)
Thiết kế hướng tới phong cách tối giản của Todoist và giao diện tối (Dark mode) sang trọng:
- **Thanh bên (Sidebar):**
  - **Hộp thư đến (Inbox):** Xem toàn bộ việc chưa làm.
  - **Hôm nay (Today):** Xem việc cần làm hôm nay.
  - **Sắp tới (Upcoming):** Lịch trình việc làm các ngày tiếp theo.
- **Khu vực chính (Main Content Area):**
  - Danh sách công việc dạng dòng (list item) có nút tròn check hoàn thành.
  - Nút thêm công việc mới hiển thị biểu mẫu (Form) nhập nhanh ngay tại dòng.
- **Khu vực thống kê (Dashboard Area):**
  - Nằm ở trên cùng hoặc một phần riêng hiển thị biểu đồ đóng góp (GitHub Heatmap Component).

---

## 2. Cấu trúc thư mục (React Project Structure)
Dự án được khởi tạo bằng Vite:

```text
frontend/
├── src/
│   ├── components/
│   │   ├── layout/         # Sidebar, Header, Layout chính
│   │   ├── todo/           # TaskList, TaskItem, AddTaskForm
│   │   └── heatmap/        # ContributionGrid, HeatmapCell
│   ├── pages/
│   │   ├── Inbox.tsx
│   │   ├── Today.tsx
│   │   └── Upcoming.tsx
│   ├── context/
│   │   └── TodoContext.tsx # Quản lý state chung của ứng dụng
│   ├── api/
│   │   └── client.ts       # Axios client kết nối backend cổng 5001
│   ├── App.tsx
│   └── main.tsx
```

---

## 3. Quy trình phát triển & Kiểm thử (Verification Steps)

1. **Khởi tạo và cài đặt TailwindCSS:**
   - Chạy lệnh khởi tạo: `npm create vite@latest frontend -- --template react-ts` hoặc `react`.
   - Cài đặt TailwindCSS theo tài liệu hướng dẫn và cấu hình `tailwind.config.js`.
   - Cài đặt `axios` và `lucide-react` để lấy icon đẹp mắt.
2. **Thiết lập kết nối API (Axios):**
   - Viết client kết nối đến địa chỉ backend `http://localhost:5001/api`.
3. **Xây dựng giao diện CRUD cơ bản:**
   - Hoàn thành giao diện danh sách công việc và form thêm việc trước.
4. **Kiểm thử thủ công (Verification):**
   - Chạy dev server bằng `npm run dev -- --host` (cổng 5173).
   - Truy cập vào cổng 8080 (khi đã cấu hình Docker) để kiểm tra toàn bộ hoạt động thêm/sửa/xóa và đánh dấu hoàn thành xem giao diện có cập nhật tức thì hay không.
5. **Git Commit:** Khi frontend đã có giao diện CRUD chạy mượt mà kết nối thành công với backend: `git add frontend/ && git commit -m "feat(frontend): create React UI and CRUD integrations"`.

---
*Tài liệu này được lưu trữ trực tuyến tại:*
* 📄 **Kế hoạch Frontend:** [http://mymony.me/viewer?file=todo/plans/plan_frontend.md](http://mymony.me/viewer?file=todo/plans/plan_frontend.md)
