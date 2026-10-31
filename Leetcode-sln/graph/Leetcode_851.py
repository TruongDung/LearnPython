from collections import defaultdict, deque
from typing import List


class Solution:
    def loudAndRich(self, richer: List[List[int]], quiet: List[int]) -> List[int]:
        """
        Cách 1: Topo sort + tập hợp richer transitively.
        Mỗi người giữ một tập các người giàu hơn và cập nhật khi duyệt topo.
        """
        n = len(quiet)
        graph = defaultdict(list)
        indegree = [0 for _ in range(n)]
        for u, v in richer:
            graph[u].append(v)
            indegree[v] += 1

        queue = deque()
        richer_map = defaultdict(set)

        for i in range(n):
            if indegree[i] == 0:
                queue.append(i)

        while queue:
            size = len(queue)
            for _ in range(size):
                cur = queue.popleft()
                for nei in graph[cur]:
                    # cur is richer than nei
                    richer_map[nei].add(cur)
                    # all people richer than curr are also richer than nei
                    richer_map[nei].update(richer_map[cur])
                    indegree[nei] -= 1
                    if indegree[nei] == 0:
                        queue.append(nei)

        res = []
        for i in range(n):
            richer_set = richer_map[i]
            least_quiet = quiet[i]
            index = i
            for rich in richer_set:
                if quiet[rich] < least_quiet:
                    least_quiet = quiet[rich]
                    index = rich
            res.append(index)

        return res

    def loudAndRich_dfs(self, richer: List[List[int]], quiet: List[int]) -> List[int]:
        """
        Cách 2: DFS + memoization trên đồ thị ngược.
        graph[v] chứa các người giàu hơn v.
        """
        n = len(quiet)
        graph = [[] for _ in range(n)]
        for u, v in richer:
            graph[v].append(u)

        memo = [-1] * n

        def dfs(person: int) -> int:
            if memo[person] != -1:
                return memo[person]

            best = person
            for richer_person in graph[person]:
                candidate = dfs(richer_person)
                if quiet[candidate] < quiet[best]:
                    best = candidate
            memo[person] = best
            return best

        return [dfs(i) for i in range(n)]

    def loudAndRich_topological(self, richer: List[List[int]], quiet: List[int]) -> List[int]:
        """
        Cách 3: Kahn's algorithm + cập nhật candidate theo từng lớp topo.
        answer[x] lưu người ít ồn nhất trong x và các người giàu hơn x.
        """
        n = len(quiet)
        graph = [[] for _ in range(n)]
        indegree = [0] * n

        for u, v in richer:
            graph[u].append(v)
            indegree[v] += 1

        queue = deque(i for i in range(n) if indegree[i] == 0)
        answer = list(range(n))

        while queue:
            rich_person = queue.popleft()
            for poor_person in graph[rich_person]:
                if quiet[answer[rich_person]] < quiet[answer[poor_person]]:
                    answer[poor_person] = answer[rich_person]
                indegree[poor_person] -= 1
                if indegree[poor_person] == 0:
                    queue.append(poor_person)

        return answer

    def loudAndRich_dp(self, richer: List[List[int]], quiet: List[int]) -> List[int]:
        """
        Cách 4: DP kiểu recursive trên đồ thị ngược.
        solve(person) = người ít ồn nhất trong person và mọi người giàu hơn person.
        """
        n = len(quiet)
        graph = [[] for _ in range(n)]
        for u, v in richer:
            graph[v].append(u)

        memo = [-1] * n

        def solve(person: int) -> int:
            if memo[person] != -1:
                return memo[person]

            best = person
            for richer_person in graph[person]:
                candidate = solve(richer_person)
                if quiet[candidate] < quiet[best]:
                    best = candidate
            memo[person] = best
            return best

        return [solve(i) for i in range(n)]


if __name__ == "__main__":
    sol = Solution()
    richer = [[1, 0], [2, 1], [3, 1], [3, 7], [4, 3], [5, 3], [6, 3]]
    quiet = [3, 2, 5, 4, 6, 1, 7, 0]

    methods = [
        ("loudAndRich", sol.loudAndRich),
        ("loudAndRich_dfs", sol.loudAndRich_dfs),
        ("loudAndRich_topological", sol.loudAndRich_topological),
        ("loudAndRich_dp", sol.loudAndRich_dp),
    ]

    for name, func in methods:
        print(name, func(richer, quiet))
