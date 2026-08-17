from typing import List
from functools import lru_cache


class Solution:
    def stoneGameV(self, stoneValue: List[int]) -> int:
        n = len(stoneValue)

        # Prefix Sum
        prefix = [0] * (n + 1)

        for i in range(n):
            prefix[i + 1] = prefix[i] + stoneValue[i]

        @lru_cache(None)
        def dfs(left: int, right: int) -> int:
            if left == right:
                return 0

            # Sum của [left ... right]
            total = prefix[right + 1] - prefix[left]

            suml = 0
            ans = 0

            for i in range(left, right):
                suml = prefix[i + 1] - prefix[left]

                sumr = total - suml

                if suml < sumr:
                    ans = max(
                        ans,
                        suml + dfs(left, i)
                    )

                elif suml > sumr:
                    ans = max(
                        ans,
                        sumr + dfs(i + 1, right)
                    )

                else:
                    ans = max(
                        ans,
                        suml + max(
                            dfs(left, i),
                            dfs(i + 1, right)
                        )
                    )

            return ans

        return dfs(0, n - 1)