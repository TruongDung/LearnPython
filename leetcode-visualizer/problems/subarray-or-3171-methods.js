'use strict';
const bi=(vi,en)=>({vi,en}),code=text=>text.trim().split('\n');
const probe = `        best = float('inf')
        for left in range(n):
            lo, hi = left, n - 1
            while lo <= hi:
                mid = (lo + hi) // 2
                right = mid
                value = range_or(left, right)
                best = min(best, abs(value - k))
                if value < k:
                    lo = mid + 1
                else:
                    hi = mid - 1
        return best`;
module.exports=[
 {label:bi('OR suffix khác nhau','Distinct suffix ORs'),time:'O(nB)',space:'O(B)',code:code(`
class Solution:
    def minimumDifference(self, nums, k):
        best = float('inf')
        suffix_ors = []
        for right, x in enumerate(nums):
            current = [(x, right)]
            for old, left in suffix_ors:
                merged = old | x
                if merged != current[-1][0]:
                    current.append((merged, left))
            suffix_ors = current
            for value, left in suffix_ors:
                best = min(best, abs(value - k))
        return best`)},
 {label:bi('Vét cạn từng subarray','Brute force'),time:'O(n²)',space:'O(1)',code:code(`
class Solution:
    def minimumDifference(self, nums, k):
        best = float('inf')
        for left in range(len(nums)):
            value = 0
            for right in range(left, len(nums)):
                value |= nums[right]
                best = min(best, abs(value - k))
        return best`)},
 {label:bi('Cập nhật OR tại chỗ','In-place OR updates'),time:'O(nB)',space:'O(1)',code:code(`
class Solution:
    def minimumDifference(self, nums, k):
        best = float('inf')
        for right in range(len(nums)):
            x = nums[right]
            left = right
            value = x
            best = min(best, abs(value - k))
            for left in range(right - 1, -1, -1):
                value = nums[left] | x
                if value == nums[left]:
                    break
                nums[left] = value
                best = min(best, abs(value - k))
        return best`)},
 {label:bi('Cửa sổ + đếm bit','Sliding window + bit counts'),time:'O(nB)',space:'O(B)',code:code(`
class Solution:
    def minimumDifference(self, nums, k):
        width = max(1, max(nums).bit_length())
        counts = [0] * width
        left = 0
        window_or = 0
        best = float('inf')
        for right, x in enumerate(nums):
            for bit in range(width):
                if x & (1 << bit):
                    counts[bit] += 1
                    window_or |= 1 << bit
            value = window_or
            best = min(best, abs(value - k))
            while left < right and window_or > k:
                for bit in range(width):
                    if nums[left] & (1 << bit):
                        counts[bit] -= 1
                        if counts[bit] == 0:
                            window_or &= ~(1 << bit)
                left += 1
                value = window_or
                best = min(best, abs(value - k))
        return best`)},
 {label:bi('Prefix bit + binary search','Prefix bit counts + binary search'),time:'O(nB log n)',space:'O(nB)',code:code(`
class Solution:
    def minimumDifference(self, nums, k):
        n = len(nums)
        width = max(1, max(nums).bit_length())
        prefix = [[0] * width]
        for x in nums:
            row = prefix[-1].copy()
            for bit in range(width):
                row[bit] += (x >> bit) & 1
            prefix.append(row)
        def range_or(left, right):
            result = 0
            for bit in range(width):
                if prefix[right + 1][bit] > prefix[left][bit]:
                    result |= 1 << bit
            return result
${probe}`)},
 {label:bi('Sparse table + binary search','Sparse table + binary search'),time:'O(n log n)',space:'O(n log n)',code:code(`
class Solution:
    def minimumDifference(self, nums, k):
        n = len(nums)
        logs = [0] * (n + 1)
        for i in range(2, n + 1):
            logs[i] = logs[i // 2] + 1
        table = [list(nums)]
        span = 2
        while span <= n:
            row = []
            for i in range(n - span + 1):
                row.append(table[-1][i] | table[-1][i + span // 2])
            table.append(row)
            span *= 2
        def range_or(left, right):
            level = logs[right - left + 1]
            block = 1 << level
            return table[level][left] | table[level][right - block + 1]
${probe}`)},
 {label:bi('Segment tree + binary search','Segment tree + binary search'),time:'O(n log² n)',space:'O(n)',code:code(`
class Solution:
    def minimumDifference(self, nums, k):
        n = len(nums)
        size = 1
        while size < n:
            size *= 2
        tree = [0] * (2 * size)
        for i, x in enumerate(nums):
            tree[size + i] = x
        for node in range(size - 1, 0, -1):
            tree[node] = tree[node * 2] | tree[node * 2 + 1]
        def range_or(left, right):
            l, r = left + size, right + size + 1
            result = 0
            while l < r:
                if l & 1:
                    result |= tree[l]
                    l += 1
                if r & 1:
                    r -= 1
                    result |= tree[r]
                l //= 2
                r //= 2
            return result
${probe}`)},
];
