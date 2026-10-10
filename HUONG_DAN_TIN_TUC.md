# Tin tức & thông báo
Trang /tin-tuc/. Chọn Tin tức từ trang chủ.
## Cập nhật bài và ảnh
Nội dung trong frontend/src/news-content.js. Mỗi bài có id duy nhất, category, title, summary, body (mảng đoạn văn), image, alt, caption, kind và status.
Ảnh: đặt JPG/JPEG/PNG/WEBP/GIF vào backend/storage/media; image là /media/ten-file.webp. Giữ null khi chưa có ảnh. Gợi ý ảnh ngang khoảng 1200px cho bài nổi bật, 800px cho thẻ.
featuredId là id bài nổi bật. Thông báo dùng category: thong-bao.
Các bài ban đầu có status: sample, date: null. Chỉ đổi status thành published sau khi đã xác nhận nội dung. Giao diện hiện không dùng ngày để sắp xếp: thứ tự bài theo mảng.
Tìm kiếm hỗ trợ không dấu và lọc kết hợp chủ đề. Liên kết bài có dạng /tin-tuc/#bai=id; nút sao chép hoạt động trên HTTPS.
Không có trang quản trị tải ảnh ở giai đoạn này.
## Kiểm tra
npm test
node scripts/build-preview.mjs
PR kiểm tra cú pháp JavaScript của bản dựng; thư mục dist được đính kèm ở Actions.
GitHub Pages chính chỉ cập nhật sau khi PR được duyệt và merge.
