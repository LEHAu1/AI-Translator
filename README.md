# AI Image Translator

**Cài trên Windows không cần chuẩn bị Node.js:** dùng `dist/AI-Image-Translator-Setup.exe`. Bộ cài kèm runtime, hướng dẫn nhập Gemini API key và tạo lối tắt chạy backend. Xem [hướng dẫn bộ cài](installer/README.md). Sau khi cài vẫn cần Load unpacked thư mục extension trong Chrome/Edge một lần.

Chrome/Edge Manifest V3: chọn ảnh trên website → Google Gemini định vị chữ và dịch → thay chữ trên ảnh hoặc hiện bảng dịch nổi. JavaScript thuần, backend Node.js không cần cài dependency.

## Chạy trên Windows

1. Cài Node.js 22 trở lên.
2. Mở PowerShell trong `D:\Games\AI translator`:

```powershell
Copy-Item backend/.env.example backend/.env
notepad backend/.env
```

Điền `GEMINI_API_KEY` trong file vừa mở. Không gửi key vào chat hoặc đưa vào extension. `GEMINI_MODEL` mặc định là `gemini-3.1-flash-lite`; đổi sang model hỗ trợ ảnh mà tài khoản của bạn có quyền dùng nếu API báo lỗi. Không ghi đè `.env` nếu đã cấu hình.

Lấy Gemini API key tại https://aistudio.google.com/apikey. Nếu trước đây đã dùng OpenAI, thêm `GEMINI_API_KEY` và `GEMINI_MODEL` theo `.env.example`; backend không dùng các biến `OPENAI_*` nữa. Khởi động lại `npm start` sau khi sửa `.env`. Free tier có giới hạn request và token; kiểm tra quota trong AI Studio. Nội dung gửi qua free tier có thể được Google dùng để cải thiện sản phẩm.

```powershell
npm start
```

Giữ terminal chạy. Kiểm tra `http://127.0.0.1:3000/health`: `configured: true` chỉ xác nhận có cấu hình key, chưa xác minh key với Google Gemini.

3. Mở `chrome://extensions` (Edge: `edge://extensions`), bật Developer mode → Load unpacked → chọn `D:\Games\AI translator\extension`.
4. Mở website HTTP/HTTPS có ảnh chứa chữ, bấm biểu tượng extension → chọn ngôn ngữ và cách hiển thị → **Chọn ảnh để dịch** → bấm ảnh. Nhấn Esc để hủy chọn.

## Thay chữ trên ảnh

Chọn **Thay chữ trên ảnh** trong popup. Gemini trả về các vùng chữ theo tọa độ chuẩn hóa 0–1000, chữ gốc, bản dịch và màu nền. Extension che từng vùng chữ bằng nền màu đơn và đặt bản dịch vào vùng đó. Cỡ chữ tự điều chỉnh theo khung; bản dịch đầy đủ luôn có trong bảng nổi. Văn bản AI được chèn bằng `textContent`.

Nút **Xem ảnh gốc / Hiện bản dịch** bật/tắt các lớp dịch. **Xóa lớp dịch** khôi phục ảnh gốc. Đóng bảng nổi vẫn giữ lớp dịch; mở extension để chọn ảnh tiếp sẽ hiện lại các nút điều khiển. Không chỉnh sửa file ảnh gốc.

Lớp dịch bám theo vị trí và kích thước ảnh khi cuộn/resize; hỗ trợ `object-fit: contain/cover`. Với ảnh CORS, tọa độ được quy đổi từ ảnh chụp về ảnh trên trang. Những vùng đã dịch ở phần khác của cùng ảnh được giữ lại khi dịch phần tiếp theo bằng cùng ngôn ngữ; phần trùng với vùng chụp mới được thay bằng kết quả mới. Giữ tối đa 20 ảnh và 200 vùng mỗi ảnh trong bộ nhớ. Nếu ảnh đổi URL hoặc kích thước gốc, lớp dịch được gỡ để tránh áp vào ảnh khác.

Định vị bằng Gemini là ước lượng, có thể lệch, bỏ sót hoặc gom nhầm vùng chữ. Nền màu đơn phù hợp bong bóng thoại/nền phẳng; không phục hồi tranh sau chữ (chưa có inpainting). Ảnh xoay/lật, `object-position` phức tạp và một số hiệu ứng CSS chưa hỗ trợ: chuyển sang bảng nổi. Khung quá nhỏ có thể khiến chữ khó đọc; xem bản đầy đủ trong bảng. Các vùng ảnh bị menu/quảng cáo che nên được làm rõ trước khi chụp.

