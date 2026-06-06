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

## 3. Kế hoạch Triển khai Từng bước & Kiểm thử (Verification Steps)

Quy trình triển khai tuân thủ quy tắc **Karpathy Clean Code**: Chỉ làm từng tính năng một, kiểm thử hoàn tất mới commit Git.

### Bước 1: Thiết kế Cơ sở Dữ liệu & API Backend (Express + SQLite)
* **Mô tả:** Thiết lập backend Node.js, cài đặt thư viện SQLite, định nghĩa schema bảng `todos` và viết các API:
  * `GET /api/todos` (Lấy danh sách việc).
  * `POST /api/todos` (Tạo việc).
  * `PUT /api/todos/:id` (Cập nhật việc/Hoàn thành việc).
  * `DELETE /api/todos/:id` (Xóa việc).
  * `GET /api/todos/heatmap` (Lấy dữ liệu thống kê số công việc hoàn thành theo ngày để vẽ biểu đồ).
* **Kiểm thử (Verification):** Sử dụng các lệnh `curl` để gọi trực tiếp các API, xác nhận dữ liệu trả về đúng định dạng JSON và SQLite lưu trữ thành công.

### Bước 2: Xây dựng Giao diện Frontend (React + TailwindCSS)
* **Mô tả:** Khởi tạo project React bằng Vite, cài đặt TailwindCSS, xây dựng giao diện Todoist gồm thanh bên điều hướng, bảng quản lý công việc và Component vẽ lưới ô vuông đóng góp (Heatmap Grid).
* **Kiểm thử (Verification):** Chạy và kiểm tra giao diện hiển thị trên trình duyệt, kiểm tra hoạt động tương tác thêm/sửa/xóa/hoàn thành và xem màu sắc các ô xanh của biểu đồ thay đổi đúng tỷ lệ.

### Bước 3: Cấu hình Docker & Docker Compose
* **Mô tả:** Viết các tệp tin Dockerfile cho frontend/backend và `docker-compose.yml`.
* **Kiểm thử (Verification):** Khởi chạy `docker compose up -d`, kiểm tra log container và xác nhận truy cập được qua các cổng 8080 (frontend) và 5001 (backend) trên VPS.
