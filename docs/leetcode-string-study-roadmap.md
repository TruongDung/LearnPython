# Lộ trình học toàn bộ bài String trên LeetCode

Danh mục gồm **895 bài có tag String chính thức**: **251 Easy · 444 Medium · 200 Hard**; 123 bài Premium.

Nguồn: [LeetCode — String](https://leetcode.com/problem-list/string/). Dữ liệu đọc từ API GraphQL công khai của LeetCode, có phân trang và kiểm tra đủ 895 ID duy nhất. Thời điểm lấy: 2026-10-05T18:21:01.850Z. Danh mục có thể được bổ sung sau thời điểm này.

## Cách học

1. Học **phần A (126 bài nền tảng)** theo số thứ tự từ trên xuống. Mỗi nhóm xây nền tảng cho nhóm sau; thứ tự trong nhóm do mình đề xuất, không phải thứ tự chính thức của LeetCode.
2. Tiếp tục **phần B (769 bài mở rộng)** để bao phủ toàn bộ danh mục. Chia theo dạng thuật toán; trong mỗi nhóm xếp Easy → Medium → Hard, rồi tăng dần ID. Bài có nhiều cách giải được đặt ở một nhóm chính để không lặp lại.
3. Với mỗi bài: tự mô tả invariant hoặc trạng thái, làm tay một ví dụ, tự code, rồi giải thích độ phức tạp. Hoàn thành nhóm khi có thể giải lại mà không xem lời giải.
4. Cột **Project = Có** nghĩa là ID có builder đã đăng ký trong leetcode-visualizer tại thời điểm tạo danh sách; không có nghĩa mọi visualization đều đã được đánh giá lại trong lần này. Premium là nhãn truy cập trên LeetCode.

Project hỗ trợ **182/895 bài** trong danh mục, còn **713 bài** chưa đăng ký. Con số này bao gồm bài nằm trong nhóm DP, sliding window, trie… của project, không chỉ nhóm String ở giao diện.

## Tổng quan phần A

| Thứ tự nhóm | Dạng bài | Thứ tự bài nền tảng | Bài mở rộng ở phần B |
| --- | --- | --- | ---: |
| 1 | Duyệt, biến đổi và mô phỏng chuỗi | [58](https://leetcode.com/problems/length-of-last-word/) → [709](https://leetcode.com/problems/to-lower-case/) → [1108](https://leetcode.com/problems/defanging-an-ip-address/) → [1662](https://leetcode.com/problems/check-if-two-string-arrays-are-equivalent/) → [1678](https://leetcode.com/problems/goal-parser-interpretation/) → [1768](https://leetcode.com/problems/merge-strings-alternately/) → [344](https://leetcode.com/problems/reverse-string/) → [541](https://leetcode.com/problems/reverse-string-ii/) → [557](https://leetcode.com/problems/reverse-words-in-a-string-iii/) → [151](https://leetcode.com/problems/reverse-words-in-a-string/) → [14](https://leetcode.com/problems/longest-common-prefix/) → [443](https://leetcode.com/problems/string-compression/) | 123 |
| 2 | Đếm ký tự, Hash Map và anagram | [383](https://leetcode.com/problems/ransom-note/) → [242](https://leetcode.com/problems/valid-anagram/) → [387](https://leetcode.com/problems/first-unique-character-in-a-string/) → [389](https://leetcode.com/problems/find-the-difference/) → [409](https://leetcode.com/problems/longest-palindrome/) → [771](https://leetcode.com/problems/jewels-and-stones/) → [205](https://leetcode.com/problems/isomorphic-strings/) → [290](https://leetcode.com/problems/word-pattern/) → [49](https://leetcode.com/problems/group-anagrams/) → [451](https://leetcode.com/problems/sort-characters-by-frequency/) → [1657](https://leetcode.com/problems/determine-if-two-strings-are-close/) | 136 |
| 3 | Two pointers và subsequence | [125](https://leetcode.com/problems/valid-palindrome/) → [680](https://leetcode.com/problems/valid-palindrome-ii/) → [345](https://leetcode.com/problems/reverse-vowels-of-a-string/) → [917](https://leetcode.com/problems/reverse-only-letters/) → [844](https://leetcode.com/problems/backspace-string-compare/) → [392](https://leetcode.com/problems/is-subsequence/) → [524](https://leetcode.com/problems/longest-word-in-dictionary-through-deleting/) → [1750](https://leetcode.com/problems/minimum-length-of-string-after-deleting-similar-ends/) | 38 |
| 4 | Sliding window và substring | [1456](https://leetcode.com/problems/maximum-number-of-vowels-in-a-substring-of-given-length/) → [1876](https://leetcode.com/problems/substrings-of-size-three-with-distinct-characters/) → [3](https://leetcode.com/problems/longest-substring-without-repeating-characters/) → [438](https://leetcode.com/problems/find-all-anagrams-in-a-string/) → [567](https://leetcode.com/problems/permutation-in-string/) → [424](https://leetcode.com/problems/longest-repeating-character-replacement/) → [159](https://leetcode.com/problems/longest-substring-with-at-most-two-distinct-characters/) → [340](https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters/) → [1358](https://leetcode.com/problems/number-of-substrings-containing-all-three-characters/) → [76](https://leetcode.com/problems/minimum-window-substring/) → [30](https://leetcode.com/problems/substring-with-concatenation-of-all-words/) | 37 |
| 5 | Stack, ngoặc và xóa ký tự | [20](https://leetcode.com/problems/valid-parentheses/) → [1021](https://leetcode.com/problems/remove-outermost-parentheses/) → [1047](https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/) → [1209](https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string-ii/) → [1249](https://leetcode.com/problems/minimum-remove-to-make-valid-parentheses/) → [921](https://leetcode.com/problems/minimum-add-to-make-parentheses-valid/) → [856](https://leetcode.com/problems/score-of-parentheses/) → [1541](https://leetcode.com/problems/minimum-insertions-to-balance-a-parentheses-string/) → [2116](https://leetcode.com/problems/check-if-a-parentheses-string-can-be-valid/) → [678](https://leetcode.com/problems/valid-parenthesis-string/) → [32](https://leetcode.com/problems/longest-valid-parentheses/) → [1190](https://leetcode.com/problems/reverse-substrings-between-each-pair-of-parentheses/) → [394](https://leetcode.com/problems/decode-string/) → [71](https://leetcode.com/problems/simplify-path/) | 33 |
| 6 | Parsing, số lớn và biểu thức | [13](https://leetcode.com/problems/roman-to-integer/) → [12](https://leetcode.com/problems/integer-to-roman/) → [67](https://leetcode.com/problems/add-binary/) → [415](https://leetcode.com/problems/add-strings/) → [8](https://leetcode.com/problems/string-to-integer-atoi/) → [43](https://leetcode.com/problems/multiply-strings/) → [65](https://leetcode.com/problems/valid-number/) → [227](https://leetcode.com/problems/basic-calculator-ii/) → [224](https://leetcode.com/problems/basic-calculator/) → [726](https://leetcode.com/problems/number-of-atoms/) → [770](https://leetcode.com/problems/basic-calculator-iv/) → [3481](https://leetcode.com/problems/apply-substitutions/) | 55 |
| 7 | String matching, KMP và hashing | [28](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/) → [459](https://leetcode.com/problems/repeated-substring-pattern/) → [796](https://leetcode.com/problems/rotate-string/) → [686](https://leetcode.com/problems/repeated-string-match/) → [1392](https://leetcode.com/problems/longest-happy-prefix/) → [214](https://leetcode.com/problems/shortest-palindrome/) → [187](https://leetcode.com/problems/repeated-dna-sequences/) → [1044](https://leetcode.com/problems/longest-duplicate-substring/) → [1316](https://leetcode.com/problems/distinct-echo-substrings/) → [2301](https://leetcode.com/problems/match-substring-after-replacement/) | 22 |
| 8 | Trie, prefix và dictionary | [208](https://leetcode.com/problems/implement-trie-prefix-tree/) → [211](https://leetcode.com/problems/design-add-and-search-words-data-structure/) → [648](https://leetcode.com/problems/replace-words/) → [677](https://leetcode.com/problems/map-sum-pairs/) → [1268](https://leetcode.com/problems/search-suggestions-system/) → [2416](https://leetcode.com/problems/sum-of-prefix-scores-of-strings/) → [745](https://leetcode.com/problems/prefix-and-suffix-search/) → [212](https://leetcode.com/problems/word-search-ii/) | 37 |
| 9 | Backtracking và đệ quy trên chuỗi | [17](https://leetcode.com/problems/letter-combinations-of-a-phone-number/) → [22](https://leetcode.com/problems/generate-parentheses/) → [93](https://leetcode.com/problems/restore-ip-addresses/) → [131](https://leetcode.com/problems/palindrome-partitioning/) → [784](https://leetcode.com/problems/letter-case-permutation/) → [1239](https://leetcode.com/problems/maximum-length-of-a-concatenated-string-with-unique-characters/) → [301](https://leetcode.com/problems/remove-invalid-parentheses/) → [241](https://leetcode.com/problems/different-ways-to-add-parentheses/) → [1096](https://leetcode.com/problems/brace-expansion-ii/) | 30 |
| 10 | DP, palindrome và subsequence | [5](https://leetcode.com/problems/longest-palindromic-substring/) → [647](https://leetcode.com/problems/palindromic-substrings/) → [516](https://leetcode.com/problems/longest-palindromic-subsequence/) → [1143](https://leetcode.com/problems/longest-common-subsequence/) → [583](https://leetcode.com/problems/delete-operation-for-two-strings/) → [72](https://leetcode.com/problems/edit-distance/) → [97](https://leetcode.com/problems/interleaving-string/) → [115](https://leetcode.com/problems/distinct-subsequences/) → [139](https://leetcode.com/problems/word-break/) → [91](https://leetcode.com/problems/decode-ways/) → [1312](https://leetcode.com/problems/minimum-insertion-steps-to-make-a-string-palindrome/) → [132](https://leetcode.com/problems/palindrome-partitioning-ii/) → [10](https://leetcode.com/problems/regular-expression-matching/) → [44](https://leetcode.com/problems/wildcard-matching/) → [1531](https://leetcode.com/problems/string-compression-ii/) → [664](https://leetcode.com/problems/strange-printer/) → [730](https://leetcode.com/problems/count-different-palindromic-subsequences/) | 89 |
| 11 | Greedy, sắp xếp và thứ tự từ điển | [1663](https://leetcode.com/problems/smallest-string-with-a-given-numeric-value/) → [767](https://leetcode.com/problems/reorganize-string/) → [791](https://leetcode.com/problems/custom-sort-string/) → [316](https://leetcode.com/problems/remove-duplicate-letters/) → [402](https://leetcode.com/problems/remove-k-digits/) → [1081](https://leetcode.com/problems/smallest-subsequence-of-distinct-characters/) → [761](https://leetcode.com/problems/special-binary-string/) → [899](https://leetcode.com/problems/orderly-queue/) → [2434](https://leetcode.com/problems/using-a-robot-to-print-the-lexicographically-smallest-string/) | 107 |
| 12 | Kết hợp thuật toán nâng cao | [1397](https://leetcode.com/problems/find-all-good-strings/) → [2213](https://leetcode.com/problems/longest-substring-of-one-repeating-character/) → [3045](https://leetcode.com/problems/count-prefix-and-suffix-pairs-ii/) → [3306](https://leetcode.com/problems/count-of-substrings-containing-every-vowel-and-k-consonants-ii/) → [3518](https://leetcode.com/problems/smallest-palindromic-rearrangement-ii/) | 62 |

## Phần A — Nền tảng nên học trước

### A.1. Duyệt, biến đổi và mô phỏng chuỗi (12 bài)

Quản lý chỉ số, ký tự, prefix; phân biệt nối chuỗi với sửa chuỗi.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 1 | [58. Length of Last Word](https://leetcode.com/problems/length-of-last-word/) | Easy |  | Có |
| 2 | [709. To Lower Case](https://leetcode.com/problems/to-lower-case/) | Easy |  | Có |
| 3 | [1108. Defanging an IP Address](https://leetcode.com/problems/defanging-an-ip-address/) | Easy |  | Có |
| 4 | [1662. Check If Two String Arrays are Equivalent](https://leetcode.com/problems/check-if-two-string-arrays-are-equivalent/) | Easy |  | Có |
| 5 | [1678. Goal Parser Interpretation](https://leetcode.com/problems/goal-parser-interpretation/) | Easy |  | Có |
| 6 | [1768. Merge Strings Alternately](https://leetcode.com/problems/merge-strings-alternately/) | Easy |  | Có |
| 7 | [344. Reverse String](https://leetcode.com/problems/reverse-string/) | Easy |  | Có |
| 8 | [541. Reverse String II](https://leetcode.com/problems/reverse-string-ii/) | Easy |  | Chưa |
| 9 | [557. Reverse Words in a String III](https://leetcode.com/problems/reverse-words-in-a-string-iii/) | Easy |  | Chưa |
| 10 | [151. Reverse Words in a String](https://leetcode.com/problems/reverse-words-in-a-string/) | Medium |  | Chưa |
| 11 | [14. Longest Common Prefix](https://leetcode.com/problems/longest-common-prefix/) | Easy |  | Có |
| 12 | [443. String Compression](https://leetcode.com/problems/string-compression/) | Medium |  | Có |

### A.2. Đếm ký tự, Hash Map và anagram (11 bài)

Đếm tần suất, ánh xạ một-một, nhóm các chuỗi theo chữ ký.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 13 | [383. Ransom Note](https://leetcode.com/problems/ransom-note/) | Easy |  | Có |
| 14 | [242. Valid Anagram](https://leetcode.com/problems/valid-anagram/) | Easy |  | Chưa |
| 15 | [387. First Unique Character in a String](https://leetcode.com/problems/first-unique-character-in-a-string/) | Easy |  | Có |
| 16 | [389. Find the Difference](https://leetcode.com/problems/find-the-difference/) | Easy |  | Chưa |
| 17 | [409. Longest Palindrome](https://leetcode.com/problems/longest-palindrome/) | Easy |  | Chưa |
| 18 | [771. Jewels and Stones](https://leetcode.com/problems/jewels-and-stones/) | Easy |  | Có |
| 19 | [205. Isomorphic Strings](https://leetcode.com/problems/isomorphic-strings/) | Easy |  | Có |
| 20 | [290. Word Pattern](https://leetcode.com/problems/word-pattern/) | Easy |  | Chưa |
| 21 | [49. Group Anagrams](https://leetcode.com/problems/group-anagrams/) | Medium |  | Có |
| 22 | [451. Sort Characters By Frequency](https://leetcode.com/problems/sort-characters-by-frequency/) | Medium |  | Chưa |
| 23 | [1657. Determine if Two Strings Are Close](https://leetcode.com/problems/determine-if-two-strings-are-close/) | Medium |  | Chưa |

### A.3. Two pointers và subsequence (8 bài)

Giữ invariant của hai con trỏ; phân biệt substring và subsequence.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 24 | [125. Valid Palindrome](https://leetcode.com/problems/valid-palindrome/) | Easy |  | Có |
| 25 | [680. Valid Palindrome II](https://leetcode.com/problems/valid-palindrome-ii/) | Easy |  | Có |
| 26 | [345. Reverse Vowels of a String](https://leetcode.com/problems/reverse-vowels-of-a-string/) | Easy |  | Chưa |
| 27 | [917. Reverse Only Letters](https://leetcode.com/problems/reverse-only-letters/) | Easy |  | Chưa |
| 28 | [844. Backspace String Compare](https://leetcode.com/problems/backspace-string-compare/) | Easy |  | Chưa |
| 29 | [392. Is Subsequence](https://leetcode.com/problems/is-subsequence/) | Easy |  | Có |
| 30 | [524. Longest Word in Dictionary through Deleting](https://leetcode.com/problems/longest-word-in-dictionary-through-deleting/) | Medium |  | Chưa |
| 31 | [1750. Minimum Length of String After Deleting Similar Ends](https://leetcode.com/problems/minimum-length-of-string-after-deleting-similar-ends/) | Medium |  | Chưa |

### A.4. Sliding window và substring (11 bài)

Biết khi nào mở rộng/co cửa sổ; theo dõi tần suất và độ hợp lệ.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 32 | [1456. Maximum Number of Vowels in a Substring of Given Length](https://leetcode.com/problems/maximum-number-of-vowels-in-a-substring-of-given-length/) | Medium |  | Có |
| 33 | [1876. Substrings of Size Three with Distinct Characters](https://leetcode.com/problems/substrings-of-size-three-with-distinct-characters/) | Easy |  | Chưa |
| 34 | [3. Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/) | Medium |  | Có |
| 35 | [438. Find All Anagrams in a String](https://leetcode.com/problems/find-all-anagrams-in-a-string/) | Medium |  | Có |
| 36 | [567. Permutation in String](https://leetcode.com/problems/permutation-in-string/) | Medium |  | Có |
| 37 | [424. Longest Repeating Character Replacement](https://leetcode.com/problems/longest-repeating-character-replacement/) | Medium |  | Có |
| 38 | [159. Longest Substring with At Most Two Distinct Characters](https://leetcode.com/problems/longest-substring-with-at-most-two-distinct-characters/) | Medium | 🔒 | Có |
| 39 | [340. Longest Substring with At Most K Distinct Characters](https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters/) | Medium | 🔒 | Có |
| 40 | [1358. Number of Substrings Containing All Three Characters](https://leetcode.com/problems/number-of-substrings-containing-all-three-characters/) | Medium |  | Có |
| 41 | [76. Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/) | Hard |  | Có |
| 42 | [30. Substring with Concatenation of All Words](https://leetcode.com/problems/substring-with-concatenation-of-all-words/) | Hard |  | Có |

### A.5. Stack, ngoặc và xóa ký tự (14 bài)

Theo dõi stack hoặc balance; xử lý lồng nhau và giữ tính hợp lệ.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 43 | [20. Valid Parentheses](https://leetcode.com/problems/valid-parentheses/) | Easy |  | Có |
| 44 | [1021. Remove Outermost Parentheses](https://leetcode.com/problems/remove-outermost-parentheses/) | Easy |  | Có |
| 45 | [1047. Remove All Adjacent Duplicates In String](https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/) | Easy |  | Chưa |
| 46 | [1209. Remove All Adjacent Duplicates in String II](https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string-ii/) | Medium |  | Chưa |
| 47 | [1249. Minimum Remove to Make Valid Parentheses](https://leetcode.com/problems/minimum-remove-to-make-valid-parentheses/) | Medium |  | Có |
| 48 | [921. Minimum Add to Make Parentheses Valid](https://leetcode.com/problems/minimum-add-to-make-parentheses-valid/) | Medium |  | Có |
| 49 | [856. Score of Parentheses](https://leetcode.com/problems/score-of-parentheses/) | Medium |  | Có |
| 50 | [1541. Minimum Insertions to Balance a Parentheses String](https://leetcode.com/problems/minimum-insertions-to-balance-a-parentheses-string/) | Medium |  | Có |
| 51 | [2116. Check if a Parentheses String Can Be Valid](https://leetcode.com/problems/check-if-a-parentheses-string-can-be-valid/) | Medium |  | Có |
| 52 | [678. Valid Parenthesis String](https://leetcode.com/problems/valid-parenthesis-string/) | Medium |  | Có |
| 53 | [32. Longest Valid Parentheses](https://leetcode.com/problems/longest-valid-parentheses/) | Hard |  | Có |
| 54 | [1190. Reverse Substrings Between Each Pair of Parentheses](https://leetcode.com/problems/reverse-substrings-between-each-pair-of-parentheses/) | Medium |  | Có |
| 55 | [394. Decode String](https://leetcode.com/problems/decode-string/) | Medium |  | Có |
| 56 | [71. Simplify Path](https://leetcode.com/problems/simplify-path/) | Medium |  | Có |

### A.6. Parsing, số lớn và biểu thức (12 bài)

Đọc token, xử lý dấu/độ ưu tiên; tính trên chữ số và mở rộng biến.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 57 | [13. Roman to Integer](https://leetcode.com/problems/roman-to-integer/) | Easy |  | Có |
| 58 | [12. Integer to Roman](https://leetcode.com/problems/integer-to-roman/) | Medium |  | Chưa |
| 59 | [67. Add Binary](https://leetcode.com/problems/add-binary/) | Easy |  | Có |
| 60 | [415. Add Strings](https://leetcode.com/problems/add-strings/) | Easy |  | Chưa |
| 61 | [8. String to Integer (atoi)](https://leetcode.com/problems/string-to-integer-atoi/) | Medium |  | Có |
| 62 | [43. Multiply Strings](https://leetcode.com/problems/multiply-strings/) | Medium |  | Có |
| 63 | [65. Valid Number](https://leetcode.com/problems/valid-number/) | Hard |  | Có |
| 64 | [227. Basic Calculator II](https://leetcode.com/problems/basic-calculator-ii/) | Medium |  | Chưa |
| 65 | [224. Basic Calculator](https://leetcode.com/problems/basic-calculator/) | Hard |  | Có |
| 66 | [726. Number of Atoms](https://leetcode.com/problems/number-of-atoms/) | Hard |  | Chưa |
| 67 | [770. Basic Calculator IV](https://leetcode.com/problems/basic-calculator-iv/) | Hard |  | Có |
| 68 | [3481. Apply Substitutions](https://leetcode.com/problems/apply-substitutions/) | Medium | 🔒 | Có |

### A.7. String matching, KMP và hashing (10 bài)

Tìm pattern, xây prefix function; kiểm soát va chạm khi dùng hash.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 69 | [28. Find the Index of the First Occurrence in a String](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/) | Easy |  | Có |
| 70 | [459. Repeated Substring Pattern](https://leetcode.com/problems/repeated-substring-pattern/) | Easy |  | Chưa |
| 71 | [796. Rotate String](https://leetcode.com/problems/rotate-string/) | Easy |  | Chưa |
| 72 | [686. Repeated String Match](https://leetcode.com/problems/repeated-string-match/) | Medium |  | Chưa |
| 73 | [1392. Longest Happy Prefix](https://leetcode.com/problems/longest-happy-prefix/) | Hard |  | Chưa |
| 74 | [214. Shortest Palindrome](https://leetcode.com/problems/shortest-palindrome/) | Hard |  | Có |
| 75 | [187. Repeated DNA Sequences](https://leetcode.com/problems/repeated-dna-sequences/) | Medium |  | Chưa |
| 76 | [1044. Longest Duplicate Substring](https://leetcode.com/problems/longest-duplicate-substring/) | Hard |  | Có |
| 77 | [1316. Distinct Echo Substrings](https://leetcode.com/problems/distinct-echo-substrings/) | Hard |  | Chưa |
| 78 | [2301. Match Substring After Replacement](https://leetcode.com/problems/match-substring-after-replacement/) | Hard |  | Có |

### A.8. Trie, prefix và dictionary (8 bài)

Biểu diễn từ trong trie, tìm kiếm prefix và kết hợp tìm kiếm trên bàn cờ.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 79 | [208. Implement Trie (Prefix Tree)](https://leetcode.com/problems/implement-trie-prefix-tree/) | Medium |  | Có |
| 80 | [211. Design Add and Search Words Data Structure](https://leetcode.com/problems/design-add-and-search-words-data-structure/) | Medium |  | Có |
| 81 | [648. Replace Words](https://leetcode.com/problems/replace-words/) | Medium |  | Có |
| 82 | [677. Map Sum Pairs](https://leetcode.com/problems/map-sum-pairs/) | Medium |  | Có |
| 83 | [1268. Search Suggestions System](https://leetcode.com/problems/search-suggestions-system/) | Medium |  | Có |
| 84 | [2416. Sum of Prefix Scores of Strings](https://leetcode.com/problems/sum-of-prefix-scores-of-strings/) | Hard |  | Có |
| 85 | [745. Prefix and Suffix Search](https://leetcode.com/problems/prefix-and-suffix-search/) | Hard |  | Có |
| 86 | [212. Word Search II](https://leetcode.com/problems/word-search-ii/) | Hard |  | Có |

### A.9. Backtracking và đệ quy trên chuỗi (9 bài)

Chọn–khám phá–hoàn tác; tách bài toán con và tránh sinh kết quả không hợp lệ.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 87 | [17. Letter Combinations of a Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/) | Medium |  | Có |
| 88 | [22. Generate Parentheses](https://leetcode.com/problems/generate-parentheses/) | Medium |  | Có |
| 89 | [93. Restore IP Addresses](https://leetcode.com/problems/restore-ip-addresses/) | Medium |  | Chưa |
| 90 | [131. Palindrome Partitioning](https://leetcode.com/problems/palindrome-partitioning/) | Medium |  | Có |
| 91 | [784. Letter Case Permutation](https://leetcode.com/problems/letter-case-permutation/) | Medium |  | Có |
| 92 | [1239. Maximum Length of a Concatenated String with Unique Characters](https://leetcode.com/problems/maximum-length-of-a-concatenated-string-with-unique-characters/) | Medium |  | Chưa |
| 93 | [301. Remove Invalid Parentheses](https://leetcode.com/problems/remove-invalid-parentheses/) | Hard |  | Có |
| 94 | [241. Different Ways to Add Parentheses](https://leetcode.com/problems/different-ways-to-add-parentheses/) | Medium |  | Có |
| 95 | [1096. Brace Expansion II](https://leetcode.com/problems/brace-expansion-ii/) | Hard |  | Có |

### A.10. DP, palindrome và subsequence (17 bài)

Viết rõ ý nghĩa trạng thái và base case; xử lý DP một chuỗi, hai chuỗi và khoảng.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 96 | [5. Longest Palindromic Substring](https://leetcode.com/problems/longest-palindromic-substring/) | Medium |  | Có |
| 97 | [647. Palindromic Substrings](https://leetcode.com/problems/palindromic-substrings/) | Medium |  | Chưa |
| 98 | [516. Longest Palindromic Subsequence](https://leetcode.com/problems/longest-palindromic-subsequence/) | Medium |  | Có |
| 99 | [1143. Longest Common Subsequence](https://leetcode.com/problems/longest-common-subsequence/) | Medium |  | Có |
| 100 | [583. Delete Operation for Two Strings](https://leetcode.com/problems/delete-operation-for-two-strings/) | Medium |  | Có |
| 101 | [72. Edit Distance](https://leetcode.com/problems/edit-distance/) | Medium |  | Có |
| 102 | [97. Interleaving String](https://leetcode.com/problems/interleaving-string/) | Medium |  | Có |
| 103 | [115. Distinct Subsequences](https://leetcode.com/problems/distinct-subsequences/) | Hard |  | Có |
| 104 | [139. Word Break](https://leetcode.com/problems/word-break/) | Medium |  | Có |
| 105 | [91. Decode Ways](https://leetcode.com/problems/decode-ways/) | Medium |  | Có |
| 106 | [1312. Minimum Insertion Steps to Make a String Palindrome](https://leetcode.com/problems/minimum-insertion-steps-to-make-a-string-palindrome/) | Hard |  | Có |
| 107 | [132. Palindrome Partitioning II](https://leetcode.com/problems/palindrome-partitioning-ii/) | Hard |  | Có |
| 108 | [10. Regular Expression Matching](https://leetcode.com/problems/regular-expression-matching/) | Hard |  | Có |
| 109 | [44. Wildcard Matching](https://leetcode.com/problems/wildcard-matching/) | Hard |  | Có |
| 110 | [1531. String Compression II](https://leetcode.com/problems/string-compression-ii/) | Hard |  | Có |
| 111 | [664. Strange Printer](https://leetcode.com/problems/strange-printer/) | Hard |  | Có |
| 112 | [730. Count Different Palindromic Subsequences](https://leetcode.com/problems/count-different-palindromic-subsequences/) | Hard |  | Có |

### A.11. Greedy, sắp xếp và thứ tự từ điển (9 bài)

Chứng minh lựa chọn tham lam; dùng heap hoặc monotonic stack khi cần.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 113 | [1663. Smallest String With A Given Numeric Value](https://leetcode.com/problems/smallest-string-with-a-given-numeric-value/) | Medium |  | Chưa |
| 114 | [767. Reorganize String](https://leetcode.com/problems/reorganize-string/) | Medium |  | Có |
| 115 | [791. Custom Sort String](https://leetcode.com/problems/custom-sort-string/) | Medium |  | Chưa |
| 116 | [316. Remove Duplicate Letters](https://leetcode.com/problems/remove-duplicate-letters/) | Medium |  | Có |
| 117 | [402. Remove K Digits](https://leetcode.com/problems/remove-k-digits/) | Medium |  | Có |
| 118 | [1081. Smallest Subsequence of Distinct Characters](https://leetcode.com/problems/smallest-subsequence-of-distinct-characters/) | Medium |  | Có |
| 119 | [761. Special Binary String](https://leetcode.com/problems/special-binary-string/) | Hard |  | Có |
| 120 | [899. Orderly Queue](https://leetcode.com/problems/orderly-queue/) | Hard |  | Có |
| 121 | [2434. Using a Robot to Print the Lexicographically Smallest String](https://leetcode.com/problems/using-a-robot-to-print-the-lexicographically-smallest-string/) | Medium |  | Chưa |

### A.12. Kết hợp thuật toán nâng cao (5 bài)

Ghép các nền tảng đã học: KMP + DP, rolling hash + binary search, segment tree, trie và counting.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 122 | [1397. Find All Good Strings](https://leetcode.com/problems/find-all-good-strings/) | Hard |  | Có |
| 123 | [2213. Longest Substring of One Repeating Character](https://leetcode.com/problems/longest-substring-of-one-repeating-character/) | Hard |  | Có |
| 124 | [3045. Count Prefix and Suffix Pairs II](https://leetcode.com/problems/count-prefix-and-suffix-pairs-ii/) | Hard |  | Có |
| 125 | [3306. Count of Substrings Containing Every Vowel and K Consonants II](https://leetcode.com/problems/count-of-substrings-containing-every-vowel-and-k-consonants-ii/) | Medium |  | Có |
| 126 | [3518. Smallest Palindromic Rearrangement II](https://leetcode.com/problems/smallest-palindromic-rearrangement-ii/) | Hard |  | Có |

## Phần B — Toàn bộ bài còn lại

### B.1. Duyệt, biến đổi và mô phỏng chuỗi (123 bài)

Quản lý chỉ số, ký tự, prefix; phân biệt nối chuỗi với sửa chuỗi.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 127 | [243. Shortest Word Distance](https://leetcode.com/problems/shortest-word-distance/) | Easy | 🔒 | Chưa |
| 128 | [293. Flip Game](https://leetcode.com/problems/flip-game/) | Easy | 🔒 | Chưa |
| 129 | [434. Number of Segments in a String](https://leetcode.com/problems/number-of-segments-in-a-string/) | Easy |  | Chưa |
| 130 | [482. License Key Formatting](https://leetcode.com/problems/license-key-formatting/) | Easy |  | Chưa |
| 131 | [520. Detect Capital](https://leetcode.com/problems/detect-capital/) | Easy |  | Chưa |
| 132 | [521. Longest Uncommon Subsequence I](https://leetcode.com/problems/longest-uncommon-subsequence-i/) | Easy |  | Chưa |
| 133 | [551. Student Attendance Record I](https://leetcode.com/problems/student-attendance-record-i/) | Easy |  | Chưa |
| 134 | [604. Design Compressed String Iterator](https://leetcode.com/problems/design-compressed-string-iterator/) | Easy | 🔒 | Chưa |
| 135 | [657. Robot Return to Origin](https://leetcode.com/problems/robot-return-to-origin/) | Easy |  | Chưa |
| 136 | [806. Number of Lines To Write String](https://leetcode.com/problems/number-of-lines-to-write-string/) | Easy |  | Chưa |
| 137 | [824. Goat Latin](https://leetcode.com/problems/goat-latin/) | Easy |  | Chưa |
| 138 | [830. Positions of Large Groups](https://leetcode.com/problems/positions-of-large-groups/) | Easy |  | Chưa |
| 139 | [944. Delete Columns to Make Sorted](https://leetcode.com/problems/delete-columns-to-make-sorted/) | Easy |  | Chưa |
| 140 | [1078. Occurrences After Bigram](https://leetcode.com/problems/occurrences-after-bigram/) | Easy |  | Chưa |
| 141 | [1119. Remove Vowels from a String](https://leetcode.com/problems/remove-vowels-from-a-string/) | Easy | 🔒 | Chưa |
| 142 | [1374. Generate a String With Characters That Have Odd Counts](https://leetcode.com/problems/generate-a-string-with-characters-that-have-odd-counts/) | Easy |  | Chưa |
| 143 | [1417. Reformat The String](https://leetcode.com/problems/reformat-the-string/) | Easy |  | Chưa |
| 144 | [1422. Maximum Score After Splitting a String](https://leetcode.com/problems/maximum-score-after-splitting-a-string/) | Easy |  | Chưa |
| 145 | [1446. Consecutive Characters](https://leetcode.com/problems/consecutive-characters/) | Easy |  | Chưa |
| 146 | [1507. Reformat Date](https://leetcode.com/problems/reformat-date/) | Easy |  | Chưa |
| 147 | [1528. Shuffle String](https://leetcode.com/problems/shuffle-string/) | Easy |  | Chưa |
| 148 | [1556. Thousand Separator](https://leetcode.com/problems/thousand-separator/) | Easy |  | Chưa |
| 149 | [1576. Replace All ?'s to Avoid Consecutive Repeating Characters](https://leetcode.com/problems/replace-all-s-to-avoid-consecutive-repeating-characters/) | Easy |  | Chưa |
| 150 | [1592. Rearrange Spaces Between Words](https://leetcode.com/problems/rearrange-spaces-between-words/) | Easy |  | Chưa |
| 151 | [1629. Slowest Key](https://leetcode.com/problems/slowest-key/) | Easy |  | Chưa |
| 152 | [1694. Reformat Phone Number](https://leetcode.com/problems/reformat-phone-number/) | Easy |  | Chưa |
| 153 | [1758. Minimum Changes To Make Alternating Binary String](https://leetcode.com/problems/minimum-changes-to-make-alternating-binary-string/) | Easy |  | Chưa |
| 154 | [1773. Count Items Matching a Rule](https://leetcode.com/problems/count-items-matching-a-rule/) | Easy |  | Chưa |
| 155 | [1784. Check if Binary String Has at Most One Segment of Ones](https://leetcode.com/problems/check-if-binary-string-has-at-most-one-segment-of-ones/) | Easy |  | Chưa |
| 156 | [1816. Truncate Sentence](https://leetcode.com/problems/truncate-sentence/) | Easy |  | Chưa |
| 157 | [1844. Replace All Digits with Characters](https://leetcode.com/problems/replace-all-digits-with-characters/) | Easy |  | Chưa |
| 158 | [1869. Longer Contiguous Segments of Ones than Zeros](https://leetcode.com/problems/longer-contiguous-segments-of-ones-than-zeros/) | Easy |  | Chưa |
| 159 | [1880. Check if Word Equals Summation of Two Words](https://leetcode.com/problems/check-if-word-equals-summation-of-two-words/) | Easy |  | Chưa |
| 160 | [1933. Check if String Is Decomposable Into Value-Equal Substrings](https://leetcode.com/problems/check-if-string-is-decomposable-into-value-equal-substrings/) | Easy | 🔒 | Chưa |
| 161 | [1945. Sum of Digits of String After Convert](https://leetcode.com/problems/sum-of-digits-of-string-after-convert/) | Easy |  | Chưa |
| 162 | [1957. Delete Characters to Make Fancy String](https://leetcode.com/problems/delete-characters-to-make-fancy-string/) | Easy |  | Chưa |
| 163 | [1967. Number of Strings That Appear as Substrings in Word](https://leetcode.com/problems/number-of-strings-that-appear-as-substrings-in-word/) | Easy |  | Có |
| 164 | [2011. Final Value of Variable After Performing Operations](https://leetcode.com/problems/final-value-of-variable-after-performing-operations/) | Easy |  | Chưa |
| 165 | [2042. Check if Numbers Are Ascending in a Sentence](https://leetcode.com/problems/check-if-numbers-are-ascending-in-a-sentence/) | Easy |  | Chưa |
| 166 | [2047. Number of Valid Words in a Sentence](https://leetcode.com/problems/number-of-valid-words-in-a-sentence/) | Easy |  | Chưa |
| 167 | [2114. Maximum Number of Words Found in Sentences](https://leetcode.com/problems/maximum-number-of-words-found-in-sentences/) | Easy |  | Chưa |
| 168 | [2124. Check if All A's Appears Before All B's](https://leetcode.com/problems/check-if-all-as-appears-before-all-bs/) | Easy |  | Chưa |
| 169 | [2129. Capitalize the Title](https://leetcode.com/problems/capitalize-the-title/) | Easy |  | Chưa |
| 170 | [2138. Divide a String Into Groups of Size k](https://leetcode.com/problems/divide-a-string-into-groups-of-size-k/) | Easy |  | Có |
| 171 | [2194. Cells in a Range on an Excel Sheet](https://leetcode.com/problems/cells-in-a-range-on-an-excel-sheet/) | Easy |  | Chưa |
| 172 | [2243. Calculate Digit Sum of a String](https://leetcode.com/problems/calculate-digit-sum-of-a-string/) | Easy |  | Chưa |
| 173 | [2255. Count Prefixes of a Given String](https://leetcode.com/problems/count-prefixes-of-a-given-string/) | Easy |  | Chưa |
| 174 | [2264. Largest 3-Same-Digit Number in String](https://leetcode.com/problems/largest-3-same-digit-number-in-string/) | Easy |  | Chưa |
| 175 | [2278. Percentage of Letter in String](https://leetcode.com/problems/percentage-of-letter-in-string/) | Easy |  | Chưa |
| 176 | [2299. Strong Password Checker II](https://leetcode.com/problems/strong-password-checker-ii/) | Easy |  | Chưa |
| 177 | [2315. Count Asterisks](https://leetcode.com/problems/count-asterisks/) | Easy |  | Chưa |
| 178 | [2437. Number of Valid Clock Times](https://leetcode.com/problems/number-of-valid-clock-times/) | Easy |  | Chưa |
| 179 | [2446. Determine if Two Events Have Conflict](https://leetcode.com/problems/determine-if-two-events-have-conflict/) | Easy |  | Chưa |
| 180 | [2490. Circular Sentence](https://leetcode.com/problems/circular-sentence/) | Easy |  | Chưa |
| 181 | [2496. Maximum Value of a String in an Array](https://leetcode.com/problems/maximum-value-of-a-string-in-an-array/) | Easy |  | Chưa |
| 182 | [2515. Shortest Distance to Target String in a Circular Array](https://leetcode.com/problems/shortest-distance-to-target-string-in-a-circular-array/) | Easy |  | Chưa |
| 183 | [2609. Find the Longest Balanced Substring of a Binary String](https://leetcode.com/problems/find-the-longest-balanced-substring-of-a-binary-string/) | Easy |  | Chưa |
| 184 | [2678. Number of Senior Citizens](https://leetcode.com/problems/number-of-senior-citizens/) | Easy |  | Chưa |
| 185 | [2710. Remove Trailing Zeros From a String](https://leetcode.com/problems/remove-trailing-zeros-from-a-string/) | Easy |  | Chưa |
| 186 | [2788. Split Strings by Separator](https://leetcode.com/problems/split-strings-by-separator/) | Easy |  | Chưa |
| 187 | [2810. Faulty Keyboard](https://leetcode.com/problems/faulty-keyboard/) | Easy |  | Chưa |
| 188 | [2828. Check if a String Is an Acronym of Words](https://leetcode.com/problems/check-if-a-string-is-an-acronym-of-words/) | Easy |  | Chưa |
| 189 | [2839. Check if Strings Can be Made Equal With Operations I](https://leetcode.com/problems/check-if-strings-can-be-made-equal-with-operations-i/) | Easy |  | Chưa |
| 190 | [2937. Make Three Strings Equal](https://leetcode.com/problems/make-three-strings-equal/) | Easy |  | Chưa |
| 191 | [2942. Find Words Containing Character](https://leetcode.com/problems/find-words-containing-character/) | Easy |  | Chưa |
| 192 | [3019. Number of Changing Keys](https://leetcode.com/problems/number-of-changing-keys/) | Easy |  | Chưa |
| 193 | [3110. Score of a String](https://leetcode.com/problems/score-of-a-string/) | Easy |  | Chưa |
| 194 | [3114. Latest Time You Can Obtain After Replacing Characters](https://leetcode.com/problems/latest-time-you-can-obtain-after-replacing-characters/) | Easy |  | Chưa |
| 195 | [3136. Valid Word](https://leetcode.com/problems/valid-word/) | Easy |  | Chưa |
| 196 | [3168. Minimum Number of Chairs in a Waiting Room](https://leetcode.com/problems/minimum-number-of-chairs-in-a-waiting-room/) | Easy |  | Chưa |
| 197 | [3210. Find the Encrypted String](https://leetcode.com/problems/find-the-encrypted-string/) | Easy |  | Chưa |
| 198 | [3248. Snake in Matrix](https://leetcode.com/problems/snake-in-matrix/) | Easy |  | Chưa |
| 199 | [3330. Find the Original Typed String I](https://leetcode.com/problems/find-the-original-typed-string-i/) | Easy |  | Chưa |
| 200 | [3340. Check Balanced String](https://leetcode.com/problems/check-balanced-string/) | Easy |  | Chưa |
| 201 | [3456. Find Special Substring of Length K](https://leetcode.com/problems/find-special-substring-of-length-k/) | Easy |  | Chưa |
| 202 | [3498. Reverse Degree of a String](https://leetcode.com/problems/reverse-degree-of-a-string/) | Easy |  | Có |
| 203 | [3571. Find the Shortest Superstring II](https://leetcode.com/problems/find-the-shortest-superstring-ii/) | Easy | 🔒 | Chưa |
| 204 | [3582. Generate Tag for Video Caption](https://leetcode.com/problems/generate-tag-for-video-caption/) | Easy |  | Chưa |
| 205 | [3696. Maximum Distance Between Unequal Words in Array I](https://leetcode.com/problems/maximum-distance-between-unequal-words-in-array-i/) | Easy | 🔒 | Chưa |
| 206 | [3707. Equal Score Substrings](https://leetcode.com/problems/equal-score-substrings/) | Easy |  | Chưa |
| 207 | [3798. Largest Even Number](https://leetcode.com/problems/largest-even-number/) | Easy |  | Chưa |
| 208 | [3813. Vowel-Consonant Score](https://leetcode.com/problems/vowel-consonant-score/) | Easy |  | Chưa |
| 209 | [3838. Weighted Word Mapping](https://leetcode.com/problems/weighted-word-mapping/) | Easy |  | Chưa |
| 210 | [3856. Trim Trailing Vowels](https://leetcode.com/problems/trim-trailing-vowels/) | Easy |  | Chưa |
| 211 | [3921. Score Validator](https://leetcode.com/problems/score-validator/) | Easy |  | Chưa |
| 212 | [3931. Check Adjacent Digit Differences](https://leetcode.com/problems/check-adjacent-digit-differences/) | Easy |  | Chưa |
| 213 | [6. Zigzag Conversion](https://leetcode.com/problems/zigzag-conversion/) | Medium |  | Chưa |
| 214 | [38. Count and Say](https://leetcode.com/problems/count-and-say/) | Medium |  | Chưa |
| 215 | [245. Shortest Word Distance III](https://leetcode.com/problems/shortest-word-distance-iii/) | Medium | 🔒 | Chưa |
| 216 | [271. Encode and Decode Strings](https://leetcode.com/problems/encode-and-decode-strings/) | Medium | 🔒 | Chưa |
| 217 | [468. Validate IP Address](https://leetcode.com/problems/validate-ip-address/) | Medium |  | Chưa |
| 218 | [722. Remove Comments](https://leetcode.com/problems/remove-comments/) | Medium |  | Chưa |
| 219 | [831. Masking Personal Information](https://leetcode.com/problems/masking-personal-information/) | Medium |  | Chưa |
| 220 | [848. Shifting Letters](https://leetcode.com/problems/shifting-letters/) | Medium |  | Chưa |
| 221 | [1236. Web Crawler](https://leetcode.com/problems/web-crawler/) | Medium | 🔒 | Có |
| 222 | [1324. Print Words Vertically](https://leetcode.com/problems/print-words-vertically/) | Medium |  | Chưa |
| 223 | [1625. Lexicographically Smallest String After Applying Operations](https://leetcode.com/problems/lexicographically-smallest-string-after-applying-operations/) | Medium |  | Chưa |
| 224 | [1769. Minimum Number of Operations to Move All Balls to Each Box](https://leetcode.com/problems/minimum-number-of-operations-to-move-all-balls-to-each-box/) | Medium |  | Chưa |
| 225 | [2075. Decode the Slanted Ciphertext](https://leetcode.com/problems/decode-the-slanted-ciphertext/) | Medium |  | Chưa |
| 226 | [2120. Execution of All Suffix Instructions Staying in a Grid](https://leetcode.com/problems/execution-of-all-suffix-instructions-staying-in-a-grid/) | Medium |  | Chưa |
| 227 | [2232. Minimize Result by Adding Parentheses to Expression](https://leetcode.com/problems/minimize-result-by-adding-parentheses-to-expression/) | Medium |  | Có |
| 228 | [2288. Apply Discount to Prices](https://leetcode.com/problems/apply-discount-to-prices/) | Medium |  | Chưa |
| 229 | [2381. Shifting Letters II](https://leetcode.com/problems/shifting-letters-ii/) | Medium |  | Chưa |
| 230 | [2391. Minimum Amount of Time to Collect Garbage](https://leetcode.com/problems/minimum-amount-of-time-to-collect-garbage/) | Medium |  | Chưa |
| 231 | [2414. Length of the Longest Alphabetical Continuous Substring](https://leetcode.com/problems/length-of-the-longest-alphabetical-continuous-substring/) | Medium |  | Chưa |
| 232 | [2483. Minimum Penalty for a Shop](https://leetcode.com/problems/minimum-penalty-for-a-shop/) | Medium |  | Chưa |
| 233 | [2559. Count Vowel Strings in Ranges](https://leetcode.com/problems/count-vowel-strings-in-ranges/) | Medium |  | Chưa |
| 234 | [2914. Minimum Number of Changes to Make Binary String Beautiful](https://leetcode.com/problems/minimum-number-of-changes-to-make-binary-string-beautiful/) | Medium |  | Chưa |
| 235 | [3163. String Compression III](https://leetcode.com/problems/string-compression-iii/) | Medium |  | Chưa |
| 236 | [3234. Count the Number of Substrings With Dominant Ones](https://leetcode.com/problems/count-the-number-of-substrings-with-dominant-ones/) | Medium |  | Chưa |
| 237 | [3271. Hash Divided String](https://leetcode.com/problems/hash-divided-string/) | Medium |  | Chưa |
| 238 | [3324. Find the Sequence of Strings Appeared on the Screen](https://leetcode.com/problems/find-the-sequence-of-strings-appeared-on-the-screen/) | Medium |  | Chưa |
| 239 | [3361. Shift Distance Between Two Strings](https://leetcode.com/problems/shift-distance-between-two-strings/) | Medium |  | Chưa |
| 240 | [3499. Maximize Active Section with Trade I](https://leetcode.com/problems/maximize-active-section-with-trade-i/) | Medium |  | Có |
| 241 | [3598. Longest Common Prefix Between Adjacent Strings After Removals](https://leetcode.com/problems/longest-common-prefix-between-adjacent-strings-after-removals/) | Medium |  | Chưa |
| 242 | [3612. Process String with Special Operations I](https://leetcode.com/problems/process-string-with-special-operations-i/) | Medium |  | Chưa |
| 243 | [3706. Maximum Distance Between Unequal Words in Array II](https://leetcode.com/problems/maximum-distance-between-unequal-words-in-array-ii/) | Medium | 🔒 | Chưa |
| 244 | [3744. Find Kth Character in Expanded String](https://leetcode.com/problems/find-kth-character-in-expanded-string/) | Medium | 🔒 | Chưa |
| 245 | [3863. Minimum Operations to Sort a String](https://leetcode.com/problems/minimum-operations-to-sort-a-string/) | Medium |  | Chưa |
| 246 | [3922. Minimum Flips to Make Binary String Coherent](https://leetcode.com/problems/minimum-flips-to-make-binary-string-coherent/) | Medium |  | Chưa |
| 247 | [68. Text Justification](https://leetcode.com/problems/text-justification/) | Hard |  | Có |
| 248 | [2468. Split Message Based on Limit](https://leetcode.com/problems/split-message-based-on-limit/) | Hard |  | Chưa |
| 249 | [3614. Process String with Special Operations II](https://leetcode.com/problems/process-string-with-special-operations-ii/) | Hard |  | Chưa |

### B.2. Đếm ký tự, Hash Map và anagram (136 bài)

Đếm tần suất, ánh xạ một-một, nhóm các chuỗi theo chữ ký.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 250 | [266. Palindrome Permutation](https://leetcode.com/problems/palindrome-permutation/) | Easy | 🔒 | Chưa |
| 251 | [500. Keyboard Row](https://leetcode.com/problems/keyboard-row/) | Easy |  | Chưa |
| 252 | [599. Minimum Index Sum of Two Lists](https://leetcode.com/problems/minimum-index-sum-of-two-lists/) | Easy |  | Chưa |
| 253 | [734. Sentence Similarity](https://leetcode.com/problems/sentence-similarity/) | Easy | 🔒 | Có |
| 254 | [748. Shortest Completing Word](https://leetcode.com/problems/shortest-completing-word/) | Easy |  | Chưa |
| 255 | [804. Unique Morse Code Words](https://leetcode.com/problems/unique-morse-code-words/) | Easy |  | Có |
| 256 | [819. Most Common Word](https://leetcode.com/problems/most-common-word/) | Easy |  | Chưa |
| 257 | [859. Buddy Strings](https://leetcode.com/problems/buddy-strings/) | Easy |  | Chưa |
| 258 | [884. Uncommon Words from Two Sentences](https://leetcode.com/problems/uncommon-words-from-two-sentences/) | Easy |  | Chưa |
| 259 | [929. Unique Email Addresses](https://leetcode.com/problems/unique-email-addresses/) | Easy |  | Chưa |
| 260 | [953. Verifying an Alien Dictionary](https://leetcode.com/problems/verifying-an-alien-dictionary/) | Easy |  | Chưa |
| 261 | [1002. Find Common Characters](https://leetcode.com/problems/find-common-characters/) | Easy |  | Chưa |
| 262 | [1160. Find Words That Can Be Formed by Characters](https://leetcode.com/problems/find-words-that-can-be-formed-by-characters/) | Easy |  | Chưa |
| 263 | [1165. Single-Row Keyboard](https://leetcode.com/problems/single-row-keyboard/) | Easy | 🔒 | Chưa |
| 264 | [1189. Maximum Number of Balloons](https://leetcode.com/problems/maximum-number-of-balloons/) | Easy |  | Chưa |
| 265 | [1370. Increasing Decreasing String](https://leetcode.com/problems/increasing-decreasing-string/) | Easy |  | Chưa |
| 266 | [1436. Destination City](https://leetcode.com/problems/destination-city/) | Easy |  | Chưa |
| 267 | [1496. Path Crossing](https://leetcode.com/problems/path-crossing/) | Easy |  | Chưa |
| 268 | [1624. Largest Substring Between Two Equal Characters](https://leetcode.com/problems/largest-substring-between-two-equal-characters/) | Easy |  | Chưa |
| 269 | [1684. Count the Number of Consistent Strings](https://leetcode.com/problems/count-the-number-of-consistent-strings/) | Easy |  | Chưa |
| 270 | [1704. Determine if String Halves Are Alike](https://leetcode.com/problems/determine-if-string-halves-are-alike/) | Easy |  | Chưa |
| 271 | [1790. Check if One String Swap Can Make Strings Equal](https://leetcode.com/problems/check-if-one-string-swap-can-make-strings-equal/) | Easy |  | Chưa |
| 272 | [1796. Second Largest Digit in a String](https://leetcode.com/problems/second-largest-digit-in-a-string/) | Easy |  | Chưa |
| 273 | [1805. Number of Different Integers in a String](https://leetcode.com/problems/number-of-different-integers-in-a-string/) | Easy |  | Chưa |
| 274 | [1832. Check if the Sentence Is Pangram](https://leetcode.com/problems/check-if-the-sentence-is-pangram/) | Easy |  | Chưa |
| 275 | [1897. Redistribute Characters to Make All Strings Equal](https://leetcode.com/problems/redistribute-characters-to-make-all-strings-equal/) | Easy |  | Chưa |
| 276 | [1935. Maximum Number of Words You Can Type](https://leetcode.com/problems/maximum-number-of-words-you-can-type/) | Easy |  | Chưa |
| 277 | [1941. Check if All Characters Have Equal Number of Occurrences](https://leetcode.com/problems/check-if-all-characters-have-equal-number-of-occurrences/) | Easy |  | Chưa |
| 278 | [2053. Kth Distinct String in an Array](https://leetcode.com/problems/kth-distinct-string-in-an-array/) | Easy |  | Chưa |
| 279 | [2062. Count Vowel Substrings of a String](https://leetcode.com/problems/count-vowel-substrings-of-a-string/) | Easy |  | Chưa |
| 280 | [2068. Check Whether Two Strings are Almost Equivalent](https://leetcode.com/problems/check-whether-two-strings-are-almost-equivalent/) | Easy |  | Chưa |
| 281 | [2085. Count Common Words With One Occurrence](https://leetcode.com/problems/count-common-words-with-one-occurrence/) | Easy |  | Chưa |
| 282 | [2103. Rings and Rods](https://leetcode.com/problems/rings-and-rods/) | Easy |  | Chưa |
| 283 | [2283. Check if Number Has Equal Digit Count and Digit Value](https://leetcode.com/problems/check-if-number-has-equal-digit-count-and-digit-value/) | Easy |  | Chưa |
| 284 | [2287. Rearrange Characters to Make Target String](https://leetcode.com/problems/rearrange-characters-to-make-target-string/) | Easy |  | Chưa |
| 285 | [2309. Greatest English Letter in Upper and Lower Case](https://leetcode.com/problems/greatest-english-letter-in-upper-and-lower-case/) | Easy |  | Chưa |
| 286 | [2325. Decode the Message](https://leetcode.com/problems/decode-the-message/) | Easy |  | Chưa |
| 287 | [2351. First Letter to Appear Twice](https://leetcode.com/problems/first-letter-to-appear-twice/) | Easy |  | Chưa |
| 288 | [2399. Check Distances Between Same Letters](https://leetcode.com/problems/check-distances-between-same-letters/) | Easy |  | Chưa |
| 289 | [2423. Remove Letter To Equalize Frequency](https://leetcode.com/problems/remove-letter-to-equalize-frequency/) | Easy |  | Chưa |
| 290 | [2451. Odd String Difference](https://leetcode.com/problems/odd-string-difference/) | Easy |  | Chưa |
| 291 | [2506. Count Pairs Of Similar Strings](https://leetcode.com/problems/count-pairs-of-similar-strings/) | Easy |  | Chưa |
| 292 | [2586. Count the Number of Vowel Strings in Range](https://leetcode.com/problems/count-the-number-of-vowel-strings-in-range/) | Easy |  | Chưa |
| 293 | [2716. Minimize String Length](https://leetcode.com/problems/minimize-string-length/) | Easy |  | Chưa |
| 294 | [2744. Find Maximum Number of String Pairs](https://leetcode.com/problems/find-maximum-number-of-string-pairs/) | Easy |  | Chưa |
| 295 | [2833. Furthest Point From Origin](https://leetcode.com/problems/furthest-point-from-origin/) | Easy |  | Chưa |
| 296 | [3083. Existence of a Substring in a String and Its Reverse](https://leetcode.com/problems/existence-of-a-substring-in-a-string-and-its-reverse/) | Easy |  | Chưa |
| 297 | [3120. Count the Number of Special Characters I](https://leetcode.com/problems/count-the-number-of-special-characters-i/) | Easy |  | Chưa |
| 298 | [3146. Permutation Difference between Two Strings](https://leetcode.com/problems/permutation-difference-between-two-strings/) | Easy |  | Chưa |
| 299 | [3438. Find Valid Pair of Adjacent Digits in String](https://leetcode.com/problems/find-valid-pair-of-adjacent-digits-in-string/) | Easy |  | Chưa |
| 300 | [3442. Maximum Difference Between Even and Odd Frequency I](https://leetcode.com/problems/maximum-difference-between-even-and-odd-frequency-i/) | Easy |  | Chưa |
| 301 | [3541. Find Most Frequent Vowel and Consonant](https://leetcode.com/problems/find-most-frequent-vowel-and-consonant/) | Easy |  | Chưa |
| 302 | [3581. Count Odd Letters from Number](https://leetcode.com/problems/count-odd-letters-from-number/) | Easy | 🔒 | Chưa |
| 303 | [3662. Filter Characters by Frequency](https://leetcode.com/problems/filter-characters-by-frequency/) | Easy | 🔒 | Chưa |
| 304 | [3692. Majority Frequency Characters](https://leetcode.com/problems/majority-frequency-characters/) | Easy |  | Chưa |
| 305 | [3803. Count Residue Prefixes](https://leetcode.com/problems/count-residue-prefixes/) | Easy |  | Chưa |
| 306 | [4006. Count Valid Prefixes](https://leetcode.com/problems/count-valid-prefixes/) | Easy |  | Chưa |
| 307 | [166. Fraction to Recurring Decimal](https://leetcode.com/problems/fraction-to-recurring-decimal/) | Medium |  | Chưa |
| 308 | [249. Group Shifted Strings](https://leetcode.com/problems/group-shifted-strings/) | Medium | 🔒 | Chưa |
| 309 | [288. Unique Word Abbreviation](https://leetcode.com/problems/unique-word-abbreviation/) | Medium | 🔒 | Chưa |
| 310 | [299. Bulls and Cows](https://leetcode.com/problems/bulls-and-cows/) | Medium |  | Chưa |
| 311 | [423. Reconstruct Original Digits from English](https://leetcode.com/problems/reconstruct-original-digits-from-english/) | Medium |  | Chưa |
| 312 | [433. Minimum Genetic Mutation](https://leetcode.com/problems/minimum-genetic-mutation/) | Medium |  | Chưa |
| 313 | [535. Encode and Decode TinyURL](https://leetcode.com/problems/encode-and-decode-tinyurl/) | Medium |  | Chưa |
| 314 | [609. Find Duplicate File in System](https://leetcode.com/problems/find-duplicate-file-in-system/) | Medium |  | Chưa |
| 315 | [635. Design Log Storage System](https://leetcode.com/problems/design-log-storage-system/) | Medium | 🔒 | Có |
| 316 | [752. Open the Lock](https://leetcode.com/problems/open-the-lock/) | Medium |  | Có |
| 317 | [811. Subdomain Visit Count](https://leetcode.com/problems/subdomain-visit-count/) | Medium |  | Chưa |
| 318 | [890. Find and Replace Pattern](https://leetcode.com/problems/find-and-replace-pattern/) | Medium |  | Chưa |
| 319 | [916. Word Subsets](https://leetcode.com/problems/word-subsets/) | Medium |  | Chưa |
| 320 | [966. Vowel Spellchecker](https://leetcode.com/problems/vowel-spellchecker/) | Medium |  | Chưa |
| 321 | [981. Time Based Key-Value Store](https://leetcode.com/problems/time-based-key-value-store/) | Medium |  | Chưa |
| 322 | [1138. Alphabet Board Path](https://leetcode.com/problems/alphabet-board-path/) | Medium |  | Chưa |
| 323 | [1177. Can Make Palindrome from Substring](https://leetcode.com/problems/can-make-palindrome-from-substring/) | Medium |  | Chưa |
| 324 | [1347. Minimum Number of Steps to Make Two Strings Anagram](https://leetcode.com/problems/minimum-number-of-steps-to-make-two-strings-anagram/) | Medium |  | Chưa |
| 325 | [1371. Find the Longest Substring Containing Vowels in Even Counts](https://leetcode.com/problems/find-the-longest-substring-containing-vowels-in-even-counts/) | Medium |  | Chưa |
| 326 | [1396. Design Underground System](https://leetcode.com/problems/design-underground-system/) | Medium |  | Chưa |
| 327 | [1419. Minimum Number of Frogs Croaking](https://leetcode.com/problems/minimum-number-of-frogs-croaking/) | Medium |  | Chưa |
| 328 | [1452. People Whose List of Favorite Companies Is Not a Subset of Another List](https://leetcode.com/problems/people-whose-list-of-favorite-companies-is-not-a-subset-of-another-list/) | Medium |  | Chưa |
| 329 | [1487. Making File Names Unique](https://leetcode.com/problems/making-file-names-unique/) | Medium |  | Chưa |
| 330 | [1540. Can Convert String in K Moves](https://leetcode.com/problems/can-convert-string-in-k-moves/) | Medium |  | Chưa |
| 331 | [1737. Change Minimum Characters to Satisfy One of Three Conditions](https://leetcode.com/problems/change-minimum-characters-to-satisfy-one-of-three-conditions/) | Medium |  | Chưa |
| 332 | [1781. Sum of Beauty of All Substrings](https://leetcode.com/problems/sum-of-beauty-of-all-substrings/) | Medium |  | Chưa |
| 333 | [1807. Evaluate the Bracket Pairs of a String](https://leetcode.com/problems/evaluate-the-bracket-pairs-of-a-string/) | Medium |  | Chưa |
| 334 | [1915. Number of Wonderful Substrings](https://leetcode.com/problems/number-of-wonderful-substrings/) | Medium |  | Chưa |
| 335 | [1930. Unique Length-3 Palindromic Subsequences](https://leetcode.com/problems/unique-length-3-palindromic-subsequences/) | Medium |  | Chưa |
| 336 | [2023. Number of Pairs of Strings With Concatenation Equal to Target](https://leetcode.com/problems/number-of-pairs-of-strings-with-concatenation-equal-to-target/) | Medium |  | Chưa |
| 337 | [2083. Substrings That Begin and End With the Same Letter](https://leetcode.com/problems/substrings-that-begin-and-end-with-the-same-letter/) | Medium | 🔒 | Chưa |
| 338 | [2166. Design Bitset](https://leetcode.com/problems/design-bitset/) | Medium |  | Chưa |
| 339 | [2186. Minimum Number of Steps to Make Two Strings Anagram II](https://leetcode.com/problems/minimum-number-of-steps-to-make-two-strings-anagram-ii/) | Medium |  | Chưa |
| 340 | [2284. Sender With Largest Word Count](https://leetcode.com/problems/sender-with-largest-word-count/) | Medium |  | Chưa |
| 341 | [2408. Design SQL](https://leetcode.com/problems/design-sql/) | Medium |  | Chưa |
| 342 | [2489. Number of Substrings With Fixed Ratio](https://leetcode.com/problems/number-of-substrings-with-fixed-ratio/) | Medium | 🔒 | Chưa |
| 343 | [2531. Make Number of Distinct Characters Equal](https://leetcode.com/problems/make-number-of-distinct-characters-equal/) | Medium |  | Chưa |
| 344 | [2539. Count the Number of Good Subsequences](https://leetcode.com/problems/count-the-number-of-good-subsequences/) | Medium | 🔒 | Chưa |
| 345 | [2564. Substring XOR Queries](https://leetcode.com/problems/substring-xor-queries/) | Medium |  | Chưa |
| 346 | [2947. Count Beautiful Substrings I](https://leetcode.com/problems/count-beautiful-substrings-i/) | Medium |  | Chưa |
| 347 | [2950. Number of Divisible Substrings](https://leetcode.com/problems/number-of-divisible-substrings/) | Medium | 🔒 | Chưa |
| 348 | [2955. Number of Same-End Substrings](https://leetcode.com/problems/number-of-same-end-substrings/) | Medium | 🔒 | Chưa |
| 349 | [3078. Match Alphanumerical Pattern in Matrix I](https://leetcode.com/problems/match-alphanumerical-pattern-in-matrix-i/) | Medium | 🔒 | Chưa |
| 350 | [3084. Count Substrings Starting and Ending with Given Character](https://leetcode.com/problems/count-substrings-starting-and-ending-with-given-character/) | Medium |  | Chưa |
| 351 | [3121. Count the Number of Special Characters II](https://leetcode.com/problems/count-the-number-of-special-characters-ii/) | Medium |  | Có |
| 352 | [3137. Minimum Number of Operations to Make Word K-Periodic](https://leetcode.com/problems/minimum-number-of-operations-to-make-word-k-periodic/) | Medium |  | Chưa |
| 353 | [3138. Minimum Length of Anagram Concatenation](https://leetcode.com/problems/minimum-length-of-anagram-concatenation/) | Medium |  | Chưa |
| 354 | [3223. Minimum Length of String After Operations](https://leetcode.com/problems/minimum-length-of-string-after-operations/) | Medium |  | Chưa |
| 355 | [3295. Report Spam Message](https://leetcode.com/problems/report-spam-message/) | Medium |  | Chưa |
| 356 | [3443. Maximum Manhattan Distance After K Changes](https://leetcode.com/problems/maximum-manhattan-distance-after-k-changes/) | Medium |  | Chưa |
| 357 | [3484. Design Spreadsheet](https://leetcode.com/problems/design-spreadsheet/) | Medium |  | Chưa |
| 358 | [3522. Calculate Score After Performing Instructions](https://leetcode.com/problems/calculate-score-after-performing-instructions/) | Medium |  | Chưa |
| 359 | [3527. Find the Most Common Response](https://leetcode.com/problems/find-the-most-common-response/) | Medium |  | Chưa |
| 360 | [3664. Two-Letter Card Game](https://leetcode.com/problems/two-letter-card-game/) | Medium |  | Chưa |
| 361 | [3713. Longest Balanced Substring I](https://leetcode.com/problems/longest-balanced-substring-i/) | Medium |  | Chưa |
| 362 | [3714. Longest Balanced Substring II](https://leetcode.com/problems/longest-balanced-substring-ii/) | Medium |  | Chưa |
| 363 | [3760. Maximum Substrings With Distinct Start](https://leetcode.com/problems/maximum-substrings-with-distinct-start/) | Medium |  | Chưa |
| 364 | [3773. Maximum Number of Equal Length Runs](https://leetcode.com/problems/maximum-number-of-equal-length-runs/) | Medium | 🔒 | Chưa |
| 365 | [3784. Minimum Deletion Cost to Make All Characters Equal](https://leetcode.com/problems/minimum-deletion-cost-to-make-all-characters-equal/) | Medium |  | Chưa |
| 366 | [3805. Count Caesar Cipher Pairs](https://leetcode.com/problems/count-caesar-cipher-pairs/) | Medium |  | Chưa |
| 367 | [3839. Number of Prefix Connected Groups](https://leetcode.com/problems/number-of-prefix-connected-groups/) | Medium |  | Chưa |
| 368 | [3846. Total Distance to Type a String Using One Finger](https://leetcode.com/problems/total-distance-to-type-a-string-using-one-finger/) | Medium | 🔒 | Chưa |
| 369 | [3853. Merge Close Characters](https://leetcode.com/problems/merge-close-characters/) | Medium |  | Chưa |
| 370 | [3860. Unique Email Groups](https://leetcode.com/problems/unique-email-groups/) | Medium | 🔒 | Chưa |
| 371 | [3889. Mirror Frequency Distance](https://leetcode.com/problems/mirror-frequency-distance/) | Medium |  | Chưa |
| 372 | [3900. Longest Balanced Substring After One Swap](https://leetcode.com/problems/longest-balanced-substring-after-one-swap/) | Medium |  | Chưa |
| 373 | [3926. Count Valid Word Occurrences](https://leetcode.com/problems/count-valid-word-occurrences/) | Medium |  | Chưa |
| 374 | [3941. Password Strength](https://leetcode.com/problems/password-strength/) | Medium |  | Chưa |
| 375 | [3968. Maximum Manhattan Distance After All Moves](https://leetcode.com/problems/maximum-manhattan-distance-after-all-moves/) | Medium |  | Chưa |
| 376 | [4019. Merge Close Characters II](https://leetcode.com/problems/merge-close-characters-ii/) | Medium | 🔒 | Chưa |
| 377 | [127. Word Ladder](https://leetcode.com/problems/word-ladder/) | Hard |  | Có |
| 378 | [854. K-Similar Strings](https://leetcode.com/problems/k-similar-strings/) | Hard |  | Chưa |
| 379 | [1542. Find Longest Awesome Substring](https://leetcode.com/problems/find-longest-awesome-substring/) | Hard |  | Chưa |
| 380 | [1830. Minimum Number of Operations to Make String Sorted](https://leetcode.com/problems/minimum-number-of-operations-to-make-string-sorted/) | Hard |  | Chưa |
| 381 | [2306. Naming a Company](https://leetcode.com/problems/naming-a-company/) | Hard |  | Chưa |
| 382 | [2514. Count Anagrams](https://leetcode.com/problems/count-anagrams/) | Hard |  | Chưa |
| 383 | [2949. Count Beautiful Substrings II](https://leetcode.com/problems/count-beautiful-substrings-ii/) | Hard |  | Chưa |
| 384 | [2983. Palindrome Rearrangement Queries](https://leetcode.com/problems/palindrome-rearrangement-queries/) | Hard |  | Chưa |
| 385 | [3279. Maximum Total Area Occupied by Pistons](https://leetcode.com/problems/maximum-total-area-occupied-by-pistons/) | Hard | 🔒 | Chưa |

### B.3. Two pointers và subsequence (38 bài)

Giữ invariant của hai con trỏ; phân biệt substring và subsequence.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 386 | [246. Strobogrammatic Number](https://leetcode.com/problems/strobogrammatic-number/) | Easy | 🔒 | Có |
| 387 | [408. Valid Word Abbreviation](https://leetcode.com/problems/valid-word-abbreviation/) | Easy | 🔒 | Chưa |
| 388 | [696. Count Binary Substrings](https://leetcode.com/problems/count-binary-substrings/) | Easy |  | Chưa |
| 389 | [821. Shortest Distance to a Character](https://leetcode.com/problems/shortest-distance-to-a-character/) | Easy |  | Chưa |
| 390 | [925. Long Pressed Name](https://leetcode.com/problems/long-pressed-name/) | Easy |  | Chưa |
| 391 | [1332. Remove Palindromic Subsequences](https://leetcode.com/problems/remove-palindromic-subsequences/) | Easy |  | Chưa |
| 392 | [1961. Check If String Is a Prefix of Array](https://leetcode.com/problems/check-if-string-is-a-prefix-of-array/) | Easy |  | Chưa |
| 393 | [2108. Find First Palindromic String in the Array](https://leetcode.com/problems/find-first-palindromic-string-in-the-array/) | Easy |  | Chưa |
| 394 | [3750. Minimum Number of Flips to Reverse Binary String](https://leetcode.com/problems/minimum-number-of-flips-to-reverse-binary-string/) | Easy |  | Chưa |
| 395 | [3794. Reverse String Prefix](https://leetcode.com/problems/reverse-string-prefix/) | Easy |  | Chưa |
| 396 | [3823. Reverse Letters Then Special Characters in a String](https://leetcode.com/problems/reverse-letters-then-special-characters-in-a-string/) | Easy |  | Chưa |
| 397 | [3884. First Matching Character From Both Ends](https://leetcode.com/problems/first-matching-character-from-both-ends/) | Easy |  | Chưa |
| 398 | [4030. Check ASCII Palindromic](https://leetcode.com/problems/check-ascii-palindromic/) | Easy |  | Chưa |
| 399 | [161. One Edit Distance](https://leetcode.com/problems/one-edit-distance/) | Medium | 🔒 | Chưa |
| 400 | [165. Compare Version Numbers](https://leetcode.com/problems/compare-version-numbers/) | Medium |  | Chưa |
| 401 | [186. Reverse Words in a String II](https://leetcode.com/problems/reverse-words-in-a-string-ii/) | Medium | 🔒 | Chưa |
| 402 | [244. Shortest Word Distance II](https://leetcode.com/problems/shortest-word-distance-ii/) | Medium | 🔒 | Chưa |
| 403 | [481. Magical String](https://leetcode.com/problems/magical-string/) | Medium |  | Chưa |
| 404 | [556. Next Greater Element III](https://leetcode.com/problems/next-greater-element-iii/) | Medium |  | Chưa |
| 405 | [777. Swap Adjacent in LR String](https://leetcode.com/problems/swap-adjacent-in-lr-string/) | Medium |  | Có |
| 406 | [809. Expressive Words](https://leetcode.com/problems/expressive-words/) | Medium |  | Chưa |
| 407 | [1616. Split Two Strings to Make Palindrome](https://leetcode.com/problems/split-two-strings-to-make-palindrome/) | Medium |  | Chưa |
| 408 | [1813. Sentence Similarity III](https://leetcode.com/problems/sentence-similarity-iii/) | Medium |  | Chưa |
| 409 | [1898. Maximum Number of Removable Characters](https://leetcode.com/problems/maximum-number-of-removable-characters/) | Medium |  | Chưa |
| 410 | [2109. Adding Spaces to a String](https://leetcode.com/problems/adding-spaces-to-a-string/) | Medium |  | Chưa |
| 411 | [2330. Valid Palindrome IV](https://leetcode.com/problems/valid-palindrome-iv/) | Medium | 🔒 | Chưa |
| 412 | [2337. Move Pieces to Obtain a String](https://leetcode.com/problems/move-pieces-to-obtain-a-string/) | Medium |  | Chưa |
| 413 | [2825. Make String a Subsequence Using Cyclic Increments](https://leetcode.com/problems/make-string-a-subsequence-using-cyclic-increments/) | Medium |  | Chưa |
| 414 | [3403. Find the Lexicographically Largest String From the Box I](https://leetcode.com/problems/find-the-lexicographically-largest-string-from-the-box-i/) | Medium |  | Chưa |
| 415 | [3460. Longest Common Prefix After at Most One Removal](https://leetcode.com/problems/longest-common-prefix-after-at-most-one-removal/) | Medium | 🔒 | Chưa |
| 416 | [3775. Reverse Words With Same Vowel Count](https://leetcode.com/problems/reverse-words-with-same-vowel-count/) | Medium |  | Chưa |
| 417 | [3983. Subsequence After One Replacement](https://leetcode.com/problems/subsequence-after-one-replacement/) | Medium |  | Chưa |
| 418 | [1163. Last Substring in Lexicographical Order](https://leetcode.com/problems/last-substring-in-lexicographical-order/) | Hard |  | Chưa |
| 419 | [1842. Next Palindrome Using Same Digits](https://leetcode.com/problems/next-palindrome-using-same-digits/) | Hard | 🔒 | Chưa |
| 420 | [2565. Subsequence With the Minimum Score](https://leetcode.com/problems/subsequence-with-the-minimum-score/) | Hard |  | Chưa |
| 421 | [3406. Find the Lexicographically Largest String From the Box II](https://leetcode.com/problems/find-the-lexicographically-largest-string-from-the-box-ii/) | Hard | 🔒 | Chưa |
| 422 | [3734. Lexicographically Smallest Palindromic Permutation Greater Than Target](https://leetcode.com/problems/lexicographically-smallest-palindromic-permutation-greater-than-target/) | Hard |  | Có |
| 423 | [3999. Minimum Number of String Groups Through Transformations](https://leetcode.com/problems/minimum-number-of-string-groups-through-transformations/) | Hard |  | Chưa |

### B.4. Sliding window và substring (37 bài)

Biết khi nào mở rộng/co cửa sổ; theo dõi tần suất và độ hợp lệ.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 424 | [1763. Longest Nice Substring](https://leetcode.com/problems/longest-nice-substring/) | Easy |  | Chưa |
| 425 | [2269. Find the K-Beauty of a Number](https://leetcode.com/problems/find-the-k-beauty-of-a-number/) | Easy |  | Chưa |
| 426 | [2379. Minimum Recolors to Get K Consecutive Black Blocks](https://leetcode.com/problems/minimum-recolors-to-get-k-consecutive-black-blocks/) | Easy |  | Chưa |
| 427 | [3090. Maximum Length Substring With Two Occurrences](https://leetcode.com/problems/maximum-length-substring-with-two-occurrences/) | Easy |  | Có |
| 428 | [3258. Count Substrings That Satisfy K-Constraint I](https://leetcode.com/problems/count-substrings-that-satisfy-k-constraint-i/) | Easy |  | Chưa |
| 429 | [4043. Count Rotations With Exactly K Equal Adjacent Pairs](https://leetcode.com/problems/count-rotations-with-exactly-k-equal-adjacent-pairs/) | Easy |  | Chưa |
| 430 | [395. Longest Substring with At Least K Repeating Characters](https://leetcode.com/problems/longest-substring-with-at-least-k-repeating-characters/) | Medium |  | Chưa |
| 431 | [1016. Binary String With Substrings Representing 1 To N](https://leetcode.com/problems/binary-string-with-substrings-representing-1-to-n/) | Medium |  | Chưa |
| 432 | [1100. Find K-Length Substrings With No Repeated Characters](https://leetcode.com/problems/find-k-length-substrings-with-no-repeated-characters/) | Medium | 🔒 | Có |
| 433 | [1156. Swap For Longest Repeated Character Substring](https://leetcode.com/problems/swap-for-longest-repeated-character-substring/) | Medium |  | Chưa |
| 434 | [1208. Get Equal Substrings Within Budget](https://leetcode.com/problems/get-equal-substrings-within-budget/) | Medium |  | Có |
| 435 | [1234. Replace the Substring for Balanced String](https://leetcode.com/problems/replace-the-substring-for-balanced-string/) | Medium |  | Có |
| 436 | [1297. Maximum Number of Occurrences of a Substring](https://leetcode.com/problems/maximum-number-of-occurrences-of-a-substring/) | Medium |  | Chưa |
| 437 | [1839. Longest Substring Of All Vowels in Order](https://leetcode.com/problems/longest-substring-of-all-vowels-in-order/) | Medium |  | Chưa |
| 438 | [1871. Jump Game VII](https://leetcode.com/problems/jump-game-vii/) | Medium |  | Chưa |
| 439 | [1888. Minimum Number of Flips to Make the Binary String Alternating](https://leetcode.com/problems/minimum-number-of-flips-to-make-the-binary-string-alternating/) | Medium |  | Chưa |
| 440 | [2024. Maximize the Confusion of an Exam](https://leetcode.com/problems/maximize-the-confusion-of-an-exam/) | Medium |  | Có |
| 441 | [2067. Number of Equal Count Substrings](https://leetcode.com/problems/number-of-equal-count-substrings/) | Medium | 🔒 | Chưa |
| 442 | [2516. Take K of Each Character From Left and Right](https://leetcode.com/problems/take-k-of-each-character-from-left-and-right/) | Medium |  | Chưa |
| 443 | [2730. Find the Longest Semi-Repetitive Substring](https://leetcode.com/problems/find-the-longest-semi-repetitive-substring/) | Medium |  | Chưa |
| 444 | [2743. Count Substrings Without Repeating Character](https://leetcode.com/problems/count-substrings-without-repeating-character/) | Medium | 🔒 | Chưa |
| 445 | [2904. Shortest and Lexicographically Smallest Beautiful String](https://leetcode.com/problems/shortest-and-lexicographically-smallest-beautiful-string/) | Medium |  | Có |
| 446 | [2981. Find Longest Special Substring That Occurs Thrice I](https://leetcode.com/problems/find-longest-special-substring-that-occurs-thrice-i/) | Medium |  | Chưa |
| 447 | [2982. Find Longest Special Substring That Occurs Thrice II](https://leetcode.com/problems/find-longest-special-substring-that-occurs-thrice-ii/) | Medium |  | Chưa |
| 448 | [3135. Equalize Strings by Adding or Removing Characters at Ends](https://leetcode.com/problems/equalize-strings-by-adding-or-removing-characters-at-ends/) | Medium | 🔒 | Chưa |
| 449 | [3297. Count Substrings That Can Be Rearranged to Contain a String I](https://leetcode.com/problems/count-substrings-that-can-be-rearranged-to-contain-a-string-i/) | Medium |  | Chưa |
| 450 | [3305. Count of Substrings Containing Every Vowel and K Consonants I](https://leetcode.com/problems/count-of-substrings-containing-every-vowel-and-k-consonants-i/) | Medium |  | Chưa |
| 451 | [3325. Count Substrings With K-Frequency Characters I](https://leetcode.com/problems/count-substrings-with-k-frequency-characters-i/) | Medium |  | Chưa |
| 452 | [3694. Distinct Points Reachable After Substring Removal](https://leetcode.com/problems/distinct-points-reachable-after-substring-removal/) | Medium |  | Chưa |
| 453 | [727. Minimum Window Subsequence](https://leetcode.com/problems/minimum-window-subsequence/) | Hard | 🔒 | Chưa |
| 454 | [2156. Find Substring With Given Hash Value](https://leetcode.com/problems/find-substring-with-given-hash-value/) | Hard |  | Chưa |
| 455 | [2781. Length of the Longest Valid Substring](https://leetcode.com/problems/length-of-the-longest-valid-substring/) | Hard |  | Chưa |
| 456 | [2953. Count Complete Substrings](https://leetcode.com/problems/count-complete-substrings/) | Hard |  | Chưa |
| 457 | [3261. Count Substrings That Satisfy K-Constraint II](https://leetcode.com/problems/count-substrings-that-satisfy-k-constraint-ii/) | Hard |  | Chưa |
| 458 | [3298. Count Substrings That Can Be Rearranged to Contain a String II](https://leetcode.com/problems/count-substrings-that-can-be-rearranged-to-contain-a-string-ii/) | Hard |  | Chưa |
| 459 | [3329. Count Substrings With K-Frequency Characters II](https://leetcode.com/problems/count-substrings-with-k-frequency-characters-ii/) | Hard | 🔒 | Chưa |
| 460 | [3445. Maximum Difference Between Even and Odd Frequency II](https://leetcode.com/problems/maximum-difference-between-even-and-odd-frequency-ii/) | Hard |  | Chưa |

### B.5. Stack, ngoặc và xóa ký tự (33 bài)

Theo dõi stack hoặc balance; xử lý lồng nhau và giữ tính hợp lệ.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 461 | [1544. Make The String Great](https://leetcode.com/problems/make-the-string-great/) | Easy |  | Chưa |
| 462 | [1598. Crawler Log Folder](https://leetcode.com/problems/crawler-log-folder/) | Easy |  | Có |
| 463 | [1614. Maximum Nesting Depth of the Parentheses](https://leetcode.com/problems/maximum-nesting-depth-of-the-parentheses/) | Easy |  | Có |
| 464 | [2000. Reverse Prefix of Word](https://leetcode.com/problems/reverse-prefix-of-word/) | Easy |  | Chưa |
| 465 | [2696. Minimum String Length After Removing Substrings](https://leetcode.com/problems/minimum-string-length-after-removing-substrings/) | Easy |  | Chưa |
| 466 | [3174. Clear Digits](https://leetcode.com/problems/clear-digits/) | Easy |  | Chưa |
| 467 | [388. Longest Absolute File Path](https://leetcode.com/problems/longest-absolute-file-path/) | Medium |  | Chưa |
| 468 | [484. Find Permutation](https://leetcode.com/problems/find-permutation/) | Medium | 🔒 | Chưa |
| 469 | [880. Decoded String at Index](https://leetcode.com/problems/decoded-string-at-index/) | Medium |  | Chưa |
| 470 | [1087. Brace Expansion](https://leetcode.com/problems/brace-expansion/) | Medium | 🔒 | Chưa |
| 471 | [1111. Maximum Nesting Depth of Two Valid Parentheses Strings](https://leetcode.com/problems/maximum-nesting-depth-of-two-valid-parentheses-strings/) | Medium |  | Có |
| 472 | [1653. Minimum Deletions to Make String Balanced](https://leetcode.com/problems/minimum-deletions-to-make-string-balanced/) | Medium |  | Chưa |
| 473 | [1717. Maximum Score From Removing Substrings](https://leetcode.com/problems/maximum-score-from-removing-substrings/) | Medium |  | Chưa |
| 474 | [1910. Remove All Occurrences of a Substring](https://leetcode.com/problems/remove-all-occurrences-of-a-substring/) | Medium |  | Chưa |
| 475 | [1963. Minimum Number of Swaps to Make the String Balanced](https://leetcode.com/problems/minimum-number-of-swaps-to-make-the-string-balanced/) | Medium |  | Có |
| 476 | [2211. Count Collisions on a Road](https://leetcode.com/problems/count-collisions-on-a-road/) | Medium |  | Chưa |
| 477 | [2375. Construct Smallest Number From DI String](https://leetcode.com/problems/construct-smallest-number-from-di-string/) | Medium |  | Chưa |
| 478 | [2390. Removing Stars From a String](https://leetcode.com/problems/removing-stars-from-a-string/) | Medium |  | Chưa |
| 479 | [2645. Minimum Additions to Make Valid String](https://leetcode.com/problems/minimum-additions-to-make-valid-string/) | Medium |  | Chưa |
| 480 | [3170. Lexicographically Minimum String After Removing Stars](https://leetcode.com/problems/lexicographically-minimum-string-after-removing-stars/) | Medium |  | Có |
| 481 | [3412. Find Mirror Score of a String](https://leetcode.com/problems/find-mirror-score-of-a-string/) | Medium |  | Chưa |
| 482 | [3561. Resulting String After Adjacent Removals](https://leetcode.com/problems/resulting-string-after-adjacent-removals/) | Medium |  | Chưa |
| 483 | [3703. Remove K-Balanced Substrings](https://leetcode.com/problems/remove-k-balanced-substrings/) | Medium |  | Chưa |
| 484 | [3746. Minimum String Length After Balanced Removals](https://leetcode.com/problems/minimum-string-length-after-balanced-removals/) | Medium |  | Chưa |
| 485 | [488. Zuma Game](https://leetcode.com/problems/zuma-game/) | Hard |  | Chưa |
| 486 | [591. Tag Validator](https://leetcode.com/problems/tag-validator/) | Hard |  | Chưa |
| 487 | [936. Stamping The Sequence](https://leetcode.com/problems/stamping-the-sequence/) | Hard |  | Chưa |
| 488 | [1896. Minimum Cost to Change the Final Value of Expression](https://leetcode.com/problems/minimum-cost-to-change-the-final-value-of-expression/) | Hard |  | Chưa |
| 489 | [2019. The Score of Students Solving Math Expression](https://leetcode.com/problems/the-score-of-students-solving-math-expression/) | Hard |  | Chưa |
| 490 | [2030. Smallest K-Length Subsequence With Occurrences of a Letter](https://leetcode.com/problems/smallest-k-length-subsequence-with-occurrences-of-a-letter/) | Hard |  | Có |
| 491 | [2296. Design a Text Editor](https://leetcode.com/problems/design-a-text-editor/) | Hard |  | Chưa |
| 492 | [3749. Evaluate Valid Expressions](https://leetcode.com/problems/evaluate-valid-expressions/) | Hard | 🔒 | Chưa |
| 493 | [3816. Lexicographically Smallest String After Deleting Duplicate Characters](https://leetcode.com/problems/lexicographically-smallest-string-after-deleting-duplicate-characters/) | Hard |  | Chưa |

### B.6. Parsing, số lớn và biểu thức (55 bài)

Đọc token, xử lý dấu/độ ưu tiên; tính trên chữ số và mở rộng biến.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 494 | [168. Excel Sheet Column Title](https://leetcode.com/problems/excel-sheet-column-title/) | Easy |  | Chưa |
| 495 | [171. Excel Sheet Column Number](https://leetcode.com/problems/excel-sheet-column-number/) | Easy |  | Chưa |
| 496 | [405. Convert a Number to Hexadecimal](https://leetcode.com/problems/convert-a-number-to-hexadecimal/) | Easy |  | Chưa |
| 497 | [412. Fizz Buzz](https://leetcode.com/problems/fizz-buzz/) | Easy |  | Chưa |
| 498 | [504. Base 7](https://leetcode.com/problems/base-7/) | Easy |  | Chưa |
| 499 | [800. Similar RGB Color](https://leetcode.com/problems/similar-rgb-color/) | Easy | 🔒 | Chưa |
| 500 | [1071. Greatest Common Divisor of Strings](https://leetcode.com/problems/greatest-common-divisor-of-strings/) | Easy |  | Chưa |
| 501 | [1154. Day of the Year](https://leetcode.com/problems/day-of-the-year/) | Easy |  | Chưa |
| 502 | [1180. Count Substrings with Only One Distinct Letter](https://leetcode.com/problems/count-substrings-with-only-one-distinct-letter/) | Easy | 🔒 | Chưa |
| 503 | [1271. Hexspeak](https://leetcode.com/problems/hexspeak/) | Easy | 🔒 | Chưa |
| 504 | [1309. Decrypt String from Alphabet to Integer Mapping](https://leetcode.com/problems/decrypt-string-from-alphabet-to-integer-mapping/) | Easy |  | Chưa |
| 505 | [1360. Number of Days Between Two Dates](https://leetcode.com/problems/number-of-days-between-two-dates/) | Easy |  | Chưa |
| 506 | [1427. Perform String Shifts](https://leetcode.com/problems/perform-string-shifts/) | Easy | 🔒 | Chưa |
| 507 | [1812. Determine Color of a Chessboard Square](https://leetcode.com/problems/determine-color-of-a-chessboard-square/) | Easy |  | Chưa |
| 508 | [2409. Count Days Spent Together](https://leetcode.com/problems/count-days-spent-together/) | Easy |  | Chưa |
| 509 | [3274. Check if Two Chessboard Squares Have the Same Color](https://leetcode.com/problems/check-if-two-chessboard-squares-have-the-same-color/) | Easy |  | Chưa |
| 510 | [3280. Convert Date to Binary](https://leetcode.com/problems/convert-date-to-binary/) | Easy |  | Chưa |
| 511 | [3461. Check If Digits Are Equal in String After Operations I](https://leetcode.com/problems/check-if-digits-are-equal-in-string-after-operations-i/) | Easy |  | Chưa |
| 512 | [3602. Hexadecimal and Hexatrigesimal Conversion](https://leetcode.com/problems/hexadecimal-and-hexatrigesimal-conversion/) | Easy |  | Chưa |
| 513 | [3894. Traffic Signal Color](https://leetcode.com/problems/traffic-signal-color/) | Easy |  | Chưa |
| 514 | [3986. Number of Elapsed Seconds Between Two Times](https://leetcode.com/problems/number-of-elapsed-seconds-between-two-times/) | Easy |  | Chưa |
| 515 | [318. Maximum Product of Word Lengths](https://leetcode.com/problems/maximum-product-of-word-lengths/) | Medium |  | Có |
| 516 | [385. Mini Parser](https://leetcode.com/problems/mini-parser/) | Medium |  | Chưa |
| 517 | [439. Ternary Expression Parser](https://leetcode.com/problems/ternary-expression-parser/) | Medium | 🔒 | Chưa |
| 518 | [537. Complex Number Multiplication](https://leetcode.com/problems/complex-number-multiplication/) | Medium |  | Chưa |
| 519 | [592. Fraction Addition and Subtraction](https://leetcode.com/problems/fraction-addition-and-subtraction/) | Medium |  | Chưa |
| 520 | [640. Solve the Equation](https://leetcode.com/problems/solve-the-equation/) | Medium |  | Chưa |
| 521 | [751. IP to CIDR](https://leetcode.com/problems/ip-to-cidr/) | Medium | 🔒 | Chưa |
| 522 | [1003. Check If Word Is Valid After Substitutions](https://leetcode.com/problems/check-if-word-is-valid-after-substitutions/) | Medium |  | Chưa |
| 523 | [1041. Robot Bounded In Circle](https://leetcode.com/problems/robot-bounded-in-circle/) | Medium |  | Chưa |
| 524 | [1256. Encode Number](https://leetcode.com/problems/encode-number/) | Medium | 🔒 | Chưa |
| 525 | [1404. Number of Steps to Reduce a Number in Binary Representation to One](https://leetcode.com/problems/number-of-steps-to-reduce-a-number-in-binary-representation-to-one/) | Medium |  | Có |
| 526 | [1410. HTML Entity Parser](https://leetcode.com/problems/html-entity-parser/) | Medium |  | Chưa |
| 527 | [1447. Simplified Fractions](https://leetcode.com/problems/simplified-fractions/) | Medium |  | Chưa |
| 528 | [1513. Number of Substrings With Only 1s](https://leetcode.com/problems/number-of-substrings-with-only-1s/) | Medium |  | Chưa |
| 529 | [1573. Number of Ways to Split a String](https://leetcode.com/problems/number-of-ways-to-split-a-string/) | Medium |  | Chưa |
| 530 | [1759. Count Number of Homogenous Substrings](https://leetcode.com/problems/count-number-of-homogenous-substrings/) | Medium |  | Chưa |
| 531 | [1904. The Number of Full Rounds You Have Played](https://leetcode.com/problems/the-number-of-full-rounds-you-have-played/) | Medium |  | Chưa |
| 532 | [2125. Number of Laser Beams in a Bank](https://leetcode.com/problems/number-of-laser-beams-in-a-bank/) | Medium |  | Chưa |
| 533 | [2450. Number of Distinct Binary Strings After Applying Operations](https://leetcode.com/problems/number-of-distinct-binary-strings-after-applying-operations/) | Medium | 🔒 | Chưa |
| 534 | [2546. Apply Bitwise Operations to Make Strings Equal](https://leetcode.com/problems/apply-bitwise-operations-to-make-strings-equal/) | Medium |  | Chưa |
| 535 | [2575. Find the Divisibility Array of a String](https://leetcode.com/problems/find-the-divisibility-array-of-a-string/) | Medium |  | Chưa |
| 536 | [2802. Find The K-th Lucky Number](https://leetcode.com/problems/find-the-k-th-lucky-number/) | Medium | 🔒 | Chưa |
| 537 | [3756. Concatenate Non-Zero Digits and Multiply by Sum II](https://leetcode.com/problems/concatenate-non-zero-digits-and-multiply-by-sum-ii/) | Medium |  | Có |
| 538 | [3817. Good Indices in a Digit String](https://leetcode.com/problems/good-indices-in-a-digit-string/) | Medium | 🔒 | Chưa |
| 539 | [4021. Minimum Operations to Make a Rotated Palindrome I](https://leetcode.com/problems/minimum-operations-to-make-a-rotated-palindrome-i/) | Medium |  | Chưa |
| 540 | [273. Integer to English Words](https://leetcode.com/problems/integer-to-english-words/) | Hard |  | Chưa |
| 541 | [564. Find the Closest Palindrome](https://leetcode.com/problems/find-the-closest-palindrome/) | Hard |  | Chưa |
| 542 | [736. Parse Lisp Expression](https://leetcode.com/problems/parse-lisp-expression/) | Hard |  | Chưa |
| 543 | [772. Basic Calculator III](https://leetcode.com/problems/basic-calculator-iii/) | Hard | 🔒 | Có |
| 544 | [906. Super Palindromes](https://leetcode.com/problems/super-palindromes/) | Hard |  | Chưa |
| 545 | [972. Equal Rational Numbers](https://leetcode.com/problems/equal-rational-numbers/) | Hard |  | Chưa |
| 546 | [1106. Parsing A Boolean Expression](https://leetcode.com/problems/parsing-a-boolean-expression/) | Hard |  | Chưa |
| 547 | [3463. Check If Digits Are Equal in String After Operations II](https://leetcode.com/problems/check-if-digits-are-equal-in-string-after-operations-ii/) | Hard |  | Chưa |
| 548 | [4028. Minimum Operations to Make a Rotated Palindrome II](https://leetcode.com/problems/minimum-operations-to-make-a-rotated-palindrome-ii/) | Hard | 🔒 | Chưa |

### B.7. String matching, KMP và hashing (22 bài)

Tìm pattern, xây prefix function; kiểm soát va chạm khi dùng hash.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 549 | [1408. String Matching in an Array](https://leetcode.com/problems/string-matching-in-an-array/) | Easy |  | Chưa |
| 550 | [1455. Check If a Word Occurs As a Prefix of Any Word in a Sentence](https://leetcode.com/problems/check-if-a-word-occurs-as-a-prefix-of-any-word-in-a-sentence/) | Easy |  | Chưa |
| 551 | [1668. Maximum Repeating Substring](https://leetcode.com/problems/maximum-repeating-substring/) | Easy |  | Chưa |
| 552 | [2185. Counting Words With a Given Prefix](https://leetcode.com/problems/counting-words-with-a-given-prefix/) | Easy |  | Chưa |
| 553 | [3407. Substring Matching Pattern](https://leetcode.com/problems/substring-matching-pattern/) | Easy |  | Chưa |
| 554 | [1461. Check If a String Contains All Binary Codes of Size K](https://leetcode.com/problems/check-if-a-string-contains-all-binary-codes-of-size-k/) | Medium |  | Chưa |
| 555 | [1554. Strings Differ by One Character](https://leetcode.com/problems/strings-differ-by-one-character/) | Medium | 🔒 | Có |
| 556 | [2168. Unique Substrings With Equal Digit Frequency](https://leetcode.com/problems/unique-substrings-with-equal-digit-frequency/) | Medium | 🔒 | Chưa |
| 557 | [3006. Find Beautiful Indices in the Given Array I](https://leetcode.com/problems/find-beautiful-indices-in-the-given-array-i/) | Medium |  | Chưa |
| 558 | [3029. Minimum Time to Revert Word to Initial State I](https://leetcode.com/problems/minimum-time-to-revert-word-to-initial-state-i/) | Medium |  | Chưa |
| 559 | [3529. Count Cells in Overlapping Horizontal and Vertical Substrings](https://leetcode.com/problems/count-cells-in-overlapping-horizontal-and-vertical-substrings/) | Medium |  | Chưa |
| 560 | [1147. Longest Chunked Palindrome Decomposition](https://leetcode.com/problems/longest-chunked-palindrome-decomposition/) | Hard |  | Chưa |
| 561 | [2223. Sum of Scores of Built Strings](https://leetcode.com/problems/sum-of-scores-of-built-strings/) | Hard |  | Chưa |
| 562 | [2430. Maximum Deletions on a String](https://leetcode.com/problems/maximum-deletions-on-a-string/) | Hard |  | Chưa |
| 563 | [2851. String Transformation](https://leetcode.com/problems/string-transformation/) | Hard |  | Chưa |
| 564 | [3008. Find Beautiful Indices in the Given Array II](https://leetcode.com/problems/find-beautiful-indices-in-the-given-array-ii/) | Hard |  | Chưa |
| 565 | [3031. Minimum Time to Revert Word to Initial State II](https://leetcode.com/problems/minimum-time-to-revert-word-to-initial-state-ii/) | Hard |  | Chưa |
| 566 | [3213. Construct String with Minimum Cost](https://leetcode.com/problems/construct-string-with-minimum-cost/) | Hard |  | Chưa |
| 567 | [3303. Find the Occurrence of First Almost Equal Substring](https://leetcode.com/problems/find-the-occurrence-of-first-almost-equal-substring/) | Hard |  | Chưa |
| 568 | [3455. Shortest Matching Substring](https://leetcode.com/problems/shortest-matching-substring/) | Hard |  | Chưa |
| 569 | [3474. Lexicographically Smallest Generated String](https://leetcode.com/problems/lexicographically-smallest-generated-string/) | Hard |  | Chưa |
| 570 | [3735. Lexicographically Smallest String After Reverse II](https://leetcode.com/problems/lexicographically-smallest-string-after-reverse-ii/) | Hard | 🔒 | Có |

### B.8. Trie, prefix và dictionary (37 bài)

Biểu diễn từ trong trie, tìm kiếm prefix và kết hợp tìm kiếm trên bàn cờ.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 571 | [1065. Index Pairs of a String](https://leetcode.com/problems/index-pairs-of-a-string/) | Easy | 🔒 | Chưa |
| 572 | [3042. Count Prefix and Suffix Pairs I](https://leetcode.com/problems/count-prefix-and-suffix-pairs-i/) | Easy |  | Chưa |
| 573 | [3491. Phone Number Prefix](https://leetcode.com/problems/phone-number-prefix/) | Easy | 🔒 | Chưa |
| 574 | [616. Add Bold Tag in String](https://leetcode.com/problems/add-bold-tag-in-string/) | Medium | 🔒 | Chưa |
| 575 | [676. Implement Magic Dictionary](https://leetcode.com/problems/implement-magic-dictionary/) | Medium |  | Có |
| 576 | [692. Top K Frequent Words](https://leetcode.com/problems/top-k-frequent-words/) | Medium |  | Có |
| 577 | [720. Longest Word in Dictionary](https://leetcode.com/problems/longest-word-in-dictionary/) | Medium |  | Có |
| 578 | [758. Bold Words in String](https://leetcode.com/problems/bold-words-in-string/) | Medium | 🔒 | Chưa |
| 579 | [792. Number of Matching Subsequences](https://leetcode.com/problems/number-of-matching-subsequences/) | Medium |  | Có |
| 580 | [820. Short Encoding of Words](https://leetcode.com/problems/short-encoding-of-words/) | Medium |  | Chưa |
| 581 | [1023. Camelcase Matching](https://leetcode.com/problems/camelcase-matching/) | Medium |  | Chưa |
| 582 | [1166. Design File System](https://leetcode.com/problems/design-file-system/) | Medium | 🔒 | Có |
| 583 | [1233. Remove Sub-Folders from the Filesystem](https://leetcode.com/problems/remove-sub-folders-from-the-filesystem/) | Medium |  | Chưa |
| 584 | [1698. Number of Distinct Substrings in a String](https://leetcode.com/problems/number-of-distinct-substrings-in-a-string/) | Medium | 🔒 | Chưa |
| 585 | [1804. Implement Trie II (Prefix Tree)](https://leetcode.com/problems/implement-trie-ii-prefix-tree/) | Medium | 🔒 | Có |
| 586 | [1858. Longest Word With All Prefixes](https://leetcode.com/problems/longest-word-with-all-prefixes/) | Medium | 🔒 | Chưa |
| 587 | [2452. Words Within Two Edits of Dictionary](https://leetcode.com/problems/words-within-two-edits-of-dictionary/) | Medium |  | Chưa |
| 588 | [2707. Extra Characters in a String](https://leetcode.com/problems/extra-characters-in-a-string/) | Medium |  | Chưa |
| 589 | [3043. Find the Length of the Longest Common Prefix](https://leetcode.com/problems/find-the-length-of-the-longest-common-prefix/) | Medium |  | Chưa |
| 590 | [3076. Shortest Uncommon Substring in an Array](https://leetcode.com/problems/shortest-uncommon-substring-in-an-array/) | Medium |  | Chưa |
| 591 | [3291. Minimum Number of Valid Strings to Form Target I](https://leetcode.com/problems/minimum-number-of-valid-strings-to-form-target-i/) | Medium |  | Chưa |
| 592 | [3597. Partition String ](https://leetcode.com/problems/partition-string/) | Medium |  | Chưa |
| 593 | [3758. Convert Number Words to Digits](https://leetcode.com/problems/convert-number-words-to-digits/) | Medium | 🔒 | Chưa |
| 594 | [140. Word Break II](https://leetcode.com/problems/word-break-ii/) | Hard |  | Có |
| 595 | [336. Palindrome Pairs](https://leetcode.com/problems/palindrome-pairs/) | Hard |  | Chưa |
| 596 | [425. Word Squares](https://leetcode.com/problems/word-squares/) | Hard | 🔒 | Chưa |
| 597 | [472. Concatenated Words](https://leetcode.com/problems/concatenated-words/) | Hard |  | Chưa |
| 598 | [527. Word Abbreviation](https://leetcode.com/problems/word-abbreviation/) | Hard | 🔒 | Chưa |
| 599 | [588. Design In-Memory File System](https://leetcode.com/problems/design-in-memory-file-system/) | Hard | 🔒 | Có |
| 600 | [642. Design Search Autocomplete System](https://leetcode.com/problems/design-search-autocomplete-system/) | Hard | 🔒 | Có |
| 601 | [1032. Stream of Characters](https://leetcode.com/problems/stream-of-characters/) | Hard |  | Chưa |
| 602 | [1178. Number of Valid Words for Each Puzzle](https://leetcode.com/problems/number-of-valid-words-for-each-puzzle/) | Hard |  | Chưa |
| 603 | [1948. Delete Duplicate Folders in System](https://leetcode.com/problems/delete-duplicate-folders-in-system/) | Hard |  | Chưa |
| 604 | [2227. Encrypt and Decrypt Strings](https://leetcode.com/problems/encrypt-and-decrypt-strings/) | Hard |  | Chưa |
| 605 | [2977. Minimum Cost to Convert String II](https://leetcode.com/problems/minimum-cost-to-convert-string-ii/) | Hard |  | Chưa |
| 606 | [3093. Longest Common Suffix Queries](https://leetcode.com/problems/longest-common-suffix-queries/) | Hard |  | Chưa |
| 607 | [3485. Longest Common Prefix of K Strings After Removal](https://leetcode.com/problems/longest-common-prefix-of-k-strings-after-removal/) | Hard |  | Chưa |

### B.9. Backtracking và đệ quy trên chuỗi (30 bài)

Chọn–khám phá–hoàn tác; tách bài toán con và tránh sinh kết quả không hợp lệ.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 608 | [79. Word Search](https://leetcode.com/problems/word-search/) | Medium |  | Có |
| 609 | [267. Palindrome Permutation II](https://leetcode.com/problems/palindrome-permutation-ii/) | Medium | 🔒 | Chưa |
| 610 | [291. Word Pattern II](https://leetcode.com/problems/word-pattern-ii/) | Medium | 🔒 | Chưa |
| 611 | [306. Additive Number](https://leetcode.com/problems/additive-number/) | Medium |  | Chưa |
| 612 | [320. Generalized Abbreviation](https://leetcode.com/problems/generalized-abbreviation/) | Medium | 🔒 | Chưa |
| 613 | [681. Next Closest Time](https://leetcode.com/problems/next-closest-time/) | Medium | 🔒 | Chưa |
| 614 | [756. Pyramid Transition Matrix](https://leetcode.com/problems/pyramid-transition-matrix/) | Medium |  | Chưa |
| 615 | [816. Ambiguous Coordinates](https://leetcode.com/problems/ambiguous-coordinates/) | Medium |  | Chưa |
| 616 | [842. Split Array into Fibonacci Sequence](https://leetcode.com/problems/split-array-into-fibonacci-sequence/) | Medium |  | Chưa |
| 617 | [949. Largest Time for Given Digits](https://leetcode.com/problems/largest-time-for-given-digits/) | Medium |  | Chưa |
| 618 | [1079. Letter Tile Possibilities](https://leetcode.com/problems/letter-tile-possibilities/) | Medium |  | Chưa |
| 619 | [1286. Iterator for Combination](https://leetcode.com/problems/iterator-for-combination/) | Medium |  | Chưa |
| 620 | [1415. The k-th Lexicographical String of All Happy Strings of Length n](https://leetcode.com/problems/the-k-th-lexicographical-string-of-all-happy-strings-of-length-n/) | Medium |  | Chưa |
| 621 | [1593. Split a String Into the Max Number of Unique Substrings](https://leetcode.com/problems/split-a-string-into-the-max-number-of-unique-substrings/) | Medium |  | Chưa |
| 622 | [1849. Splitting a String Into Descending Consecutive Values](https://leetcode.com/problems/splitting-a-string-into-descending-consecutive-values/) | Medium |  | Chưa |
| 623 | [1980. Find Unique Binary String](https://leetcode.com/problems/find-unique-binary-string/) | Medium |  | Chưa |
| 624 | [2002. Maximum Product of the Length of Two Palindromic Subsequences](https://leetcode.com/problems/maximum-product-of-the-length-of-two-palindromic-subsequences/) | Medium |  | Chưa |
| 625 | [2767. Partition String Into Minimum Beautiful Substrings](https://leetcode.com/problems/partition-string-into-minimum-beautiful-substrings/) | Medium |  | Chưa |
| 626 | [3211. Generate Binary Strings Without Adjacent Zeros](https://leetcode.com/problems/generate-binary-strings-without-adjacent-zeros/) | Medium |  | Chưa |
| 627 | [3799. Word Squares II](https://leetcode.com/problems/word-squares-ii/) | Medium |  | Chưa |
| 628 | [3955. Valid Binary Strings With Cost Limit](https://leetcode.com/problems/valid-binary-strings-with-cost-limit/) | Medium |  | Chưa |
| 629 | [126. Word Ladder II](https://leetcode.com/problems/word-ladder-ii/) | Hard |  | Có |
| 630 | [282. Expression Add Operators](https://leetcode.com/problems/expression-add-operators/) | Hard |  | Có |
| 631 | [411. Minimum Unique Word Abbreviation](https://leetcode.com/problems/minimum-unique-word-abbreviation/) | Hard | 🔒 | Chưa |
| 632 | [691. Stickers to Spell Word](https://leetcode.com/problems/stickers-to-spell-word/) | Hard |  | Chưa |
| 633 | [1255. Maximum Score Words Formed by Letters](https://leetcode.com/problems/maximum-score-words-formed-by-letters/) | Hard |  | Chưa |
| 634 | [1307. Verbal Arithmetic Puzzle](https://leetcode.com/problems/verbal-arithmetic-puzzle/) | Hard |  | Chưa |
| 635 | [2014. Longest Subsequence Repeated k Times](https://leetcode.com/problems/longest-subsequence-repeated-k-times/) | Hard |  | Chưa |
| 636 | [2056. Number of Valid Move Combinations On Chessboard](https://leetcode.com/problems/number-of-valid-move-combinations-on-chessboard/) | Hard |  | Chưa |
| 637 | [3348. Smallest Divisible Digit Product II](https://leetcode.com/problems/smallest-divisible-digit-product-ii/) | Hard |  | Chưa |

### B.10. DP, palindrome và subsequence (89 bài)

Viết rõ ý nghĩa trạng thái và base case; xử lý DP một chuỗi, hai chuỗi và khoảng.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 638 | [2900. Longest Unequal Adjacent Groups Subsequence I](https://leetcode.com/problems/longest-unequal-adjacent-groups-subsequence-i/) | Easy |  | Chưa |
| 639 | [418. Sentence Screen Fitting](https://leetcode.com/problems/sentence-screen-fitting/) | Medium | 🔒 | Có |
| 640 | [467. Unique Substrings in Wraparound String](https://leetcode.com/problems/unique-substrings-in-wraparound-string/) | Medium |  | Chưa |
| 641 | [474. Ones and Zeroes](https://leetcode.com/problems/ones-and-zeroes/) | Medium |  | Có |
| 642 | [712. Minimum ASCII Delete Sum for Two Strings](https://leetcode.com/problems/minimum-ascii-delete-sum-for-two-strings/) | Medium |  | Có |
| 643 | [838. Push Dominoes](https://leetcode.com/problems/push-dominoes/) | Medium |  | Chưa |
| 644 | [926. Flip String to Monotone Increasing](https://leetcode.com/problems/flip-string-to-monotone-increasing/) | Medium |  | Chưa |
| 645 | [1048. Longest String Chain](https://leetcode.com/problems/longest-string-chain/) | Medium |  | Chưa |
| 646 | [1525. Number of Good Ways to Split a String](https://leetcode.com/problems/number-of-good-ways-to-split-a-string/) | Medium |  | Chưa |
| 647 | [1578. Minimum Time to Make Rope Colorful](https://leetcode.com/problems/minimum-time-to-make-rope-colorful/) | Medium |  | Chưa |
| 648 | [1638. Count Substrings That Differ by One Character](https://leetcode.com/problems/count-substrings-that-differ-by-one-character/) | Medium |  | Chưa |
| 649 | [1682. Longest Palindromic Subsequence II](https://leetcode.com/problems/longest-palindromic-subsequence-ii/) | Medium | 🔒 | Có |
| 650 | [2052. Minimum Cost to Separate Sentence Into Rows](https://leetcode.com/problems/minimum-cost-to-separate-sentence-into-rows/) | Medium | 🔒 | Chưa |
| 651 | [2063. Vowels of All Substrings](https://leetcode.com/problems/vowels-of-all-substrings/) | Medium |  | Chưa |
| 652 | [2086. Minimum Number of Food Buckets to Feed the Hamsters](https://leetcode.com/problems/minimum-number-of-food-buckets-to-feed-the-hamsters/) | Medium |  | Chưa |
| 653 | [2222. Number of Ways to Select Buildings](https://leetcode.com/problems/number-of-ways-to-select-buildings/) | Medium |  | Chưa |
| 654 | [2266. Count Number of Texts](https://leetcode.com/problems/count-number-of-texts/) | Medium |  | Chưa |
| 655 | [2311. Longest Binary Subsequence Less Than or Equal to K](https://leetcode.com/problems/longest-binary-subsequence-less-than-or-equal-to-k/) | Medium |  | Chưa |
| 656 | [2370. Longest Ideal Subsequence](https://leetcode.com/problems/longest-ideal-subsequence/) | Medium |  | Chưa |
| 657 | [2380. Time Needed to Rearrange a Binary String](https://leetcode.com/problems/time-needed-to-rearrange-a-binary-string/) | Medium |  | Chưa |
| 658 | [2522. Partition String Into Substrings With Values at Most K](https://leetcode.com/problems/partition-string-into-substrings-with-values-at-most-k/) | Medium |  | Chưa |
| 659 | [2606. Find the Substring With Maximum Cost](https://leetcode.com/problems/find-the-substring-with-maximum-cost/) | Medium |  | Chưa |
| 660 | [2712. Minimum Cost to Make All Characters Equal](https://leetcode.com/problems/minimum-cost-to-make-all-characters-equal/) | Medium |  | Chưa |
| 661 | [2746. Decremental String Concatenation](https://leetcode.com/problems/decremental-string-concatenation/) | Medium |  | Chưa |
| 662 | [2896. Apply Operations to Make Two Strings Equal](https://leetcode.com/problems/apply-operations-to-make-two-strings-equal/) | Medium |  | Chưa |
| 663 | [2901. Longest Unequal Adjacent Groups Subsequence II](https://leetcode.com/problems/longest-unequal-adjacent-groups-subsequence-ii/) | Medium |  | Chưa |
| 664 | [2957. Remove Adjacent Almost-Equal Characters](https://leetcode.com/problems/remove-adjacent-almost-equal-characters/) | Medium |  | Chưa |
| 665 | [3144. Minimum Substring Partition of Equal Character Frequency](https://leetcode.com/problems/minimum-substring-partition-of-equal-character-frequency/) | Medium |  | Chưa |
| 666 | [3302. Find the Lexicographically Smallest Valid Sequence](https://leetcode.com/problems/find-the-lexicographically-smallest-valid-sequence/) | Medium |  | Có |
| 667 | [3316. Find Maximum Removals From Source String](https://leetcode.com/problems/find-maximum-removals-from-source-string/) | Medium |  | Chưa |
| 668 | [3335. Total Characters in String After Transformations I](https://leetcode.com/problems/total-characters-in-string-after-transformations-i/) | Medium |  | Chưa |
| 669 | [3458. Select K Disjoint Special Substrings](https://leetcode.com/problems/select-k-disjoint-special-substrings/) | Medium |  | Có |
| 670 | [3472. Longest Palindromic Subsequence After at Most K Operations](https://leetcode.com/problems/longest-palindromic-subsequence-after-at-most-k-operations/) | Medium |  | Chưa |
| 671 | [3503. Longest Palindrome After Substring Concatenation I](https://leetcode.com/problems/longest-palindrome-after-substring-concatenation-i/) | Medium |  | Chưa |
| 672 | [3557. Find Maximum Number of Non Intersecting Substrings](https://leetcode.com/problems/find-maximum-number-of-non-intersecting-substrings/) | Medium |  | Chưa |
| 673 | [3628. Maximum Number of Subsequences After One Inserting](https://leetcode.com/problems/maximum-number-of-subsequences-after-one-inserting/) | Medium |  | Chưa |
| 674 | [3844. Longest Almost-Palindromic Substring](https://leetcode.com/problems/longest-almost-palindromic-substring/) | Medium |  | Chưa |
| 675 | [3952. Maximum Total Value of Covered Indices](https://leetcode.com/problems/maximum-total-value-of-covered-indices/) | Medium |  | Chưa |
| 676 | [3980. Minimum Operations to Transform Binary String](https://leetcode.com/problems/minimum-operations-to-transform-binary-string/) | Medium |  | Chưa |
| 677 | [87. Scramble String](https://leetcode.com/problems/scramble-string/) | Hard |  | Chưa |
| 678 | [466. Count The Repetitions](https://leetcode.com/problems/count-the-repetitions/) | Hard |  | Chưa |
| 679 | [471. Encode String with Shortest Length](https://leetcode.com/problems/encode-string-with-shortest-length/) | Hard | 🔒 | Có |
| 680 | [514. Freedom Trail](https://leetcode.com/problems/freedom-trail/) | Hard |  | Có |
| 681 | [639. Decode Ways II](https://leetcode.com/problems/decode-ways-ii/) | Hard |  | Chưa |
| 682 | [828. Count Unique Characters of All Substrings of a Given String](https://leetcode.com/problems/count-unique-characters-of-all-substrings-of-a-given-string/) | Hard |  | Chưa |
| 683 | [902. Numbers At Most N Given Digit Set](https://leetcode.com/problems/numbers-at-most-n-given-digit-set/) | Hard |  | Chưa |
| 684 | [903. Valid Permutations for DI Sequence](https://leetcode.com/problems/valid-permutations-for-di-sequence/) | Hard |  | Chưa |
| 685 | [940. Distinct Subsequences II](https://leetcode.com/problems/distinct-subsequences-ii/) | Hard |  | Có |
| 686 | [943. Find the Shortest Superstring](https://leetcode.com/problems/find-the-shortest-superstring/) | Hard |  | Có |
| 687 | [960. Delete Columns to Make Sorted III](https://leetcode.com/problems/delete-columns-to-make-sorted-iii/) | Hard |  | Chưa |
| 688 | [1092. Shortest Common Supersequence ](https://leetcode.com/problems/shortest-common-supersequence/) | Hard |  | Có |
| 689 | [1216. Valid Palindrome III](https://leetcode.com/problems/valid-palindrome-iii/) | Hard | 🔒 | Có |
| 690 | [1278. Palindrome Partitioning III](https://leetcode.com/problems/palindrome-partitioning-iii/) | Hard |  | Chưa |
| 691 | [1320. Minimum Distance to Type a Word Using Two Fingers](https://leetcode.com/problems/minimum-distance-to-type-a-word-using-two-fingers/) | Hard |  | Chưa |
| 692 | [1416. Restore The Array](https://leetcode.com/problems/restore-the-array/) | Hard |  | Có |
| 693 | [1639. Number of Ways to Form a Target String Given a Dictionary](https://leetcode.com/problems/number-of-ways-to-form-a-target-string-given-a-dictionary/) | Hard |  | Có |
| 694 | [1745. Palindrome Partitioning IV](https://leetcode.com/problems/palindrome-partitioning-iv/) | Hard |  | Chưa |
| 695 | [1771. Maximize Palindrome Length From Subsequences](https://leetcode.com/problems/maximize-palindrome-length-from-subsequences/) | Hard |  | Chưa |
| 696 | [1977. Number of Ways to Separate Numbers](https://leetcode.com/problems/number-of-ways-to-separate-numbers/) | Hard |  | Có |
| 697 | [1987. Number of Unique Good Subsequences](https://leetcode.com/problems/number-of-unique-good-subsequences/) | Hard |  | Có |
| 698 | [2060. Check if an Original String Exists Given Two Encoded Strings](https://leetcode.com/problems/check-if-an-original-string-exists-given-two-encoded-strings/) | Hard |  | Chưa |
| 699 | [2147. Number of Ways to Divide a Long Corridor](https://leetcode.com/problems/number-of-ways-to-divide-a-long-corridor/) | Hard |  | Chưa |
| 700 | [2167. Minimum Time to Remove All Cars Containing Illegal Goods](https://leetcode.com/problems/minimum-time-to-remove-all-cars-containing-illegal-goods/) | Hard |  | Chưa |
| 701 | [2209. Minimum White Tiles After Covering With Carpets](https://leetcode.com/problems/minimum-white-tiles-after-covering-with-carpets/) | Hard |  | Chưa |
| 702 | [2262. Total Appeal of A String](https://leetcode.com/problems/total-appeal-of-a-string/) | Hard |  | Chưa |
| 703 | [2272. Substring With Largest Variance](https://leetcode.com/problems/substring-with-largest-variance/) | Hard |  | Chưa |
| 704 | [2472. Maximum Number of Non-overlapping Palindrome Substrings](https://leetcode.com/problems/maximum-number-of-non-overlapping-palindrome-substrings/) | Hard |  | Có |
| 705 | [2478. Number of Beautiful Partitions](https://leetcode.com/problems/number-of-beautiful-partitions/) | Hard |  | Chưa |
| 706 | [2484. Count Palindromic Subsequences](https://leetcode.com/problems/count-palindromic-subsequences/) | Hard |  | Chưa |
| 707 | [2719. Count of Integers](https://leetcode.com/problems/count-of-integers/) | Hard |  | Chưa |
| 708 | [2801. Count Stepping Numbers in Range](https://leetcode.com/problems/count-stepping-numbers-in-range/) | Hard |  | Chưa |
| 709 | [2911. Minimum Changes to Make K Semi-palindromes](https://leetcode.com/problems/minimum-changes-to-make-k-semi-palindromes/) | Hard |  | Chưa |
| 710 | [2999. Count the Number of Powerful Integers](https://leetcode.com/problems/count-the-number-of-powerful-integers/) | Hard |  | Chưa |
| 711 | [3003. Maximize the Number of Partitions After Operations](https://leetcode.com/problems/maximize-the-number-of-partitions-after-operations/) | Hard |  | Chưa |
| 712 | [3260. Find the Largest Palindrome Divisible by K](https://leetcode.com/problems/find-the-largest-palindrome-divisible-by-k/) | Hard |  | Chưa |
| 713 | [3320. Count The Number of Winning Sequences](https://leetcode.com/problems/count-the-number-of-winning-sequences/) | Hard |  | Chưa |
| 714 | [3333. Find the Original Typed String II](https://leetcode.com/problems/find-the-original-typed-string-ii/) | Hard |  | Chưa |
| 715 | [3337. Total Characters in String After Transformations II](https://leetcode.com/problems/total-characters-in-string-after-transformations-ii/) | Hard |  | Chưa |
| 716 | [3343. Count Number of Balanced Permutations](https://leetcode.com/problems/count-number-of-balanced-permutations/) | Hard |  | Chưa |
| 717 | [3352. Count K-Reducible Numbers Less Than N](https://leetcode.com/problems/count-k-reducible-numbers-less-than-n/) | Hard |  | Chưa |
| 718 | [3389. Minimum Operations to Make Character Frequencies Equal](https://leetcode.com/problems/minimum-operations-to-make-character-frequencies-equal/) | Hard |  | Chưa |
| 719 | [3441. Minimum Cost Good Caption](https://leetcode.com/problems/minimum-cost-good-caption/) | Hard |  | Chưa |
| 720 | [3448. Count Substrings Divisible By Last Digit](https://leetcode.com/problems/count-substrings-divisible-by-last-digit/) | Hard |  | Chưa |
| 721 | [3504. Longest Palindrome After Substring Concatenation II](https://leetcode.com/problems/longest-palindrome-after-substring-concatenation-ii/) | Hard |  | Chưa |
| 722 | [3519. Count Numbers with Non-Decreasing Digits ](https://leetcode.com/problems/count-numbers-with-non-decreasing-digits/) | Hard |  | Chưa |
| 723 | [3563. Lexicographically Smallest String After Adjacent Removals](https://leetcode.com/problems/lexicographically-smallest-string-after-adjacent-removals/) | Hard |  | Chưa |
| 724 | [3579. Minimum Steps to Convert String with Operations](https://leetcode.com/problems/minimum-steps-to-convert-string-with-operations/) | Hard |  | Chưa |
| 725 | [3981. Count Distinct Ways to Form Target from Two Strings](https://leetcode.com/problems/count-distinct-ways-to-form-target-from-two-strings/) | Hard |  | Chưa |
| 726 | [3995. Minimum Cost to Convert String III](https://leetcode.com/problems/minimum-cost-to-convert-string-iii/) | Hard |  | Chưa |

### B.11. Greedy, sắp xếp và thứ tự từ điển (107 bài)

Chứng minh lựa chọn tham lam; dùng heap hoặc monotonic stack khi cần.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 727 | [942. DI String Match](https://leetcode.com/problems/di-string-match/) | Easy |  | Chưa |
| 728 | [1221. Split a String in Balanced Strings](https://leetcode.com/problems/split-a-string-in-balanced-strings/) | Easy |  | Chưa |
| 729 | [1736. Latest Time by Replacing Hidden Digits](https://leetcode.com/problems/latest-time-by-replacing-hidden-digits/) | Easy |  | Chưa |
| 730 | [1859. Sorting the Sentence](https://leetcode.com/problems/sorting-the-sentence/) | Easy |  | Chưa |
| 731 | [1903. Largest Odd Number in String](https://leetcode.com/problems/largest-odd-number-in-string/) | Easy |  | Chưa |
| 732 | [1974. Minimum Time to Type Word Using Special Typewriter](https://leetcode.com/problems/minimum-time-to-type-word-using-special-typewriter/) | Easy |  | Chưa |
| 733 | [2027. Minimum Moves to Convert String](https://leetcode.com/problems/minimum-moves-to-convert-string/) | Easy |  | Chưa |
| 734 | [2224. Minimum Number of Operations to Convert Time](https://leetcode.com/problems/minimum-number-of-operations-to-convert-time/) | Easy |  | Chưa |
| 735 | [2259. Remove Digit From Number to Maximize Result](https://leetcode.com/problems/remove-digit-from-number-to-maximize-result/) | Easy |  | Chưa |
| 736 | [2273. Find Resultant Array After Removing Anagrams](https://leetcode.com/problems/find-resultant-array-after-removing-anagrams/) | Easy |  | Chưa |
| 737 | [2418. Sort the People](https://leetcode.com/problems/sort-the-people/) | Easy |  | Chưa |
| 738 | [2697. Lexicographically Smallest Palindrome](https://leetcode.com/problems/lexicographically-smallest-palindrome/) | Easy |  | Chưa |
| 739 | [2864. Maximum Odd Binary Number](https://leetcode.com/problems/maximum-odd-binary-number/) | Easy |  | Chưa |
| 740 | [3014. Minimum Number of Pushes to Type Word I](https://leetcode.com/problems/minimum-number-of-pushes-to-type-word-i/) | Easy |  | Có |
| 741 | [3216. Lexicographically Smallest String After a Swap](https://leetcode.com/problems/lexicographically-smallest-string-after-a-swap/) | Easy |  | Chưa |
| 742 | [3545. Minimum Deletions for At Most K Distinct Characters](https://leetcode.com/problems/minimum-deletions-for-at-most-k-distinct-characters/) | Easy |  | Chưa |
| 743 | [3606. Coupon Code Validator](https://leetcode.com/problems/coupon-code-validator/) | Easy |  | Chưa |
| 744 | [3992. Rearrange String to Avoid Character Pair](https://leetcode.com/problems/rearrange-string-to-avoid-character-pair/) | Easy |  | Chưa |
| 745 | [179. Largest Number](https://leetcode.com/problems/largest-number/) | Medium |  | Có |
| 746 | [522. Longest Uncommon Subsequence II](https://leetcode.com/problems/longest-uncommon-subsequence-ii/) | Medium |  | Chưa |
| 747 | [539. Minimum Time Difference](https://leetcode.com/problems/minimum-time-difference/) | Medium |  | Có |
| 748 | [555. Split Concatenated Strings](https://leetcode.com/problems/split-concatenated-strings/) | Medium | 🔒 | Chưa |
| 749 | [649. Dota2 Senate](https://leetcode.com/problems/dota2-senate/) | Medium |  | Chưa |
| 750 | [763. Partition Labels](https://leetcode.com/problems/partition-labels/) | Medium |  | Chưa |
| 751 | [833. Find And Replace in String](https://leetcode.com/problems/find-and-replace-in-string/) | Medium |  | Chưa |
| 752 | [893. Groups of Special-Equivalent Strings](https://leetcode.com/problems/groups-of-special-equivalent-strings/) | Medium |  | Chưa |
| 753 | [937. Reorder Data in Log Files](https://leetcode.com/problems/reorder-data-in-log-files/) | Medium |  | Chưa |
| 754 | [955. Delete Columns to Make Sorted II](https://leetcode.com/problems/delete-columns-to-make-sorted-ii/) | Medium |  | Chưa |
| 755 | [984. String Without AAA or BBB](https://leetcode.com/problems/string-without-aaa-or-bbb/) | Medium |  | Chưa |
| 756 | [1055. Shortest Way to Form String](https://leetcode.com/problems/shortest-way-to-form-string/) | Medium | 🔒 | Có |
| 757 | [1058. Minimize Rounding Error to Meet Target](https://leetcode.com/problems/minimize-rounding-error-to-meet-target/) | Medium | 🔒 | Chưa |
| 758 | [1152. Analyze User Website Visit Pattern](https://leetcode.com/problems/analyze-user-website-visit-pattern/) | Medium | 🔒 | Chưa |
| 759 | [1169. Invalid Transactions](https://leetcode.com/problems/invalid-transactions/) | Medium |  | Chưa |
| 760 | [1170. Compare Strings by Frequency of the Smallest Character](https://leetcode.com/problems/compare-strings-by-frequency-of-the-smallest-character/) | Medium |  | Chưa |
| 761 | [1181. Before and After Puzzle](https://leetcode.com/problems/before-and-after-puzzle/) | Medium | 🔒 | Chưa |
| 762 | [1247. Minimum Swaps to Make Strings Equal](https://leetcode.com/problems/minimum-swaps-to-make-strings-equal/) | Medium |  | Chưa |
| 763 | [1328. Break a Palindrome](https://leetcode.com/problems/break-a-palindrome/) | Medium |  | Chưa |
| 764 | [1348. Tweet Counts Per Frequency](https://leetcode.com/problems/tweet-counts-per-frequency/) | Medium |  | Chưa |
| 765 | [1366. Rank Teams by Votes](https://leetcode.com/problems/rank-teams-by-votes/) | Medium |  | Chưa |
| 766 | [1400. Construct K Palindrome Strings](https://leetcode.com/problems/construct-k-palindrome-strings/) | Medium |  | Chưa |
| 767 | [1405. Longest Happy String](https://leetcode.com/problems/longest-happy-string/) | Medium |  | Chưa |
| 768 | [1418. Display Table of Food Orders in a Restaurant](https://leetcode.com/problems/display-table-of-food-orders-in-a-restaurant/) | Medium |  | Chưa |
| 769 | [1433. Check If a String Can Break Another String](https://leetcode.com/problems/check-if-a-string-can-break-another-string/) | Medium |  | Chưa |
| 770 | [1451. Rearrange Words in a Sentence](https://leetcode.com/problems/rearrange-words-in-a-sentence/) | Medium |  | Chưa |
| 771 | [1529. Minimum Suffix Flips](https://leetcode.com/problems/minimum-suffix-flips/) | Medium |  | Chưa |
| 772 | [1604. Alert Using Same Key-Card Three or More Times in a One Hour Period](https://leetcode.com/problems/alert-using-same-key-card-three-or-more-times-in-a-one-hour-period/) | Medium |  | Chưa |
| 773 | [1647. Minimum Deletions to Make Character Frequencies Unique](https://leetcode.com/problems/minimum-deletions-to-make-character-frequencies-unique/) | Medium |  | Chưa |
| 774 | [1689. Partitioning Into Minimum Number Of Deci-Binary Numbers](https://leetcode.com/problems/partitioning-into-minimum-number-of-deci-binary-numbers/) | Medium |  | Chưa |
| 775 | [1702. Maximum Binary String After Change](https://leetcode.com/problems/maximum-binary-string-after-change/) | Medium |  | Chưa |
| 776 | [1754. Largest Merge Of Two Strings](https://leetcode.com/problems/largest-merge-of-two-strings/) | Medium |  | Chưa |
| 777 | [1772. Sort Features by Popularity](https://leetcode.com/problems/sort-features-by-popularity/) | Medium | 🔒 | Chưa |
| 778 | [1794. Count Pairs of Equal Substrings With Minimum Difference](https://leetcode.com/problems/count-pairs-of-equal-substrings-with-minimum-difference/) | Medium | 🔒 | Chưa |
| 779 | [1850. Minimum Adjacent Swaps to Reach the Kth Smallest Number](https://leetcode.com/problems/minimum-adjacent-swaps-to-reach-the-kth-smallest-number/) | Medium |  | Chưa |
| 780 | [1864. Minimum Number of Swaps to Make the Binary String Alternating](https://leetcode.com/problems/minimum-number-of-swaps-to-make-the-binary-string-alternating/) | Medium |  | Chưa |
| 781 | [1881. Maximum Value after Insertion](https://leetcode.com/problems/maximum-value-after-insertion/) | Medium |  | Chưa |
| 782 | [1946. Largest Number After Mutating Substring](https://leetcode.com/problems/largest-number-after-mutating-substring/) | Medium |  | Chưa |
| 783 | [1985. Find the Kth Largest Integer in the Array](https://leetcode.com/problems/find-the-kth-largest-integer-in-the-array/) | Medium |  | Chưa |
| 784 | [2131. Longest Palindrome by Concatenating Two Letter Words](https://leetcode.com/problems/longest-palindrome-by-concatenating-two-letter-words/) | Medium |  | Chưa |
| 785 | [2135. Count Words Obtained After Adding a Letter](https://leetcode.com/problems/count-words-obtained-after-adding-a-letter/) | Medium |  | Chưa |
| 786 | [2182. Construct String With Repeat Limit](https://leetcode.com/problems/construct-string-with-repeat-limit/) | Medium |  | Chưa |
| 787 | [2207. Maximize Number of Subsequences in a String](https://leetcode.com/problems/maximize-number-of-subsequences-in-a-string/) | Medium |  | Chưa |
| 788 | [2268. Minimum Number of Keypresses](https://leetcode.com/problems/minimum-number-of-keypresses/) | Medium | 🔒 | Chưa |
| 789 | [2343. Query Kth Smallest Trimmed Number](https://leetcode.com/problems/query-kth-smallest-trimmed-number/) | Medium |  | Chưa |
| 790 | [2353. Design a Food Rating System](https://leetcode.com/problems/design-a-food-rating-system/) | Medium |  | Chưa |
| 791 | [2384. Largest Palindromic Number](https://leetcode.com/problems/largest-palindromic-number/) | Medium |  | Chưa |
| 792 | [2405. Optimal Partition of String](https://leetcode.com/problems/optimal-partition-of-string/) | Medium |  | Chưa |
| 793 | [2456. Most Popular Video Creator](https://leetcode.com/problems/most-popular-video-creator/) | Medium |  | Chưa |
| 794 | [2486. Append Characters to String to Make Subsequence](https://leetcode.com/problems/append-characters-to-string-to-make-subsequence/) | Medium |  | Chưa |
| 795 | [2512. Reward Top K Students](https://leetcode.com/problems/reward-top-k-students/) | Medium |  | Chưa |
| 796 | [2590. Design a Todo List](https://leetcode.com/problems/design-a-todo-list/) | Medium | 🔒 | Chưa |
| 797 | [2734. Lexicographically Smallest String After Substring Operation](https://leetcode.com/problems/lexicographically-smallest-string-after-substring-operation/) | Medium |  | Chưa |
| 798 | [2785. Sort Vowels in a String](https://leetcode.com/problems/sort-vowels-in-a-string/) | Medium |  | Chưa |
| 799 | [2800. Shortest String That Contains Three Strings](https://leetcode.com/problems/shortest-string-that-contains-three-strings/) | Medium |  | Chưa |
| 800 | [2840. Check if Strings Can be Made Equal With Operations II](https://leetcode.com/problems/check-if-strings-can-be-made-equal-with-operations-ii/) | Medium |  | Chưa |
| 801 | [2844. Minimum Operations to Make a Special Number](https://leetcode.com/problems/minimum-operations-to-make-a-special-number/) | Medium |  | Chưa |
| 802 | [2933. High-Access Employees](https://leetcode.com/problems/high-access-employees/) | Medium |  | Chưa |
| 803 | [2938. Separate Black and White Balls](https://leetcode.com/problems/separate-black-and-white-balls/) | Medium |  | Chưa |
| 804 | [3016. Minimum Number of Pushes to Type Word II](https://leetcode.com/problems/minimum-number-of-pushes-to-type-word-ii/) | Medium |  | Có |
| 805 | [3035. Maximum Palindromes After Operations](https://leetcode.com/problems/maximum-palindromes-after-operations/) | Medium |  | Chưa |
| 806 | [3081. Replace Question Marks in String to Minimize Its Value](https://leetcode.com/problems/replace-question-marks-in-string-to-minimize-its-value/) | Medium |  | Chưa |
| 807 | [3085. Minimum Deletions to Make String K-Special](https://leetcode.com/problems/minimum-deletions-to-make-string-k-special/) | Medium |  | Chưa |
| 808 | [3106. Lexicographically Smallest String After Operations With Constraint](https://leetcode.com/problems/lexicographically-smallest-string-after-operations-with-constraint/) | Medium |  | Chưa |
| 809 | [3119. Maximum Number of Potholes That Can Be Fixed](https://leetcode.com/problems/maximum-number-of-potholes-that-can-be-fixed/) | Medium | 🔒 | Chưa |
| 810 | [3125. Maximum Number That Makes Result of Bitwise AND Zero](https://leetcode.com/problems/maximum-number-that-makes-result-of-bitwise-and-zero/) | Medium | 🔒 | Chưa |
| 811 | [3143. Maximum Points Inside the Square](https://leetcode.com/problems/maximum-points-inside-the-square/) | Medium |  | Chưa |
| 812 | [3167. Better Compression of String](https://leetcode.com/problems/better-compression-of-string/) | Medium | 🔒 | Chưa |
| 813 | [3228. Maximum Number of Operations to Move Ones to the End](https://leetcode.com/problems/maximum-number-of-operations-to-move-ones-to-the-end/) | Medium |  | Chưa |
| 814 | [3365. Rearrange K Substrings to Form Target String](https://leetcode.com/problems/rearrange-k-substrings-to-form-target-string/) | Medium |  | Chưa |
| 815 | [3517. Smallest Palindromic Rearrangement I](https://leetcode.com/problems/smallest-palindromic-rearrangement-i/) | Medium |  | Có |
| 816 | [3556. Sum of Largest Prime Substrings](https://leetcode.com/problems/sum-of-largest-prime-substrings/) | Medium |  | Chưa |
| 817 | [3675. Minimum Operations to Transform String](https://leetcode.com/problems/minimum-operations-to-transform-string/) | Medium |  | Chưa |
| 818 | [3720. Lexicographically Smallest Permutation Greater Than Target](https://leetcode.com/problems/lexicographically-smallest-permutation-greater-than-target/) | Medium |  | Có |
| 819 | [3781. Maximum Score After Binary Swaps](https://leetcode.com/problems/maximum-score-after-binary-swaps/) | Medium |  | Chưa |
| 820 | [3800. Minimum Cost to Make Two Binary Strings Equal](https://leetcode.com/problems/minimum-cost-to-make-two-binary-strings-equal/) | Medium |  | Chưa |
| 821 | [3849. Maximum Bitwise XOR After Rearrangement](https://leetcode.com/problems/maximum-bitwise-xor-after-rearrangement/) | Medium |  | Chưa |
| 822 | [3913. Sort Vowels by Frequency](https://leetcode.com/problems/sort-vowels-by-frequency/) | Medium |  | Chưa |
| 823 | [3998. Transform Binary String Using Subsequence Sort](https://leetcode.com/problems/transform-binary-string-using-subsequence-sort/) | Medium |  | Chưa |
| 824 | [4026. Maximum Gap Between Stations](https://leetcode.com/problems/maximum-gap-between-stations/) | Medium |  | Chưa |
| 825 | [4036. Lexicographically Largest String After Pair Transformations](https://leetcode.com/problems/lexicographically-largest-string-after-pair-transformations/) | Medium |  | Chưa |
| 826 | [358. Rearrange String k Distance Apart](https://leetcode.com/problems/rearrange-string-k-distance-apart/) | Hard | 🔒 | Chưa |
| 827 | [420. Strong Password Checker](https://leetcode.com/problems/strong-password-checker/) | Hard |  | Chưa |
| 828 | [1520. Maximum Number of Non-Overlapping Substrings](https://leetcode.com/problems/maximum-number-of-non-overlapping-substrings/) | Hard |  | Có |
| 829 | [1585. Check If String Is Transformable With Substring Sort Operations](https://leetcode.com/problems/check-if-string-is-transformable-with-substring-sort-operations/) | Hard |  | Chưa |
| 830 | [2663. Lexicographically Smallest Beautiful String](https://leetcode.com/problems/lexicographically-smallest-beautiful-string/) | Hard |  | Chưa |
| 831 | [2842. Count K-Subsequences of a String With Maximum Beauty](https://leetcode.com/problems/count-k-subsequences-of-a-string-with-maximum-beauty/) | Hard |  | Chưa |
| 832 | [3088. Make String Anti-palindrome](https://leetcode.com/problems/make-string-anti-palindrome/) | Hard | 🔒 | Chưa |
| 833 | [3104. Find Longest Self-Contained Substring](https://leetcode.com/problems/find-longest-self-contained-substring/) | Hard | 🔒 | Chưa |

### B.12. Kết hợp thuật toán nâng cao (62 bài)

Ghép các nền tảng đã học: KMP + DP, rolling hash + binary search, segment tree, trie và counting.

| Thứ tự học | Bài | Độ khó | Premium | Project |
| ---: | --- | --- | --- | --- |
| 834 | [257. Binary Tree Paths](https://leetcode.com/problems/binary-tree-paths/) | Easy |  | Có |
| 835 | [247. Strobogrammatic Number II](https://leetcode.com/problems/strobogrammatic-number-ii/) | Medium | 🔒 | Chưa |
| 836 | [331. Verify Preorder Serialization of a Binary Tree](https://leetcode.com/problems/verify-preorder-serialization-of-a-binary-tree/) | Medium |  | Chưa |
| 837 | [399. Evaluate Division](https://leetcode.com/problems/evaluate-division/) | Medium |  | Có |
| 838 | [449. Serialize and Deserialize BST](https://leetcode.com/problems/serialize-and-deserialize-bst/) | Medium |  | Chưa |
| 839 | [536. Construct Binary Tree from String](https://leetcode.com/problems/construct-binary-tree-from-string/) | Medium | 🔒 | Chưa |
| 840 | [544. Output Contest Matches](https://leetcode.com/problems/output-contest-matches/) | Medium | 🔒 | Chưa |
| 841 | [606. Construct String from Binary Tree](https://leetcode.com/problems/construct-string-from-binary-tree/) | Medium |  | Chưa |
| 842 | [721. Accounts Merge](https://leetcode.com/problems/accounts-merge/) | Medium |  | Có |
| 843 | [737. Sentence Similarity II](https://leetcode.com/problems/sentence-similarity-ii/) | Medium | 🔒 | Chưa |
| 844 | [988. Smallest String Starting From Leaf](https://leetcode.com/problems/smallest-string-starting-from-leaf/) | Medium |  | Có |
| 845 | [990. Satisfiability of Equality Equations](https://leetcode.com/problems/satisfiability-of-equality-equations/) | Medium |  | Có |
| 846 | [1061. Lexicographically Smallest Equivalent String](https://leetcode.com/problems/lexicographically-smallest-equivalent-string/) | Medium |  | Có |
| 847 | [1062. Longest Repeating Substring](https://leetcode.com/problems/longest-repeating-substring/) | Medium | 🔒 | Chưa |
| 848 | [1202. Smallest String With Swaps](https://leetcode.com/problems/smallest-string-with-swaps/) | Medium |  | Chưa |
| 849 | [1257. Smallest Common Region](https://leetcode.com/problems/smallest-common-region/) | Medium | 🔒 | Chưa |
| 850 | [1258. Synonymous Sentences](https://leetcode.com/problems/synonymous-sentences/) | Medium | 🔒 | Có |
| 851 | [1545. Find Kth Bit in Nth Binary String](https://leetcode.com/problems/find-kth-bit-in-nth-binary-string/) | Medium |  | Chưa |
| 852 | [1618. Maximum Font to Fit a Sentence in a Screen](https://leetcode.com/problems/maximum-font-to-fit-a-sentence-in-a-screen/) | Medium | 🔒 | Chưa |
| 853 | [1927. Sum Game](https://leetcode.com/problems/sum-game/) | Medium |  | Có |
| 854 | [2038. Remove Colored Pieces if Both Neighbors are the Same Color](https://leetcode.com/problems/remove-colored-pieces-if-both-neighbors-are-the-same-color/) | Medium |  | Chưa |
| 855 | [2055. Plates Between Candles](https://leetcode.com/problems/plates-between-candles/) | Medium |  | Chưa |
| 856 | [2096. Step-By-Step Directions From a Binary Tree Node to Another](https://leetcode.com/problems/step-by-step-directions-from-a-binary-tree-node-to-another/) | Medium |  | Có |
| 857 | [2115. Find All Possible Recipes from Given Supplies](https://leetcode.com/problems/find-all-possible-recipes-from-given-supplies/) | Medium |  | Có |
| 858 | [2976. Minimum Cost to Convert String I](https://leetcode.com/problems/minimum-cost-to-convert-string-i/) | Medium |  | Chưa |
| 859 | [3227. Vowels Game in a String](https://leetcode.com/problems/vowels-game-in-a-string/) | Medium |  | Chưa |
| 860 | [3331. Find Subtree Sizes After Changes](https://leetcode.com/problems/find-subtree-sizes-after-changes/) | Medium |  | Chưa |
| 861 | [3387. Maximize Amount After Two Days of Conversions](https://leetcode.com/problems/maximize-amount-after-two-days-of-conversions/) | Medium |  | Chưa |
| 862 | [3970. Shortest Path With At Most K Consecutive Identical Characters](https://leetcode.com/problems/shortest-path-with-at-most-k-consecutive-identical-characters/) | Medium |  | Chưa |
| 863 | [248. Strobogrammatic Number III](https://leetcode.com/problems/strobogrammatic-number-iii/) | Hard | 🔒 | Chưa |
| 864 | [269. Alien Dictionary](https://leetcode.com/problems/alien-dictionary/) | Hard | 🔒 | Có |
| 865 | [297. Serialize and Deserialize Binary Tree](https://leetcode.com/problems/serialize-and-deserialize-binary-tree/) | Hard |  | Có |
| 866 | [332. Reconstruct Itinerary](https://leetcode.com/problems/reconstruct-itinerary/) | Hard |  | Có |
| 867 | [428. Serialize and Deserialize N-ary Tree](https://leetcode.com/problems/serialize-and-deserialize-n-ary-tree/) | Hard | 🔒 | Chưa |
| 868 | [499. The Maze III](https://leetcode.com/problems/the-maze-iii/) | Hard | 🔒 | Có |
| 869 | [631. Design Excel Sum Formula](https://leetcode.com/problems/design-excel-sum-formula/) | Hard | 🔒 | Chưa |
| 870 | [753. Cracking the Safe](https://leetcode.com/problems/cracking-the-safe/) | Hard |  | Có |
| 871 | [839. Similar String Groups](https://leetcode.com/problems/similar-string-groups/) | Hard |  | Chưa |
| 872 | [843. Guess the Word](https://leetcode.com/problems/guess-the-word/) | Hard |  | Chưa |
| 873 | [1028. Recover a Tree From Preorder Traversal](https://leetcode.com/problems/recover-a-tree-from-preorder-traversal/) | Hard |  | Chưa |
| 874 | [1153. String Transforms Into Another String](https://leetcode.com/problems/string-transforms-into-another-string/) | Hard | 🔒 | Chưa |
| 875 | [1505. Minimum Possible Integer After at Most K Adjacent Swaps On Digits](https://leetcode.com/problems/minimum-possible-integer-after-at-most-k-adjacent-swaps-on-digits/) | Hard |  | Chưa |
| 876 | [1548. The Most Similar Path in a Graph](https://leetcode.com/problems/the-most-similar-path-in-a-graph/) | Hard | 🔒 | Chưa |
| 877 | [1597. Build Binary Expression Tree From Infix Expression](https://leetcode.com/problems/build-binary-expression-tree-from-infix-expression/) | Hard | 🔒 | Chưa |
| 878 | [1857. Largest Color Value in a Directed Graph](https://leetcode.com/problems/largest-color-value-in-a-directed-graph/) | Hard |  | Chưa |
| 879 | [1960. Maximum Product of the Length of Two Palindromic Substrings](https://leetcode.com/problems/maximum-product-of-the-length-of-two-palindromic-substrings/) | Hard |  | Chưa |
| 880 | [2157. Groups of Strings](https://leetcode.com/problems/groups-of-strings/) | Hard |  | Có |
| 881 | [2193. Minimum Number of Moves to Make Palindrome](https://leetcode.com/problems/minimum-number-of-moves-to-make-palindrome/) | Hard |  | Chưa |
| 882 | [2246. Longest Path With Different Adjacent Characters](https://leetcode.com/problems/longest-path-with-different-adjacent-characters/) | Hard |  | Có |
| 883 | [2307. Check for Contradictions in Equations](https://leetcode.com/problems/check-for-contradictions-in-equations/) | Hard | 🔒 | Chưa |
| 884 | [2573. Find the String with LCP](https://leetcode.com/problems/find-the-string-with-lcp/) | Hard |  | Chưa |
| 885 | [2868. The Wording Game](https://leetcode.com/problems/the-wording-game/) | Hard | 🔒 | Chưa |
| 886 | [3292. Minimum Number of Valid Strings to Form Target II](https://leetcode.com/problems/minimum-number-of-valid-strings-to-form-target-ii/) | Hard |  | Chưa |
| 887 | [3327. Check if DFS Strings Are Palindromes](https://leetcode.com/problems/check-if-dfs-strings-are-palindromes/) | Hard |  | Chưa |
| 888 | [3399. Smallest Substring With Identical Characters II](https://leetcode.com/problems/smallest-substring-with-identical-characters-ii/) | Hard |  | Chưa |
| 889 | [3435. Frequencies of Shortest Supersequences](https://leetcode.com/problems/frequencies-of-shortest-supersequences/) | Hard |  | Chưa |
| 890 | [3501. Maximize Active Section with Trade II](https://leetcode.com/problems/maximize-active-section-with-trade-ii/) | Hard |  | Có |
| 891 | [3615. Longest Palindromic Path in Graph](https://leetcode.com/problems/longest-palindromic-path-in-graph/) | Hard |  | Chưa |
| 892 | [3666. Minimum Operations to Equalize Binary String](https://leetcode.com/problems/minimum-operations-to-equalize-binary-string/) | Hard |  | Chưa |
| 893 | [3777. Minimum Deletions to Make Alternating Substring](https://leetcode.com/problems/minimum-deletions-to-make-alternating-substring/) | Hard |  | Chưa |
| 894 | [3841. Palindromic Path Queries in a Tree](https://leetcode.com/problems/palindromic-path-queries-in-a-tree/) | Hard |  | Chưa |
| 895 | [3864. Minimum Cost to Partition a Binary String](https://leetcode.com/problems/minimum-cost-to-partition-a-binary-string/) | Hard |  | Chưa |

