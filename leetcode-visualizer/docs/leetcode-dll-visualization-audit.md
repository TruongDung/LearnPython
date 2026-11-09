# Kiểm tra visualization: Linked List / DLL

Đã kiểm tra đủ **15/15 bài**. Độ khó đối chiếu trang đề LeetCode ngày 2026-11-09: **10 Medium, 5 Hard, không có Easy**.

| Bài | Độ khó | Trạng thái | Lời giải đang minh họa | Vai trò DLL |
| --- | --- | --- | --- | --- |
| [707. Design Linked List](https://leetcode.com/problems/design-linked-list/) | Medium | **Thêm mới** | Dummy + node có `prev` / `next`; thêm, tìm, xóa theo index | Tự triển khai DLL; đề cũng cho phép singly linked list |
| [146. LRU Cache](https://leetcode.com/problems/lru-cache/) | Medium | **Làm lại visualization** | HashMap + DLL, hai sentinel, thứ tự LRU → MRU | Trực tiếp |
| [460. LFU Cache](https://leetcode.com/problems/lfu-cache/) | Hard | Đã có | HashMap + bucket tần suất bằng `OrderedDict` | Có thể tự triển khai mỗi bucket bằng DLL |
| [432. All O`one Data Structure](https://leetcode.com/problems/all-oone-data-structure/) | Hard | Đã có | Bucket DLL + HashMap | Trực tiếp |
| [1472. Design Browser History](https://leetcode.com/problems/design-browser-history/) | Medium | Đã có | Node `prev` / `next`, con trỏ trang hiện tại | Trực tiếp |
| [430. Flatten a Multilevel Doubly Linked List](https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/) | Medium | Đã có | DFS nối `child` vào DLL | Trực tiếp |
| [2296. Design a Text Editor](https://leetcode.com/problems/design-a-text-editor/) | Hard | **Thêm mới** | DLL ký tự + cursor, chèn, backspace, dịch trái/phải | Trực tiếp; hai stack/deque là phương án khác |
| [1206. Design Skiplist](https://leetcode.com/problems/design-skiplist/) | Hard | **Thêm mới** | Node có `forward[level]`, thêm/tìm/xóa một bản sao | Linked list nhiều tầng; không phải DLL thông thường |
| [1797. Design Authentication Manager](https://leetcode.com/problems/design-authentication-manager/) | Medium | Đã có | HashMap token → thời điểm hết hạn | DLL là lựa chọn khác để quản lý thứ tự hết hạn |
| [381. Insert Delete GetRandom O(1) — Duplicates allowed](https://leetcode.com/problems/insert-delete-getrandom-o1-duplicates-allowed/) | Hard | Đã có | Array + HashMap các tập index; swap với phần tử cuối | DLL đơn thuần không cung cấp truy cập ngẫu nhiên O(1) |
| [355. Design Twitter](https://leetcode.com/problems/design-twitter/) | Medium | Đã có | Danh sách tweet mỗi user + heap trộn news feed | Có thể thay danh sách tweet bằng linked list |
| [1823. Find the Winner of the Circular Game](https://leetcode.com/problems/find-the-winner-of-the-circular-game/) | Medium | **Thêm mới** | Circular DLL, đếm k rồi nối bỏ node | DLL là phương án mô phỏng; Josephus dùng được O(n) thời gian, O(1) bộ nhớ |
| [641. Design Circular Deque](https://leetcode.com/problems/design-circular-deque/) | Medium | Đã có | Circular buffer: array, front, size | Circular DLL là một phương án triển khai khác |
| [1670. Design Front Middle Back Queue](https://leetcode.com/problems/design-front-middle-back-queue/) | Medium | Đã có | Hai deque cân bằng hai nửa | Có thể dùng DLL; hiện minh họa hai deque |
| [622. Design Circular Queue](https://leetcode.com/problems/design-circular-queue/) | Medium | Đã có | Circular buffer: array, front, size | Circular linked list / DLL là lựa chọn khác |

## Các visualization mới và phần làm lại

- **707, 146, 2296:** sơ đồ node và mũi tên `next` / `prev`, ID ổn định khi trùng giá trị, node đã tách vẫn xem được; chọn node để xem con trỏ.
- **1206:** các tầng Skiplist, mũi tên `forward[level]`, node/tầng đang duyệt, thêm và xóa giá trị trùng. Seed cố định giúp phát lại cùng một diễn tiến.
- **1823:** vòng tròn người chơi, `current`, số người còn lại, từng phép gán `next` / `prev` khi loại node.
- Cả năm bài phát đúng từng dòng Python, có ví dụ chọn nhanh, điều khiển bước, kết quả từng thao tác, biến từng frame, giao diện sáng/tối và màn hình nhỏ. Constructor chạy riêng; mảng kết quả chỉ chứa các thao tác sau constructor.

Giới hạn nhập phục vụ hình minh họa: tối đa 20 thao tác; 707/146 tối đa 14 lần thêm/put, 1206 tối đa 14 lần add, 2296 tối đa 24 ký tự được thêm, 1823 tối đa 12 người. Code Python vẫn thể hiện đầy đủ thuật toán; trace trong giới hạn được giữ trọn vẹn.

## Kiểm tra

`tests/linked-design-roadmap.test.js` kiểm tra đủ roster, kết quả mẫu, mô hình độc lập cho từng thuật toán, các trường hợp biên/trùng giá trị, con trỏ sau mỗi dòng, đồng bộ code trong live editor, dữ liệu trace đối chiếu CPython và renderer VI/EN.

Các bộ kiểm tra liên quan còn bao phủ runtime dùng chung, cây 654, các linked-list trace cũ, tài nguyên tải theo bài và kết quả tìm kiếm không trùng.

Kết quả: **68 tests đạt** trong các bộ kiểm tra liên quan. Kiểm tra Chromium chạy được cả 15 bài; năm bài mới/làm lại được kiểm tra tất cả frame và preset, dòng code sáng đúng bước, dữ liệu node/con trỏ, thời điểm hiện kết quả, phím Enter/Space, theme sáng/tối và chiều rộng 320px.
