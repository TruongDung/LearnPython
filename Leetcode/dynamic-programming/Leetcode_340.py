from collections import defaultdict


class Solution:
    def lengthOfLongestSubstringKDistinct(self, s: str, k: int) -> int:
        counts = defaultdict(int)
        left = 0
        max_length = 0

        for right, char in enumerate(s):
            counts[char] += 1

            # Shrink the window until it holds at most k distinct characters.
            while len(counts) > k:
                left_char = s[left]
                counts[left_char] -= 1
                if counts[left_char] == 0:
                    del counts[left_char]
                left += 1

            max_length = max(max_length, right - left + 1)

        return max_length


sol = Solution()
print(sol.lengthOfLongestSubstringKDistinct("eceba", 2))
