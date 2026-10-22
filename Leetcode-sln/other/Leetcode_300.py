class Solution:
    def maximumBeauty(self, items: list[list[int]], queries: list[int]) -> list[int]:
        items.sort()

        prefix_max = []
        best = 0

        for price, beauty in items:
            best = max(best, beauty)
            prefix_max.append(best)

        res = []

        for query in queries:
            low = 0
            high = len(items) - 1

            while low <= high:
                mid = (low + high) // 2

                if items[mid][0] <= query:
                    low = mid + 1
                else:
                    high = mid - 1

            res.append(prefix_max[low - 1] if low else 0)

        return res

sol = Solution()
print(sol.maximumBeauty([[1,2],[3,2],[2,4],[5,6]], [1,2,3,4,5,6]))
