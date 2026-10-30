# AI Image Translator

**Dịch chữ trong ảnh trên website và trang PDF bằng Google Gemini.**

AI Image Translator là extension dành cho Chrome, Edge và các trình duyệt có hỗ trợ tương tự. Bạn chọn ảnh hoặc chụp một vùng PDF, ứng dụng nhận diện chữ rồi dịch sang tiếng Việt, tiếng Anh hoặc tiếng Nhật. Với chế độ **Thay chữ trên ảnh**, bản dịch được đặt lên vùng chữ gốc để bạn đọc ngay trong bố cục của ảnh.

Phù hợp để đọc truyện tranh, ảnh hướng dẫn, tài liệu và các trang PDF có nội dung bằng ngôn ngữ khác.

> Ứng dụng gồm **extension trong trình duyệt** và **ứng dụng chạy trên Windows**. Hãy giữ ứng dụng Windows hoạt động khi dịch. Mỗi người dùng cần có Gemini API key riêng và kết nối Internet.

## Có thể làm gì?

| Chức năng | Cách hoạt động |
| --- | --- |
| Dịch ảnh trên website | Chọn ảnh, nhận bản dịch trong bảng nổi hoặc đặt bản dịch lên ảnh. |
| Thay chữ trên ảnh | AI xác định vùng chữ; ứng dụng che chữ gốc bằng màu nền đơn và chèn bản dịch. Có thể bật/tắt để so sánh. |
| Chụp ảnh mới | Chọn ảnh khác ngay từ bảng dịch, không cần mở lại popup. |
| Chụp lại | Chụp mới ảnh vừa chọn, hoặc ảnh lớn nhất đang hiển thị nếu ảnh cũ không còn trên màn hình. |
| Xử lý ảnh bị chặn đọc | Khi website chặn đọc ảnh gốc, ứng dụng thử chụp phần ảnh đang hiển thị để dịch. |
| Dịch trang PDF | Chụp phần PDF đang hiển thị, khoanh vùng và xem bản dịch đè chữ trong cửa sổ riêng. |

**Lưu ý về “thay chữ”:** đây là lớp bản dịch hiển thị trên ảnh. Ứng dụng chưa phục hồi nét vẽ phía sau chữ, chưa sửa file ảnh gốc và chưa xuất ra file PDF đã dịch.

## Cài đặt nhanh trên Windows

### 1. Chuẩn bị Gemini API key

