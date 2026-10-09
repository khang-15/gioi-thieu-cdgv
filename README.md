## Mới: Nhạc tự phát và nút nhỏ

Website thử phát nhạc khi mở trang hoặc F5; nếu trình duyệt chặn, phát ở thao tác đầu tiên. Đã bỏ bảng điều khiển lớn, chỉ giữ nút nốt nhạc nhỏ để tắt/bật. Xem `HUONG_DAN_NHAC_NEN.md`. Khi cập nhật giữ nguyên `backend/storage` và không nhập lại dữ liệu.

## Mới: Thanh cuộn danh sách tổ và nhạc nền

Xem `HUONG_DAN_NHAC_NEN.md`. Nhập nhạc bằng `npm run music:set -- "đường-dẫn-file.mp3"`. Giữ nguyên dữ liệu hiện tại khi cập nhật, không nhập lại danh sách tổ. ZIP chưa kèm file âm thanh.

## Cập nhật: Các tổ

Mục ban, nhóm nay là bốn tổ với số tổ, tổ trưởng, tổ phó và danh sách thành viên. Xem `HUONG_DAN_CAC_TO.md`; dùng `npm run teams:export -- cac-to.json` và `npm run teams:import -- cac-to.json` để cập nhật tên. Hướng dẫn ban, nhóm cũ bên dưới đã được thay bằng hướng dẫn các tổ.

## Thêm video MP4 giới thiệu

Xem `HUONG_DAN_VIDEO.md`. Bản này hỗ trợ phát và tua MP4 trực tiếp trong cửa sổ giới thiệu.

# Cập nhật bốn chiều kích đào tạo

Dải năm mục được thay bằng Thiêng liêng, Nhân bản, Tri thức và Mục vụ. Máy tính hiển thị bốn cột; điện thoại hiển thị hai hàng, mỗi hàng hai cột. Các điểm điều hướng bên cạnh hero cũng được đồng bộ với bốn mục.

Cập nhật: dừng website bằng Ctrl+C; sao lưu backend/storage; chép đè frontend, backend/src, backend/content và package.json từ ZIP vào dự án hiện tại. Giữ backend/storage và .env. Chạy npm start và nhấn Ctrl+F5. Không import homepage mẫu và không xóa database. BE tự cập nhật riêng bốn mục một lần, giữ nguyên ảnh và các nội dung còn lại.

Mô tả bốn mục là nội dung gợi ý, có thể chỉnh qua xuất/nhập nội dung hiện tại. File backend/content/formation.json cung cấp nội dung cho lần nâng cấp; sửa file này sau khi nâng cấp không tự thay database đã lưu.

Đã đạt 9 kiểm tra tự động, bao gồm kiểm tra nâng cấp chỉ thay values và hero.steps, giữ nguyên mọi nội dung và ảnh khác. Chưa kiểm tra bố cục trực tiếp bằng trình duyệt Windows.

---

# Mục Các ban, nhóm đã được phát triển

Xem [HUONG_DAN_BAN_NHOM.md](HUONG_DAN_BAN_NHOM.md) để cập nhật bản đang có ảnh, nhập nội dung và gắn ảnh ban, nhóm. Bản này có thẻ giới thiệu và cửa sổ chi tiết; các thẻ hiện là khung chờ tên ban, nhóm thực tế.

**Quan trọng:** Giữ nguyên `backend/storage` khi cập nhật. Dùng `groups:import` để chỉ thay nội dung ban, nhóm; không import toàn bộ homepage mẫu vào dữ liệu đã có ảnh.

---

# Cập nhật giao diện v2 — Cộng đoàn Dự tu Gò Vấp

## Cập nhật từ bản đang chạy

