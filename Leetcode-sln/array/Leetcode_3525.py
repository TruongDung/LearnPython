from typing import List


class Solution:
    def resultArray(self, nums: List[int], k: int, queries: List[List[int]]) -> List[int]:
        # Removing a suffix of nums[start..] leaves a PREFIX of that range, so a
        # query counts the prefixes of nums[start..n-1] whose product % k == x.
        #
        # nums is mutated between queries and the edit persists, so unlike
        # problem 3524 a single preprocessing pass will not do. Each segment-tree
        # node stores:
        #   prod   = product of its whole range, mod k
        #   cnt[r] = how many prefixes OF THAT RANGE have product % k == r
        n = len(nums)
        prod = [1] * (4 * n)
        cnt = [[0] * k for _ in range(4 * n)]

        def merge(u):
            # A prefix that stays inside the left child keeps its remainder, so
            # the left child's cnt is copied as-is. A prefix that swallows the
            # left child and continues into the right child has its remainder
            # multiplied by the left child's prod. Hence this merge is NOT
            # commutative: only the right side picks up the extra factor.
            left, right = u * 2, u * 2 + 1
            prod[u] = prod[left] * prod[right] % k
            cnt[u] = cnt[left][:]
            for r in range(k):
                cnt[u][prod[left] * r % k] += cnt[right][r]

        def build(u, lo, hi):
            if lo == hi:
                v = nums[lo] % k
                prod[u] = v
                cnt[u] = [0] * k
                cnt[u][v] = 1
                return
            mid = (lo + hi) // 2
            build(u * 2, lo, mid)
            build(u * 2 + 1, mid + 1, hi)
            merge(u)

        def update(u, lo, hi, i, v):
            if lo == hi:
                prod[u] = v % k
                cnt[u] = [0] * k
                cnt[u][v % k] = 1
                return
            mid = (lo + hi) // 2
            if i <= mid:
                update(u * 2, lo, mid, i, v)
            else:
                update(u * 2 + 1, mid + 1, hi, i, v)
            merge(u)

        def query(u, lo, hi, left):
            # Answer for [left, n-1] intersected with this node's range.
            if lo >= left:
                return prod[u], cnt[u]
            mid = (lo + hi) // 2
            if left > mid:
                return query(u * 2 + 1, mid + 1, hi, left)
            lp, lc = query(u * 2, lo, mid, left)
            rp, rc = query(u * 2 + 1, mid + 1, hi, left)
            total = lc[:]
            for r in range(k):
                total[lp * r % k] += rc[r]
            return lp * rp % k, total

        build(1, 0, n - 1)
        ans = []
        for index, value, start, x in queries:
            nums[index] = value
            update(1, 0, n - 1, index, value)
            ans.append(query(1, 0, n - 1, start)[1][x])
        return ans

    def resultArrayBrute(self, nums: List[int], k: int, queries: List[List[int]]) -> List[int]:
        """O(n) per query straight from the statement, for cross-checking."""
        values = nums[:]
        ans = []
        for index, value, start, x in queries:
            values[index] = value
            running = 1
            count = 0
            for j in range(start, len(values)):
                running = running * values[j] % k
                if running == x:
                    count += 1
            ans.append(count)
        return ans


if __name__ == "__main__":
    import random

    solution = Solution()

    # LeetCode example 1.
    assert solution.resultArray(
        [1, 2, 3, 4, 5], 3, [[2, 2, 0, 2], [3, 3, 3, 0], [0, 1, 0, 1]]
    ) == [2, 2, 2]
    # LeetCode example 2: no prefix leaves remainder 1.
    assert solution.resultArray(
        [1, 2, 4, 8, 16, 32], 4, [[0, 2, 0, 2], [0, 2, 0, 1]]
    ) == [1, 0]
    # LeetCode example 3.
    assert solution.resultArray([1, 1, 2, 1, 1], 2, [[2, 1, 0, 1]]) == [5]

    # k = 1 puts every prefix in bucket 0.
    assert solution.resultArray([7, 7, 7], 1, [[0, 5, 0, 0]]) == [3]
    # start at the last index leaves exactly one prefix.
    assert solution.resultArray([2, 3], 5, [[0, 2, 1, 3]]) == [1]

    # The segment tree and the literal reading must agree, and each answer must
    # never exceed the number of prefixes in the queried range.
    random.seed(3525)
    for _ in range(300):
        n = random.randint(1, 9)
        modulus = random.randint(1, 5)
        values = [random.randint(1, 40) for _ in range(n)]
        qs = [
            [
                random.randrange(n),
                random.randint(1, 40),
                random.randrange(n),
                random.randrange(modulus),
            ]
            for _ in range(random.randint(1, 5))
        ]
        fast = solution.resultArray(values[:], modulus, [q[:] for q in qs])
        slow = solution.resultArrayBrute(values[:], modulus, [q[:] for q in qs])
        assert fast == slow, (values, modulus, qs, fast, slow)
        for (_i, _v, start, _x), got in zip(qs, fast):
            assert 0 <= got <= n - start, (values, modulus, qs)
