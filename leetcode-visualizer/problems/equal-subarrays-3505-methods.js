'use strict';
const sortedCosts=`        n = len(nums)
        cost = [None] * (n - x + 1)
        for start in range(n - x + 1):
            window = sorted(nums[start:start + x])
            median = window[(x - 1) // 2]
            current = 0
            for index, value in enumerate(window):
                current += abs(value - median)
            cost[start] = current
`;
const dp=`        dp = []
        for end in range(n + 1):
            dp.append([float("inf")] * (k + 1))
        dp[0][0] = 0
        for i in range(1, n + 1):
            dp[i][0] = 0
            for used in range(1, k + 1):
                skip = dp[i - 1][used]
                take = float("inf")
                if i >= x:
                    take = dp[i - x][used - 1] + cost[i - x]
                dp[i][used] = min(skip, take)
        return dp[n][k]`;
const make=(vi,en,time,space,imports,costs,selection=dp)=>({label:{vi,en},time,space,code:(imports+'class Solution:\n    def minOperations(self, nums, x, k):\n'+costs+selection).split('\n')});
const heapCosts=`        n = len(nums)
        cost = [None] * (n - x + 1)
        low, high = [], []
        low_size = high_size = 0
        low_sum = high_sum = 0
        delayed = {}
        def prune(heap, negative):
            while heap:
                value = -heap[0] if negative else heap[0]
                if delayed.get(value, 0) == 0:
                    break
                heappop(heap)
                delayed[value] -= 1
        def balance():
            nonlocal low_size, high_size, low_sum, high_sum
            if low_size > high_size + 1:
                value = -heappop(low)
                low_size -= 1
                low_sum -= value
                heappush(high, value)
                high_size += 1
                high_sum += value
                prune(low, True)
            elif low_size < high_size:
                value = heappop(high)
                high_size -= 1
                high_sum -= value
                heappush(low, -value)
                low_size += 1
                low_sum += value
                prune(high, False)
        def add(value):
            nonlocal low_size, high_size, low_sum, high_sum
            if not low or value <= -low[0]:
                heappush(low, -value)
                low_size += 1
                low_sum += value
            else:
                heappush(high, value)
                high_size += 1
                high_sum += value
            balance()
        def remove(value):
            nonlocal low_size, high_size, low_sum, high_sum
            delayed[value] = delayed.get(value, 0) + 1
            if value <= -low[0]:
                low_size -= 1
                low_sum -= value
                if value == -low[0]:
                    prune(low, True)
            else:
                high_size -= 1
                high_sum -= value
                if value == high[0]:
                    prune(high, False)
            balance()
        for index in range(x):
            add(nums[index])
        for start in range(n - x + 1):
            if start > 0:
                remove(nums[start - 1])
                add(nums[start + x - 1])
            median = -low[0]
            current = median * low_size - low_sum + high_sum - median * high_size
            cost[start] = current
`;
const fenwickCosts=`        n = len(nums)
        cost = [None] * (n - x + 1)
        coords = sorted(set(nums))
        m = len(coords)
        ranks = {}
        for index, value in enumerate(coords, 1):
            ranks[value] = index
        bit_count = [0] * (m + 1)
        bit_sum = [0] * (m + 1)
        def add(index, count, amount):
            while index <= m:
                bit_count[index] += count
                bit_sum[index] += amount
                index += index & -index
        def prefix(tree, end):
            result = 0
            while end > 0:
                result += tree[end]
                end -= end & -end
            return result
        def kth(need):
            index = 0
            step = 1 << (m.bit_length() - 1)
            while step:
                nxt = index + step
                if nxt <= m and bit_count[nxt] < need:
                    need -= bit_count[nxt]
                    index = nxt
                step //= 2
            return index + 1
        window_sum = 0
        for index in range(x):
            add(ranks[nums[index]], 1, nums[index])
            window_sum += nums[index]
        for start in range(n - x + 1):
            if start > 0:
                value = nums[start - 1]
                add(ranks[value], -1, -value)
                window_sum -= value
                value = nums[start + x - 1]
                add(ranks[value], 1, value)
                window_sum += value
            median_rank = kth((x + 1) // 2)
            median = coords[median_rank - 1]
            left_count = prefix(bit_count, median_rank)
            left_sum = prefix(bit_sum, median_rank)
            current = median * left_count - left_sum + window_sum - left_sum - median * (x - left_count)
            cost[start] = current
`;
module.exports=[
make('Sort từng cửa sổ + DP','Sort windows + DP','O(nx log x + nk)','O(nk + x)','',sortedCosts),
make('Sorted list trượt + DP','Sliding sorted list + DP','O(nx + nk)','O(nk + x)','from bisect import bisect_left, insort\n\n',`        n = len(nums)
        cost = [None] * (n - x + 1)
        window = sorted(nums[:x])
        lower_count = (x + 1) // 2
        for start in range(n - x + 1):
            if start > 0:
                window.pop(bisect_left(window, nums[start - 1]))
                insort(window, nums[start + x - 1])
            median = window[lower_count - 1]
            low_sum = sum(window[:lower_count])
            high_sum = sum(window[lower_count:])
            current = median * lower_count - low_sum + high_sum - median * (x - lower_count)
            cost[start] = current
`),
make('Hai heap + DP','Dual heaps + DP','O(n log n + nk)','O(nk + n)','from heapq import heappop, heappush\n\n',heapCosts),
make('Fenwick + DP','Fenwick + DP','O(n log n + nk)','O(nk + n)','',fenwickCosts),
make('Memo DFS','Memoized DFS','O(nx log x + nk)','O(nk + n)','import sys\n\n',sortedCosts,`        sys.setrecursionlimit(max(sys.getrecursionlimit(), 2 * n + 100))
        memo = {}
        def solve(i, left):
            if left == 0:
                return 0
            if n - i < left * x:
                return float("inf")
            key = (i, left)
            if key in memo:
                return memo[key]
            skip = solve(i + 1, left)
            take = cost[i] + solve(i + x, left - 1)
            memo[key] = min(skip, take)
            return memo[key]
        return solve(0, k)`),
make('DP cuộn hai hàng','Rolling DP','O(nx log x + nk)','O(n + x)','',sortedCosts,`        prev = [0] * (n + 1)
        for used in range(1, k + 1):
            curr = [float("inf")] * (n + 1)
            for i in range(1, n + 1):
                skip = curr[i - 1]
                take = float("inf")
                if i >= x:
                    take = prev[i - x] + cost[i - x]
                curr[i] = min(skip, take)
            prev = curr
        return prev[n]`),
make('DFS chọn / bỏ + cắt nhánh','DFS with pruning','O(nx log x + n × 2^n)','O(n + x + k²)','',sortedCosts,`        best = float("inf")
        def search(i, left, spent, path):
            nonlocal best
            if left == 0:
                best = min(best, spent)
                return
            if n - i < left * x or spent >= best:
                return
            search(i + x, left - 1, spent + cost[i], path + [i])
            search(i + 1, left, spent, path)
        search(0, k, 0, [])
        return best`)
];
