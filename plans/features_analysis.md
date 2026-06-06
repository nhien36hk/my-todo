# Phân tích tính năng: Todoist Clone với Bảng thống kê kiểu GitHub

Bản phân tích này hoạch định các tính năng cốt lõi, kiến trúc hệ thống và giao diện hiển thị cho ứng dụng Todoist Clone tự vận hành.

---

## 1. Danh sách tính năng cốt lõi (Core Features)

### Feature 1: Quản lý tác vụ (Task CRUD)
- **Thêm tác vụ:** Tiêu đề (bắt buộc), Mô tả chi tiết, Ngày hạn chót (Due Date), Độ ưu tiên (Thấp, Trung bình, Cao), Nhãn/Dự án.
- **Hoàn thành tác vụ:** Đánh dấu hoàn thành (Trigger để ghi nhận vào lịch sử biểu đồ đóng góp).
- **Chỉnh sửa & Xóa tác vụ:** Cho phép thay đổi thông tin hoặc xóa bỏ.

### Feature 2: Bộ lọc & Lịch trình (Filters & Views)
- **Hộp thư đến (Inbox):** Danh sách toàn bộ việc chưa làm.
- **Hôm nay (Today):** Các việc có hạn chót là ngày hôm nay.
- **Sắp tới (Upcoming):** Lịch trình các ngày tiếp theo dạng danh sách xếp theo thời gian.

### Feature 3: Biểu đồ đóng góp kiểu GitHub (GitHub-style Heatmap) - TÍNH NĂNG ĐẶC BIỆT
Hiển thị một lưới (grid) gồm 365 ô tương ứng với các ngày trong năm (52 tuần).
- **Logic màu sắc:**
  - Ngày không hoàn thành việc nào: Màu nền xám/trắng nhạt (`bg-slate-900/10` hoặc tương đương).
  - Ngày có hoàn thành công việc: Hiển thị màu xanh (hoặc màu chủ đạo của hệ thống).
  - **Độ đậm nhạt thích ứng (Dynamic Intensity):**
    - Hệ thống tự động quét lịch sử hoàn thành để tìm ra **số lượng công việc hoàn thành nhiều nhất trong một ngày** của năm đó (`MAX_COMPLETED`).
    - Các ngày còn lại sẽ được tính tỷ lệ màu sắc dựa trên công thức: `Intensity = (Số việc hoàn thành ngày đó) / MAX_COMPLETED`.
    - Phân chia màu thành 4 cấp độ đậm dần tương ứng với tỷ lệ phần trăm (25%, 50%, 75%, 100%).

---

## 2. Kiến trúc hệ thống & Thiết lập Docker

Hệ thống được chạy hoàn toàn dưới dạng container thông qua Docker Compose độc lập, tránh xung đột cổng với dự án MyMoni:

| Thành phần | Công nghệ | Cổng ngoài (Host) | Cổng trong (Container) | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | React + Vite + TailwindCSS | **8080** | 5173 | Giao diện người dùng tối giản, mượt mà |
| **Backend** | Node.js + Express | **5001** | 5000 | Cung cấp RESTful API xử lý dữ liệu |
| **Database** | SQLite | *Nội bộ* | *Nội bộ* | Cơ sở dữ liệu tự chứa dạng file gọn nhẹ, lưu trữ an toàn |

---

## 3. Kế hoạch triển khai từng bước (Plans Folder Structure)
Chúng ta sẽ tạo các file kế hoạch chi tiết trong thư mục `plans/` tương ứng cho từng tính năng:
1. `plan_backend.md`: Thiết lập Node.js + SQLite API và viết các test case.
2. `plan_frontend.md`: Thiết lập React + Tailwind và giao diện CRUD cơ bản.
3. `plan_heatmap.md`: Xây dựng component vẽ lưới thống kê đóng góp kiểu GitHub.
4. `plan_docker.md`: Cấu hình Dockerfile, docker-compose và chạy thử nghiệm tích hợp.

---
*Bản tài liệu này được lưu trữ trong mã nguồn dự án tại VPS của bạn:*
* 📄 **Tài liệu Phân tích tính năng:** [http://mymony.me/viewer?file=todo/plans/features_analysis.md](http://mymony.me/viewer?file=todo/plans/features_analysis.md)
