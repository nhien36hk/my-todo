# Kế hoạch Triển khai: Biểu đồ đóng góp kiểu GitHub (Heatmap Component)

Kế hoạch này vạch ra thiết kế toán học, cấu trúc mã nguồn React và CSS Grid để vẽ biểu đồ nhiệt hiển thị đóng góp theo ngày.

---

## 1. Logic Vẽ lưới ô vuông (Lưới 365 ngày)
Thay vì sử dụng các thư viện vẽ biểu đồ nặng nề (như Chart.js hay Recharts), chúng ta sẽ sử dụng trực tiếp **CSS Grid** thuần của TailwindCSS để đảm bảo tính tối giản, hiệu năng cao và dễ tùy biến:

```tsx
// Lưới Grid 7 dòng hiển thị từ trên xuống dưới, cột xếp từ trái qua phải (grid-flow-col)
<div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto p-4 bg-zinc-900/50 rounded-xl border border-white/5">
  {daysArray.map((day) => (
    <HeatmapCell key={day.date} date={day.date} count={day.count} max={maxCompleted} />
  ))}
</div>
```

---

## 2. Xác định màu sắc thích ứng theo số việc (Color Intensity Mapping)
Chúng ta sẽ tính toán cấp độ màu của mỗi ngày dựa trên ngày có số việc hoàn thành cao nhất (`MAX_COMPLETED`):

- **Trường hợp `MAX_COMPLETED == 0`:** Tất cả các ô hiển thị màu xám đen (`bg-zinc-800/50`).
- **Trường hợp `count > 0`:** Tỷ lệ hoàn thành `ratio = count / MAX_COMPLETED`.
  - **Mức 1 (`ratio <= 0.25`):** Xanh lục siêu nhạt (`bg-emerald-900/30`)
  - **Mức 2 (`ratio <= 0.50`):** Xanh lục nhạt (`bg-emerald-700/50`)
  - **Mức 3 (`ratio <= 0.75`):** Xanh lục trung bình (`bg-emerald-600/70`)
  - **Mức 4 (`ratio > 0.75`):** Xanh lục đậm chủ đạo (`bg-emerald-500`)

---

## 3. Tạo Danh sách 365 Ngày liên tiếp
Ở Frontend, chúng ta sẽ sinh ra mảng chứa 365 ngày qua (từ hôm nay lùi về quá khứ):

```typescript
const generateYearDays = () => {
  const days = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0]; // Định dạng YYYY-MM-DD
    days.push({ date: dateStr, count: 0 });
  }
  return days;
};
```
Sau đó khớp dữ liệu từ API `GET /api/todos/heatmap` để cập nhật số lượng `count` thực tế của từng ngày.

---

## 4. Quy trình phát triển & Kiểm thử Biên (Verification Steps)

Theo triết lý 80-5-15, chúng ta dành phần lớn nỗ lực để kiểm soát các edge cases của UI Heatmap:

### Các Kịch Bản Kiểm Thử Biên & Phá Hoại (Edge-Cases):
1. **Division by Zero (Chia cho 0):** Khi backend trả về mảng rỗng và `MAX_COMPLETED` bằng 0, đảm bảo code frontend không gặp lỗi chia cho 0 (`ratio = count / 0`) dẫn đến giá trị `NaN` hoặc `Infinity` làm crash giao diện.
2. **Sai lệch dữ liệu ngày tháng (Invalid Dates):** Khi API trả về các ngày nằm ngoài khoảng 365 ngày qua hoặc ngày bị lỗi định dạng (ví dụ: rỗng hoặc chữ), frontend phải bỏ qua mà không làm crash Component.
3. **Năm nhuận & Chuyển giao năm:** Đảm bảo hàm sinh ngày `generateYearDays` xử lý chính xác sự thay đổi ngày khi đi qua năm nhuận hoặc tháng 2.
4. **Vượt quá số lượng cột (Layout Overflow):** Đảm bảo lưới Grid hiển thị cuộn ngang mượt mà trên mobile và không làm vỡ giao diện chung của ứng dụng khi kích thước màn hình nhỏ.
5. **Dữ liệu phân phối cực đoan:** Kiểm thử render với dữ liệu giả lập (mock data) chứa một ngày có 50 tasks hoàn thành (cực đại) và các ngày khác chỉ có 1 task để kiểm tra sự chênh lệch sắc độ màu rõ rệt của ô.

### Các bước thực hiện:
1. **Tạo Mock Data Edge Cases:** Thiết lập tập dữ liệu mock biên ngay trong component để chạy thử trước khi kết nối API.
2. **Kiểm thử thủ công & Tự động:** Chạy giao diện trên nhiều độ phân giải khác nhau và hover kiểm tra tooltip của từng ô.
3. **Git Commit:** Chỉ commit component sau khi nó đã vượt qua tất cả các kịch bản stress-test dữ liệu cực đoan ở trên.

---
*Tài liệu này được lưu trữ trực tuyến tại:*
* 📄 **Kế hoạch Heatmap:** [http://mymony.me/viewer?file=todo/plans/plan_heatmap.md](http://mymony.me/viewer?file=todo/plans/plan_heatmap.md)

