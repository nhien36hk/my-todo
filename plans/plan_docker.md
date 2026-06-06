# Kế hoạch Triển khai: Cấu hình Docker & Docker Compose

Kế hoạch này vạch ra thiết kế Dockerfile cho cả hai phần Backend/Frontend và cấu hình docker-compose để chạy toàn bộ hệ thống.

---

## 1. Dockerfile cho Backend
Sử dụng node alpine nhẹ, cài đặt dependencies và chạy server Express.

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5001
CMD ["node", "server.js"]
```

---

## 2. Dockerfile cho Frontend
Vận hành Vite Dev Server trong chế độ phát triển để hỗ trợ Hot Reload (HMR).

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm", "run", "dev", "--", "--port", "8080", "--host", "0.0.0.0"]
```

---

## 3. docker-compose.yml
Kết nối cả hai phần lại với nhau, đảm bảo dữ liệu SQLite không bị mất khi container khởi động lại thông qua Volume gắn kết.

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: todo-backend
    ports:
      - "5001:5001"
    volumes:
      - ./backend:/app
      - /app/node_modules
      - todo-db-data:/app/data
    environment:
      - PORT=5001
      - DATABASE_PATH=/app/data/todo.db
    restart: always

  frontend:
    build: ./frontend
    container_name: todo-frontend
    ports:
      - "8080:8080"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    restart: always

volumes:
  todo-db-data:
```

---

## 4. Quy trình phát triển & Kiểm thử Biên (Verification Steps)

Theo triết lý 80-5-15, chúng ta dành phần lớn nỗ lực để kiểm soát các edge cases của hệ thống hạ tầng và Container:

### Các Kịch Bản Kiểm Thử Biên & Phá Hoại (Edge-Cases):
1. ** SQLite Persistence & File Lock (Mất dữ liệu):**
   - SQLite là file đơn trên ổ đĩa. Khi Docker container bị restart (`docker compose restart`), dữ liệu phải được lưu giữ vĩnh viễn trên volume ngoài (`todo-db-data`).
   - Kiểm thử phá hoại: Ghi dữ liệu vào ứng dụng -> Chạy `docker compose down` rồi `docker compose up -d` -> Kiểm tra xem các công việc cũ có còn nguyên vẹn không.
2. **Container Crash Recovery (Khôi phục sau sự cố):**
   - Đảm bảo chính sách `restart: always` hoạt động tốt.
   - Kiểm thử phá hoại: Chạy lệnh `docker kill todo-backend` (mô phỏng tiến trình bị lỗi nghiêm trọng) -> Chờ 5 giây -> Kiểm tra xem Docker có tự khởi động lại container và ứng dụng có tiếp tục hoạt động bình thường không.
3. **CORS & Docker Network Resolution:**
   - Trong Docker, container frontend chạy trên cổng 8080 và proxy các request `/api` sang container backend (`http://todo-backend:5001`).
   - Đảm bảo cấu hình proxy trong container frontend sử dụng DNS của Docker Compose (tên service `backend`) thay vì `localhost` vì `localhost` bên trong container frontend trỏ vào chính nó chứ không phải backend.
   - Sửa cấu hình proxy trong production/docker: Container frontend sẽ sử dụng Nginx để reverse proxy `/api` sang `http://backend:5001` để tối ưu hóa hiệu năng, tránh chạy Vite dev server trên production.
4. **.dockerignore Optimization (Tối ưu hóa dung lượng):**
   - Đảm bảo loại bỏ `node_modules`, `dist`, `.git`, và file local `todo.db` khỏi build context của docker để tránh tăng kích thước image bất hợp lý và xung đột file.

### Các bước thực hiện:
1. **Tạo `.dockerignore` cho cả hai service.**
2. **Tạo Dockerfiles & docker-compose.yml.**
3. **Khởi chạy và thực hiện stress-test hệ thống hạ tầng** bằng cách tắt/bật đột ngột các dịch vụ.
4. **Git Commit:** Chỉ commit sau khi xác nhận dữ liệu SQLite không bị mất khi hạ container và cơ chế tự phục hồi hoạt động hoàn hảo.

---
*Tài liệu này được lưu trữ trực tuyến tại:*
* 📄 **Kế hoạch Docker:** [http://mymony.me/viewer?file=todo/plans/plan_docker.md](http://mymony.me/viewer?file=todo/plans/plan_docker.md)
