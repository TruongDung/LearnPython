from typing import List


class Solution:
    def checkIfExist(self, arr: List[int]) -> bool:
        seen = set()
        for num in arr:
            # For current num, check its double or its half (if even)
            if num * 2 in seen or (num % 2 == 0 and num // 2 in seen):
                return True
            seen.add(num)
        return False


sol = Solution()
print(sol.checkIfExist([10, 2, 5, 3]))   # True (10 = 2*5)
print(sol.checkIfExist([3, 1, 7, 11]))   # False
print(sol.checkIfExist([0, 0]))          # True (0 = 2*0)
