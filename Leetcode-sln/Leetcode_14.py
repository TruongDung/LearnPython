from typing import List


class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        if not strs:
            return ""

        # Take the first string as the initial prefix, shrink against others
        prefix = strs[0]
        for word in strs[1:]:
            while not word.startswith(prefix):
                prefix = prefix[:-1]
                if not prefix:
                    return ""

        return prefix


sol = Solution()
print(sol.longestCommonPrefix(["flower", "flow", "flight"]))  # "fl"
print(sol.longestCommonPrefix(["dog", "racecar", "car"]))     # ""
