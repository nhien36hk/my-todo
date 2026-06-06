# Kế hoạch Cải tiến Heatmap (Lọc theo Năm Calendar)

## 1. Ngữ cảnh (Context)
Hiện tại, `Heatmap.tsx` đang render cố định 365 ngày lùi về quá khứ tính từ hôm nay. Tuy nhiên, hành vi đúng chuẩn của Heatmap (giống Github) thường là hiển thị dữ liệu theo từng năm Dương lịch (từ 01/01 đến 31/12). 

**Yêu cầu:**
- Heatmap phải hiển thị trọn vẹn 1 năm.
- Có bộ lọc (dropdown) để chọn năm ở góc phải.
- Bộ lọc này chỉ hiển thị "Năm hiện tại" và các "Năm trong quá khứ có chứa dữ liệu hoàn thành" (Nếu 2025 không có dữ liệu, sẽ không hiển thị 2025).

## 2. Kế hoạch (80% Planning)

### 2.1 Thu thập các Năm hợp lệ (Available Years)
- Lặp qua mảng `data` (danh sách `HeatmapData` fetch từ backend).
- Parse trường `date` (VD: "2026-06-06") để lấy ra năm (`2026`).
- Thu thập bằng một `Set<number>` để loại bỏ trùng lặp.
- Đảm bảo `năm hiện tại (new Date().getFullYear())` luôn có trong Set dù có hay không có data.
- Sắp xếp mảng năm theo thứ tự giảm dần (VD: `[2026, 2025]`).

### 2.2 Quản lý State
- Thêm state `selectedYear` vào `Heatmap.tsx` (kiểu `number`), mặc định là năm hiện tại.
- Thêm dropdown `<select>` ở header của component.

### 2.3 Tính toán mảng số ngày trong năm (Days Array)
Thay vì lặp 365 lần ngược từ hôm nay, chúng ta sẽ:
- Tìm ngày `01/01/{selectedYear}`.
- Nếu ngày 01/01 không phải là Chủ nhật (với Chủ nhật = 0), chúng ta phải thêm một số ô `padding` (rỗng) vào mảng đầu tiên để căn lề đúng thứ tự trong lưới `grid-rows-7`. (Ví dụ: 01/01 là Thứ 4, tức là index 3 -> Thêm 3 ô padding trống không có data).
- Tính tổng số ngày trong năm (365 hoặc 366 với năm nhuận).
- Lặp từ ngày 1 đến ngày cuối cùng của năm, thêm dữ liệu vào `days` array. Cấu trúc array phải tương thích với thuật toán `map` đang có ở `grid-flow-col grid-rows-7`.

### 2.4 Cập nhật Month Labels
- Điều chỉnh thuật toán tính toán `monthLabels` cho phù hợp với mảng `days` mới (vì số cột có thể lên đến 54 cột).

## 3. Thực thi (5% Implementation)
- Cập nhật file `frontend/src/components/heatmap/Heatmap.tsx`.
- Gắn các rule về UI: dropdown cần đẹp, màu đồng nhất (màu kẽm tối, viền xanh).

## 4. Kiểm Thử (15% Testing)
- Verify năm hiện tại là mặc định.
- Verify khi chọn 1 năm không có data, tất cả các ô đều màu tối.
- Verify ngày đầu tiên của năm bắt đầu đúng hàng (Ví dụ: Thứ tư nằm ở hàng thứ 4).
- Verify Grid không bị bể hoặc lấn cột quá mức.
