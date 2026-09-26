from collections import Counter


class Solution:
    def minWindow(self, s: str, t: str) -> str:
        # need[c] = how many of character c are STILL OWED by the window.
        # Letting it go NEGATIVE is the trick: need[c] < 0 means the window holds
        # a surplus of c, which is exactly why left can keep shrinking.
        # missing = the total still owed, so missing == 0 means "window covers t"
        # without ever comparing two frequency tables.
        if not s or not t:
            return ""
        need = Counter(t)
        missing = len(t)
        left = 0
        start, end = 0, 0
        for right, char in enumerate(s):
            # Only a character that was genuinely still owed reduces missing.
            if need[char] > 0:
                missing -= 1
            need[char] -= 1
            while missing == 0:
                if end == 0 or right - left + 1 < end - start:
                    start, end = left, right + 1
                need[s[left]] += 1
                # The shrink loop stops only when giving a character back
                # creates a real debt again.
                if need[s[left]] > 0:
                    missing += 1
                left += 1
        return s[start:end]

    def minWindowBrute(self, s: str, t: str) -> str:
        """O(n^2) reference: check every substring, for cross-checking."""
        if not s or not t:
            return ""
        want = Counter(t)
        best = ""
        for i in range(len(s)):
            for j in range(i + 1, len(s) + 1):
                if best and j - i >= len(best):
                    break
                have = Counter(s[i:j])
                if all(have[c] >= n for c, n in want.items()):
                    best = s[i:j]
                    break
        return best


if __name__ == "__main__":
    solution = Solution()

    # LeetCode example 1.
    assert solution.minWindow("ADOBECODEBANC", "ABC") == "BANC"
    # LeetCode example 2: s and t are the same single character.
    assert solution.minWindow("a", "a") == "a"
    # LeetCode example 3: t needs two 'a' but s has only one.
    assert solution.minWindow("a", "aa") == ""

    # Duplicates in t must be respected, not just the distinct letters.
    assert solution.minWindow("aa", "aa") == "aa"
    assert solution.minWindow("bba", "ab") == "ba"
    # A surplus in the middle must be shrunk away.
    assert solution.minWindow("cabwefgewcwaefgcf", "cae") == "cwae"
    # Case is significant.
    assert solution.minWindow("Ab", "ab") == ""

    # The linear and quadratic readings must agree.
    cases = [
        ("ADOBECODEBANC", "ABC"),
        ("a", "a"),
        ("a", "aa"),
        ("aa", "aa"),
        ("bba", "ab"),
        ("cabwefgewcwaefgcf", "cae"),
        ("Ab", "ab"),
        ("abcabdec", "abcd"),
        ("zzzzz", "z"),
        ("abcdef", "fa"),
    ]
    for text, pattern in cases:
        fast = solution.minWindow(text, pattern)
        slow = solution.minWindowBrute(text, pattern)
        # Both must be valid and of the same length; ties may differ in position.
        assert len(fast) == len(slow), (text, pattern, fast, slow)
        if fast:
            have = Counter(fast)
            assert all(have[c] >= n for c, n in Counter(pattern).items()), (text, pattern, fast)
            assert fast in text, (text, pattern, fast)
