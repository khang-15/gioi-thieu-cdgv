# Xem trên điện thoại

Bản xem trước: https://khang-15.github.io/gioi-thieu-cdgv/

Trong GitHub, mở Settings → Pages → Source → GitHub Actions. Vào Actions, xem workflow Publish phone preview; khi thành công, mở đường link trên.

Workflow chạy kiểm thử và dựng hai trang HTML từ backend/content/*.json. Không cần chạy máy tính cá nhân. Sau khi thay đổi dữ liệu JSON hoặc giao diện trên main, bản xem trước được cập nhật tự động.

Bản xem trước không chạy SQLite hoặc trang quản trị. Video MP4 lớn được mở qua GitHub LFS; cần có đối tượng LFS và dung lượng phục vụ khả dụng. Nếu video không mở được, ảnh, trang và nhạc vẫn có thể xem bình thường.

Chạy thử build: node scripts/build-preview.mjs (Node.js 24+). Kết quả nằm trong dist. Không đưa database lên hosting tĩnh.