Sau khi nâng cấp, dừng/chạy lại `npm start`, Reload extension ở `chrome://extensions` rồi F5 website. Không cần đổi `.env`.

## Chụp lại sau khi chuyển trang

Nút **Chụp ảnh mới** ngay trong bảng dịch cho phép chọn một ảnh khác mà không cần đóng/mở popup. Bấm nút rồi bấm ảnh muốn chụp; Esc để hủy. Nút luôn chụp mới phần ảnh đang hiển thị. Khi chuyển trang trong cùng website, bảng điều khiển tự xuất hiện lại và chờ bạn bấm nút; không tự chụp/dịch. Đóng bảng bằng nút **Đóng** sẽ tắt việc khôi phục bảng ở trang kế tiếp. Sang tên miền khác hoặc tab mới cần bấm biểu tượng extension để cấp quyền activeTab cho trang đó.

Nút **Chụp lại** có trong popup extension và bảng dịch nổi. Nút luôn chụp mới phần ảnh đang hiển thị, không tái sử dụng ảnh/bản dịch cũ. Nếu ảnh vừa chọn vẫn còn trên màn hình, extension dùng ảnh đó. Khi ảnh cũ đã bị thay hoặc bạn chuyển sang trang mới, extension dùng ảnh có diện tích hiển thị lớn nhất; muốn chọn ảnh khác thì dùng **Chọn ảnh để dịch**. Nếu không có ảnh nhìn thấy, extension báo để bạn cuộn tới ảnh.

Với trang mới tải lại toàn bộ trong cùng website, bảng điều khiển được khôi phục sau khi trang tải xong. Nếu không thấy bảng, mở popup để kích hoạt lại. Không tự chụp hoặc gọi Gemini khi bạn chuyển trang. Một lần bấm tương ứng một lượt dịch, chỉ phần ảnh đang hiển thị được gửi. Đừng cuộn/đổi tab trong lúc chụp. Nếu trang hoặc ảnh thay đổi khi Gemini đang xử lý, kết quả cũ không được áp vào trang mới.

Ảnh được gửi tới Google Gemini qua backend trên máy sau khi bạn chọn. Free tier có hạn mức; phí tùy cấu hình tài khoản. Không có chế độ tự động gửi ảnh. API key chỉ nằm ở backend; backend bind `127.0.0.1`, không mở ra mạng LAN.

## Chụp và dịch trang PDF

1. Mở PDF trong Chrome, Edge hoặc Brave, cuộn/phóng to phần cần dịch. Chế độ này chụp màn hình tab, không đọc trực tiếp nội dung file PDF.
2. Bấm biểu tượng extension → **Chụp trang PDF**. Không dùng nút chọn ảnh web trên trình xem PDF tích hợp.
3. Cửa sổ **Dịch trang PDF** mở với ảnh chụp. Kéo chuột để khoanh trang/đoạn cần dịch; bỏ qua thanh công cụ và hình thu nhỏ. Hoặc bấm **Chọn toàn ảnh** nếu bạn muốn gửi toàn bộ phần ảnh chụp đó.
4. Chọn ngôn ngữ → **Dịch vùng đã chọn**. Chỉ vùng này được cắt trên máy và gửi backend/Gemini. Bản dịch được đặt vào vị trí chữ trên ảnh bên phải, kèm toàn bộ văn bản dịch ở dưới. Dùng **Xem ảnh gốc / Hiện bản dịch** để so sánh.
5. Quay lại tab PDF để cuộn/chuyển trang, trở lại cửa sổ dịch và bấm **Chụp trang tiếp theo**. Nút chụp phần hiện đang hiển thị của tab gốc; không tự bấm chuyển trang PDF và không tự gửi dịch. Ảnh mới cần khoanh vùng lại.

Ảnh chụp tạm nằm trong bộ nhớ phiên extension; đóng cửa sổ dịch sẽ xóa phiên chụp. Chỉ giữ một phiên PDF; bấm Chụp trang PDF lần nữa sẽ thay ảnh trong cửa sổ đó. Không chèn lớp dịch vào trình xem PDF mặc định, không sửa hoặc xuất lại file PDF gốc. Trang nhiều chữ nên phóng to và dịch từng đoạn để giữ độ rõ. Vị trí do Gemini ước lượng; công thức, nhiều cột và bảng có thể bị nhận diện sai.

