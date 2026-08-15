from typing import List


class Solution:
    def plusOne(self, digits: List[int]) -> List[int]:
        # Walk from the least significant digit, handle carry
        for i in range(len(digits) - 1, -1, -1):
            if digits[i] < 9:
                digits[i] += 1
                return digits
            digits[i] = 0  # 9 + 1 = 10 → set 0, carry continues

        # All digits were 9 → prepend 1 (e.g. 999 -> 1000)
        return [1] + digits


sol = Solution()
print(sol.plusOne([1, 2, 3]))     # [1, 2, 4]
print(sol.plusOne([4, 3, 2, 1]))  # [4, 3, 2, 2]
print(sol.plusOne([9, 9, 9]))     # [1, 0, 0, 0]
