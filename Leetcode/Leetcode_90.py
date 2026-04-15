class Solution:
    def subsetsWithDup(self, nums: List[int]) -> List[List[int]]:
        res = []
        nums.sort()
        def dfs(start, temp):
            if start == len(nums):
                res.append(list(temp))

            for i in range(start, n):
                if i > start and nums[i] == nums[i+1]:
                    continue

                temp.append(nums[i])
                dfs(start+1, temp)
                temp.pop()
                
            dfs(0,[])

        return res