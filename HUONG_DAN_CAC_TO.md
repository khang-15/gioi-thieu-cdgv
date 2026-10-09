# Danh sách tổ đã điền theo ảnh 2026–2027

Đã điền 66 người gồm tên thánh và họ tên, theo thứ tự trong hai ảnh: Tổ 1 (17), Tổ 2 (16), Tổ 3 (16), Tổ 4 (17). Bỏ hai dòng trống số 17 của tổ 2 và tổ 3. Giữ cách viết tên thánh trong ảnh, kể cả các dạng viết tắt.

Ảnh không ghi tổ trưởng/tổ phó, nên hai trường chức vụ để trống. Không suy ra chức vụ từ thứ tự hay màu nền hàng.

## Áp dụng vào website đang dùng bản bốn tổ

Giải nén ZIP, chép file `cac-to.json` vào thư mục website hiện tại (cùng cấp `package.json`). Mở Terminal tại thư mục đó rồi chạy:

```powershell
npm run teams:import -- cac-to.json
```

Ctrl+F5 ở trang web để thấy danh sách. Không cần chép đè mã nguồn nếu đã dùng bản có bốn tổ. Lệnh chỉ thay mục Các tổ, giữ logo, ảnh, video, tin tức và nội dung mục khác. Có thể sao lưu danh sách cũ trước bằng `npm run teams:export -- cac-to-cu.json`.

Nếu chưa cập nhật bản bốn tổ: dừng website, sao lưu thư mục, chép đè `frontend`, `backend/src`, `backend/content`, `package.json` từ ZIP. Giữ nguyên `backend/storage` và `.env`. Sau đó nhập `cac-to.json` bằng lệnh trên, chạy `npm start` rồi Ctrl+F5.

## Bổ sung chức vụ

Mở `cac-to.json`, sửa `leader` thành tên tổ trưởng, `deputy` thành tên tổ phó cho từng tổ, lưu UTF-8 và chạy lại lệnh nhập. `members` là danh sách đầy đủ, bao gồm cả người giữ chức vụ; không cần xóa họ khỏi danh sách. Giữ đúng bốn tổ với số 1–4 không trùng.
