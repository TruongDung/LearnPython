class Solution:
    def longestDupSubstring(self, s: str) -> str:
        n = len(s)
        nums = [ord(c) - ord('a') for c in s]
        base = 26
        mod = 2 ** 61 - 1  # large prime for low collision risk

        def search(length: int) -> int:
            """Return start index of a duplicated substring of given length, or -1."""
            if length == 0:
                return 0

            # Rolling hash of the first `length` chars
            cur = 0
            for i in range(length):
                cur = (cur * base + nums[i]) % mod

            seen = {cur}
            # base^length % mod, to remove the leftmost char
            base_l = pow(base, length, mod)

            for i in range(1, n - length + 1):
                cur = (cur * base - nums[i - 1] * base_l + nums[i + length - 1]) % mod
                if cur in seen:
                    return i
                seen.add(cur)
            return -1

        # Binary search on the length of the duplicate substring
        lo, hi = 1, n - 1
        start, best_len = -1, 0
        while lo <= hi:
            mid = (lo + hi) // 2
            idx = search(mid)
            if idx != -1:
                start, best_len = idx, mid
                lo = mid + 1  # try longer
            else:
                hi = mid - 1  # try shorter

        return s[start:start + best_len] if start != -1 else ""


sol = Solution()
print(sol.longestDupSubstring("banana"))     # "ana"
print(sol.longestDupSubstring("abcd"))       # ""
print(sol.longestDupSubstring("aabcaabdaab"))  # "aab"
