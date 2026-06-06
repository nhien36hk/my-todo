# QUY TẮC TÁI CÁU TRÚC THỰC CHIẾN (PRAGMATIC REFACTORING RULES)

Tài liệu này định hình triết lý và tư duy cốt lõi khi thực hiện tái cấu trúc (refactoring) mã nguồn cho dự án này. Mọi Agent (AI) hoặc lập trình viên trước khi thực hiện chia tách file, hàm BẮT BUỘC phải đọc và tuân theo nguyên tắc này.

## 1. TRIẾT LÝ CỐT LÕI: "CLEAN CODE KHÔNG PHẢI LÀ BĂM NHỎ CODE"

Nhiều AI và Lập trình viên thường rơi vào một cái bẫy cực đoan: Cho rằng cứ tách thành hàng chục file nhỏ, viết hàng trăm hàm ngắn gọn thì đó là Clean Code. ĐIỀU ĐÓ LÀ SAI LẦM.

- Tách quá nhiều file/hàm sẽ phá vỡ luồng đọc (reading flow). Người (hoặc AI) khi đọc code sẽ phải nhảy liên tục qua lại giữa hàng tá file khác nhau (file jumping) chỉ để hiểu một logic đơn giản.
- Việc này gây ra Quá Tải Nhận Thức (Cognitive Overload), làm mất đi sự tập trung.
- Bản chất của Clean Code: Là giúp người đọc dễ hiểu nhất, mạch lạc nhất, chứ không phải là mù quáng tuân theo số lượng dòng code.

## 2. NGUYÊN TẮC CHIA TÁCH: "MỘT FILE - MỘT DÒNG SUY NGHĨ"

Thay vì chia tách theo kích thước (độ dài của file), hãy chia tách theo mạch tư duy (Context & Thoughts):

1. Single Responsibility (Trách nhiệm duy nhất): Một file hoặc một module chỉ nên gánh vác MỘT "suy nghĩ" duy nhất.
   - *Ví dụ:* Đừng nhét logic cập nhật UI (giao diện) chung với logic quản lý Network (Socket/API). Hãy tách chúng ra.
2. Giữ các phần liên quan ở gần nhau (Cohesion): Nếu 2 hoặc 3 hàm phối hợp vô cùng chặt chẽ để tạo thành một quy trình nghiệp vụ chung, hãy để chúng trong CÙNG MỘT FILE. Đừng tách ra 3 file khác nhau chỉ vì mỗi hàm dài 50 dòng. Mạch đọc từ trên xuống dưới trong 1 file bao giờ cũng tự nhiên hơn.
3. Tránh trừu tượng hóa thừa thãi (No Over-engineering): Đừng tạo ra các Class Interface hay Design Patterns rườm rà nếu tính năng đó chỉ dùng một lần.

## 3. CÁCH THỨC REFACTOR CHUẨN DÀNH CHO AI

Khi được yêu cầu Refactor mã nguồn, AI phải tư duy theo các bước sau:

- Bước 1 (Đọc & Phân tích): Xem xét file hiện tại đang gánh vác bao nhiêu vai trò (Networking, Data Fetching, UI Updating, File I/O).
- Bước 2 (Gom nhóm tư duy): Nhóm các đoạn code giải quyết cùng một vấn đề lại với nhau.
- Bước 3 (Quyết định tách):
  - Chỉ tách ra file mới khi một nhóm code có vai trò hoàn toàn độc lập với phần còn lại của file.
  - Khi tách file, cách đặt tên file và tên folder phải nói lên ngay lập tức "Tư duy" của file đó (VD: executor.js, router.js, session.js).
- Bước 4 (Review lại luồng đọc): Tưởng tượng một lập trình viên mới vào dự án, liệu họ đọc đoạn code vừa tách ra có thấy trơn tru, liền mạch không, hay phải nhảy file (Ctrl+Click) tới 5 lần để hiểu? Nếu nhảy quá nhiều -> Cần gộp lại.

## 4. KẾT LUẬN

Một kiến trúc tốt là kiến trúc biết CÂN BẰNG. Không viết "Spaghetti Code" (mọi thứ nhét chung 1 file nghìn dòng), nhưng cũng tuyệt đối không viết "Ravioli Code" (mọi thứ bị băm nát thành hàng trăm mẩu vụn lặt vặt). Hãy code để KỂ MỘT CÂU CHUYỆN LOGIC rõ ràng và liền mạch nhất!
