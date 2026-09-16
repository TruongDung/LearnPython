import math


class Solution:
    def numberOfSets(self, n: int, k: int) -> int:
        mod = 10**9 + 7
        ways = [[0] * (k + 1) for _ in range(n + 1)]
        prefix = [[0] * (k + 1) for _ in range(n + 1)]
        ways[0][0] = 1

        for points in range(1, n + 1):
            ways[points][0] = 1
            prefix[points][0] = points
            for segments in range(1, k + 1):
                skip = ways[points - 1][segments]
                end_here = prefix[points - 1][segments - 1]
                ways[points][segments] = (skip + end_here) % mod
                prefix[points][segments] = (
                    prefix[points - 1][segments] + ways[points][segments]
                ) % mod

        return ways[n][k]

    def numberOfSetsCombinatorial(self, n: int, k: int) -> int:
        """Stars and bars over k segment lengths and k + 1 gaps."""
        return math.comb(n + k - 1, 2 * k) % (10**9 + 7)


if __name__ == "__main__":
    solution = Solution()
    assert solution.numberOfSets(4, 2) == 5
    assert solution.numberOfSets(3, 1) == 3
    assert solution.numberOfSets(30, 7) == 796297179
    assert solution.numberOfSetsCombinatorial(4, 2) == 5
    assert solution.numberOfSetsCombinatorial(30, 7) == 796297179
