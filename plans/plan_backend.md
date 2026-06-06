# Kế hoạch Triển khai: Node.js Backend với SQLite

Kế hoạch này tập trung vào việc cài đặt phần Backend (RESTful API) sử dụng Node.js, Express và SQLite.

---

## 1. Thiết kế Cơ sở Dữ liệu (SQLite Schema)
Dữ liệu sẽ được lưu trữ trong một tệp tin duy nhất là `todo.db`. Bảng `todos` có cấu trúc như sau:

```sql
CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT, -- Định dạng YYYY-MM-DD
  completed INTEGER DEFAULT 0, -- 0: Chưa làm, 1: Đã hoàn thành
  completed_at TEXT, -- Định dạng YYYY-MM-DD (NULL nếu chưa hoàn thành)
  priority TEXT DEFAULT 'medium', -- low, medium, high
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. Danh sách các API Endpoints (Express.js)

Tất cả các endpoint bắt đầu bằng `/api`:
- **`GET /api/todos`**: Trả về toàn bộ công việc chưa hoàn thành hoặc toàn bộ công việc tùy tham số.
- **`POST /api/todos`**: Tạo mới một công việc.
  - Body: `{ title, description, due_date, priority }`
- **`PUT /api/todos/:id`**: Cập nhật thông tin công việc hoặc đánh dấu hoàn thành.
  - Body: `{ title, description, due_date, priority, completed }`
  - *Logic đặc biệt:* Nếu `completed` thay đổi từ `0` sang `1`, hệ thống tự động ghi nhận ngày hoàn thành hiện tại (`completed_at = YYYY-MM-DD`). Nếu thay đổi ngược lại từ `1` về `0`, thiết lập `completed_at = NULL`.
- **`DELETE /api/todos/:id`**: Xóa hoàn toàn một công việc khỏi hệ thống.
- **`GET /api/todos/heatmap`**: Lấy thống kê số việc đã hoàn thành theo ngày để vẽ biểu đồ GitHub.
  - Trả về danh mục dạng: `[{ date: "2026-06-06", count: 3 }, ...]`

---

## 3. Kế hoạch Phát triển & Kiểm thử (Verification Steps)

1. **Khởi tạo project Node.js:**
   - Tạo thư mục `/root/my-todo/backend`.
   - Chạy `npm init -y` và cài đặt dependencies (`express`, `cors`, `sqlite3` hoặc `sqlite`).
2. **Viết mã nguồn:**
   - Tạo tệp `db.js` khởi tạo kết nối SQLite và tạo bảng.
   - Tạo tệp `server.js` khởi chạy server Express trên cổng **5001** và định nghĩa các route API.
3. **Kiểm thử thủ công (Verification):**
   - Dùng lệnh `curl` gọi các API kiểm thử:
     - Tạo công việc: `curl -X POST -H "Content-Type: application/json" -d '{"title":"Test task"}' http://localhost:5001/api/todos`
     - Lấy danh sách: `curl http://localhost:5001/api/todos`
     - Hoàn thành công việc: `curl -X PUT -H "Content-Type: application/json" -d '{"completed":1}' http://localhost:5001/api/todos/1`
     - Kiểm tra heatmap API: `curl http://localhost:5001/api/todos/heatmap`
4. **Git Commit:** Khi toàn bộ API đã chạy đúng và dữ liệu SQLite lưu chính xác, tiến hành commit đầu tiên: `git add backend/ && git commit -m "feat(backend): implement CRUD APIs and SQLite database"`.

---
*Tài liệu này được lưu trữ trực tuyến tại:*
* 📄 **Kế hoạch Backend:** [http://mymony.me/viewer?file=todo/plans/plan_backend.md](http://mymony.me/viewer?file=todo/plans/plan_backend.md)
