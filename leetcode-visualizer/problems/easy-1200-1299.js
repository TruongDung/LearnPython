"use strict";
const {defineEasy}=require('./easy-lesson');const lessons={};const add=(...args)=>{const p=defineEasy(...args);lessons[p.id]=p;};
add(1200,'Minimum Absolute Difference','array',[[4,2,1,3]],[[1,2],[2,3],[3,4]],`
class Solution:
    def minimumAbsDifference(self, arr):
        ordered = sorted(arr)
        best = min(b-a for a,b in zip(ordered,ordered[1:]))
        return [[a,b] for a,b in zip(ordered,ordered[1:]) if b-a == best]
`,'Sau sắp xếp, cặp có chênh lệch nhỏ nhất luôn đứng cạnh nhau. Tìm mức nhỏ nhất rồi lấy tất cả cặp đạt mức đó.','O(n log n)','O(n)',{difficulty:'easy'});
add(1202,'Smallest String With Swaps','graph',['dcab',[[0,3],[1,2]]],'bacd',`
class Solution:
    def smallestStringWithSwaps(self, s, pairs):
        parent = list(range(len(s)))
        def find(i):
            while parent[i] != i:
                parent[i] = parent[parent[i]]
                i = parent[i]
            return i
        for a,b in pairs:
            parent[find(a)] = find(b)
        groups = {}
        for i in range(len(s)):
            groups.setdefault(find(i),[]).append(i)
        answer = list(s)
        for indices in groups.values():
            letters = sorted(s[i] for i in indices)
            for i,ch in zip(indices,letters):
                answer[i] = ch
        return ''.join(answer)
`,'Các vị trí nối qua phép đổi thuộc cùng nhóm DSU và có thể hoán vị tự do. Đặt chữ nhỏ nhất vào chỉ số nhỏ nhất trong từng nhóm.','O(n log n+edges·α(n))','O(n)',{focus:['s','groups','indices','letters','answer']});
add(1204,'Last Person to Fit in the Bus','sql',[[{person_name:'Alice',weight:250,turn:1},{person_name:'Alex',weight:350,turn:2},{person_name:'John Cena',weight:400,turn:3},{person_name:'Marie',weight:200,turn:4}]],'John Cena',`
class Solution:
    def lastPerson(self, queue):
        total,last = 0,None
        for person in sorted(queue,key=lambda r:r['turn']):
            if total+person['weight'] > 1000:
                break
            total += person['weight']
            last = person['person_name']
        return last
`,'Xếp người theo turn rồi cộng dồn cân nặng; dừng trước người khiến tổng vượt 1000 và trả tên người vừa lên cuối cùng.','O(n log n)','O(n)');
add(1205,'Monthly Transactions II','sql',[[{id:1,country:'US',state:'approved',amount:1000,trans_date:'2019-01-01'},{id:2,country:'US',state:'declined',amount:2000,trans_date:'2019-01-02'}],[{trans_id:2,trans_date:'2019-02-01'}]],[{month:'2019-01',country:'US',approved_count:1,approved_amount:1000,chargeback_count:0,chargeback_amount:0},{month:'2019-02',country:'US',approved_count:0,approved_amount:0,chargeback_count:1,chargeback_amount:2000}],`
class Solution:
    def monthly(self, transactions, chargebacks):
        original = {r['id']:r for r in transactions}
        events = [(r['trans_date'][:7],r['country'],r['amount'],0) for r in transactions if r['state'] == 'approved']
        events += [(r['trans_date'][:7],original[r['trans_id']]['country'],original[r['trans_id']]['amount'],1) for r in chargebacks]
        groups = {}
        for month,country,amount,kind in events:
            values = groups.setdefault((month,country),[0,0,0,0])
            values[kind*2] += 1
            values[kind*2+1] += amount
        return [{'month':m,'country':c,'approved_count':v[0],'approved_amount':v[1],'chargeback_count':v[2],'chargeback_amount':v[3]} for (m,c),v in sorted(groups.items(),key=lambda p:(p[0][0],p[0][1] or ''))]
`,'Gộp hai dòng sự kiện: approved theo tháng giao dịch, chargeback theo tháng bị hoàn tiền. Quốc gia và số tiền chargeback lấy từ giao dịch gốc.','O(t+c log(t+c))','O(t+c)');
add(1207,'Unique Number of Occurrences','array',[[1,2,2,1,1,3]],true,`
class Solution:
    def uniqueOccurrences(self, arr):
        from collections import Counter
        counts = Counter(arr)
        frequencies = list(counts.values())
        return len(set(frequencies)) == len(frequencies)
`,'Đếm số lần của từng giá trị; các tần suất phải khác nhau từng đôi một.','O(n)','O(n)',{difficulty:'easy'});
add(1209,'Remove All Adjacent Duplicates in String II','string',['deeedbbcccbdaa',3],'aa',`
class Solution:
    def removeDuplicates(self, s, k):
        stack = []
        for ch in s:
            if stack and stack[-1][0] == ch:
                stack[-1][1] += 1
            else:
                stack.append([ch,1])
            if stack[-1][1] == k:
                stack.pop()
        return ''.join(ch*count for ch,count in stack)
`,'Stack giữ từng nhóm chữ và độ dài. Nhóm đủ k thì xóa ngay; nhóm mới lộ ra có thể nối với chữ tiếp theo để tiếp tục xóa dây chuyền.','O(n)','O(n)',{focus:['s','stack']});
add(1210,'Minimum Moves to Reach Target with Rotations','graph',[[[0,0,0,0,0,1],[1,1,0,0,1,0],[0,0,0,0,1,1],[0,0,1,0,1,0],[0,1,1,0,0,0],[0,1,1,0,0,0]]],11,`
class Solution:
    def minimumMoves(self, grid):
        from collections import deque
        n = len(grid)
        queue,seen = deque([(0,0,0,0)]),{(0,0,0)}
        while queue:
            r,c,orientation,distance = queue.popleft()
            if (r,c,orientation) == (n-1,n-2,0):
                return distance
            following = []
            if orientation == 0:
                if c+2 < n and grid[r][c+2] == 0:
                    following.append((r,c+1,0))
                if r+1 < n and grid[r+1][c] == grid[r+1][c+1] == 0:
                    following.extend([(r+1,c,0),(r,c,1)])
            else:
                if r+2 < n and grid[r+2][c] == 0:
                    following.append((r+1,c,1))
                if c+1 < n and grid[r][c+1] == grid[r+1][c+1] == 0:
                    following.extend([(r,c+1,1),(r,c,0)])
            for state in following:
                if state not in seen:
                    seen.add(state)
                    queue.append((*state,distance+1))
        return -1
`,'Trạng thái gồm góc trái/trên của rắn và hướng ngang/dọc. BFS thử dịch phải, dịch xuống và xoay khi toàn bộ vùng rắn quét qua đều trống.','O(n²)','O(n²)',{difficulty:'hard',focus:['grid','following','r','c','orientation','distance'],traceOptions:{maxEvents:20000,summarizeLocals:{seen:20,queue:20}}});
add(1211,'Queries Quality and Percentage','sql',[[{query_name:'Dog',rating:5,position:1},{query_name:'Dog',rating:1,position:3}]],[{query_name:'Dog',quality:2.67,poor_query_percentage:50}],`
class Solution:
    def quality(self, queries):
        from decimal import Decimal,ROUND_HALF_UP
        groups = {}
        for row in queries:
            if row['query_name'] is not None:
                groups.setdefault(row['query_name'],[]).append(row)
        answer = []
        for name,rows in sorted(groups.items()):
            quality = sum(Decimal(r['rating'])/r['position'] for r in rows)/len(rows)
            poor = Decimal(sum(r['rating'] < 3 for r in rows))*100/len(rows)
            answer.append({'query_name':name,'quality':float(quality.quantize(Decimal('.01'),rounding=ROUND_HALF_UP)),'poor_query_percentage':float(poor.quantize(Decimal('.01'),rounding=ROUND_HALF_UP))})
        return answer
`,'Quality là trung bình của từng rating/position, không phải tỉ số hai tổng. Poor là phần trăm dòng có rating <3; làm tròn hai chữ số.','O(n log n)','O(n)',{difficulty:'easy'});
add(1212,'Team Scores in Football Tournament','sql',[[{team_id:1,team_name:'A'},{team_id:2,team_name:'B'},{team_id:3,team_name:'C'}],[{host_team:1,guest_team:2,host_goals:2,guest_goals:1}]],[{team_id:1,team_name:'A',num_points:3},{team_id:2,team_name:'B',num_points:0},{team_id:3,team_name:'C',num_points:0}],`
class Solution:
    def teamScores(self, teams, matches):
        points = {team['team_id']:0 for team in teams}
        for match in matches:
            h,g = match['host_team'],match['guest_team']
            a,b = match['host_goals'],match['guest_goals']
            points[h] += 3 if a > b else 1 if a == b else 0
            points[g] += 3 if b > a else 1 if a == b else 0
        return [dict(team,num_points=points[team['team_id']]) for team in sorted(teams,key=lambda r:(-points[r['team_id']],r['team_id']))]
`,'Mỗi trận cộng 3 điểm cho đội thắng hoặc 1 cho mỗi đội hòa. Giữ cả đội chưa thi đấu, xếp điểm giảm rồi ID tăng.','O(teams log teams+matches)','O(teams)');
add(1213,'Intersection of Three Sorted Arrays','array',[[1,2,3,4,5],[1,2,5,7,9],[1,3,4,5,8]],[1,5],`
class Solution:
    def arraysIntersection(self, arr1, arr2, arr3):
        i,j,k,answer = 0,0,0,[]
        while i < len(arr1) and j < len(arr2) and k < len(arr3):
            a,b,c = arr1[i],arr2[j],arr3[k]
            if a == b == c:
                answer.append(a)
                i,j,k = i+1,j+1,k+1
            else:
                smallest = min(a,b,c)
                i += a == smallest
                j += b == smallest
                k += c == smallest
        return answer
`,'Ba con trỏ: nếu bằng nhau thì lưu; nếu khác thì tiến các con trỏ đang mang giá trị nhỏ nhất để bắt kịp phần còn lại.','O(a+b+c)','O(output)',{difficulty:'easy'});
add(1215,'Stepping Numbers','graph',[0,21],[0,1,2,3,4,5,6,7,8,9,10,12,21],`
class Solution:
    def countSteppingNumbers(self, low, high):
        from collections import deque
        assert 0 <= low <= high <= 1000000
        queue,answer = deque(range(1,10)),[0] if low == 0 else []
        while queue:
            value = queue.popleft()
            if value > high:
                continue
            if value >= low:
                answer.append(value)
            last = value%10
            for digit in (last-1,last+1):
                if 0 <= digit <= 9 and value*10+digit <= high:
                    queue.append(value*10+digit)
        return sorted(answer)
`,'BFS xây số từ chữ số đầu 1..9; chỉ nối chữ số lệch chữ số cuối đúng 1. Số 0 được xử lý riêng, không sinh số có 0 đầu.','O(2^digits)','O(2^digits)');
add(1217,'Minimum Cost to Move Chips to The Same Position','math',[[1,2,3]],1,`
class Solution:
    def minCostToMoveChips(self, position):
        odd = sum(value%2 for value in position)
        even = len(position)-odd
        return min(odd,even)
`,'Dịch 2 ô miễn phí nên các chip cùng tính chẵn/lẻ gom được với chi phí 0. Chỉ cần trả tiền chuyển nhóm ít hơn sang nhóm kia.','O(n)','O(1)',{difficulty:'easy'});
add(1218,'Longest Arithmetic Subsequence of Given Difference','dp',[[1,5,7,8,5,3,4,2,1],-2],4,`
class Solution:
    def longestSubsequence(self, arr, difference):
        dp,answer = {},0
        for value in arr:
            dp[value] = dp.get(value-difference,0)+1
            answer = max(answer,dp[value])
        return answer
`,'Dãy kết thúc bằng value nối được dãy kết thúc bằng value−difference đã gặp trước; lưu độ dài theo giá trị.','O(n)','O(n)');
add(1219,'Path with Maximum Gold','backtracking',[[[0,6,0],[5,8,7],[0,9,0]]],24,`
class Solution:
    def getMaximumGold(self, grid):
        board = [row[:] for row in grid]
        m,n = len(board),len(board[0])
        assert sum(value > 0 for row in board for value in row) <= 18
        def visit(r,c):
            if not 0 <= r < m or not 0 <= c < n or board[r][c] == 0:
                return 0
            gold = board[r][c]
            board[r][c] = 0
            best = max(visit(r+1,c),visit(r-1,c),visit(r,c+1),visit(r,c-1))
            board[r][c] = gold
            return gold+best
        return max(visit(r,c) for r in range(m) for c in range(n))
`,'Thử điểm bắt đầu ở mỗi ô vàng; đi bốn hướng, tạm đánh dấu 0 để không ghé lại. Trả vàng về ô khi quay lui để thử đường khác.','O(mn·4^goldCells)','O(goldCells)',{focus:['board','gold','best'],traceOptions:{maxEvents:30000}});
add(1220,'Count Vowels Permutation','dp',[5],68,`
class Solution:
    def countVowelPermutation(self, n):
        assert 1 <= n <= 80
        moves = [[1],[0,2],[0,1,3,4],[2,4],[0]]
        dp = [1]*5
        for length in range(2,n+1):
            following = [0]*5
            for vowel in range(5):
                for neighbor in moves[vowel]:
                    following[neighbor] = (following[neighbor]+dp[vowel])%1000000007
            dp = following
        return sum(dp)%1000000007
`,'dp theo thứ tự a,e,i,o,u đếm dãy kết thúc bằng từng nguyên âm. Chuyển số cách theo các cạnh được phép, rồi cộng sau n ký tự.','O(n)','O(5)',{difficulty:'hard',focus:['dp','following','vowel','neighbor'],traceOptions:{maxEvents:20000}});
add(1221,'Split a String in Balanced Strings','greedy',['RLRRLLRLRL'],4,`
class Solution:
    def balancedStringSplit(self, s):
        balance,answer = 0,0
        for ch in s:
            balance += 1 if ch == 'R' else -1
            if balance == 0:
                answer += 1
        return answer
`,'Cộng R là +1, L là −1. Mỗi khi tổng về 0, chốt ngay một đoạn cân bằng để được nhiều đoạn nhất.','O(n)','O(1)',{difficulty:'easy'});
add(1222,'Queens That Can Attack the King','array',[[[0,1],[1,0],[4,0],[0,4],[3,3],[2,4]],[0,0]],[[0,1],[1,0],[3,3]],`
class Solution:
    def queensAttacktheKing(self, queens, king):
        occupied,answer = {tuple(p) for p in queens},[]
        for dr,dc in [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]:
            r,c = king[0]+dr,king[1]+dc
            while 0 <= r < 8 and 0 <= c < 8:
                if (r,c) in occupied:
                    answer.append([r,c])
                    break
                r,c = r+dr,c+dc
        return answer
`,'Từ vua quét tám tia; quân hậu đầu tiên trên mỗi tia có thể tấn công, các quân phía sau bị nó chắn.','O(8²+queens)','O(queens)');
add(1225,'Report Contiguous Dates','sql',[[ '2019-01-03','2019-01-04'],['2019-01-01','2019-01-02']],[{period_state:'succeeded',start_date:'2019-01-01',end_date:'2019-01-02'},{period_state:'failed',start_date:'2019-01-03',end_date:'2019-01-04'}],`
class Solution:
    def periods(self, failed, succeeded):
        from datetime import date,timedelta
        days = sorted([(d,'failed') for d in failed if d[:4] == '2019']+[(d,'succeeded') for d in succeeded if d[:4] == '2019'])
        answer = []
        for day,state in days:
            if answer and answer[-1]['period_state'] == state and date.fromisoformat(day) == date.fromisoformat(answer[-1]['end_date'])+timedelta(days=1):
                answer[-1]['end_date'] = day
            else:
                answer.append({'period_state':state,'start_date':day,'end_date':day})
        return answer
`,'Gộp hai lịch trạng thái trong năm 2019 rồi sắp ngày. Chỉ kéo dài nhóm khi trạng thái giống và ngày kế liền đúng một ngày.','O(n log n)','O(n)',{difficulty:'hard'});
add(1226,'The Dining Philosophers','concurrency',[[0,1,2,3,4]],[3,2,1,0,4],`
class Solution:
    def dine(self, order):
        assert sorted(order) == list(range(5))
        forks,stage,slots,finished,ate = [-1]*5,[0]*5,4,0,[]
        while finished < 5:
            for philosopher in order:
                left,right = philosopher,(philosopher+1)%5
                action = stage[philosopher]
                if action == 0 and slots:
                    slots -= 1
                    stage[philosopher] += 1
                elif action == 1 and forks[left] == -1:
                    forks[left] = philosopher
                    stage[philosopher] += 1
                elif action == 2 and forks[right] == -1:
                    forks[right] = philosopher
                    stage[philosopher] += 1
                elif action == 3:
                    ate.append(philosopher)
                    stage[philosopher] += 1
                elif action == 4:
                    forks[left] = -1
                    stage[philosopher] += 1
                elif action == 5:
                    forks[right] = -1
                    stage[philosopher] += 1
                elif action == 6:
                    slots += 1
                    finished += 1
                    stage[philosopher] += 1
        return ate
`,'Semaphore chỉ cho tối đa 4 người vào bàn nên không thể cả 5 cùng giữ một nĩa rồi chờ vòng tròn. Mỗi người lấy hai nĩa, ăn, trả hai nĩa rồi trả suất vào bàn.','O(1) for five philosophers','O(1)',{description:'Deterministic cooperative scheduler model. Fork ownership and a four-seat semaphore are explicit; this simulation does not create OS threads.',focus:['forks','stage','slots','philosopher','ate']});
add(1227,'Airplane Seat Assignment Probability','dp',[4],0.5,`
class Solution:
    def nthPersonGetsNthSeat(self, n):
        assert 1 <= n <= 80
        dp = [0.0,1.0]
        for people in range(2,n+1):
            probability = (1+sum(dp[2:people]))/people
            dp.append(probability)
        return dp[n]
`,'Người đầu chọn ghế mình thì người cuối thắng, chọn ghế cuối thì thua; chọn ghế giữa giảm về bài toán nhỏ hơn. Từ n≥2 xác suất luôn bằng 1/2.','O(n²)','O(n)');
add(1228,'Missing Number In Arithmetic Progression','search',[[5,7,11,13]],9,`
class Solution:
    def missingNumber(self, arr):
        difference = (arr[-1]-arr[0])//len(arr)
        left,right = 0,len(arr)
        while left < right:
            mid = (left+right)//2
            if arr[mid] == arr[0]+mid*difference:
                left = mid+1
            else:
                right = mid
        return arr[0]+left*difference
`,'Công sai bằng (cuối−đầu)/số phần tử đang có. Trước chỗ thiếu, arr[i] khớp giá trị kỳ vọng; sau chỗ thiếu thì lệch, nên tìm nhị phân biên.','O(log n)','O(1)');
add(1230,'Toss Strange Coins','dp',[[0.4],1],0.4,`
class Solution:
    def probabilityOfHeads(self, prob, target):
        dp = [1.0]+[0.0]*target
        for p in prob:
            following = [0.0]*(target+1)
            for heads in range(target+1):
                following[heads] = dp[heads]*(1-p)+(dp[heads-1]*p if heads else 0)
            dp = following
        return dp[target]
`,'dp[h] là xác suất có đúng h mặt ngửa sau các đồng đã xét. Đồng mới sấp giữ h, ngửa chuyển từ h−1.','O(n·target)','O(target)',{focus:['prob','dp','following','heads']});
add(1232,'Check If It Is a Straight Line','math',[[[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]]],true,`
class Solution:
    def checkStraightLine(self, coordinates):
        x,y = coordinates[0]
        dx,dy = coordinates[1][0]-x,coordinates[1][1]-y
        for a,b in coordinates[2:]:
            if dx*(b-y) != dy*(a-x):
                return False
        return True
`,'Lấy hướng từ hai điểm đầu; mọi điểm còn lại phải có tích chéo với hướng đó bằng 0. Không chia nên xử lý được đường thẳng đứng.','O(n)','O(1)',{difficulty:'easy'});
add(1233,'Remove Sub-Folders from the Filesystem','string',[[ '/a','/a/b','/c/d','/c/d/e','/c/f']],['/a','/c/d','/c/f'],`
class Solution:
    def removeSubfolders(self, folder):
        answer = []
        for path in sorted(folder):
            if not answer or not path.startswith(answer[-1]+'/'):
                answer.append(path)
        return answer
`,'Sắp đường dẫn để thư mục cha đứng trước con. Chỉ bỏ đường dẫn có tiền tố thư mục đã giữ kèm dấu /, tránh nhầm /a với /ab.','O(nL log n)','O(nL)');
add(1235,'Maximum Profit in Job Scheduling','dp',[[1,2,3,3],[3,4,5,6],[50,10,40,70]],120,`
class Solution:
    def jobScheduling(self, startTime, endTime, profit):
        from bisect import bisect_right
        jobs = sorted(zip(endTime,startTime,profit))
        ends = [job[0] for job in jobs]
        dp = [0]
        for i,(end,start,reward) in enumerate(jobs):
            compatible = bisect_right(ends,start,0,i)
            dp.append(max(dp[-1],dp[compatible]+reward))
        return dp[-1]
`,'Xếp theo giờ kết thúc. Mỗi việc chọn bỏ qua hoặc nhận, rồi cộng lợi nhuận tốt nhất của các việc kết thúc không muộn hơn giờ bắt đầu.','O(n log n)','O(n)',{difficulty:'hard',focus:['jobs','dp','compatible','reward']});
add(1237,'Find Positive Integer Solution for a Given Equation','search',['sum',5],[[1,4],[2,3],[3,2],[4,1]],`
class Solution:
    def findSolution(self, function, z):
        assert function in ('sum','product','square-sum') and 1 <= z <= 1000
        def f(x,y):
            return x+y if function == 'sum' else x*y if function == 'product' else x*x+y*y
        x,y,answer = 1,min(z,1000),[]
        while x <= min(z,1000) and y >= 1:
            value = f(x,y)
            if value == z:
                answer.append([x,y])
                x,y = x+1,y-1
            elif value < z:
                x += 1
            else:
                y -= 1
        return answer
`,'Mô phỏng CustomFunction tăng theo cả x,y với ba hàm chọn sẵn. Bắt đầu ở góc trên: giá trị nhỏ thì tăng x, lớn thì giảm y.','O(z)','O(output)',{description:'Choose sum (x+y), product (x*y), or square-sum (x*x+y*y) as the monotone CustomFunction model.',diagram:'coordinates'});
add(1238,'Circular Permutation in Binary Representation','bits',[2,3],[3,2,0,1],`
class Solution:
    def circularPermutation(self, n, start):
        assert 1 <= n <= 6 and 0 <= start < 2**n
        answer = []
        for i in range(2**n):
            gray = i ^ (i >> 1)
            answer.append(gray ^ start)
        return answer
`,'Gray code đổi đúng một bit giữa hai phần tử kề, kể cả cuối về đầu. XOR toàn bộ với start để dãy bắt đầu tại start mà giữ tính chất đó.','O(2^n)','O(2^n)');
add(1239,'Maximum Length of a Concatenated String with Unique Characters','bits',[[ 'un','iq','ue']],4,`
class Solution:
    def maxLength(self, arr):
        states = {0}
        for word in arr:
            if len(set(word)) != len(word):
                continue
            mask = sum(1 << (ord(ch)-ord('a')) for ch in word)
            following = {state | mask for state in states if state & mask == 0}
            states.update(following)
        return max(mask.bit_count() for mask in states)
`,'Bỏ từ tự lặp chữ. Mỗi trạng thái là tập bit các chữ đã chọn; chỉ ghép khi hai mask không có bit chung.','O(2^n·word length)','O(2^n)',{focus:['arr','states','mask','following']});
add(1241,'Number of Comments per Post','sql',[[{sub_id:1,parent_id:null},{sub_id:2,parent_id:null},{sub_id:3,parent_id:1},{sub_id:3,parent_id:1},{sub_id:4,parent_id:1}]],[{post_id:1,number_of_comments:2},{post_id:2,number_of_comments:0}],`
class Solution:
    def comments(self, submissions):
        posts,comments = set(),{}
        for row in submissions:
            if row['parent_id'] is None:
                posts.add(row['sub_id'])
            else:
                comments.setdefault(row['parent_id'],set()).add(row['sub_id'])
        return [{'post_id':post,'number_of_comments':len(comments.get(post,set()))} for post in sorted(posts)]
`,'parent_id NULL là bài đăng. Các dòng còn lại là bình luận; đếm sub_id khác nhau theo bài, kể cả bài không có bình luận.','O(n log n)','O(n)',{difficulty:'easy'});
add(1242,'Web Crawler Multithreaded','concurrency',['http://news.com',{'http://news.com':['http://news.com/a','http://other.com'],'http://news.com/a':['http://news.com']},2],['http://news.com','http://news.com/a'],`
class Solution:
    def crawl(self, startUrl, pages, workers):
        from urllib.parse import urlparse
        assert 1 <= workers <= 8
        hostname = urlparse(startUrl).hostname
        seen,queue = {startUrl},[startUrl]
        while queue:
            batch,queue = queue[:workers],queue[workers:]
            for worker,url in enumerate(batch):
                links = pages.get(url,[])
                for link in links:
                    if urlparse(link).hostname == hostname and link not in seen:
                        seen.add(link)
                        queue.append(link)
        return sorted(seen)
`,'Mô phỏng pool lấy một batch URL mỗi vòng. Tập seen dùng chung để không giao trùng tác vụ; chỉ nhận URL cùng hostname. pages là dữ liệu mẫu, không truy cập mạng.','O(vertices+edges)','O(vertices)',{description:'A deterministic task-pool model using the supplied pages adjacency map. It creates no OS threads and makes no network requests.',focus:['queue','batch','links','seen']});
add(1243,'Array Transformation','array',[[6,2,3,4]],[6,3,3,4],`
class Solution:
    def transformArray(self, arr):
        current = arr[:]
        while True:
            following = current[:]
            for i in range(1,len(current)-1):
                if current[i] > max(current[i-1],current[i+1]):
                    following[i] -= 1
                elif current[i] < min(current[i-1],current[i+1]):
                    following[i] += 1
            if current == following:
                return current
            current = following
`,'Mỗi ngày giảm đỉnh và tăng đáy đúng 1, hai đầu giữ nguyên. Tất cả quyết định đọc mảng ngày cũ để cập nhật đồng thời.','O(days·n)','O(n)',{difficulty:'easy',focus:['current','following']});
add(1244,'Design A Leaderboard','design',[[['addScore',1,73],['addScore',2,56],['top',1],['reset',1],['addScore',2,10],['top',1]]],[null,null,73,null,null,66],`
class Solution:
    def leaderboard(self, operations):
        scores,answer = {},[]
        for operation in operations:
            command,argument = operation[:2]
            if command == 'addScore':
                scores[argument] = scores.get(argument,0)+operation[2]
                answer.append(None)
            elif command == 'reset':
                scores.pop(argument,None)
                answer.append(None)
            else:
                leaders = sorted(scores.values(),reverse=True)[:argument]
                answer.append(sum(leaders))
        return answer
`,'addScore cộng dồn điểm theo người chơi; reset xóa điểm; top(K) sắp điểm hiện tại và cộng K người cao nhất.','O(q² log q) worst case','O(q)',{focus:['scores','leaders','answer']});
add(1246,'Palindrome Removal','dp',[[1,3,4,1,5]],3,`
class Solution:
    def minimumMoves(self, arr):
        n = len(arr)
        dp = [[0]*n for _ in arr]
        for i in range(n):
            dp[i][i] = 1
        for length in range(2,n+1):
            for left in range(n-length+1):
                right = left+length-1
                dp[left][right] = 1+dp[left+1][right]
                if arr[left] == arr[left+1]:
                    dp[left][right] = min(dp[left][right],1+(dp[left+2][right] if left+2 <= right else 0))
                for mid in range(left+2,right+1):
                    if arr[left] == arr[mid]:
                        candidate = dp[left+1][mid-1]+(dp[mid+1][right] if mid < right else 0)
                        dp[left][right] = min(dp[left][right],candidate)
        return dp[0][-1]
`,'dp[l][r] là số lần xóa ít nhất trong đoạn. Có thể xóa riêng arr[l], ghép hai chữ kề giống nhau, hoặc ghép hai đầu giống nhau vào lần xóa cuối của phần bên trong.','O(n³)','O(n²)',{difficulty:'hard',focus:['arr','dp','left','right','mid']});
add(1247,'Minimum Swaps to Make Strings Equal','string',['xx','yy'],1,`
class Solution:
    def minimumSwap(self, s1, s2):
        xy,yx = 0,0
        for a,b in zip(s1,s2):
            xy += a == 'x' and b == 'y'
            yx += a == 'y' and b == 'x'
        if (xy+yx)%2:
            return -1
        return xy//2+yx//2+2*(xy%2)
`,'Chỉ xét vị trí lệch xy hoặc yx. Hai lệch cùng loại sửa bằng một lần đổi; còn một xy và một yx cần hai lần đổi.','O(n)','O(1)');
add(1250,'Check If It Is a Good Array','math',[[12,5,7,23]],true,`
class Solution:
    def isGoodArray(self, nums):
        from math import gcd
        divisor = 0
        for value in nums:
            divisor = gcd(divisor,value)
        return divisor == 1
`,'Theo định lý Bézout, tổ hợp nguyên của các số tạo được 1 khi và chỉ khi ƯCLN của toàn mảng bằng 1.','O(n log max value)','O(1)',{difficulty:'hard'});
add(1251,'Average Selling Price','sql',[[{product_id:1,start_date:'2019-01-01',end_date:'2019-01-31',price:5},{product_id:2,start_date:'2019-01-01',end_date:'2019-01-31',price:20}],[{product_id:1,purchase_date:'2019-01-05',units:2}]],[{product_id:1,average_price:5},{product_id:2,average_price:0}],`
class Solution:
    def averagePrice(self, prices, unitsSold):
        from decimal import Decimal,ROUND_HALF_UP
        totals = {r['product_id']:[0,0] for r in prices}
        for sale in unitsSold:
            for price in prices:
                if sale['product_id'] == price['product_id'] and price['start_date'] <= sale['purchase_date'] <= price['end_date']:
                    values = totals[sale['product_id']]
                    values[0] += sale['units']*price['price']
                    values[1] += sale['units']
        return [{'product_id':p,'average_price':float((Decimal(revenue)/units).quantize(Decimal('.01'),rounding=ROUND_HALF_UP)) if units else 0.0} for p,(revenue,units) in sorted(totals.items())]
`,'Nối lần bán với khoảng giá chứa đúng ngày mua. Giá trung bình có trọng số = tổng units×price / tổng units; chưa bán thì 0.','O(prices·sales)','O(products)',{difficulty:'easy'});
add(1252,'Cells with Odd Values in a Matrix','array',[2,3,[[0,1],[1,1]]],6,`
class Solution:
    def oddCells(self, m, n, indices):
        assert 1 <= m <= 15 and 1 <= n <= 15
        rows,cols = [0]*m,[0]*n
        for r,c in indices:
            rows[r] ^= 1
            cols[c] ^= 1
        grid = [[rows[r]^cols[c] for c in range(n)] for r in range(m)]
        return sum(map(sum,grid))
`,'Chỉ cần tính chẵn/lẻ số lần tăng từng hàng/cột. Một ô lẻ khi tính chẵn/lẻ của hàng và cột khác nhau.','O(indices+mn)','O(mn)',{difficulty:'easy',focus:['rows','cols','grid']});
add(1253,'Reconstruct a 2-Row Binary Matrix','greedy',[2,1,[1,1,1]],[[1,1,0],[0,0,1]],`
class Solution:
    def reconstructMatrix(self, upper, lower, colsum):
        answer = [[0]*len(colsum) for _ in range(2)]
        for c,total in enumerate(colsum):
            if total == 2:
                answer[0][c] = answer[1][c] = 1
                upper,lower = upper-1,lower-1
        for c,total in enumerate(colsum):
            if total == 1:
                if upper > 0:
                    answer[0][c] = 1
                    upper -= 1
                else:
                    answer[1][c] = 1
                    lower -= 1
        return answer if upper == lower == 0 else []
`,'Cột tổng 2 bắt buộc hai ô đều 1, tổng 0 đều 0. Sau đó phân các cột tổng 1 theo số 1 còn thiếu ở hàng trên/dưới.','O(n)','O(n)',{focus:['colsum','answer','upper','lower']});
const wordScores=Array(26).fill(0);for(const[ch,value]of Object.entries({a:1,c:9,d:5,g:3,o:2}))wordScores[ch.charCodeAt(0)-97]=value;
add(1255,'Maximum Score Words Formed by Letters','backtracking',[[ 'dog','cat','dad','good'],['a','a','c','d','d','d','g','o','o'],wordScores],23,`
class Solution:
    def maxScoreWords(self, words, letters, score):
        from collections import Counter
        needed = [Counter(word) for word in words]
        points = [sum(score[ord(ch)-ord('a')] for ch in word) for word in words]
        def solve(i, available):
            if i == len(words):
                return 0
            best = solve(i+1,available)
            if all(available[ch] >= count for ch,count in needed[i].items()):
                best = max(best,points[i]+solve(i+1,available-needed[i]))
            return best
        assert len(words) <= 10
        return solve(0,Counter(letters))
`,'Mỗi từ chọn lấy hoặc bỏ. Chỉ lấy khi đủ mọi chữ còn lại, trừ các chữ dùng rồi cộng điểm; quay lui thử cả hai nhánh.','O(2^words·alphabet)','O(words·alphabet)',{difficulty:'hard',focus:['words','available','needed','points','best'],traceOptions:{maxEvents:20000}});
add(1256,'Encode Number','bits',[23],'1000',`
class Solution:
    def encode(self, num):
        binary = format(num+1,'b')
        return binary[1:]
`,'Mã của num là biểu diễn nhị phân của num+1 sau khi bỏ bit 1 đầu. Vì vậy 0 có mã rỗng.','O(log num)','O(log num)');
add(1257,'Smallest Common Region','tree',[[['Earth','North America','South America'],['North America','United States','Canada'],['United States','New York','Boston'],['Canada','Ontario','Quebec']],'Quebec','New York'],'North America',`
class Solution:
    def findSmallestRegion(self, regions, region1, region2):
        parent = {}
        for group in regions:
            for child in group[1:]:
                parent[child] = group[0]
        ancestors = set()
        while region1 is not None:
            ancestors.add(region1)
            region1 = parent.get(region1)
        while region2 not in ancestors:
            region2 = parent.get(region2)
            if region2 is None:
                return None
        return region2
`,'Lập bản đồ con→cha. Ghi mọi tổ tiên vùng thứ nhất rồi đi từ vùng thứ hai lên; tổ tiên gặp đầu tiên là vùng chung nhỏ nhất.','O(total regions)','O(total regions)');
add(1259,'Handshakes That Do Not Cross','dp',[4],2,`
class Solution:
    def numberOfWays(self, numPeople):
        assert 0 <= numPeople <= 80 and numPeople%2 == 0
        pairs = numPeople//2
        dp = [1]
        for total in range(1,pairs+1):
            ways = sum(dp[left]*dp[total-1-left] for left in range(total))
            dp.append(ways%1000000007)
        return dp[pairs]
`,'Chọn người bắt tay với người đầu chia vòng thành hai phần chẵn độc lập. Cộng tích số cách của hai phần: chính là truy hồi Catalan.','O(n²)','O(n)',{difficulty:'hard'});
add(1261,'Find Elements in a Contaminated Binary Tree','tree',[[-1,null,-1],[1,2]],[false,true],`
class Solution:
    def findElements(self, root, targets):
        values = set()
        def recover(node, value):
            if node:
                node.val = value
                values.add(value)
                recover(node.left,2*value+1)
                recover(node.right,2*value+2)
        recover(root,0)
        return [target in values for target in targets]
`,'Khôi phục gốc 0, con trái 2x+1, con phải 2x+2. Lưu mọi giá trị vào tập để trả từng truy vấn find.','O(nodes+queries)','O(nodes)',{kinds:['tree'],focus:['values','targets']});
add(1262,'Greatest Sum Divisible by Three','dp',[[3,6,5,1,8]],18,`
class Solution:
    def maxSumDivThree(self, nums):
        dp = [0,-float('inf'),-float('inf')]
        for value in nums:
            following = dp[:]
            for remainder in range(3):
                slot = (remainder+value)%3
                following[slot] = max(following[slot],dp[remainder]+value)
            dp = following
        return dp[0]
`,'dp[r] là tổng lớn nhất có phần dư r. Mỗi số có thể bỏ hoặc lấy; dùng bản sao để một số không bị lấy nhiều lần trong cùng bước.','O(n)','O(3)',{focus:['nums','dp','following','remainder']});
add(1263,'Minimum Moves to Move a Box to Their Target Location','graph',[[ '#####','#SBT#','#####']],1,`
class Solution:
    def minPushBox(self, grid):
        from collections import deque
        m,n = len(grid),len(grid[0])
        positions = {ch:(r,c) for r,row in enumerate(grid) for c,ch in enumerate(row) if ch in 'SBT'}
        def free(p):
            return 0 <= p[0] < m and 0 <= p[1] < n and grid[p[0]][p[1]] != '#'
        def reachable(start, goal, box):
            queue,seen = deque([start]),{start}
            while queue:
                current = queue.popleft()
                if current == goal:
                    return True
                for dr,dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                    point = (current[0]+dr,current[1]+dc)
                    if free(point) and point != box and point not in seen:
                        seen.add(point)
                        queue.append(point)
            return False
        startBox,startPlayer = positions['B'],positions['S']
        queue,seen = deque([(startBox,startPlayer,0)]),{(startBox,startPlayer)}
        while queue:
            box,player,pushes = queue.popleft()
            if box == positions['T']:
                return pushes
            for dr,dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                following,behind = (box[0]+dr,box[1]+dc),(box[0]-dr,box[1]-dc)
                if free(following) and free(behind) and (following,box) not in seen and reachable(player,behind,box):
                    seen.add((following,box))
                    queue.append((following,box,pushes+1))
        return -1
`,'BFS theo số lần đẩy, không theo bước chân. Muốn đẩy thùng sang một hướng, người phải đi tới ô phía sau thùng mà không xuyên tường hoặc xuyên thùng.','O((mn)^3)','O((mn)²)',{difficulty:'hard',focus:['grid','box','player','pushes','behind'],traceOptions:{maxEvents:100000,summarizeLocals:{seen:20,queue:20}}});
add(1264,'Page Recommendations','sql',[[[1,2],[1,3]],[{user_id:2,page_id:10},{user_id:1,page_id:20},{user_id:3,page_id:20}]],[10],`
class Solution:
    def recommendations(self, friendship, likes):
        friends = set()
        for a,b in friendship:
            if a == 1:
                friends.add(b)
            if b == 1:
                friends.add(a)
        own = {r['page_id'] for r in likes if r['user_id'] == 1}
        suggested = {r['page_id'] for r in likes if r['user_id'] in friends}
        return sorted(suggested-own)
`,'Tìm bạn của user 1 theo cả hai chiều quan hệ; đề xuất các trang bạn thích nhưng user 1 chưa thích, loại trùng.','O(friendships+likes)','O(friendships+likes)');
add(1265,'Print Immutable Linked List in Reverse','list',[[1,2,3,4]],[4,3,2,1],`
class Solution:
    def printReverse(self, values):
        frozen,printed = tuple(values),[]
        def getNext(node):
            return node+1 if node+1 < len(frozen) else None
        def printValue(node):
            printed.append(frozen[node])
        def visit(node):
            if node is not None:
                visit(getNext(node))
                printValue(node)
        visit(0 if frozen else None)
        return printed
`,'Node được mô phỏng bằng chỉ số trong tuple bất biến. Hàm đệ quy chỉ gọi getNext và printValue: đi tới cuối trước, in khi quay lui; không sửa liên kết.','O(n)','O(n)',{description:'ImmutableListNode API model: getNext reads the next index; printValue records a printed value. The returned array is the captured print output.',focus:['frozen','printed','node']});
add(1266,'Minimum Time Visiting All Points','math',[[[1,1],[3,4],[-1,0]]],7,`
class Solution:
    def minTimeToVisitAllPoints(self, points):
        answer = 0
        for a,b in zip(points,points[1:]):
            dx,dy = abs(a[0]-b[0]),abs(a[1]-b[1])
            answer += max(dx,dy)
        return answer
`,'Đi chéo xử lý cả hai tọa độ cùng lúc; thời gian giữa hai điểm bằng max(|dx|,|dy|). Cộng cho từng cặp theo thứ tự bắt buộc.','O(n)','O(1)',{difficulty:'easy'});
add(1270,'All People Report to the Given Manager','sql',[[{employee_id:1,manager_id:1},{employee_id:2,manager_id:1},{employee_id:3,manager_id:2},{employee_id:4,manager_id:4}]],[2,3],`
class Solution:
    def employees(self, employees):
        children = {}
        for row in employees:
            if row['employee_id'] != row['manager_id']:
                children.setdefault(row['manager_id'],[]).append(row['employee_id'])
        queue,answer = [1],[]
        for manager in queue:
            for employee in children.get(manager,[]):
                answer.append(employee)
                queue.append(employee)
        return sorted(answer)
`,'Lập danh sách cấp dưới trực tiếp theo quản lý; đi từ quản lý 1 xuống tất cả tầng và bỏ chính người 1 khỏi kết quả.','O(n log n)','O(n)');
add(1271,'Hexspeak','math',['257'],'IOI',`
class Solution:
    def toHexspeak(self, num):
        hexadecimal = format(int(num),'X')
        translated = hexadecimal.replace('0','O').replace('1','I')
        return 'ERROR' if any(ch in '23456789' for ch in translated) else translated
`,'Chuyển số thập phân sang hex viết hoa, đổi 0→O và 1→I. Nếu còn chữ số 2..9 thì không phải Hexspeak.','O(log num)','O(log num)',{difficulty:'easy'});
add(1273,'Delete Tree Nodes','tree',[7,[-1,0,0,1,2,2,2],[1,-2,4,0,-2,-1,-1]],2,`
class Solution:
    def deleteTreeNodes(self, nodes, parent, value):
        children = [[] for _ in range(nodes)]
        root = parent.index(-1)
        for node,p in enumerate(parent):
            if p >= 0:
                children[p].append(node)
        def visit(node):
            total,remaining = value[node],1
            for child in children[node]:
                childSum,childCount = visit(child)
                total += childSum
                remaining += childCount
            return total,0 if total == 0 else remaining
        return visit(root)[1]
`,'Duyệt từ con lên cha, trả tổng cây con và số node còn lại. Tổng bằng 0 thì xóa toàn cây con, số node còn lại của nó về 0.','O(n)','O(n)',{focus:['children','value','node','total','remaining']});
add(1274,'Number of Ships in a Rectangle','search',[[[1,1],[2,2],[3,3]],[4,4],[0,0]],3,`
class Solution:
    def countShips(self, ships, topRight, bottomLeft):
        queries = []
        def hasShips(x1,y1,x2,y2):
            result = any(x1 <= x <= x2 and y1 <= y <= y2 for x,y in ships)
            queries.append([x1,y1,x2,y2,result])
            return result
        def count(x1,y1,x2,y2):
            if x1 > x2 or y1 > y2 or not hasShips(x1,y1,x2,y2):
                return 0
            if x1 == x2 and y1 == y2:
                return 1
            mx,my = (x1+x2)//2,(y1+y2)//2
            return count(x1,y1,mx,my)+count(mx+1,y1,x2,my)+count(x1,my+1,mx,y2)+count(mx+1,my+1,x2,y2)
        return count(*bottomLeft,*topRight)
`,'hasShips là oracle chỉ cho biết vùng có tàu hay không. Loại vùng rỗng; vùng còn tàu chia bốn cho tới ô đơn. Dữ liệu ships chỉ phục vụ mô phỏng oracle.','O(ships·log coordinate range) oracle calls','O(log coordinate range)',{difficulty:'hard',description:'The supplied ship positions implement the Sea.hasShips oracle; the counting routine only queries rectangles.',focus:['ships','queries','x1','y1','x2','y2'],traceOptions:{maxEvents:30000}});
add(1276,'Number of Burgers with No Waste of Ingredients','math',[16,7],[1,6],`
class Solution:
    def numOfBurgers(self, tomatoSlices, cheeseSlices):
        if tomatoSlices%2:
            return []
        jumbo = (tomatoSlices-2*cheeseSlices)//2
        small = cheeseSlices-jumbo
        return [jumbo,small] if min(jumbo,small) >= 0 else []
`,'Mỗi burger dùng một phô mai, loại jumbo dùng thêm hai lát cà chua so với loại nhỏ. Giải hai phương trình rồi kiểm tra nghiệm nguyên không âm.','O(1)','O(1)');
add(1279,'Traffic Light Controlled Intersection','concurrency',[[{car_id:1,road_id:1,direction:2},{car_id:2,road_id:2,direction:3},{car_id:3,road_id:2,direction:4}]],[['cross',1],['green',2],['cross',2],['cross',3]],`
class Solution:
    def trafficLight(self, arrivals):
        green,locked,events = 1,False,[]
        for car in arrivals:
            locked = True
            if green != car['road_id']:
                green = car['road_id']
                events.append(['green',green])
            events.append(['cross',car['car_id']])
            locked = False
        return events
`,'Mutex bao cả kiểm tra đèn và cho xe qua. Chỉ gọi đổi đèn khi đường cần đi chưa xanh; lịch mẫu xử lý các lượt xe theo thứ tự đầu vào.','O(cars)','O(cars)',{description:'A serialized arrival schedule models the mutex-protected critical section; no OS threads are created.',focus:['arrivals','car','green','locked','events']});
add(1280,'Students and Examinations','sql',[[{student_id:1,student_name:'Alice'},{student_id:2,student_name:'Bob'}],['Math','Physics'],[{student_id:1,subject_name:'Math'},{student_id:1,subject_name:'Math'},{student_id:2,subject_name:'Physics'}]],[{student_id:1,student_name:'Alice',subject_name:'Math',attended_exams:2},{student_id:1,student_name:'Alice',subject_name:'Physics',attended_exams:0},{student_id:2,student_name:'Bob',subject_name:'Math',attended_exams:0},{student_id:2,student_name:'Bob',subject_name:'Physics',attended_exams:1}],`
class Solution:
    def attendance(self, students, subjects, examinations):
        from collections import Counter
        counts = Counter((r['student_id'],r['subject_name']) for r in examinations)
        answer = []
        for student in sorted(students,key=lambda r:r['student_id']):
            for subject in sorted(subjects):
                answer.append(dict(student,subject_name=subject,attended_exams=counts[student['student_id'],subject]))
        return answer
`,'Tạo mọi cặp sinh viên×môn học trước, rồi nối số lượt thi. Không có bản ghi thi vẫn phải hiện một dòng có attended_exams = 0.','O(students·subjects+exams)','O(students·subjects+exams)',{difficulty:'easy'});
add(1281,'Subtract the Product and Sum of Digits of an Integer','math',[234],15,`
class Solution:
    def subtractProductAndSum(self, n):
        digits = [int(ch) for ch in str(n)]
        product,total = 1,0
        for digit in digits:
            product *= digit
            total += digit
        return product-total
`,'Tách chữ số, tích bắt đầu từ 1 và tổng bắt đầu từ 0; trả tích trừ tổng.','O(digits)','O(digits)',{difficulty:'easy'});
add(1282,'Group the People Given the Group Size They Belong To','array',[[3,3,3,3,3,1,3]],[[0,1,2],[5],[3,4,6]],`
class Solution:
    def groupThePeople(self, groupSizes):
        buckets,answer = {},[]
        for person,size in enumerate(groupSizes):
            group = buckets.setdefault(size,[])
            group.append(person)
            if len(group) == size:
                answer.append(group[:])
                buckets[size] = []
        return answer
`,'Mỗi kích thước có một nhóm đang gom. Đủ đúng size người thì chốt bản sao nhóm và mở nhóm mới cùng kích thước.','O(n)','O(n)');
add(1285,'Find the Start and End Number of Continuous Ranges','sql',[[1,2,3,7,8]],[{start_id:1,end_id:3},{start_id:7,end_id:8}],`
class Solution:
    def ranges(self, log_ids):
        answer = []
        for value in sorted(log_ids):
            if answer and answer[-1]['end_id']+1 == value:
                answer[-1]['end_id'] = value
            else:
                answer.append({'start_id':value,'end_id':value})
        return answer
`,'Sắp log_id; ID bằng cuối nhóm +1 thì kéo dài nhóm, có khoảng trống thì mở nhóm mới.','O(n log n)','O(n)');
add(1286,'Iterator for Combination','design',['abc',2,['next','hasNext','next','hasNext','next','hasNext']],['ab',true,'ac',true,'bc',false],`
class Solution:
    def combinations(self, characters, combinationLength, operations):
        k,n = combinationLength,len(characters)
        assert 1 <= k <= n
        indices,available,answer = list(range(k)),True,[]
        for operation in operations:
            if operation == 'hasNext':
                answer.append(available)
                continue
            assert available
            answer.append(''.join(characters[i] for i in indices))
            i = k-1
            while i >= 0 and indices[i] == n-k+i:
                i -= 1
            if i < 0:
                available = False
            else:
                indices[i] += 1
                for j in range(i+1,k):
                    indices[j] = indices[j-1]+1
        return answer
`,'Giữ k chỉ số tăng dần. Để sinh tổ hợp kế theo từ điển, tăng chỉ số phải nhất còn tăng được rồi đặt phần đuôi về các giá trị nhỏ nhất.','O(q·k)','O(k+q)',{focus:['characters','indices','available','answer']});
add(1287,'Element Appearing More Than 25% In Sorted Array','search',[[1,2,2,6,6,6,6,7,10]],6,`
class Solution:
    def findSpecialInteger(self, arr):
        from bisect import bisect_left,bisect_right
        n = len(arr)
        for index in (n//4,n//2,3*n//4):
            value = arr[index]
            frequency = bisect_right(arr,value)-bisect_left(arr,value)
            if frequency*4 > n:
                return value
`,'Một khối dài hơn n/4 chắc chắn phủ ít nhất một vị trí n/4,n/2,3n/4. Thử ba ứng viên và tìm hai biên để kiểm tra tần suất.','O(log n)','O(1)',{difficulty:'easy'});
add(1290,'Convert Binary Number in a Linked List to Integer','list',[[1,0,1]],5,`
class Solution:
    def getDecimalValue(self, head):
        node,answer = head,0
        while node:
            answer = 2*answer+node.val
            node = node.next
        return answer
`,'Đầu list là bit cao nhất; mỗi node mới dịch giá trị đã đọc sang trái một bit rồi cộng bit mới.','O(n)','O(1)',{kinds:['list'],difficulty:'easy'});
add(1292,'Maximum Side Length of a Square with Sum Less than or Equal to Threshold','search',[[[1,1,3,2,4,3,2],[1,1,3,2,4,3,2],[1,1,3,2,4,3,2]],4],2,`
class Solution:
    def maxSideLength(self, mat, threshold):
        m,n = len(mat),len(mat[0])
        prefix = [[0]*(n+1) for _ in range(m+1)]
        for r in range(m):
            for c in range(n):
                prefix[r+1][c+1] = mat[r][c]+prefix[r][c+1]+prefix[r+1][c]-prefix[r][c]
        def feasible(size):
            for r in range(size,m+1):
                for c in range(size,n+1):
                    total = prefix[r][c]-prefix[r-size][c]-prefix[r][c-size]+prefix[r-size][c-size]
                    if total <= threshold:
                        return True
            return False
        left,right = 0,min(m,n)
        while left < right:
            mid = (left+right+1)//2
            if feasible(mid):
                left = mid
            else:
                right = mid-1
        return left
`,'Tổng tiền tố 2D cho tổng mỗi hình vuông trong O(1). Vì các số không âm, cạnh khả thi nhỏ hơn cũng khả thi; tìm nhị phân cạnh lớn nhất.','O(mn log min(m,n))','O(mn)',{focus:['mat','prefix','size','total']});
add(1294,'Weather Type in Each Country','sql',[[{country_id:1,country_name:'USA'},{country_id:2,country_name:'Japan'}],[{country_id:1,weather_state:10,day:'2019-11-01'},{country_id:1,weather_state:20,day:'2019-11-02'},{country_id:2,weather_state:25,day:'2019-11-01'}]],[{country_name:'USA',weather_type:'Cold'},{country_name:'Japan',weather_type:'Hot'}],`
class Solution:
    def weather(self, countries, weather):
        groups = {}
        for row in weather:
            if '2019-11-01' <= row['day'] <= '2019-11-30':
                groups.setdefault(row['country_id'],[]).append(row['weather_state'])
        answer = []
        for country in countries:
            values = groups.get(country['country_id'],[])
            if values:
                average = sum(values)/len(values)
                kind = 'Cold' if average <= 15 else 'Hot' if average >= 25 else 'Warm'
                answer.append({'country_name':country['country_name'],'weather_type':kind})
        return answer
`,'Chỉ lấy tháng 11/2019; tính trung bình weather_state mỗi nước rồi phân loại Cold ≤15, Hot ≥25, còn lại Warm.','O(c+w)','O(w)',{difficulty:'easy'});
add(1296,'Divide Array in Sets of K Consecutive Numbers','greedy',[[1,2,3,3,4,4,5,6],4],true,`
class Solution:
    def isPossibleDivide(self, nums, k):
        from collections import Counter
        if len(nums)%k:
            return False
        counts = Counter(nums)
        for start in sorted(counts):
            amount = counts[start]
            if amount:
                for value in range(start,start+k):
                    if counts[value] < amount:
                        return False
                    counts[value] -= amount
        return True
`,'Số nhỏ nhất còn lại phải mở đầu nhóm. Nếu có amount bản sao, cần cùng amount bản sao của k−1 số tiếp theo; thiếu một số thì không chia được.','O(n log n)','O(n)');
add(1297,'Maximum Number of Occurrences of a Substring','sliding',['aababcaab',2,3,4],2,`
class Solution:
    def maxFreq(self, s, maxLetters, minSize, maxSize):
        from collections import Counter
        letters,occurrences = Counter(),{}
        for right,ch in enumerate(s):
            letters[ch] += 1
            if right >= minSize:
                old = s[right-minSize]
                letters[old] -= 1
                if not letters[old]:
                    del letters[old]
            if right+1 >= minSize and len(letters) <= maxLetters:
                word = s[right-minSize+1:right+1]
                occurrences[word] = occurrences.get(word,0)+1
        return max(occurrences.values(),default=0)
`,'Chỉ cần cửa sổ minSize: mọi đoạn dài hơn không thể xuất hiện nhiều hơn một đoạn minSize nằm trong nó. Đếm đoạn chỉ có tối đa maxLetters chữ khác nhau.','O(n·minSize)','O(n·minSize)',{focus:['s','letters','occurrences','word']});
add(1298,'Maximum Candies You Can Get from Boxes','graph',[[1,0,1,0],[7,5,4,100],[[],[],[1],[]],[[1,2],[3],[],[]],[0]],16,`
class Solution:
    def maxCandies(self, status, candies, keys, containedBoxes, initialBoxes):
        from collections import deque
        owned,unlocked,opened = set(initialBoxes),set(),set()
        queue = deque(box for box in initialBoxes if status[box])
        answer = 0
        while queue:
            box = queue.popleft()
            if box in opened:
                continue
            opened.add(box)
            answer += candies[box]
            for key in keys[box]:
                unlocked.add(key)
                if key in owned and key not in opened:
                    queue.append(key)
            for following in containedBoxes[box]:
                owned.add(following)
                if (status[following] or following in unlocked) and following not in opened:
                    queue.append(following)
        return answer
`,'Phân biệt có hộp, có chìa và đã mở. Chỉ cho vào hàng đợi khi vừa sở hữu hộp vừa mở được; mỗi hộp chỉ cộng kẹo một lần.','O(boxes+keys+contained boxes)','O(boxes)',{difficulty:'hard',focus:['queue','owned','unlocked','opened','answer']});
module.exports=lessons;
