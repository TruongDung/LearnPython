"use strict";
const base = require('./dp')[5];
const { runTrace } = require('./wasm-picture-trace');
const bi = (vi, en) => ({vi, en});
const code = `class Solution:
    def longestPalindrome(self, s: str) -> str:
        best_start, best_end = 0, -1
        for center in range(len(s)):
            for left, right in ((center, center), (center, center + 1)):
                while left >= 0 and right < len(s) and s[left] == s[right]:
                    if right - left + 1 > best_end - best_start + 1:
                        best_start, best_end = left, right
                    left -= 1
                    right += 1
        return s[best_start:best_end + 1]`.split('\n');
const code2 = `class Solution:
    def longestPalindrome(self, s: str) -> str:
        n = len(s)
        dp = [[False] * n for _ in range(n)]
        best_start, best_end = 0, -1
        for length in range(1, n + 1):
            for i in range(n - length + 1):
                j = i + length - 1
                if s[i] == s[j] and (length <= 2 or dp[i + 1][j - 1]):
                    dp[i][j] = True
                    if length > best_end - best_start + 1:
                        best_start, best_end = i, j
        return s[best_start:best_end + 1]`.split('\n');
function parse(input) {
    if (typeof input !== 'string' || [...input].length > 32)
        throw new RangeError('#5: nhập chuỗi tối đa 32 ký tự để theo dõi từng bước / Enter at most 32 characters for the step-by-step view.');
    return input;
}
function builder(input, params = {}) {
    const s = parse(input), chars = [...s], mode = Number(params.approach) === 2 ? 'dp' : 'center';
    const source = mode === 'dp' ? code2 : code;
    const trace = runTrace({code: source.join('\n'), method: 'longestPalindrome', args: [s], maxEvents: 12000, failOnTruncate: true});
    let center = null, kind = null, accepted = null, candidate = null, checked = null;
    const tested = new Set();
    const stages = mode === 'center' ? {
        3: bi('Chưa có kết quả', 'Start with an empty best'),
        4: bi('Chọn vị trí tâm', 'Choose a center'),
        5: bi('Bắt đầu một lần mở rộng', 'Start an expansion'),
        6: bi('Kiểm tra biên và hai ký tự', 'Check boundaries and the character pair'),
        7: bi('Đoạn vừa khớp có dài hơn best?', 'Is the matching range longer than best?'),
        8: bi('Lưu đoạn dài nhất mới', 'Save the new longest range'),
        9: bi('Dời L sang trái', 'Move L left'),
        10: bi('Dời R sang phải', 'Move R right'),
        11: bi('Trả về chuỗi con dài nhất', 'Return the longest substring'),
    } : {
        3: bi('Đọc độ dài chuỗi', 'Read the string length'),
        4: bi('Tạo bảng dp', 'Create the dp table'),
        5: bi('Chưa có kết quả', 'Start with an empty best'),
        6: bi('Xét theo độ dài tăng dần', 'Process shorter ranges first'),
        7: bi('Chọn đầu trái i', 'Choose left endpoint i'),
        8: bi('Tìm đầu phải j', 'Find right endpoint j'),
        9: bi('Hai đầu giống nhau và bên trong đối xứng?', 'Equal ends and a palindromic interior?'),
        10: bi('Xác nhận dp[i][j] = True', 'Confirm dp[i][j] = True'),
        11: bi('Đoạn này có dài hơn best?', 'Is this range longer than best?'),
        12: bi('Lưu đoạn dài nhất mới', 'Save the new longest range'),
        13: bi('Trả về chuỗi con dài nhất', 'Return the longest substring'),
    };
    const steps = trace.events.map(event => {
        const x = event.locals, line = event.line, final = event.returning === true;
        if (mode === 'center') {
            if (line === 4 && event.branch) {center = x.center; candidate = accepted = checked = null; kind = null;}
            if (line === 5 && event.branch) {kind = x.left === x.right ? 'odd' : 'even'; accepted = checked = null; candidate = [x.left, x.right];}
            if (line === 6) {
                candidate = [x.left, x.right]; checked = Boolean(event.branch);
                if (checked) accepted = [...candidate];
            }
            if (line === 9 || line === 10) {candidate = [x.left, x.right]; checked = null;}
        } else {
            if ((line === 6 || line === 7) && event.branch) {candidate = null; checked = null; accepted = null;}
            if (line === 8) {candidate = [x.i, x.j]; checked = null; accepted = null;}
            if (line === 9) {checked = Boolean(event.branch); if (!checked) tested.add(`${x.i},${x.j}`);}
            if (line === 10) {accepted = [x.i,x.j]; tested.add(`${x.i},${x.j}`);}
        }
        const start = x.best_start ?? 0, end = x.best_end ?? -1;
        if (final) {candidate = null; checked = null; center = kind = null; accepted = end >= start ? [start,end] : null;}
        const phase = stages[line] || bi('Theo dõi thuật toán', 'Follow the algorithm');
        const view = {mode, chars, center, kind, candidate: candidate && [...candidate], accepted: accepted && [...accepted], checked,
            best: [start,end], bestText: chars.slice(start,end+1).join(''), bestUpdated: line === (mode === 'center' ? 8 : 12),
            table: x.dp || [], tested: [...tested], line, source: source[line-1].trim(), phase, final,
            answer: final ? trace.answer : null};
        return {arr: [], highlight: [], mark: [], codeLines: [line], codeBlock: mode === 'dp' ? 2 : 1, final,
            title: phase, note: bi('', ''), vars: Object.entries(x).map(([name,value])=>({name,value,rawValue:value})), palindrome5View: view};
    });
    return {s, original: s, answer: trace.answer, steps};
}
module.exports = {5: {...base, code, code2, builder, debugMode: 'line-by-line',
    titleVi: bi('Chuỗi con đối xứng dài nhất', 'Longest palindromic substring'),
    inputLabel: bi('Chuỗi s · tối đa 32 ký tự để xem từng bước', 'String s · at most 32 characters for step-by-step viewing'),
    statement: bi('Tìm đoạn ký tự LIÊN TIẾP dài nhất đọc xuôi và ngược giống nhau. Ví dụ babad có hai đáp án dài 3: bab và aba. Visualization giữ đoạn gặp trước khi hai đoạn dài bằng nhau.', 'Find the longest CONTIGUOUS range that reads the same forwards and backwards. For example, babad has two answers of length 3: bab and aba. This visualization keeps the first range when lengths tie.'),
    approach: [bi('Tâm lẻ nằm trên một ký tự; tâm chẵn nằm giữa hai ký tự. So sánh L và R rồi mở rộng sang hai phía.', 'An odd center sits on a character; an even center sits between two characters. Compare L and R, then expand outwards.'),
        bi('Hai ký tự khác nhau hoặc vượt biên → dừng tâm đó. Chỉ cập nhật best khi đoạn đã xác nhận dài hơn.', 'A mismatch or boundary stops that expansion. Update best only when a confirmed range is longer.'),
        bi('Với DP: hai đầu phải giống nhau; đoạn dài trên 2 còn cần dp[i+1][j−1] = True. Điền đoạn ngắn trước.', 'With DP: endpoints must match; ranges longer than 2 also need dp[i+1][j−1] = True. Fill shorter ranges first.')],
    liveArgs: input => [parse(input)],
}};
