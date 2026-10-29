"""Small-input reference solvers, independent of the visualized algorithms."""
import collections
import itertools
import json
import sys

DIRS = [(1,0),(-1,0),(0,1),(0,-1)]
def components(grid, allowed=lambda x: bool(x)):
    rows, cols = len(grid), len(grid[0]); seen=set(); groups=[]
    for r in range(rows):
        for c in range(cols):
            if (r,c) in seen or not allowed(grid[r][c]):continue
            group={(r,c)}; todo=[(r,c)];seen.add((r,c))
            while todo:
                a,b=todo.pop()
                for da,db in DIRS:
                    p=(a+da,b+db)
                    if 0<=p[0]<rows and 0<=p[1]<cols and p not in seen and allowed(grid[p[0]][p[1]]):
                        seen.add(p);group.add(p);todo.append(p)
            groups.append(group)
    return groups

def graph_components(n,edges):
    reach=[[i==j for j in range(n)] for i in range(n)]
    for a,b in edges:reach[a][b]=reach[b][a]=True
    for k in range(n):
        for i in range(n):
            for j in range(n):reach[i][j] |= reach[i][k] and reach[k][j]
    return reach

def oracle(pid,args):
    if pid==529:
        board,click=args;r,c=click
        if board[r][c]=='M':board[r][c]='X';return board
        seen=set()
        def reveal(r,c):
            if (r,c) in seen or board[r][c]!='E':return
            seen.add((r,c));neighbors=[(r+dr,c+dc) for dr in (-1,0,1) for dc in (-1,0,1) if (dr or dc) and 0<=r+dr<len(board) and 0<=c+dc<len(board[0])]
            count=sum(board[a][b]=='M' for a,b in neighbors)
            board[r][c]=str(count) if count else 'B'
            if not count:
                for a,b in neighbors:reveal(a,b)
        reveal(r,c);return board
    if pid==1034:
        grid,r,c,color=args;old=grid[r][c];group=next(g for g in components([[v==old for v in row] for row in grid]) if (r,c) in g)
        border=[(a,b) for a,b in group if any((a+da,b+db) not in group for da,db in DIRS)]
        for a,b in border:grid[a][b]=color
        return grid
    if pid==1992:
        return [[min(r for r,c in g),min(c for r,c in g),max(r for r,c in g),max(c for r,c in g)] for g in components(args[0])]
    if pid==2658:
        grid=args[0];return max((sum(grid[r][c] for r,c in g) for g in components(grid)),default=0)
    if pid==711:
        signatures=set()
        for group in components(args[0]):
            shapes=[]
            for mirror in (1,-1):
                points=[(r,c*mirror) for r,c in group]
                for rotation in range(4):
                    points=[(c,-r) for r,c in points]
                    low_r=min(r for r,c in points);low_c=min(c for r,c in points)
                    shapes.append(tuple(sorted((r-low_r,c-low_c) for r,c in points)))
            signatures.add(min(shapes))
        return len(signatures)
    if pid==1559:
        grid=args[0];rows,cols=len(grid),len(grid[0]);parent=list(range(rows*cols))
        def find(x):
            while parent[x]!=x:x=parent[x]
            return x
        for r in range(rows):
            for c in range(cols):
                for dr,dc in ((-1,0),(0,-1)):
                    nr,nc=r+dr,c+dc
                    if nr>=0 and nc>=0 and grid[nr][nc]==grid[r][c]:
                        a,b=find(r*cols+c),find(nr*cols+nc)
                        if a==b:return True
                        parent[a]=b
        return False
    if pid==407:
        grid=args[0];rows,cols=len(grid),len(grid[0]);heights=sorted(set(sum(grid,[])));water=0
        for r in range(rows):
            for c in range(cols):
                for level in heights:
                    if level<grid[r][c]:continue
                    todo=[(r,c)];seen={(r,c)};escaped=False
                    while todo:
                        a,b=todo.pop()
                        if a in (0,rows-1) or b in (0,cols-1):escaped=True;break
                        for dr,dc in DIRS:
                            p=(a+dr,b+dc)
                            if p not in seen and grid[p[0]][p[1]]<=level:seen.add(p);todo.append(p)
                    if escaped:water+=level-grid[r][c];break
        return water
    if pid==4003:
        m,n,penalty=args;inf=10**15;dist=[inf]*(m*n*2);dist[1]=1;edges=[]
        def index(r,c,p):return (r*n+c)*2+p
        for r in range(m):
            for c in range(n):
                for p in (0,1):
                    a=index(r,c,p);edges.append((a,index(r,c,1-p),penalty[r][c]))
                    for dr,dc in DIRS:
                        nr,nc=r+dr,c+dc
                        if 0<=nr<m and 0<=nc<n:
                            follows=p==1 and dr+dc>0 or p==0 and dr+dc<0
                            edges.append((a,index(nr,nc,1-p),(nr+1)*(nc+1)+(0 if follows else penalty[r][c])))
        for _ in range(len(dist)-1):
            changed=False
            for a,b,w in edges:
                if dist[b]>dist[a]+w:dist[b]=dist[a]+w;changed=True
            if not changed:break
        return min(dist[-2:])
    if pid==3310:
        n,k,edges=args;reach=[[i==j for j in range(n)] for i in range(n)]
        for a,b in edges:reach[a][b]=True
        for mid in range(n):
            for a in range(n):
                for b in range(n):reach[a][b]|=reach[a][mid] and reach[mid][b]
        suspicious={i for i in range(n) if reach[k][i]}
        return list(range(n)) if any(a not in suspicious and b in suspicious for a,b in edges) else [i for i in range(n) if i not in suspicious]
    if pid==261:
        n,edges=args;reach=graph_components(n,edges);return len(edges)==n-1 and all(reach[0])
    if pid==305:
        m,n,positions=args;grid=[[0]*n for _ in range(m)];out=[]
        for r,c in positions:grid[r][c]=1;out.append(len(components(grid)))
        return out
    if pid==310:
        n,edges=args;dist=[[0 if a==b else n+1 for b in range(n)] for a in range(n)]
        for a,b in edges:dist[a][b]=dist[b][a]=1
        for k in range(n):
            for a in range(n):
                for b in range(n):dist[a][b]=min(dist[a][b],dist[a][k]+dist[k][b])
        heights=list(map(max,dist));return [i for i,h in enumerate(heights) if h==min(heights)]
    if pid==675:
        forest=args[0];rows,cols=len(forest),len(forest[0]);targets=sorted((forest[r][c],r,c) for r in range(rows) for c in range(cols) if forest[r][c]>1)
        if not targets:return 0
        if not forest[0][0]:return -1
        inf=10000;dist=[[inf]*(rows*cols) for _ in range(rows*cols)]
        for r in range(rows):
            for c in range(cols):
                if not forest[r][c]:continue
                a=r*cols+c;dist[a][a]=0
                for dr,dc in DIRS:
                    nr,nc=r+dr,c+dc
                    if 0<=nr<rows and 0<=nc<cols and forest[nr][nc]:dist[a][nr*cols+nc]=1
        for k in range(rows*cols):
            for a in range(rows*cols):
                for b in range(rows*cols):dist[a][b]=min(dist[a][b],dist[a][k]+dist[k][b])
        at=0;answer=0
        for _,r,c in targets:
            target=r*cols+c
            if dist[at][target]>=inf:return -1
            answer+=dist[at][target];at=target
        return answer
    if pid==947:
        stones=args[0];edges=[(a,b) for a in range(len(stones)) for b in range(a) if stones[a][0]==stones[b][0] or stones[a][1]==stones[b][1]];reach=graph_components(len(stones),edges);groups={tuple(row) for row in reach};return len(stones)-len(groups)
    if pid==990:
        equations=args[0];reach=graph_components(26,[(ord(s[0])-97,ord(s[3])-97) for s in equations if s[1:3]=='==']);return all(s[1:3]=='==' or not reach[ord(s[0])-97][ord(s[3])-97] for s in equations)
    if pid==1284:
        mat=args[0];m,n=len(mat),len(mat[0]);start=sum(mat[r][c]<<(r*n+c) for r in range(m) for c in range(n));best=None
        for subset in range(1<<(m*n)):
            mask=start
            for i in range(m*n):
                if subset>>i&1:
                    r,c=divmod(i,n)
                    for dr,dc in [(0,0)]+DIRS:
                        nr,nc=r+dr,c+dc
                        if 0<=nr<m and 0<=nc<n:mask^=1<<(nr*n+nc)
            if not mask:best=min(best if best is not None else m*n,bin(subset).count('1'))
        return -1 if best is None else best
    if pid==1466:
        n,edges=args;answer=0
        for omitted,(a,b) in enumerate(edges):
            remaining=[e for j,e in enumerate(edges) if j!=omitted];reach=graph_components(n,remaining)
            answer+=reach[0][a] and not reach[0][b]
        return answer
    raise ValueError(pid)

if __name__=='__main__':
    print(json.dumps([oracle(case['id'],case['args']) for case in json.load(sys.stdin)]))
