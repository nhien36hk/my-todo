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

## 4. Quy trình phát triển & Kiểm thử (Verification Steps)

1. **Khởi tạo Dockerfiles:**
   - Tạo tệp `backend/Dockerfile` và `frontend/Dockerfile`.
   - Tạo tệp `docker-compose.yml` ở thư mục gốc dự án `/root/my-todo/`.
2. **Khởi chạy hệ thống:**
   - Chạy lệnh: `docker compose up -d --build`.
   - Kiểm tra trạng thái các container: `docker compose ps` và xem log: `docker compose logs -f`.
3. **Kiểm thử liên thông (End-to-End Verification):**
   - Mở trình duyệt truy cập `http://<domain_hoặc_IP>:8080` xem giao diện React hiển thị và thực hiện thêm một vài công việc để kiểm tra API lưu trữ dữ liệu thành công.
4. **Git Commit:** Khi hệ thống Docker Compose hoạt động ổn định và lưu trữ dữ liệu an toàn: `git add docker-compose.yml backend/Dockerfile frontend/Dockerfile && git commit -m "feat(docker): dockerize frontend and backend with compose setup"`.

---
*Tài liệu này được lưu trữ trực tuyến tại:*
* 📄 **Kế hoạch Docker:** [http://mymony.me/viewer?file=todo/plans/plan_docker.md](http://mymony.me/viewer?file=todo/plans/plan_docker.md)
