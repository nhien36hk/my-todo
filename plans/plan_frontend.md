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

## 3. Quy trình phát triển & Kiểm thử Biên (Verification Steps)

Theo triết lý 80-5-15, chúng ta dành phần lớn nỗ lực để thiết kế các kịch bản kiểm thử biên và phòng ngừa lỗi trên giao diện (UI robustness):

### Các Kịch Bản Kiểm Thử Biên & Phá Hoại (Edge-Cases):
1. **Network Failures & Lỗi API:** Khi Backend bị sập hoặc API trả về mã lỗi 500, Frontend không được crash màn hình trắng mà phải hiển thị thông báo Toast cảnh báo lỗi thân thiện.
2. **Double Submission (Nhấn đúp nút gửi):** Khi người dùng nhấp liên tiếp vào nút thêm công việc (hoặc bấm enter liên tục), Frontend cần vô hiệu hóa (disable) nút gửi để tránh chèn đúp dữ liệu lên Backend.
3. **Hiển thị văn bản quá dài (Layout Break):** Nhập công việc với tên siêu dài (ví dụ: 1000 ký tự không có dấu cách) để kiểm tra xem giao diện có tự động ngắt dòng (`break-all` / `truncate`) hay làm vỡ bố cục Sidebar/Main layout.
4. **Đồng bộ State khi hoàn thành:** Đảm bảo khi bấm nút checkbox hoàn thành, state của danh sách và Heatmap trên màn hình được cập nhật đồng bộ ngay lập tức mà không cần F5 (tải lại trang).
5. **Trạng thái rỗng (Empty States):** Kiểm tra hiển thị khi danh sách công việc hoàn toàn rỗng để hiển thị các minh họa và gợi ý trực quan thay vì màn hình trống trơn nhàm chán.

### Các bước thực hiện:
1. **Khởi tạo dự án và cấu hình Tailwind:**
   - Chạy lệnh khởi tạo: `npm create vite@latest frontend -- --template react-ts`
   - Cài đặt TailwindCSS và icon pack (`lucide-react`).
2. **Cấu hình xử lý lỗi tập trung:** Viết Client Axios xử lý lỗi chung (interceptor) để hiển thị thông báo lỗi khi API thất bại.
3. **Mô phỏng & Stress-Test:** Nhập thử các chuỗi ký tự độc hại, ngắt kết nối mạng tạm thời trong tab Network của DevTools để xem Frontend xử lý thế nào.
4. **Git Commit:** Chỉ commit sau khi đã kiểm tra kỹ các kịch bản phá hoại UI ở trên và đảm bảo giao diện chống chịu tốt trước dữ liệu lỗi.

---
*Tài liệu này được lưu trữ trực tuyến tại:*
* 📄 **Kế hoạch Frontend:** [http://mymony.me/viewer?file=todo/plans/plan_frontend.md](http://mymony.me/viewer?file=todo/plans/plan_frontend.md)

