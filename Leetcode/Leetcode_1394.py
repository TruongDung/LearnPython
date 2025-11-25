from collections import defaultdict
from collections import Counter
class Solution:
    def findLucky(self, arr: List[int]) -> int:
        # d = defaultdict(int)
        # for i in range(len(arr)):
        #         d[arr[i]] += 1

        # count = -1

        # for i in d:
        #     if d[i] == i:
        #         count = max(count, d[i])
        # return count
        c = Counter(arr)
        return max([num for num, freq in c.items() if num == freq], default=-1)

sol = Solution()
print(sol.findLucky([2,2,3,4]))