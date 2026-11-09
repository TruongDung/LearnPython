# Cập nhật visualization: 10 bài stack và chia đoạn

Đã hoàn tất 402, 503, 768, 769, 3430, 3359, 3205, 2945, 1856 và 975. Bài 768 xuất hiện hai lần trong yêu cầu và được cập nhật một lần.

Tất cả có hình minh họa tương tác, debug đúng từng dòng Python, biến của từng frame, ví dụ chọn nhanh, điều khiển bằng Enter/Space, theme sáng/tối và bố cục mobile.

| Bài | Hình minh họa chính | Giới hạn nhập cho hình minh họa |
| --- | --- | --- |
| 402 — Remove K Digits | Chữ số giữ/xóa, ID riêng cho số trùng, POP và giảm k riêng, cắt đuôi, chuẩn hóa 0 đầu | 1–18 chữ số; 0 ≤ k ≤ độ dài num |
| 503 — Next Greater Element II | Mảng tròn, hai lượt quét, i → i % n, cạnh tìm được, answer trước/sau khi ghi | 1–14 số, −10⁹…10⁹ |
| 768 — Max Chunks To Make Sorted II | Chunk đã PUSH, nhóm đang gộp, stack max, sort riêng từng chunk | 1–16 số, 0…10⁸ |
| 769 — Max Chunks To Make Sorted | Prefix có đủ 0…i, điều kiện max = i, đường cắt chỉ hiện khi counter tăng | Hoán vị 0…n−1, 1–10 phần tử |
| 3430 — Maximum and Minimum Sums of at Most Size K Subarrays | MIN/MAX, biên sở hữu, bảng chọn đầu/cuối, loại cặp dài hơn k | 1–12 số, −10⁶…10⁶; 1 ≤ k ≤ n |
| 3359 — Find Sorted Submatrices With Maximum Element at Most K | Grid, width hàng không tăng, stack cột, chọn hình chữ nhật để tô trên grid | Grid tối đa 6×6, giá trị 0…10⁹; 1 ≤ k ≤ 10⁹ |
| 3205 — Maximum Array Hopping Score I | Mỗi đơn vị khoảng cách nhận suffix max, gộp thành bước nhảy | 2–14 số dương, tối đa 100000 |
| 2945 — Find Maximum Non-decreasing Array Length | Prefix, bảng DP, deque theo need, chuỗi parent, các đoạn được thay bằng tổng | 1–12 số dương, tối đa 100000 |
| 1856 — Maximum Subarray Min-Product | Minimum sở hữu đoạn, prefix difference, product và best trước modulo | 1–14 số dương, tối đa 10⁷ |
| 975 — Odd Even Jump | Order đã sort, cạnh lẻ/chẵn khác màu, bảng DP, đường đi luân phiên đến cuối | 1–14 số, 0…100000 |

Các giới hạn trên dành cho hình minh họa; code Python vẫn thể hiện đầy đủ thuật toán. Trace trong giới hạn được giữ trọn vẹn.

Các trạng thái trung gian được giữ đúng: POP không tự ghi đáp án hoặc giảm k; cắt đuôi không tự gán k = 0; bỏ 0 đầu không tiêu thêm lượt xóa; đáp án thật bằng −1 của bài 503 được phân biệt với trạng thái chưa tìm thấy. Các hình sort/gộp và đường đi là minh họa từ dữ liệu đã tính, không thay đổi biến Python.

3205 dùng chung bộ trace suffix-max với 3221 vì cùng công thức điểm ở nơi đáp. Giao diện và metadata vẫn hiển thị đúng bài 3205.

## Kiểm tra

- **70 tests đạt**, bao gồm các bài mới, hồi quy 581/2282 và bộ hình stack liên quan, tài nguyên tải theo bài và tìm kiếm.
- Đối chiếu source event, locals, frame, branch và return với CPython.
- So với các oracle độc lập: thử cách xóa chữ số, tìm next bằng duyệt trực tiếp, thử mọi partition nhỏ, duyệt đoạn con và hình chữ nhật.
- Chromium: tất cả frame/preset; kiểm tra bàn phím, chọn đoạn/hình chữ nhật không sửa snapshot, theme sáng/tối.
- Input sát giới hạn: tất cả frame ở chiều rộng 1440, 390 và 320px; không lỗi JavaScript, không tràn trang, SVG không bị cắt.

Các bộ kiểm tra chính: `tests/stack-roster-native.test.js` và `tests/advanced-stack-pictures.test.js`.
