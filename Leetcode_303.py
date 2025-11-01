class NumArray:

    def __init__(self, nums: List[int]):
        print('Constructor')

    def sumRange(self, left: int, right: int) -> int:
        print('Sum Range')
       
obj = NumArray([-2,0,3,-5,2,1])
obj.sumRange(1,2)