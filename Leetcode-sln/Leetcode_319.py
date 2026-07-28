import math


class Solution:
    def bulbSwitch(self, n: int) -> int:
        # Bulb i is toggled once for every divisor of i.
        # Only perfect squares have an odd number of divisors,
        # so exactly the perfect squares <= n stay ON.
        # Their count is floor(sqrt(n)).
        return int(math.sqrt(n))


sol = Solution()
print(sol.bulbSwitch(3))  # 1
print(sol.bulbSwitch(0))  # 0
print(sol.bulbSwitch(1))  # 1
print(sol.bulbSwitch(9))  # 3