1. Mở [Google AI Studio](https://aistudio.google.com/apikey) và đăng nhập tài khoản Google.
2. Tạo API key theo hướng dẫn trên trang, hoặc dùng key bạn đã có.
3. Giữ key để nhập vào bộ cài. Không gửi key cho người khác hoặc đưa lên GitHub.

Gemini áp dụng hạn mức và phí theo model, dự án và tài khoản của bạn. Kiểm tra trong Google AI Studio; bộ cài không cung cấp tài khoản Google, API key hoặc credit.

### 2. Cài ứng dụng

1. Chạy file **AI-Image-Translator.exe** 
2. Chạy file bộ cài trên **Windows 10/11 64-bit**.
3. Dán **Gemini API key** vào ô tương ứng. Model mặc định của ứng dụng là `gemini-3.1-flash-lite`.
4. Chọn **Thư mục cài đặt**, hoặc bấm **Duyệt…** để đổi nơi cài. Nên dùng thư mục riêng có quyền ghi, ví dụ `D:\Apps\AIImageTranslator`.
5. Bấm **Kiểm tra key** nếu muốn kiểm tra kết nối, rồi bấm **Cài đặt**.
6. Mở **AI Image Translator** từ lối tắt trên Desktop hoặc Start Menu. Chờ thông báo **Backend đang chạy**.

### 3. Nạp extension vào trình duyệt — chỉ làm lần đầu

1. Trong ứng dụng Windows, bấm **Mở thư mục extension** để biết thư mục cần chọn.
2. Mở trang quản lý extension của trình duyệt:

   | Trình duyệt | Địa chỉ nhập vào thanh địa chỉ |
   | --- | --- |
   | Chrome | `chrome://extensions` |
   | Edge | `edge://extensions` |
   | vv...| `vv...://extensions` |

3. Bật **Chế độ dành cho nhà phát triển / Developer mode**.
4. Bấm **Tải tiện ích đã giải nén / Load unpacked**.
5. Chọn thư mục **extension** bên trong nơi bạn vừa cài ứng dụng. Chọn thư mục, không chọn một file riêng lẻ.
6. Ghim biểu tượng **AI Image Translator** lên thanh công cụ nếu muốn mở nhanh.

> Giữ nguyên thư mục cài sau khi nạp extension. Nếu chuyển thư mục sang nơi khác, bạn cần nạp lại extension từ vị trí mới.

## Dùng hằng ngày

1. Mở ứng dụng **AI Image Translator** trên Windows và chờ backend chạy.
2. Mở website hoặc PDF cần đọc trong trình duyệt.
3. Bấm biểu tượng extension và chọn chức năng dịch.

Bạn có thể **thu nhỏ ứng dụng Windows xuống khay hệ thống** để tiếp tục dịch. Nhấp đúp biểu tượng ở khay để mở lại cửa sổ. Đóng ứng dụng sẽ dừng backend do ứng dụng khởi chạy.

### Dịch một ảnh trên website

1. Mở website có ảnh chứa chữ và chờ ảnh tải xong.
2. Bấm biểu tượng extension.
3. Chọn ngôn ngữ đích và cách hiển thị:
   - **Thay chữ trên ảnh:** che vùng chữ gốc và đặt bản dịch vào vị trí tương ứng.
   - **Bảng dịch nổi:** đọc bản dịch trong bảng bên cạnh, không đặt chữ lên ảnh.
4. Bấm **Chọn ảnh để dịch**, rồi bấm vào ảnh muốn dịch trên website.
5. Chờ kết quả. Nhấn **Esc** nếu muốn hủy thao tác chọn ảnh.

Nếu ảnh bị website chặn đọc, ứng dụng dùng ảnh chụp phần đang hiển thị. Với ảnh dài, cuộn tới phần tiếp theo rồi chụp lại để dịch tiếp. Giữ nguyên tab và không cuộn trong lúc chụp.

### Các nút trong bảng dịch

| Nút | Dùng khi nào? |
| --- | --- |
| **Chụp ảnh mới** | Muốn tự chọn một ảnh khác trên trang. Bấm nút rồi bấm ảnh mới. |
| **Chụp lại** | Muốn chụp và dịch lại ảnh vừa chọn. Nếu ảnh đó không còn hiển thị, ứng dụng chọn ảnh lớn nhất đang hiển thị. |
| **Xem ảnh gốc / Hiện bản dịch** | Bật hoặc tắt các lớp dịch để so sánh với ảnh gốc. |
| **Xóa lớp dịch** | Gỡ các lớp dịch và xem lại ảnh nguyên bản. |
| **Đóng** | Đóng bảng điều khiển; các lớp dịch đang có vẫn được giữ. |

Khi chuyển trang trong cùng website, bảng điều khiển được khôi phục để bạn chọn ảnh mới. Nếu đã bấm **Đóng**, hoặc chuyển sang tên miền/tab khác, hãy bấm biểu tượng extension để kích hoạt lại. Ứng dụng không tự gửi ảnh đi dịch khi bạn chuyển trang.

### Dịch trang PDF

1. Mở PDF trong Chrome, Edge hoặc Trình duyệt tương tự. Cuộn hoặc phóng to phần cần dịch để chữ đủ rõ.
2. Bấm biểu tượng extension → **Chụp trang PDF**.
3. Cửa sổ **Dịch trang PDF** mở với ảnh chụp. Kéo chuột khoanh vùng trang hoặc đoạn văn cần dịch; bỏ qua thanh công cụ và hình thu nhỏ ở bên trái.
4. Chọn ngôn ngữ rồi bấm **Dịch vùng đã chọn**. Nếu muốn dịch toàn bộ ảnh chụp, bấm **Chọn toàn ảnh** trước.
5. Xem bản dịch đặt lên ảnh bên phải hoặc đọc bản văn bên dưới. Có nút **Xem ảnh gốc / Hiện bản dịch** để so sánh.
6. Để dịch tiếp, quay lại tab PDF gốc và chuyển trang hoặc cuộn xuống. Trở lại cửa sổ dịch, bấm **Chụp trang tiếp theo**, khoanh vùng mới rồi dịch.

Chức năng này **chỉ chụp phần đang nhìn thấy**, không tự chuyển trang và không dịch toàn bộ tài liệu trong một lần. Bản dịch hiển thị trong cửa sổ riêng; không thay chữ trực tiếp trong trình xem PDF mặc định và không sửa file PDF gốc.

Nếu PDF mở từ máy, vào trang quản lý extension → **Chi tiết / Details** → bật **Cho phép truy cập vào URL của tệp / Allow access to file URLs** nếu trình duyệt yêu cầu.

## Đổi API key và cập nhật ứng dụng

**Đổi key:** trong ứng dụng Windows, bấm **Cấu hình API**, nhập key mới và lưu. Backend do ứng dụng quản lý sẽ được khởi động lại để dùng cấu hình mới.

**Cập nhật:** đóng ứng dụng Windows, chạy Setup.exe mới và chọn đúng thư mục đang cài. Sau đó mở lại ứng dụng, vào trang quản lý extension bấm **Tải lại / Reload**, rồi tải lại website bằng **F5**.

**Đổi nơi cài:** chạy lại bộ cài và chọn thư mục mới. Bộ cài không tự di chuyển hoặc xóa bản cũ. Gỡ extension đã nạp từ thư mục cũ rồi dùng **Load unpacked** để nạp thư mục mới.

## 
## Lỗi thường gặp

| Thông báo hoặc hiện tượng | Cách xử lý |
| --- | --- |
| Không kết nối được backend | Mở ứng dụng Windows và chờ báo backend đang chạy. Nếu chạy mã nguồn, giữ terminal `npm start` hoạt động. |
| Chưa cấu hình `GEMINI_API_KEY` | Mở **Cấu hình API**, nhập key và lưu. Với mã nguồn, sửa `backend/.env` rồi chạy lại backend. |
| Gemini trả lỗi 400, 403 hoặc 404 | Kiểm tra key, tên model và quyền sử dụng API trong AI Studio. Model không khả dụng với tài khoản có thể trả lỗi 404. |
| Đã chạm hạn mức Gemini / lỗi 429 | Kiểm tra hạn mức trong AI Studio và chờ trước khi thử lại. Tránh bấm dịch liên tục. |
| Cổng 3000 đang được sử dụng | Nếu đang chạy `npm start` hoặc một bản ứng dụng khác, đóng bản đó trước khi mở bản muốn dùng. |
| Không chọn được ảnh trên PDF | Dùng **Chụp trang PDF**, không dùng **Chọn ảnh để dịch**. |
| PDF trên máy không chụp được | Bật quyền truy cập URL tệp tại trang chi tiết extension, rồi bấm biểu tượng extension trên tab PDF để thử lại. |
| Chụp lại nhầm ảnh | Bấm **Chụp ảnh mới** để chọn đúng ảnh thay vì để ứng dụng chọn ảnh lớn nhất. |
| Chữ nhỏ, thiếu hoặc đặt lệch | Phóng to ảnh/PDF, chọn vùng nhỏ hơn hoặc dùng bảng dịch nổi. Vị trí chữ do AI ước lượng. |
| Không thấy tính năng mới sau cập nhật | Đóng/mở lại ứng dụng, Reload extension và nhấn F5 trên website. |

## Dữ liệu, chi phí và giới hạn

- API key nằm trong `backend/.env` ở thư mục cài, không được nhúng vào extension. Không chia sẻ file này hoặc đưa lên GitHub. Bộ cài không chứa key cá nhân của người tạo dự án.
- Khi bạn yêu cầu dịch ảnh web, ảnh gốc hoặc vùng ảnh chụp được gửi qua backend trên máy tới Google Gemini. Ở chế độ PDF, chỉ vùng bạn chọn được gửi sau khi bấm **Dịch vùng đã chọn**.
- Ảnh chụp PDF tạm được lưu trong phiên extension. Đóng cửa sổ dịch PDF sẽ xóa phiên đó. Mỗi lần chỉ giữ một phiên PDF.
- Cần Internet để gọi Gemini. Hạn mức, phí và chính sách xử lý dữ liệu phụ thuộc tài khoản/dịch vụ Google; xem trong [Google AI Studio](https://aistudio.google.com/) trước khi gửi nội dung nhạy cảm.
- AI có thể dịch sai, bỏ sót hoặc định vị lệch. Chữ trên nền tranh phức tạp được che bằng màu đơn, chưa có chức năng phục hồi nền.
- Ảnh quá nhỏ, chữ dọc, công thức, bảng và tài liệu nhiều cột có thể cho kết quả kém. Với PDF, nên dịch từng đoạn ở mức phóng to đủ rõ.
- Chế độ chọn ảnh web hỗ trợ ảnh trong trang chính; chưa chọn trực tiếp được ảnh nền CSS, canvas hoặc ảnh trong iframe. Chế độ chụp PDF không phụ thuộc việc chọn phần tử ảnh.
- Khi chụp màn hình, menu hoặc quảng cáo đang đè lên vùng ảnh cũng có thể xuất hiện trong ảnh chụp. Hãy đóng chúng trước khi dịch.
- Dịch ảnh web có thể bị hạn chế trên trang nội bộ của trình duyệt, kho extension hoặc các trang được bảo vệ. Khi đổi website, có thể cần bấm biểu tượng extension để cấp quyền lại.

## 
