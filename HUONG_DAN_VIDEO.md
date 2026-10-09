# Đưa clip MP4 vào phần video giới thiệu

## Cập nhật website đang chạy

1. Dừng website bằng Ctrl+C trong Terminal đang chạy `npm start`.
2. Sao lưu thư mục website hiện tại. Giải nén ZIP bản mới vào một thư mục khác.
3. Từ thư mục `cong-doan-web` trong ZIP, chép đè `frontend`, `backend/src`, `backend/content`, `scripts`, `package.json` và các file hướng dẫn vào website hiện tại. Giữ nguyên `backend/storage` và `.env` của bạn: đây là nơi giữ nội dung, ảnh đã nhập và cấu hình.
4. Không nhập lại `backend/content/homepage.json` vào dữ liệu đang dùng.

## Nhập clip

Ví dụ, đặt clip tại `C:\AnhCongDoan\gioi-thieu.mp4`. Trong Terminal ở `C:\xampp\htdocs\cong-doan-web`, chạy:

```powershell
npm run video:set -- "C:\AnhCongDoan\gioi-thieu.mp4"
npm start
```

Đường dẫn phải trỏ tới file thật trên máy. Bạn có thể đổi tên và đường dẫn trong câu lệnh; không cần sửa JSON. Lệnh chỉ cập nhật video giới thiệu, giữ nguyên ảnh và nội dung khác.

Mở http://localhost:5173, nhấn Ctrl+F5 rồi bấm **Xem video giới thiệu**. Video có điều khiển phát/dừng, âm lượng, tua và toàn màn hình. Khi đóng cửa sổ, video dừng. Website không tự phát clip.

Nếu website đã chạy bản mới, mở Terminal thứ hai để chạy `video:set`, sau đó tải lại trang; không cần dừng server mỗi lần đổi clip.

## Nếu không phát được

MP4 là dạng chứa video; khả năng phát còn phụ thuộc codec. Nếu trình duyệt báo không hỗ trợ, xuất lại clip MP4 với video H.264 và âm thanh AAC. Chỉ đổi đuôi file sang `.mp4` sẽ không chuyển đổi video. Nếu báo ENOENT, kiểm tra tên file và đường dẫn thực tế.

FE và BE vẫn tách riêng. BE lưu clip và hỗ trợ đọc theo từng đoạn byte để tua; FE truyền dữ liệu dạng stream và dùng trình phát của trình duyệt. URL HTTPS cũ vẫn mở bằng liên kết như trước.
