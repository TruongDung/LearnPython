from collections import defaultdict
from typing import List


class Solution:
    def accountsMerge(self, accounts: List[List[str]]) -> List[List[str]]:
        parent = {}

        def find(x: str) -> str:
            parent.setdefault(x, x)
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        def union(a: str, b: str) -> None:
            parent[find(a)] = find(b)

        email_to_name = {}
        for account in accounts:
            name = account[0]
            first_email = account[1]
            for email in account[1:]:
                email_to_name[email] = name
                union(email, first_email)

        # Group emails by their root
        groups = defaultdict(list)
        for email in email_to_name:
            groups[find(email)].append(email)

        result = []
        for emails in groups.values():
            name = email_to_name[emails[0]]
            result.append([name] + sorted(emails))

        return result


sol = Solution()
print(sol.accountsMerge([
    ["John", "johnsmith@mail.com", "john_newyork@mail.com"],
    ["John", "johnsmith@mail.com", "john00@mail.com"],
    ["Mary", "mary@mail.com"],
    ["John", "johnnybravo@mail.com"],
]))
