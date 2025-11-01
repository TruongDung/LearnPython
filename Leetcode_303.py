
class NumArray:
    def __init__(self, nums: List[int]):
        prefixArr = [0]*(len(nums)+1)
        prefixSum = 0
        for i in range(len(nums)):
            prefixSum += nums[i]
            prefixArr[i+1] = prefixSum
        self.prefixArr = prefixArr

    def sumRange(self, left: int, right: int) -> int:
        return self.prefixArr[right+1] - self.prefixArr[left]
       
obj = NumArray([-2,0,3,-5,2,1])
obj.sumRange(0,2)