1. Nhấn Ctrl+C để dừng website.
2. Sao lưu thư mục `backend/storage` trước khi cập nhật.
3. Giải nén ZIP mới vào thư mục tạm; chép đè toàn bộ thư mục `frontend`, `backend/src`, `backend/content` và file `package.json`, `README.md` vào dự án hiện tại. Khi Windows hỏi, chọn thay thế các file trùng tên.
4. Giữ nguyên `backend/storage` và `.env` hiện có. Không cần xóa database hoặc import lại JSON.
5. Chạy `npm start`, mở http://localhost:5173 rồi nhấn Ctrl+F5.

BE sẽ tự nâng cấp tên cũ `Xuân Lộc Gò Vấp` thành `Gò Vấp` một lần. Ảnh, liên hệ, bài viết và dữ liệu riêng được giữ nguyên. Không thay tên `Giáo phận Xuân Lộc` vì đó là thông tin khác.

## Thay đổi v2

- Font Sans và Serif hỗ trợ tiếng Việt được đóng gói trong `frontend/src/fonts`; chạy không cần tải font từ Internet. Có giấy phép font kèm theo.
- Chuẩn hóa Unicode NFC; bỏ khoảng cách chữ âm; tăng khoảng cách dòng để tránh dấu bị tách hoặc chồng.
- Hero xuất hiện theo từng từ, ánh sáng chuyển động, hạt sáng vàng, chiều sâu khi cuộn.
- Thanh điều hướng kính mờ khi cuộn, vạch tiến độ đọc, nội dung xuất hiện theo nhịp, nút phản hồi nhẹ theo chuột và thẻ bắt ánh sáng khi rê chuột.
- Hạt sáng dừng khi hero không còn trong màn hình hoặc tab bị ẩn; hiệu ứng tắt/giảm khi hệ điều hành yêu cầu giảm chuyển động. Điện thoại không có hiệu ứng rê chuột.
- Không thay ảnh chờ bằng ảnh giả; các vị trí ảnh vẫn chờ ảnh thật của cộng đoàn.

Kiểm tra v2: 6 bài kiểm tra tự động đạt, bao gồm nâng cấp dữ liệu giữ ảnh/nội dung và đường dẫn Windows/Linux. Luồng FE–BE, file font, module hiệu ứng, nhập/xuất và phục vụ ảnh đã đạt. Đã xác nhận bộ font có glyph tiếng Việt. Chưa kiểm tra bố cục và animation bằng trình duyệt thực trong môi trường đóng gói; cần xem lại trực tiếp trên máy Windows của bạn.

---

# Website Cộng đoàn Dự tu Gò Vấp

Trang chủ dựng theo ảnh tham chiếu: header, hero tông xanh tối và vàng, năm giá trị, tin tức và sự kiện đặt cạnh nhau, banner hành trình ơn gọi. Các vị trí ảnh để khung chờ. Menu ban/nhóm, thư viện và liên hệ dẫn đến các mục ngắn phía dưới, chưa phải những trang riêng của giai đoạn 1.

## 1. Chạy trên Windows / VS Code

Cần **Node.js 24 trở lên** (bản thông thường, gồm npm). Không cần Docker hay cài phần mềm database. Không có package bên ngoài nên không cần `npm install`.

1. Giải nén ZIP.
2. Mở thư mục `cong-doan-web` trong VS Code.
3. Mở Terminal (CMD hoặc PowerShell), tại thư mục có `package.json`.
4. Chạy:

```bash
node --version
npm start
```

5. Truy cập **http://localhost:5173**.
6. Dừng bằng **Ctrl+C**.

Hoặc nhấp đúp `start-windows.cmd` nếu Node.js đã có trong PATH.

Chạy riêng trong hai Terminal:

```bash
npm run start:be
```

```bash
npm run start:fe
```

FE: http://localhost:5173 · BE: http://127.0.0.1:4000 · kiểm tra BE: http://127.0.0.1:4000/health.

Nếu bị trùng cổng, sao chép `.env.example` thành `.env`, sửa `FE_PORT` và `BE_PORT`, rồi khởi động lại. Nếu BE chạy trên máy khác, đặt `API_URL` ở FE. Mặc định cả hai chỉ nhận kết nối trên máy của bạn. Không mở cổng ra Internet trước khi bổ sung bảo vệ và cấu hình triển khai phù hợp.

