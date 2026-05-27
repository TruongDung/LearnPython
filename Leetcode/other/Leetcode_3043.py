from typing import List


class Solution:
    def longestCommonPrefix(self, arr1: List[int], arr2: List[int]) -> int:
        prefixes = set()
        for x in arr1:
            while x:
                prefixes.add(x)
                x //= 10

        ans = 0
        for y in arr2:
            while y:
                if y in prefixes:
                    ans = max(ans, len(str(y)))
                    break
                y //= 10

        return ans


if __name__ == "__main__":
    sol = Solution()
    print(sol.longestCommonPrefix([1, 10, 100], [1000]))  # 3
    print(sol.longestCommonPrefix([1, 2, 3], [4, 4, 4]))  # 0
