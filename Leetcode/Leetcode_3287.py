class Solution:
    def maxValue(self, nums: List[int], k: int) -> int:
        """
        Find the Maximum Sequence Value of Array (LeetCode 3287)
        
        The maximum value of a subsequence of length k is the sum of the k largest elements.
        """
        if k > len(nums):
            return 0  # or raise error, but assume k <= n
        
        # Sort in descending order
        nums.sort(reverse=True)
        # Sum the first k elements
        return sum(nums[:k])
        