## 2. FE và BE tách riêng

```text
cong-doan-web/
  frontend/
    index.html
    server.mjs          máy chủ FE và proxy API/media
    src/app.js          render từ dữ liệu API và tương tác
    src/styles.css      giao diện, responsive, animation
    src/icons.js        biểu tượng giao diện
  backend/
    src/server.mjs      HTTP API đọc dữ liệu và phục vụ ảnh
    src/repository.mjs  kiểm tra nội dung, truy cập SQLite
    src/content-cli.mjs nhập/xuất nội dung, gắn ảnh
    content/homepage.json dữ liệu khởi tạo, chỉnh sửa được
    storage/           database và ảnh được tạo lúc chạy
  scripts/start.mjs    khởi động hai tiến trình độc lập
```

FE không import dữ liệu từ thư mục BE và không truy cập database. FE gọi `/api/homepage`; máy chủ FE proxy tới BE. BE quản lý SQLite và ảnh. Có thể chuyển FE, BE sang máy khác nhau bằng cấu hình URL.

Giao diện dùng HTML/CSS/JavaScript module. BE dùng Node.js HTTP và SQLite tích hợp. Đây là lựa chọn ít phụ thuộc, dễ chạy bản ZIP. Không phải dự án Next.js/NestJS.

## 3. Nội dung không hard code trong giao diện

Tên cộng đoàn, menu, hero, câu trích dẫn, năm giá trị, bài viết, sự kiện, banner ơn gọi, thư viện, liên hệ đều nằm trong dữ liệu BE. CSS/bố cục và những thông báo dự phòng khi API không hoạt động thuộc mã giao diện. Nội dung ban đầu lấy từ `backend/content/homepage.json`, sau đó lưu bền vững vào `backend/storage/community.sqlite`.

**Lưu ý:** Những bài viết và ngày sự kiện trong bản mẫu là nội dung minh họa theo ảnh thiết kế, không phải thông tin hoạt động được xác nhận. Sự kiện mẫu có ngày năm 2024 và giữ thứ tự nhập liệu để khớp ảnh; chưa có chức năng tự lọc lịch tương lai. Thông tin lịch sử, người phụ trách, địa chỉ liên hệ chưa được tự bịa thêm. Hãy cập nhật dữ liệu trước khi công bố.

### Cập nhật nội dung lần đầu

Sửa `backend/content/homepage.json`, sau đó chạy tại thư mục gốc:

```bash
npm run content:import -- backend/content/homepage.json
```

Tải lại trang để xem thay đổi. Sửa JSON đơn thuần không thay đổi database đã được khởi tạo; phải chạy lệnh import.

### Cập nhật sau khi đã gắn ảnh

Xuất dữ liệu hiện tại trước để giữ các đường dẫn ảnh:

```bash
npm run content:export -- content-current.json
```

Sửa file vừa xuất, rồi nhập lại:

```bash
npm run content:import -- content-current.json
```

Các lệnh import/export thao tác toàn bộ nội dung trang chủ. Trước khi import nên xuất một bản sao lưu. Chưa có dashboard quản trị hoặc đăng nhập; việc chỉnh nội dung hiện thực hiện bằng các lệnh trên.

## 4. Đưa ảnh của bạn vào

Hỗ trợ JPG, PNG, WEBP, GIF. Có thể dùng đường dẫn tuyệt đối, đặt trong dấu nháy nếu có khoảng trắng. Lệnh sao chép ảnh vào kho BE và cập nhật database, không phải sửa code FE.

