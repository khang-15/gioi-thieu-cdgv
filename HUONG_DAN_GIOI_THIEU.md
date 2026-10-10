# Trang Giới thiệu Cộng đoàn

Đường dẫn: http://localhost:5173/gioi-thieu

Trang chủ có menu Giới thiệu và nút Tìm hiểu Cộng đoàn nối tới trang mới. Bố cục: mở đầu, chúng tôi là ai, bốn chiều kích đào luyện, đời sống huynh đệ, khoảnh khắc và lời mời kết nối. Ảnh chính lấy từ trang chủ nếu chưa nhập ảnh riêng; ba ảnh sinh hoạt dùng lại thư viện hiện tại.

Nội dung được soạn như lời giới thiệu và định hướng; không khẳng định năm thành lập, người sáng lập, cơ cấu pháp lý hay lịch sinh hoạt chưa được xác nhận. Vui lòng chỉnh thông tin theo thực tế cộng đoàn khi có dữ liệu chính thức.

Hiệu ứng: khối thánh giá với các vòng 3D CSS, ảnh nghiêng nhẹ theo con trỏ, ánh sáng trên thẻ, xuất hiện từng phần khi cuộn, thanh tiến độ đọc, ảnh chuyển động chậm và bố cục thích ứng. Tôn trọng tùy chọn giảm chuyển động của hệ điều hành; không chạy hiệu ứng nghiêng trên màn hình cảm ứng.

## Cài cập nhật bằng Terminal

Tải `cap-nhat-gioi-thieu.mjs`, giữ trong Downloads. Dừng npm start bằng Ctrl+C rồi chạy tại thư mục dự án:

```powershell
node "$env:USERPROFILE\Downloads\cap-nhat-gioi-thieu.mjs"
npm start
```

Trình cập nhật kiểm tra mã hiện tại, sao lưu các file mã sẽ thay, thêm trang mới và lệnh nội dung. Không thay homepage.json, cac-to.json, .env, database hay file media. Khi mở BE, dữ liệu giới thiệu được tạo riêng nếu chưa có; không ghi đè nội dung trang chủ.

Nếu đã sửa mã nguồn ngoài bản hiện tại, trình cập nhật dừng và báo file khác phiên bản trước khi thay đổi. Gửi thông báo đó để điều chỉnh bản cập nhật theo mã đang dùng.

## Sửa văn bản trực tiếp bằng Terminal

```powershell
npm run about:set -- identity.title "Một mái nhà huynh đệ"
npm run about:set -- hero.description "Lời giới thiệu mới của cộng đoàn."
npm run about:set -- formation.items.0.description "Mô tả chiều kích Thiêng liêng."
```

Tải lại trang để thấy nội dung mới. Có thể dùng chuỗi `\n` trong văn bản để xuống dòng ở tiêu đề. Nếu cần chỉnh nhiều mục:

```powershell
npm run about:export -- gioi-thieu.json
code gioi-thieu.json
npm run about:import -- gioi-thieu.json
```

Các lệnh chỉ cập nhật dữ liệu trang giới thiệu. Dữ liệu được lưu trong bảng riêng trong database BE. API `/api/about` chỉ đọc; không có API ghi công khai hay trang quản trị ở bước này.

## Ảnh riêng cho trang giới thiệu

```powershell
npm run media:set -- "C:\AnhCongDoan\anh-gioi-thieu.jpg" about
```

Nếu không thêm ảnh riêng, trang dùng ảnh toàn cộng đoàn hiện tại.

## Lưu thay đổi nội dung cho lần cài mới

Sửa bằng about:set/import cập nhật database đang chạy. Để giữ nội dung đó khi clone mới, xuất dữ liệu trước khi commit:

```powershell
npm run about:export -- backend/content/about.json
git add frontend backend/src backend/content/about.json package.json HUONG_DAN_GIOI_THIEU.md .gitignore
git commit -m "Them trang gioi thieu cong doan"
git push origin main
```

Nếu thêm ảnh riêng, đưa cả file đó trong backend/storage/media vào commit. Với phiên bản chạy mới từ GitHub, Node.js 24 trở lên, chạy npm start. Nhạc nền trên trang giới thiệu dùng cấu hình/file nhạc hiện tại của trang chủ và chính sách tự phát của trình duyệt.

## Bốn khung ảnh 3D ở đầu trang

Khung trống mặc định, không tự lấy ảnh trang chủ. Điền từng ảnh bằng Terminal:

```powershell
npm run media:set -- "C:\AnhCongDoan\anh1.jpg" about:1
npm run media:set -- "C:\AnhCongDoan\anh2.jpg" about:2
npm run media:set -- "C:\AnhCongDoan\anh3.jpg" about:3
npm run media:set -- "C:\AnhCongDoan\anh4.jpg" about:4
npm run about:set -- hero.images.0.caption "Đời sống cầu nguyện"
```

Dùng đường dẫn ảnh thật, rồi Ctrl+F5. Chỉ số chú thích bắt đầu từ 0, vị trí ảnh bắt đầu từ 1.
File cập nhật nằm ngay thư mục gốc dự án: `capnhatgioithieu.mjs` (cùng cấp package.json).
Chạy tại thư mục dự án: `node .\capnhatgioithieu.mjs`. File có thể đưa lên Git cùng mã nguồn.
