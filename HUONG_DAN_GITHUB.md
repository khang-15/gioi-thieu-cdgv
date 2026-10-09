# Đẩy website từ máy Windows lên GitHub

Kho: https://github.com/khang-15/gioi-thieu-cdgv

Lần thực hiện qua kết nối GitHub của trợ lý bị từ chối ghi (403 Resource not accessible by integration), chưa có file nào được đẩy. Chạy các bước sau trên máy bạn để dùng quyền đăng nhập GitHub của bạn và lấy đúng dữ liệu hiện tại.

## Chuẩn bị

Chép file `.gitignore` trong ZIP vào `C:\xampp\htdocs\cong-doan-web`, cùng cấp `package.json`. Không cần chép đè mã nguồn hoặc dữ liệu hiện tại.

Mở Terminal PowerShell ở thư mục này và chạy:

```powershell
cd C:\xampp\htdocs\cong-doan-web
git --version
npm run content:export -- backend/content/homepage.json
git init
git branch -M main
git remote add origin https://github.com/khang-15/gioi-thieu-cdgv.git
git add .
git status
git commit -m "Them website Cong doan Du tu Go Vap"
git push -u origin main
```

Lệnh export ghi nội dung hiện tại (gồm phân tổ, chức vụ, đường dẫn ảnh/nhạc/clip) vào file khởi tạo để máy khác có thể chạy bản đúng dữ liệu của bạn. Không thay database đang dùng. Git đưa các file media trong `backend/storage/media` lên cùng mã nguồn. `.gitignore` bỏ qua `.env`, database SQLite lúc chạy, thư mục storage cũ ở gốc và node_modules.

Nếu Git báo `remote origin already exists`, kiểm tra `git remote -v`. Nếu cần đổi sang kho này:

```powershell
git remote set-url origin https://github.com/khang-15/gioi-thieu-cdgv.git
```

Nếu thiếu thông tin tác giả, dùng tên và email GitHub của bạn:

```powershell
git config user.name "Ten GitHub cua ban"
git config user.email "Email GitHub cua ban"
```

Sau đó chạy lại commit và push. Khi cửa sổ đăng nhập xuất hiện, đăng nhập tài khoản khang-15. Nếu chưa có Git, cài Git for Windows rồi mở lại VS Code.

Nếu kho đã có commit khác và push bị từ chối, không force push. Gửi thông báo lỗi để được hướng dẫn đồng bộ lịch sử. Nếu file video/nhạc quá lớn bị GitHub từ chối, cần đưa file đó qua Git LFS hoặc dịch vụ lưu file; force push không xử lý được lỗi kích thước.

## Sau khi đẩy

Vào trang kho để kiểm tra các thư mục frontend, backend, scripts và file package.json. Trên máy khác, dùng Node.js 24 trở lên và chạy `npm start`, mở http://localhost:5173. Dự án không dùng gói npm ngoài nên không cần npm install. GitHub Pages không chạy được BE Node.js/SQLite của dự án.
