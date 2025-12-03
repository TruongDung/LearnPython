from collections import defaultdict

class Solution:
    def countLargestGroup(self, n: int) -> int:
        group = defaultdict(int)

        for i in range(1, n+1):
            a1 = list(map(int, str(i)))
            print(type(a1))
            key = sum(map(int, str(i)))   # f(i) = sum of digits
            group[key] += 1
        
        m = max(group.values())
        return list(group.values()).count(m)
    
sol = Solution()
print(sol.countLargestGroup(13))