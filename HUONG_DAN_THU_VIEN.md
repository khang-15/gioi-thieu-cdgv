# Thư viện ảnh & video — Google Drive
Trang /thu-vien/, vào từ menu Thư viện trên trang chủ.
Nội dung: frontend/src/library-content.js.
## Bổ sung Drive
Mỗi album có driveUrl: null. Thay null bằng link HTTPS Google Drive, ví dụ "https://drive.google.com/drive/folders/ID" hoặc "https://drive.google.com/file/d/ID/view".
Link hợp lệ mở trong tab mới. Link trống hoặc không hợp lệ để nút ở trạng thái Đang cập nhật. Trang không nhúng Drive, không tải ảnh/video từ Drive.
Cần thiết lập quyền xem thư mục/file trên Drive theo đối tượng bạn muốn chia sẻ.
## Bổ sung ảnh bìa
Đưa JPG/JPEG/PNG/WEBP/GIF vào backend/storage/media. Sửa cover thành "/media/ten-anh.webp"; alt là mô tả ảnh. Giữ null nếu chưa có ảnh.
## Bổ sung album
Mỗi album gồm id duy nhất, type ("photo" hoặc "video"), title, description, cover, alt, driveUrl. featuredId chọn album nổi bật.
Không đặt số lượng ảnh, ngày sự kiện hay thông tin chưa xác nhận.
## Kiểm tra
npm test
node scripts/build-preview.mjs
CI kiểm tra bộ lọc, link Drive, trạng thái trống, tuyến trang và cú pháp JavaScript bản dựng.
Nhánh feature/thu-vien-drive, chờ duyệt PR trước khi merge.
