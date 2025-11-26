class Solution:
    def tictactoe(self, moves: List[List[int]]) -> str:
        win = (
            ([0,0], [0,1], [0,2]), 
            ([1,0], [1,1], [1,2]),
            ([2,0], [2,1], [2,2]),
            ([0,0], [1,0], [2,0]),
            ([0,1], [1,1], [2,1]),
            ([0,2], [1,2], [2,2]),
            ([0,0], [1,1], [2,2]),
            ([2,0], [1,1], [0,2])
        )

        amove = []
        bmove = []
        for i in range(len(moves)):
            if i %2 == 0:
                amove.append(tuple(moves[i]))
            else:
                bmove.append(tuple(moves[i]))

        A = set(amove)
        B = set(bmove)

        # Kiểm tra thắng
        for combo in win:
            if all(c in A for c in combo):
                return "A"
            if all(c in B for c in combo):
                return "B"


        return "None"
    
sol = Solution()
print(sol.tictactoe([[0,0],[2,0],[1,1],[2,1],[2,2]]))