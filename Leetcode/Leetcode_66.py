class Solution:
    def plusOne(self, digits: List[int]) -> List[int]:
        memory = 1

        for i in range(len(digits)-1, -1, -1):
            memory += digits[i]
            digits[i] = memory%10
            memory = memory // 10
            
        if memory == 1: return [1] + digits
        
        return digits
sol = Solution()
print(sol.plusOne([1,2,3]))
print(sol.plusOne([9,9,9]))