PDF trên máy (`file://`) có thể cần bật **Cho phép truy cập vào URL của tệp / Allow access to file URLs** tại trang chi tiết extension. Nếu mất quyền chụp khi sang website khác, bấm biểu tượng extension tại tab PDF mới rồi chọn Chụp trang PDF lại. Không cần cấp quyền đọc mọi website.

Sau khi nâng cấp bản cài: đóng ứng dụng, chạy Setup.exe mới và chọn đúng thư mục đang cài, mở lại ứng dụng rồi Reload extension ở `chrome://extensions`, `edge://extensions` hoặc `brave://extensions`.

## Giới hạn khác

- Chưa dùng OCR chuyên dụng hoặc phục hồi nền. Vị trí chữ do Gemini ước lượng, không bảo đảm chính xác từng pixel.
- Hỗ trợ phần tử `<img>` trong trang chính. Chưa hỗ trợ canvas, ảnh nền CSS hoặc ảnh trong iframe.
- Khi ảnh bị CORS, extension chụp tab bằng quyền activeTab đã có và cắt vùng ảnh trên máy trước khi gửi backend. Ảnh chụp toàn tab chỉ được xử lý tạm trong bộ nhớ; backend và Gemini chỉ nhận vùng đã cắt. Bảng dịch được ẩn khi chụp. Nội dung website đang đè lên vùng ảnh (menu, quảng cáo…) vẫn xuất hiện trong phần đã cắt; hãy đóng chúng trước khi dịch. Giữ tab đang mở và không cuộn trong lúc chụp.
- Với ảnh bị CORS dài hơn màn hình, chỉ dịch phần đang hiển thị. Cuộn tới phần tiếp theo rồi chọn lại ảnh. Chụp màn hình không lấy được chữ ngoài vùng hiển thị và có chất lượng theo độ phân giải màn hình. Phóng to bằng cử chỉ cần tắt trước khi chụp.
- Không hoạt động trên trang nội bộ trình duyệt, Chrome Web Store hoặc trang hạn chế extension.
- Ảnh được thu nhỏ cạnh dài tối đa 2400px trước khi gửi; chữ nhỏ có thể khó đọc. Mỗi lần dịch tối đa 90 giây ở backend, một request đồng thời, không tự retry.
- Đóng bảng nổi chỉ ẩn giao diện, không hủy request đã gửi. Bản dịch có thể hiện lại khi request xong.
- Giữ PORT=3000; nếu đổi cổng phải sửa cả `extension/background.js` và `extension/manifest.json`, rồi reload extension.
- Service worker MV3 có thể bị trình duyệt ngắt với request kéo dài. Nếu kết nối gián đoạn, thử ảnh nhỏ hơn.

## Kiểm tra

```powershell
npm test
```

Test backend dùng API giả, không tốn phí. Bộ test kiểm tra dữ liệu vùng chữ, tọa độ, lỗi API, CORS và phép quy đổi tọa độ. Kiểm tra thủ công thêm trên website thực tế: dịch sang ba ngôn ngữ; Esc/Đóng khi chọn; chọn lại nhiều lần; backend chưa chạy; ảnh bị chặn CORS.

Có thể kiểm tra giao diện bằng Chrome headless với ảnh và API giả:

```powershell
node tests/run-browser.mjs
node tests/run-browser.mjs --pdf
```

Trình chạy dùng Chrome ở đường dẫn cài mặc định; có thể đặt biến `CHROME_PATH` nếu khác. Kết quả và ảnh chụp nằm trong `test-output/`. Kiểm tra định vị, co giãn, object-fit, cuộn, CORS, xem ảnh gốc, xóa lớp dịch và đổi nguồn ảnh.

Đã xác minh một lượt định vị bằng API Gemini thật với ảnh mẫu HELLO WORLD: trả chữ gốc, bản dịch XIN CHÀO THẾ GIỚI và tọa độ vùng hợp lệ. Đây không phải bảo đảm độ chính xác trên mọi ảnh. Schema gửi Gemini chỉ mô tả cấu trúc; backend kiểm tra thêm số lượng vùng, độ dài văn bản, màu và giới hạn tọa độ trước khi trả cho extension.

Luồng ảnh dựa trên tài liệu chính thức: https://ai.google.dev/api/generate-content