```bash
npm run media:set -- "C:\Anh\anh-tap-the.jpg" hero
npm run media:set -- "C:\Anh\logo.png" logo
npm run media:set -- "C:\Anh\on-goi.jpg" journey
npm run media:set -- "C:\Anh\thanh-le.jpg" news:news-0
npm run media:set -- "C:\Anh\tinh-tam.jpg" news:news-1
npm run media:set -- "C:\Anh\bac-ai.jpg" news:news-2
npm run media:set -- "C:\Anh\sinh-hoat.jpg" gallery:gallery-0
```

Sau đó tải lại trang. Muốn bỏ ảnh, xuất JSON, đổi trường ảnh tương ứng thành `null`, rồi import lại. Ảnh cũ vẫn nằm trong thư mục media, có thể dọn thủ công khi chắc chắn không còn dùng. `hero`/`journey`/`news` dùng trường `image`; thư viện dùng `src`; logo dùng `brand.logo`.

Gợi ý ảnh: hero ngang rộng 1920×900, tin tức 800×450, banner ơn gọi 1600×500. Logo chưa có sẽ dùng khung và dấu thánh giá đơn giản làm vị trí chờ, không giả lập logo chính thức.

## 5. Video và liên hệ

Đặt `hero.videoUrl` thành URL HTTPS của video chính thức; nút sẽ mở liên kết video trong tab mới. Nếu `null`, hiển thị trạng thái đang cập nhật. Bản này chưa nhúng trình phát YouTube.

Điền `contact.email`, `contact.phone`, `contact.address` và `contact.links` trong JSON. Liên kết có dạng `{ "label": "Kênh chính thức", "url": "https://..." }`.

## 6. Có gì hoạt động

- Menu responsive và chuyển đến các mục trên trang.
- Tìm kiếm tin tức/sự kiện, mở chi tiết và xem tất cả.
- Xem thư viện ảnh bằng cửa sổ chi tiết.
- Các điểm hành trình dẫn đến giá trị tương ứng.
- Hiệu ứng xuất hiện khi cuộn, hover; giảm chuyển động theo cài đặt hệ điều hành.
- Lưu nội dung/đường dẫn ảnh trong SQLite sau khi tắt và bật lại.
- API công khai chỉ đọc; thay đổi nội dung qua CLI trên máy.

Không bao gồm quản lý thành viên, đăng ký sự kiện, dashboard quản trị hay các trang độc lập khác. Những phần này sẽ được phát triển sau.

## 7. Kiểm tra và sao lưu

```bash
npm test
```

Các kiểm tra bao gồm nội dung tồn tại sau khi mở lại database, API lấy dữ liệu mới, API từ chối ghi và đường dẫn file nội bộ, import từ chối ID trùng/ảnh sai định dạng.

Sao lưu: dừng website, sao chép toàn bộ `backend/storage` và file JSON đã xuất. ZIP nguồn không kèm database phát sinh trong lần kiểm tra; khi chạy lần đầu sẽ tự tạo database bằng dữ liệu khởi tạo.

## 8. Phạm vi kiểm tra bản bàn giao

Đã chạy kiểm tra tự động database/API và kiểm tra tích hợp FE–BE, proxy, nhập/xuất nội dung, cập nhật ảnh. Đã kiểm tra render dữ liệu FE và escape HTML ở mức mã. Chưa thực hiện được kiểm tra bố cục/hành vi bằng trình duyệt thực trong môi trường tạo ZIP; responsive và hiệu ứng đã được viết nhưng cần xem lại trực tiếp trên máy của bạn. Bố cục bám ảnh tham chiếu, không cam kết khớp từng pixel, đặc biệt khi ảnh nền đang để trống.

## Bản sửa tương thích Windows

Đã sửa HTTP 404 do kiểm tra đường dẫn dùng dấu phân cách Linux. Có kiểm tra mô phỏng đường dẫn Windows và Linux cho trang chủ, CSS/JS và chặn truy cập file nội bộ. Nếu cập nhật từ bản trước, dừng website và chỉ thay `frontend/server.mjs`; giữ nguyên `backend/storage` để không mất dữ liệu hoặc ảnh.
