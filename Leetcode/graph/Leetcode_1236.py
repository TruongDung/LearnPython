
from collections import deque


class Solution:
    def crawl(self, startUrl: str, htmlParser: 'HtmlParser') -> List[str]:
        queue = deque()
        queue.append(startUrl)
        host_name = self.get_host_name(startUrl)
        visited = set()
        visited.add(startUrl)
        res = []
        while queue:
            size = len(queue)

            for _ in range(size):
                curr = queue.popleft()

                if self.get_host_name(curr) == host_name:
                    res.append(curr)
                    
                for nei in htmlParser.getUrls(curr):
                    if not nei in visited:
                        visited.add(nei)
                        queue.append(nei)

        return res
        
    def get_host_name(self, url):
        return url.split("/")[2]
    
urls = ["http://psn.wlyby.edu/wvoz","http://psn.wlyby.edu/shez","http://psn.wlyby.edu/upkr","http://psn.wlyby.edu/ubmr","http://psn.wlyby.edu/apgb","http://psn.wlyby.edu/sbin","http://psn.wlyby.edu/inmj","http://cpq.jkvox.tech/mjkb","http://lqr.shmtu.tech/rsvw","http://ylk.fubmn.com/ypyh"]

edges = [[0,8],[1,6],[1,7],[1,4],[3,3],[3,4],[3,7],[4,1],[4,0],[4,3],[5,5],[5,8],[5,5],[5,0],[6,8],[7,2],[7,7],[7,4],[10,7],[10,4],[10,3],[10,4]]

#output : ["http://psn.wlyby.edu/ubmr","http://psn.wlyby.edu/apgb","http://psn.wlyby.edu/shez","http://psn.wlyby.edu/wvoz","http://psn.wlyby.edu/upkr","http://psn.wlyby.edu/inmj"]
#expect: ["http://psn.wlyby.edu/apgb","http://psn.wlyby.edu/inmj","http://psn.wlyby.edu/shez","http://psn.wlyby.edu/ubmr","http://psn.wlyby.edu/wvoz"]