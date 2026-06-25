
class Solution:
    def subarraySum(self, nums, k):
        count = defaultdict(int)

        count[0] = 1
        cur = 0
        res = 0

        for num in nums:
            cur += num

            if cur-k in count:
                res += count[cur - k]

            count[cur] += 1

        return res