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

## 4. Quy trình phát triển & Kiểm thử (Verification Steps)

1. **Xây dựng Heatmap Component:**
   - Tạo file [Heatmap.tsx](file:///root/my-todo/frontend/src/components/heatmap/Heatmap.tsx).
   - Thêm tính năng Tooltip khi hover vào từng ô để hiển thị thông tin dạng: `"3 việc đã hoàn thành vào ngày 06/06/2026"`.
2. **Kiểm thử thủ công (Verification):**
   - Hoàn thành 1 việc trong ngày hôm nay -> Kiểm tra ô của ngày hôm nay chuyển sang màu Mức 4 (vì `MAX_COMPLETED = 1`).
   - Tiếp tục thêm và hoàn thành thêm 3 việc nữa trong ngày hôm nay -> Ô ngày hôm nay vẫn màu Mức 4.
   - Sang ngày hôm sau (hoặc sửa dữ liệu DB của ngày hôm qua thành hoàn thành 1 việc) -> Kiểm tra ô ngày hôm qua chuyển sang màu Mức 1 hoặc Mức 2 (nhạt hơn vì ngày hôm nay đã có 4 việc hoàn thành làm mốc cực đại).
3. **Git Commit:** Khi biểu đồ nhiệt đã tự động đổi màu chính xác và mượt mà: `git add frontend/src/components/heatmap/ && git commit -m "feat(frontend): implement GitHub-style contribution heatmap component"`.

---
*Tài liệu này được lưu trữ trực tuyến tại:*
* 📄 **Kế hoạch Heatmap:** [http://mymony.me/viewer?file=todo/plans/plan_heatmap.md](http://mymony.me/viewer?file=todo/plans/plan_heatmap.md)
