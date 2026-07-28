from typing import List


class Robot:
    """Simulated robot API over a known grid (for local testing)."""

    def __init__(self, room: List[List[int]], row: int, col: int):
        self.room = room
        self.rows = len(room)
        self.cols = len(room[0])
        self.r = row
        self.c = col
        # facing: 0=up, 1=right, 2=down, 3=left
        self.d = 0
        self.cleaned = set()

    def move(self) -> bool:
        dr, dc = [(-1, 0), (0, 1), (1, 0), (0, -1)][self.d]
        nr, nc = self.r + dr, self.c + dc
        if 0 <= nr < self.rows and 0 <= nc < self.cols and self.room[nr][nc] == 1:
            self.r, self.c = nr, nc
            return True
        return False

    def turnLeft(self) -> None:
        self.d = (self.d - 1) % 4

    def turnRight(self) -> None:
        self.d = (self.d + 1) % 4

    def clean(self) -> None:
        self.cleaned.add((self.r, self.c))


class Solution:
    def cleanRoom(self, robot: "Robot") -> None:
        visited = set()
        directions = [(-1, 0), (0, 1), (1, 0), (0, -1)]  # up, right, down, left

        def go_back():
            robot.turnRight()
            robot.turnRight()
            robot.move()
            robot.turnRight()
            robot.turnRight()

        def dfs(r, c, d):
            visited.add((r, c))
            robot.clean()

            for i in range(4):
                nd = (d + i) % 4
                dr, dc = directions[nd]
                nr, nc = r + dr, c + dc

                if (nr, nc) not in visited and robot.move():
                    dfs(nr, nc, nd)
                    go_back()

                robot.turnRight()  # rotate to try next direction

        dfs(0, 0, 0)


room = [
    [1, 1, 1, 1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1, 0, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
]
r = Robot(room, 1, 3)
Solution().cleanRoom(r)
total_free = sum(row.count(1) for row in room)
print(len(r.cleaned) == total_free)  # True — all reachable cells cleaned
