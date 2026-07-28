from collections import defaultdict


class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        count = defaultdict(int)
        left = 0
        max_freq = 0
        result = 0

        for right, ch in enumerate(s):
            count[ch] += 1
            max_freq = max(max_freq, count[ch])

            # Window invalid: too many chars to replace (> k)
            while (right - left + 1) - max_freq > k:
                count[s[left]] -= 1
                left += 1

            result = max(result, right - left + 1)

        return result


sol = Solution()
print(sol.characterReplacement("ABAB", 2))    # 4
print(sol.characterReplacement("AABABBA", 1))  # 4
