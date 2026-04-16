class Solution:
    def getFactors(self, n: int) -> List[List[int]]:
        nums = []

        if n == 1:
            return nums
            
        for num in range(2, n):
            if n % num == 0:
                nums.append(num)
        

        res = []
        temp = []

        def dfs(start, res, temp, current_product):
            if current_product == n:
                res.append(temp.copy())
                return 
            
            for i in range(start, len(nums)):
                
                if current_product * nums[i] > n:
                    continue

                temp.append(nums[i])
                dfs(i, res, temp, current_product*nums[i])
                temp.pop()
        
        dfs(0, res, temp, 1)
        return res