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

## 3. Kế hoạch Phát triển & Kiểm thử Phá Hoại (Destructive Testing)

Theo triết lý 80-5-15, chúng ta dành 80% nỗ lực phân tích các kịch bản biên của Backend và xây dựng kịch bản kiểm thử tự động tại `backend/test.js` để phát hiện lỗi trước khi code hoặc commit.

### Các Kịch Bản Kiểm Thử Biên & Phá Hoại (Edge-Cases):
1. **Thiếu tiêu đề (Title Validation):** `POST /api/todos` với `{ title: "" }` hoặc không có trường `title`. Phản hồi phải trả về `400 Bad Request` thay vì crash server hoặc chèn rỗng vào DB.
2. **Sai định dạng ngày (Due Date Validation):** `POST /api/todos` hoặc `PUT /api/todos/:id` với `due_date` có giá trị bất hợp lý:
   - Sai định dạng: `"due_date": "06-06-2026"` (phải là `YYYY-MM-DD`).
   - Ngày không tồn tại: `"due_date": "2026-02-30"`.
   - Chuỗi độc hại hoặc rỗng: `"due_date": "NOT_A_DATE"`.
   Server cần từ chối và trả về `400 Bad Request`.
3. **Giá trị priority không hợp lệ (Priority Validation):** Gửi priority là `"critical"` hoặc `""`. DB chỉ chấp nhận các giá trị: `low`, `medium`, `high`. Hệ thống phải tự động gán về mặc định `medium` hoặc trả về `400 Bad Request`.
4. **Trạng thái Completed & completed_at logic:**
   - Khi `PUT /api/todos/:id` cập nhật `completed = 1`, hệ thống tự ghi nhận `completed_at` là ngày hiện tại (`YYYY-MM-DD`).
   - Khi `PUT /api/todos/:id` cập nhật `completed = 0`, hệ thống phải xóa `completed_at` thành `null`.
   - Chạy test cập nhật liên tiếp `completed = 1` -> `completed = 0` -> `completed = 1` để kiểm tra tính đồng bộ của DB.
5. **ID không tồn tại:** `PUT /api/todos/9999` hoặc `DELETE /api/todos/9999`. Trả về `404 Not Found`.
6. **API Heatmap rỗng & biên:**
   - Lấy dữ liệu heatmap khi DB hoàn toàn rỗng.
   - Thêm nhiều task đã hoàn thành trong cùng một ngày (ví dụ: 5 task) và kiểm tra xem API Heatmap có trả về count chính xác bằng 5 hay không.

### Các bước thực hiện:
1. **Viết script kiểm thử tự động (`backend/test.js`):**
   - Viết các test case sử dụng thư viện `fetch` hoặc `axios` để gọi API Backend và khẳng định (assert) các mã trạng thái HTTP cũng như dữ liệu trả về.
   - Script phải chạy độc lập và trả về mã lỗi (exit code 1) nếu có bất kỳ test case nào thất bại.
2. **Khởi chạy Backend và chạy Test:**
   - Chạy backend: `node server.js`
   - Chạy test: `node test.js`
3. **Lặp lại Feedback Loop (Sửa Bug):**
   - Nếu script test tìm ra bug (ví dụ: server crash khi nhận ngày sai), ta dừng lại, sửa code trong `server.js` hoặc `db.js`, cập nhật lại kế hoạch nếu cần, rồi chạy lại test.
4. **Git Commit:** Chỉ commit sau khi file `node test.js` kết thúc thành công 100% các kịch bản biên trên.

---
*Tài liệu này được lưu trữ trực tuyến tại:*
* 📄 **Kế hoạch Backend:** [http://mymony.me/viewer?file=todo/plans/plan_backend.md](http://mymony.me/viewer?file=todo/plans/plan_backend.md)

