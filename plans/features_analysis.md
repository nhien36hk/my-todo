# Kế hoạch Phân tích Tính năng: My Todoist Clone

Dự án này hướng tới phát triển một ứng dụng quản lý công việc (Todoist Clone) với giao diện trực quan và một tính năng đặc biệt: **Biểu đồ đóng góp (Contribution Heatmap) kiểu GitHub** ghi nhận mức độ hoàn thành công việc theo ngày trong năm.

---

## 1. Phân bổ Cổng (Ports) & Tránh xung đột với MyMoni
Để không xung đột với ứng dụng MyMoni (đang chạy trên cổng 80 và 5000), ứng dụng Todo mới sẽ dùng các cổng sau:
* **React Frontend:** Cổng **8080** (ánh xạ từ cổng 5173 của Vite trong container).
* **Node.js Backend:** Cổng **5001** (ánh xạ từ cổng 5001 trong container).
* **Database:** SQLite (lưu trữ dưới dạng file đơn lẻ `todo.db` trong volume Docker để tối giản hóa tài nguyên và đảm bảo tính di động).

---

## 2. Các Tính năng Cốt lõi (Core Features)

### Tính năng 1: Quản lý Công việc (Todo CRUD)
* **Thêm việc mới:** Nhập tiêu đề, mô tả (tùy chọn), ngày hết hạn (due date), mức độ ưu tiên (Thấp, Trung bình, Cao).
* **Hiển thị danh sách:** Xem công việc hôm nay, việc sắp tới (Upcoming), việc đã hoàn thành.
* **Hoàn thành việc:** Đánh dấu hoàn thành. Lưu lại thời điểm hoàn thành (`completed_at`) để vẽ biểu đồ.
* **Chỉnh sửa / Xóa việc:** Thay đổi thông tin hoặc xóa hẳn công việc.

### Tính năng 2: Biểu đồ Nhiệt Đóng góp (GitHub-style Completed Tasks Heatmap)
Hiển thị một lưới 53 tuần tương tự như biểu đồ đóng góp commit của GitHub để theo dõi năng suất.
* **Cơ chế tính toán màu sắc:**
  1. Tìm ngày có số lượng công việc hoàn thành nhiều nhất trong năm qua (`max_completed`).
  2. Nếu `max_completed == 0`, toàn bộ biểu đồ sẽ hiển thị màu xám nhạt (không có đóng góp).
  3. Nếu `max_completed > 0`, tỷ lệ màu sắc của một ngày có số công việc hoàn thành `completed_count` sẽ là:
     * `level = ceil((completed_count / max_completed) * 4)` (giá trị từ 1 đến 4).
     * Mức 0: 0 việc completed -> Màu xám nhạt (`bg-zinc-800` hoặc tương tự).
     * Mức 1: Màu xanh lá cây rất nhạt (nhạt nhất).
     * Mức 2: Màu xanh lá cây nhạt.
     * Mức 3: Màu xanh lá cây trung bình.
     * Mức 4: Màu xanh lá cây đậm nhất (ngày làm nhiều việc nhất).

### Tính năng 3: Môi trường Docker hóa (Docker Integration)
* **Backend Dockerfile:** Sử dụng Node.js Alpine, cài đặt dependencies, chạy ứng dụng Express.
* **Frontend Dockerfile:** Sử dụng Node.js để chạy Vite Dev Server trong chế độ phát triển (hoặc Nginx cho production).
* **docker-compose.yml:** Khởi chạy đồng thời cả hai dịch vụ trên cổng 8080 và 5001, đồng bộ volume dữ liệu của SQLite.

---

## 3. Kế hoạch Triển khai & Triết lý Phát triển (80-5-15 Rule)

Quy trình triển khai tuân thủ các nguyên tắc nghiêm ngặt:
* **Phân bổ nỗ lực (80-5-15):** 80% thời gian nghiên cứu context và phân tích các trường hợp biên/edge cases dễ gây lỗi; 5% viết code giải pháp; 15% thiết kế và chạy các bài kiểm thử phá hoại (destructive tests).
* **Triết lý Kiểm thử:** Mục tiêu của bộ test không phải là hiển thị màu xanh lá cây "Pass" một cách dễ dàng, mà là bao phủ nhiều kịch bản phức tạp nhất để phát hiện lỗi thực tế. Một bộ test được coi là thành công khi nó stress-test được toàn bộ các edge case.
* **Quy trình Lặp (Feedback Loop):** Nếu test phát hiện ra lỗi, lỗi đó được định nghĩa thành một "sub-feature" cần sửa. Kế hoạch (plan) và code sẽ được cập nhật, sau đó chạy lại test cho đến khi toàn bộ các trường hợp biên được xử lý triệt để rồi mới thực hiện Git Commit.

### Bước 1: API Backend (Express + SQLite) & Kiểm thử Biên
* **Mô tả:** Thiết lập backend Node.js, SQLite schema và các API CRUD + Heatmap.
* **Edge cases cần lên kế hoạch & kiểm thử:**
  * Thêm công việc không có tiêu đề, tiêu đề quá dài, hoặc chứa ký tự đặc biệt.
  * Định dạng ngày tháng do người dùng truyền lên không hợp lệ (ví dụ: `2026-02-30`, sai định dạng `YYYY-MM-DD`).
  * Mức độ ưu tiên truyền lên giá trị lạ (ví dụ: `ultra-high` thay vì `low/medium/high`).
  * Đánh dấu hoàn thành một công việc đã hoàn thành hoặc ngược lại (kiểm tra trường `completed_at` có được gán/xóa đúng và đồng nhất không).
  * API Heatmap hoạt động thế nào khi không có task nào hoàn thành, hoặc khi có hàng chục task hoàn thành trong cùng một ngày (xử lý chia cho 0 hoặc giá trị biên).
* **Kiểm thử (Verification):** Sử dụng script kiểm thử tự động (ví dụ: dùng shell script hoặc JS test script) gửi các payload độc hại và biên để kiểm tra khả năng phục hồi lỗi của Backend.

### Bước 2: Frontend (React + Tailwind) & Lưới Nhiệt Heatmap
* **Mô tả:** Tạo dự án React/Vite, Tailwind, và dựng lưới nhiệt 53 tuần.
* **Edge cases cần lên kế hoạch & kiểm thử:**
  * Lưới nhiệt hiển thị thế nào trong năm nhuận hoặc khi chuyển giao giữa các năm.
  * Màu sắc hiển thị thế nào khi số lượng công việc hoàn thành trong một ngày vượt quá kỳ vọng hoặc cực kỳ phân tán.
  * Hành vi giao diện khi gọi API thất bại (hiển thị trạng thái lỗi thay vì crash trang).
* **Kiểm thử (Verification):** Mô phỏng các tập dữ liệu heatmap biên (rỗng, cực lớn, lệch) để kiểm tra giao diện render chuẩn xác.

### Bước 3: Docker Compose Integration
* **Mô tả:** Đóng gói Docker và liên kết volume SQLite.
* **Kiểm thử (Verification):** Restart container đột ngột để kiểm tra tính toàn vẹn của dữ liệu trong cơ sở dữ liệu SQLite.

---
*Tài liệu này được lưu trữ trực tuyến tại:*
* 📄 **Phân tích Tính năng:** [http://mymony.me/viewer?file=todo/plans/features_analysis.md](http://mymony.me/viewer?file=todo/plans/features_analysis.md)
