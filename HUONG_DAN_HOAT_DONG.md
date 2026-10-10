# Trang Hoạt động & sinh hoạt
Đường dẫn: /su-kien/. Trang chủ → Sự kiện dẫn tới trang mới.
Nội dung: frontend/src/activities-content.js. Các bài đang là gợi ý, lịch chính thức để trống.
## Gắn ảnh
Đưa file JPG, JPEG, PNG, WEBP hoặc GIF vào backend/storage/media. Sửa trường trong activities-content.js thành đường dẫn /media/ten-file.webp:
- heroImage: ảnh đầu trang (ngang, khoảng 1400px).
- featuredImage: ảnh khối giới thiệu.
- stories[].image: ảnh từng bài (khoảng 800px).
- gallery[].src: ảnh thư viện; điền alt mô tả ảnh.
Giữ null nếu chưa có ảnh. Không dùng ảnh thay thế không rõ nguồn.
## Lịch đã xác nhận
Thêm phần tử vào schedule: {date:"2026-11-01",title:"Tên hoạt động",time:"Giờ đã xác nhận",location:"Địa điểm đã xác nhận"}.
Chỉ nhập lịch có thông tin chính thức.
## Kiểm tra
npm test
node scripts/build-preview.mjs
Trang được dựng HTML trên máy chủ và trong bản GitHub Pages. Bộ lọc, bài đọc chi tiết và thư viện ảnh được bổ sung bằng JavaScript.
Thay đổi ở nhánh feature/hoat-dong-sinh-hoat. GitHub Pages chính chỉ cập nhật sau khi PR được merge.
