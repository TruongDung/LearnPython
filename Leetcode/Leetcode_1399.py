from collections import defaultdict

class Solution:
    def countLargestGroup(self, n: int) -> int:
        m = defaultdict(int)
        for i in range(1,n+1):
            sum1 = self.sum_digit(i)
            m[sum1] += 1
        max_value = max(m.values())
        return list(m.values()).count(max_value)
    
    def sum_digit(self, j: int) -> int:
        sum = 0
        while j > 0:
            sum += j%10
            j = j//10
        return sum


    
sol = Solution()
print(sol.countLargestGroup(2))