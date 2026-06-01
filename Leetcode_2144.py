class Solution:
    def minimumCost(self, cost: List[int]) -> int:
        cost.sort(reverse=True)
        total = 0
        for i, price in enumerate(cost):
            if i%3 != 2:
                total += price
        return total

sol = Solution()
print(sol.minimumCost([1,2,3]))