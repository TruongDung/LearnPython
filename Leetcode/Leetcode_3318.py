class Solution:
    def findXSum(self, nums: List[int], k: int, x: int) -> List[int]:
        result = []
        for num in nums:
            if num + k == x:
                result.append(num)
        return result