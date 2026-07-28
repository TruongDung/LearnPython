from functools import cmp_to_key
from typing import List


class Solution:
    def largestNumber(self, nums: List[int]) -> str:
        strs = [str(n) for n in nums]

        # a should come before b if a+b > b+a as strings
        def compare(a: str, b: str) -> int:
            if a + b > b + a:
                return -1
            if a + b < b + a:
                return 1
            return 0

        strs.sort(key=cmp_to_key(compare))

        result = "".join(strs)
        # Handle all-zero case ("00" -> "0")
        return "0" if result[0] == "0" else result


sol = Solution()
print(sol.largestNumber([10, 2]))            # "210"
print(sol.largestNumber([3, 30, 34, 5, 9]))  # "9534330"
print(sol.largestNumber([0, 0]))             # "0"
