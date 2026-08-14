from math import gcd
from bisect import bisect_left
from itertools import accumulate
from collections import Counter
from typing import List


class Solution:
    def gcdValues(self, nums: List[int], queries: List[int]) -> List[int]:
        freq = Counter(nums)
        maxVal = max(nums)

        exact = [0] * (maxVal + 1)

        # Process g from HIGH to LOW so that exact[2g], exact[3g]... are
        # already computed when we process g (inclusion-exclusion sieve).
        for g in range(maxVal, 0, -1):
            cntMult = sum(freq[g * k] for k in range(1, maxVal // g + 1))
            exact[g] = cntMult * (cntMult - 1) // 2
            for k in range(2, maxVal // g + 1):
                exact[g] -= exact[g * k]

        # prefix[g] = number of pairs with GCD <= g
        prefix = list(accumulate(exact))

        # Each query q → index into the sorted gcdPairs array
        return [bisect_left(prefix, q + 1) for q in queries]
