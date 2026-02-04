import math

class Solution:
    def repairCars(self, ranks: List[int], cars: int) -> int:
        start = 1
        end = min(ranks) * cars * cars

        while start < end:
            mid = (start + end) // 2

            total_cars = sum(math.isqrt(mid//rank) for rank in ranks)

            if total_cars == cars:
                return mid
            elif total_cars > cars:
                end = mid
            elif total_cars < cars:
                start = mid + 1

        return start
        
sol = Solution()
print(sol.repairCars([5,1,8], 6))