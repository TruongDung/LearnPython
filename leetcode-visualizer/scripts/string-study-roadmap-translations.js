// Translate the authored roadmap text while preserving problem IDs, URLs and order.
const phrases = new Map([
  ['Lộ trình học toàn bộ bài String trên LeetCode', 'Study roadmap for all LeetCode String problems'],
  ['Cách học', 'How to study'],
  ['Tổng quan phần A', 'Part A overview'],
  ['Phần A — Nền tảng nên học trước', 'Part A — Core problems to study first'],
  ['Phần B — Toàn bộ bài còn lại', 'Part B — All remaining problems'],
  ['Duyệt, biến đổi và mô phỏng chuỗi', 'String traversal, transformations and simulation'],
  ['Đếm ký tự, Hash Map và anagram', 'Character counts, hash maps and anagrams'],
  ['Two pointers và subsequence', 'Two pointers and subsequences'],
  ['Sliding window và substring', 'Sliding windows and substrings'],
  ['Stack, ngoặc và xóa ký tự', 'Stacks, parentheses and character removal'],
  ['Parsing, số lớn và biểu thức', 'Parsing, large numbers and expressions'],
  ['String matching, KMP và hashing', 'String matching, KMP and hashing'],
  ['Trie, prefix và dictionary', 'Tries, prefixes and dictionaries'],
  ['Backtracking và đệ quy trên chuỗi', 'Backtracking and string recursion'],
  ['DP, palindrome và subsequence', 'DP, palindromes and subsequences'],
  ['Greedy, sắp xếp và thứ tự từ điển', 'Greedy algorithms, sorting and lexicographic order'],
  ['Kết hợp thuật toán nâng cao', 'Advanced algorithm combinations'],
  ['Quản lý chỉ số, ký tự, prefix; phân biệt nối chuỗi với sửa chuỗi.', 'Track indices, characters and prefixes; distinguish string concatenation from mutation.'],
  ['Đếm tần suất, ánh xạ một-một, nhóm các chuỗi theo chữ ký.', 'Count frequencies, build one-to-one mappings and group strings by signatures.'],
  ['Giữ invariant của hai con trỏ; phân biệt substring và subsequence.', 'Maintain a two-pointer invariant; distinguish substrings from subsequences.'],
  ['Biết khi nào mở rộng/co cửa sổ; theo dõi tần suất và độ hợp lệ.', 'Know when to expand or shrink a window; track frequencies and validity.'],
  ['Theo dõi stack hoặc balance; xử lý lồng nhau và giữ tính hợp lệ.', 'Track a stack or balance counter; handle nesting while preserving validity.'],
  ['Đọc token, xử lý dấu/độ ưu tiên; tính trên chữ số và mở rộng biến.', 'Read tokens, handle signs and precedence, compute with digits and expand variables.'],
  ['Tìm pattern, xây prefix function; kiểm soát va chạm khi dùng hash.', 'Match patterns, build prefix functions and account for hash collisions.'],
  ['Biểu diễn từ trong trie, tìm kiếm prefix và kết hợp tìm kiếm trên bàn cờ.', 'Store words in a trie, search prefixes and combine tries with board search.'],
  ['Chọn–khám phá–hoàn tác; tách bài toán con và tránh sinh kết quả không hợp lệ.', 'Choose, explore and undo; split into subproblems and avoid generating invalid results.'],
  ['Viết rõ ý nghĩa trạng thái và base case; xử lý DP một chuỗi, hai chuỗi và khoảng.', 'Define states and base cases clearly; use DP on one string, two strings and intervals.'],
  ['Chứng minh lựa chọn tham lam; dùng heap hoặc monotonic stack khi cần.', 'Prove each greedy choice; use heaps or monotonic stacks when needed.'],
  ['Ghép các nền tảng đã học: KMP + DP, rolling hash + binary search, segment tree, trie và counting.', 'Combine the foundations: KMP + DP, rolling hash + binary search, segment trees, tries and counting.'],
  ['Thứ tự nhóm', 'Group order'],
  ['Dạng bài', 'Pattern'],
  ['Thứ tự bài nền tảng', 'Core problem sequence'],
  ['Bài mở rộng ở phần B', 'Additional problems in Part B'],
  ['Thứ tự học', 'Study order'],
  ['Độ khó', 'Difficulty'],
  ['Bài', 'Problem'],
  ['Có', 'Available'],
  ['Chưa', 'Not yet'],
]);

function translate(value) {
  if (phrases.has(value)) return phrases.get(value);
  if (value.startsWith('Danh mục gồm ')) {
    const numbers = value.match(/\d+/g);
    return `The catalog contains **${numbers[0]} problems with the official String tag**: **${numbers[1]} Easy · ${numbers[2]} Medium · ${numbers[3]} Hard**; ${numbers[4]} are Premium problems.`;
  }
  if (value.startsWith('Nguồn: ')) {
    const link = value.match(/\[LeetCode — String\]\([^)]+\)/)[0];
    const total = value.match(/đủ (\d+) ID/)[1], timestamp = value.match(/lấy: (\S+)\./)[1];
    return `Source: ${link}. Data was retrieved from LeetCode’s public GraphQL API, using pagination and verifying ${total} unique IDs. Retrieved at: ${timestamp}. New problems may be added after this snapshot.`;
  }
  if (/^1\. Học /.test(value)) {
    const count = value.match(/\((\d+) bài/)[1];
    return `1. Study **Part A (${count} core problems)** from top to bottom. Each group builds a foundation for later groups. The order within each group is my recommendation, rather than an official LeetCode order.`;
  }
  if (/^2\. Tiếp tục /.test(value)) {
    const count = value.match(/\((\d+) bài/)[1];
    return `2. Continue with **Part B (${count} additional problems)** to cover the entire catalog. Problems are grouped by algorithm pattern; each group is ordered Easy → Medium → Hard, then by increasing ID. A problem with multiple approaches is assigned to one main group to avoid duplicates.`;
  }
  if (/^3\. Với mỗi bài:/.test(value)) return '3. For each problem, describe the invariant or state, work through an example by hand, write the code yourself and explain its complexity. Finish a group when you can solve its problems again without looking at a solution.';
  if (/^4\. Cột /.test(value)) return '4. **Project = Available** means the problem ID has a registered builder in leetcode-visualizer when this list was created. It does not mean every visualization was reviewed again for this list. Premium indicates access restrictions on LeetCode.';
  if (value.startsWith('Project hỗ trợ ')) {
    const counts = value.match(/\d+/g);
    return `The project supports **${counts[0]}/${counts[1]} problems** in this catalog; **${counts[2]} problems** are not yet registered. This includes problems under DP, sliding window, trie and other project categories, rather than only the String category in the UI.`;
  }
  // Headings contain a stage prefix and a problem count around a pattern name.
  let output = value;
  for (const [vi, en] of phrases) {
    if (vi.length > 10) output = output.replaceAll(vi, en);
  }
  return output.replace(/\((\d+) bài\)/g, '($1 problems)');
}

function translateMarkdown(markdown) {
  return markdown.split(/\r?\n/).map(line => {
    if (line.startsWith('|')) return line.split(/(?<!\\)\|/).map(cell => cell.trim() ? ' ' + translate(cell.trim()) + ' ' : cell).join('|');
    const heading = /^(#{1,3}) (.+)$/.exec(line);
    return heading ? heading[1] + ' ' + translate(heading[2]) : translate(line);
  }).join('\n');
}

module.exports = { translate, translateMarkdown };
