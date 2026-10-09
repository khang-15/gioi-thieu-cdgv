# Thanh cuộn và nhạc nền tự phát Xin giữ con

Danh sách thành viên mỗi tổ có thanh cuộn riêng với chiều cao 275px (250px trên điện thoại). Đưa chuột vào danh sách để cuộn; cũng có thể Tab tới danh sách và dùng phím mũi tên.

## Cập nhật mà giữ nguyên dữ liệu hiện tại

Dừng website bằng Ctrl+C và sao lưu thư mục. Giải nén ZIP mới vào thư mục khác, chép đè `frontend`, `backend/src`, `backend/content`, `package.json` cùng các hướng dẫn vào website hiện tại. Giữ nguyên `backend/storage` và `.env`, rồi chạy `npm start` và Ctrl+F5.

Không nhập lại `cac-to.json` hoặc `homepage.json` khi chỉ cập nhật chức năng này: danh sách và chức vụ bạn đã chỉnh được giữ trong dữ liệu hiện tại. Bản nâng cấp chỉ bổ sung cấu hình nhạc nếu chưa có.

## Đưa bản thu vào

Bản này chưa kèm file âm thanh. Đặt bản thu Xin giữ con trên máy, ví dụ `C:\AnhCongDoan\xin-giu-con.mp3`. Mở Terminal thứ hai tại thư mục website rồi chạy:

```powershell
npm run music:set -- "C:\AnhCongDoan\xin-giu-con.mp3"
```

Tên file và đường dẫn phải khớp file thật của bạn. Hỗ trợ MP3, M4A, OGG, WAV. Tải lại trang bằng Ctrl+F5. Website thử tự phát nhạc khi mở trang hoặc F5. Nếu trình duyệt chặn tự phát có tiếng, nhạc bắt đầu khi bạn bấm/chạm hoặc nhấn phím lần đầu trên trang. Không cần bảng điều khiển hay thanh âm lượng; chỉ có một nút nốt nhạc nhỏ ở góc dưới để tắt/bật. Âm lượng lấy từ cấu hình BE (mặc định 30%). Nhạc phát lặp. Không thể bảo đảm tự phát có tiếng trên mọi trình duyệt vì quyền này do trình duyệt quyết định. Khi phát video giới thiệu, nhạc dừng để không chồng âm thanh; có thể bật lại bằng nút sau khi xem xong.

Lệnh chỉ cập nhật file nhạc, giữ các ảnh, video và danh sách tổ. File được chép vào BE, FE nhận đường dẫn từ API; không phải sửa mã giao diện.

Muốn đổi tên bài hiển thị, truyền thêm tên:

```powershell
npm run music:set -- "C:\AnhCongDoan\bai-khac.mp3" "Tên bài khác"
```

Nếu báo ENOENT: kiểm tra file đã nằm đúng đường dẫn. Nếu báo không phát được: thử bản MP3 hoặc M4A tương thích trình duyệt. Không đổi đuôi file để thay cho chuyển định dạng.
