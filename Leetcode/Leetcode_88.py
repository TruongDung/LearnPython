class Solution:
    def merge(self, nums1: List[int], m: int, nums2: List[int], n: int) -> None:
        i = m-1 # last index in nums1
        j = n-1 # last index in nums2
        k = m+n-1 # last index of the combined list 

        while i >= 0 and j >= 0:
            if nums1[i] < nums2[j]:
                nums1[k] = nums2[j]
                k-=1
                j-=1
            else:
                nums1[k] = nums1[i]
                k-=1
                i-=1
        # i<0
        while j >= 0:
            nums1[k] = nums2[j]
            k-=1
            j-=1

sol = Solution()
sol.merge([1,2,3,0,0,0], 3, [2,5,6], 3)