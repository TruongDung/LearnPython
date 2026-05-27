from itertools import combinations

class Solution:
    def largestSquareArea(
        self, bottomLeft: List[List[int]], topRight: List[List[int]]) -> int:
        max_size = 0

        for (bottom_left_i, top_right_i), (bottom_left_j,top_right_j) in combinations(zip(bottomLeft, topRight), 2):
            w = min(top_right_i[0], top_right_j[0]) - max(bottom_left_i[0], bottom_left_j[0])
            h = min(top_right_i[1], top_right_j[1]) - max(bottom_left_i[1], bottom_left_j[1])

            max_size = max(max_size, min(w, h))

        return max_size * max_size
    
sol = Solution()
#print(sol.largestSquareArea([[1,1],[1,3],[1,5]], [[5,5],[5,7],[5,9]]))
print(sol.largestSquareArea([[1,1],[2,2],[3,1]], [[3,3],[4,4],[6,6]]))