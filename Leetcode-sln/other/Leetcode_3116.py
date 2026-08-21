from math import gcd
from typing import List


class Solution:
    def findKthSmallest(self, coins: List[int], k: int) -> int:
        n = len(coins)

        def lcm(a, b):
            return a // gcd(a, b) * b

        def count(x):
            total = 0

            # Enumerate all non-empty subsets
            for mask in range(1, 1 << n):

                curr_lcm = 1
                bits = 0

                for i in range(n):
                    if mask & (1 << i):
                        bits += 1
                        curr_lcm = lcm(curr_lcm, coins[i])

                        # LCM already too large
                        if curr_lcm > x:
                            break

                else:
                    amount = x // curr_lcm

                    # Inclusion-Exclusion
                    if bits % 2 == 1:
                        total += amount
                    else:
                        total -= amount

            return total

        # Binary Search on Answer
        left = min(coins)
        right = min(coins) * k

        while left < right:
            mid = (left + right) // 2

            if count(mid) >= k:
                right = mid
            else:
                left = mid + 1

        return left

sol = Solution()
print(sol.findKthSmallest([3,6,9], 3))