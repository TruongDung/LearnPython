"use strict";
const {defineEasy}=require('./easy-lesson');const lessons={};const add=(...args)=>{const p=defineEasy(...args);lessons[p.id]=p;};
add(1103,'Distribute Candies to People','array',[7,4],[1,2,3,1],`
class Solution:
    def distributeCandies(self, candies, num_people):
        assert 1 <= num_people <= 80 and 0 <= candies <= 100000
        answer,turn = [0]*num_people,0
        while candies:
            gift = min(candies,turn+1)
            answer[turn%num_people] += gift
            candies -= gift
            turn += 1
        return answer
`,'Phát 1,2,3,... viên theo vòng tròn; lượt cuối chỉ phát số kẹo còn lại.','O(√candies)','O(people)',{difficulty:'easy'});
add(1104,'Path In Zigzag Labelled Binary Tree','tree',[14],[1,3,4,14],`
class Solution:
    def pathInZigZagTree(self, label):
        answer = []
        while label:
            answer.append(label)
            level = label.bit_length()-1
            low,high = 2**level,2**(level+1)-1
            label = (low+high-label)//2
        return answer[::-1]
`,'Mỗi tầng đảo chiều nhãn so với tầng trước. Soi nhãn qua tổng hai đầu tầng rồi chia 2 để tìm nhãn cha.','O(log label)','O(log label)');
add(1106,'Parsing A Boolean Expression','string',['|(&(t,f,t),!(t))'],false,`
class Solution:
    def parseBoolExpr(self, expression):
        stack = []
        for ch in expression:
            if ch == ',':
                continue
            if ch != ')':
                stack.append(ch)
                continue
            values = []
            while stack[-1] != '(':
                values.append(stack.pop() == 't')
            stack.pop()
            operation = stack.pop()
            result = not values[0] if operation == '!' else all(values) if operation == '&' else any(values)
            stack.append('t' if result else 'f')
        return stack[0] == 't'
`,'Gặp dấu ) thì gom các giá trị tới (, lấy toán tử trước ngoặc, tính một giá trị rồi đẩy lại stack.','O(n)','O(n)',{difficulty:'hard',focus:['expression','stack','values','result']});
add(1107,'New Users Daily Count','sql',[[{user_id:1,activity:'login',activity_date:'2019-05-01'},{user_id:1,activity:'login',activity_date:'2019-05-02'},{user_id:2,activity:'login',activity_date:'2019-05-01'}]],[{login_date:'2019-05-01',user_count:2}],`
class Solution:
    def newUsers(self, traffic):
        from datetime import date,timedelta
        from collections import Counter
        first = {}
        for row in traffic:
            if row['activity'] == 'login':
                user,day = row['user_id'],row['activity_date']
                first[user] = min(first.get(user,day),day)
        today = date(2019,6,30)
        counts = Counter(day for day in first.values() if today-timedelta(days=90) <= date.fromisoformat(day) <= today)
        return [{'login_date':day,'user_count':count} for day,count in sorted(counts.items())]
`,'Lấy lần login đầu tiên trong toàn bộ lịch sử của mỗi người, sau đó đếm theo ngày nếu cách 2019-06-30 không quá 90 ngày.','O(n log n)','O(n)');
add(1110,'Delete Nodes And Return Forest','tree',[[1,2,3,4,5,6,7],[3,5]],[[1,2,null,4],[6],[7]],`
class Solution:
    def delNodes(self, root, to_delete):
        deleted,forest = set(to_delete),[]
        def visit(node, isRoot):
            if not node:
                return None
            remove = node.val in deleted
            if isRoot and not remove:
                forest.append(node)
            node.left = visit(node.left,remove)
            node.right = visit(node.right,remove)
            return None if remove else node
        visit(root,True)
        return [_tree_values(tree) for tree in forest]
`,'Node bị xóa làm hai con thành ứng viên gốc mới. DFS nối lại các nhánh còn sống và lưu các gốc không bị xóa; kết quả dùng level-order từng cây.','O(n)','O(n)',{kinds:['tree']});
add(1112,'Highest Grade For Each Student','sql',[[{student_id:2,course_id:2,grade:95},{student_id:2,course_id:1,grade:95},{student_id:1,course_id:3,grade:90}]],[{student_id:1,course_id:3,grade:90},{student_id:2,course_id:1,grade:95}],`
class Solution:
    def highestGrade(self, enrollments):
        best = {}
        for row in enrollments:
            student = row['student_id']
            if student not in best or (-row['grade'],row['course_id']) < (-best[student]['grade'],best[student]['course_id']):
                best[student] = row
        return [best[student] for student in sorted(best)]
`,'Mỗi sinh viên chọn điểm cao nhất; hòa điểm thì chọn course_id nhỏ nhất.','O(n log n)','O(n)');
add(1113,'Reported Posts','sql',[[{user_id:1,post_id:1,action_date:'2019-07-04',action:'report',extra:'spam'},{user_id:2,post_id:1,action_date:'2019-07-04',action:'report',extra:'spam'},{user_id:3,post_id:2,action_date:'2019-07-04',action:'report',extra:'racism'}]],[{report_reason:'racism',report_count:1},{report_reason:'spam',report_count:1}],`
class Solution:
    def reports(self, actions):
        groups = {}
        for row in actions:
            if row['action'] == 'report' and row['action_date'] == '2019-07-04':
                groups.setdefault(row['extra'],set()).add(row['post_id'])
        return [{'report_reason':reason,'report_count':len(posts)} for reason,posts in sorted(groups.items())]
`,'Chỉ lấy action report trong ngày 2019-07-04. Nhóm lý do và đếm post_id khác nhau, không đếm số người báo cùng bài.','O(n log n)','O(n)',{difficulty:'easy'});
const model='Deterministic cooperative scheduler model: waiting and signaling are simulated as Python state transitions, without creating operating-system threads.';
add(1114,'Print in Order','concurrency',[[3,2,1]],'firstsecondthird',`
class Solution:
    def printInOrder(self, arrival):
        assert sorted(arrival) == [1,2,3]
        pending,turn,output = arrival[:],1,[]
        labels = {1:'first',2:'second',3:'third'}
        while pending:
            for thread in pending[:]:
                ready = thread == turn
                if ready:
                    output.append(labels[thread])
                    pending.remove(thread)
                    turn += 1
        return ''.join(output)
`,'Luồng đến sai thứ tự phải chờ. turn là tín hiệu cho phép: first hoàn tất mới mở second, second hoàn tất mới mở third.','O(1)','O(1)',{description:model,focus:['pending','output','thread','turn','ready']});
add(1115,'Print FooBar Alternately','concurrency',[2,['bar','foo']],'foobarfoobar',`
class Solution:
    def fooBar(self, n, arrival):
        assert sorted(arrival) == ['bar','foo'] and 1 <= n <= 30
        completed,turn,output = {'foo':0,'bar':0},'foo',[]
        while completed['bar'] < n:
            for thread in arrival:
                ready = thread == turn and completed[thread] < n
                if ready:
                    output.append(thread)
                    completed[thread] += 1
                    turn = 'bar' if thread == 'foo' else 'foo'
        return ''.join(output)
`,'Chỉ foo có tín hiệu lúc đầu. In xong phải trao quyền cho bar và ngược lại; mỗi luồng dừng sau n lần.','O(n)','O(n)',{description:model,focus:['completed','output','turn','thread','ready']});
add(1116,'Print Zero Even Odd','concurrency',[5,['odd','even','zero']],[0,1,0,2,0,3,0,4,0,5],`
class Solution:
    def zeroEvenOdd(self, n, arrival):
        assert sorted(arrival) == ['even','odd','zero'] and 1 <= n <= 30
        turn,value,output = 'zero',1,[]
        while value <= n:
            for thread in arrival:
                if value > n:
                    break
                if thread != turn:
                    continue
                if thread == 'zero':
                    output.append(0)
                    turn = 'odd' if value%2 else 'even'
                elif value <= n:
                    output.append(value)
                    value += 1
                    turn = 'zero'
        return output
`,'Zero luôn in 0 rồi đánh thức odd hoặc even theo số kế tiếp; luồng số in xong trả quyền cho zero.','O(n)','O(n)',{description:model,focus:['output','turn','value','thread']});
add(1117,'Building H2O','concurrency',['OOHHHH'],'HHOHHO',`
class Solution:
    def water(self, arrivals):
        assert arrivals.count('H') == 2*arrivals.count('O')
        waiting,output = {'H':0,'O':0},[]
        for thread in arrivals:
            waiting[thread] += 1
            while waiting['H'] >= 2 and waiting['O'] >= 1:
                waiting['H'] -= 2
                waiting['O'] -= 1
                output.append('HHO')
        return ''.join(output)
`,'Barrier chỉ mở khi đã có đủ 2 H và 1 O; giải phóng trọn một phân tử trước khi cho nhóm tiếp theo đi. Trong mỗi nhóm, các thứ tự HHO/HOH/OHH đều hợp lệ.','O(n)','O(n)',{description:model+' This replay releases each complete batch in HHO order.',focus:['arrivals','waiting','output']});
add(1118,'Number of Days in a Month','math',[2000,2],29,`
class Solution:
    def numberOfDays(self, year, month):
        leap = year%400 == 0 or year%4 == 0 and year%100 != 0
        days = [31,29 if leap else 28,31,30,31,30,31,31,30,31,30,31]
        return days[month-1]
`,'Năm nhuận chia hết 400, hoặc chia hết 4 nhưng không chia hết 100. Chỉ tháng Hai thay đổi số ngày.','O(1)','O(1)',{difficulty:'easy'});
add(1119,'Remove Vowels from a String','string',['leetcodeisacommunityforcoders'],'ltcdscmmntyfrcdrs',`
class Solution:
    def removeVowels(self, s):
        answer = []
        for ch in s:
            if ch not in 'aeiou':
                answer.append(ch)
        return ''.join(answer)
`,'Duyệt trái sang phải và chỉ giữ ký tự không thuộc a,e,i,o,u.','O(n)','O(n)',{difficulty:'easy'});
add(1121,'Divide Array Into Increasing Sequences','greedy',[[1,2,2,3,3,4,4],3],true,`
class Solution:
    def canDivideIntoSubsequences(self, nums, k):
        from collections import Counter
        counts = Counter(nums)
        groups = max(counts.values())
        return len(nums) >= groups*k
`,'Các bản sao cùng giá trị phải ở các dãy khác nhau, nên cần ít nhất maxFrequency dãy. Mỗi dãy dài ≥k đòi tổng phần tử ≥maxFrequency·k.','O(n)','O(n)',{difficulty:'hard'});
add(1122,'Relative Sort Array','array',[[2,3,1,3,2,4,6,7,9,2,19],[2,1,4,3,9,6]],[2,2,2,1,4,3,3,9,6,7,19],`
class Solution:
    def relativeSortArray(self, arr1, arr2):
        from collections import Counter
        counts,answer = Counter(arr1),[]
        for value in arr2:
            answer.extend([value]*counts.pop(value,0))
        for value in sorted(counts):
            answer.extend([value]*counts[value])
        return answer
`,'Xuất các giá trị theo thứ tự arr2 với đúng số lần của chúng; phần không có trong arr2 xếp tăng dần ở cuối.','O(n+u log u)','O(n)',{difficulty:'easy'});
add(1126,'Active Businesses','sql',[[{business_id:1,event_type:'reviews',occurences:7},{business_id:1,event_type:'ads',occurences:11},{business_id:2,event_type:'reviews',occurences:3},{business_id:2,event_type:'ads',occurences:7}]],[1],`
class Solution:
    def activeBusinesses(self, events):
        totals,sizes = {},{}
        for row in events:
            kind = row['event_type']
            totals[kind] = totals.get(kind,0)+row['occurences']
            sizes[kind] = sizes.get(kind,0)+1
        above = {}
        for row in events:
            if row['occurences']*sizes[row['event_type']] > totals[row['event_type']]:
                business = row['business_id']
                above[business] = above.get(business,0)+1
        return sorted(business for business,count in above.items() if count > 1)
`,'Tính mức trung bình riêng từng loại sự kiện; doanh nghiệp tích cực khi vượt trung bình ở nhiều hơn một loại.','O(n log n)','O(n)');
add(1127,'User Purchase Platform','sql',[[{user_id:1,spend_date:'2019-07-01',platform:'mobile',amount:100},{user_id:1,spend_date:'2019-07-01',platform:'desktop',amount:100},{user_id:2,spend_date:'2019-07-01',platform:'mobile',amount:100}]],[{spend_date:'2019-07-01',platform:'desktop',total_amount:0,total_users:0},{spend_date:'2019-07-01',platform:'mobile',total_amount:100,total_users:1},{spend_date:'2019-07-01',platform:'both',total_amount:200,total_users:1}],`
class Solution:
    def platforms(self, spending):
        users = {}
        for row in spending:
            key = (row['spend_date'],row['user_id'])
            platforms,amount = users.get(key,(set(),0))
            platforms.add(row['platform'])
            users[key] = (platforms,amount+row['amount'])
        groups = {}
        for (day,user),(platforms,amount) in users.items():
            platform = 'both' if len(platforms) == 2 else next(iter(platforms))
            total,count = groups.get((day,platform),(0,0))
            groups[day,platform] = total+amount,count+1
        answer = []
        for day in sorted({r['spend_date'] for r in spending}):
            for platform in ['desktop','mobile','both']:
                total,count = groups.get((day,platform),(0,0))
                answer.append({'spend_date':day,'platform':platform,'total_amount':total,'total_users':count})
        return answer
`,'Phân loại mỗi người trong từng ngày là chỉ desktop, chỉ mobile hoặc cả hai; mỗi người chỉ được tính vào một nhóm. Bổ sung nhóm rỗng bằng 0.','O(n log n)','O(n)',{difficulty:'hard'});
add(1128,'Number of Equivalent Domino Pairs','array',[[[1,2],[2,1],[3,4],[5,6]]],1,`
class Solution:
    def numEquivDominoPairs(self, dominoes):
        counts,answer = {},0
        for a,b in dominoes:
            key = (min(a,b),max(a,b))
            answer += counts.get(key,0)
            counts[key] = counts.get(key,0)+1
        return answer
`,'Chuẩn hóa hai đầu nhỏ–lớn để bỏ ảnh hưởng chiều quay. Domino mới tạo một cặp với mỗi domino cùng khóa đã gặp.','O(n)','O(n)',{difficulty:'easy'});
add(1129,'Shortest Path with Alternating Colors','graph',[3,[[0,1],[1,2]],[]],[0,1,-1],`
class Solution:
    def shortestAlternatingPaths(self, n, redEdges, blueEdges):
        from collections import deque
        assert 1 <= n <= 40
        graph = [[[] for _ in range(n)] for _ in range(2)]
        for color,edges in enumerate([redEdges,blueEdges]):
            for a,b in edges:
                graph[color][a].append(b)
        distance = [[-1]*n for _ in range(2)]
        distance[0][0] = distance[1][0] = 0
        queue = deque([(0,0),(0,1)])
        while queue:
            node,lastColor = queue.popleft()
            color = 1-lastColor
            for following in graph[color][node]:
                if distance[color][following] == -1:
                    distance[color][following] = distance[lastColor][node]+1
                    queue.append((following,color))
        return [min(a,b) if min(a,b) >= 0 else max(a,b) for a,b in zip(*distance)]
`,'Trạng thái BFS gồm node và màu cạnh vừa đi. Bước kế tiếp bắt buộc đổi màu; một node có thể có hai trạng thái khoảng cách khác nhau.','O(n+edges)','O(n+edges)',{focus:['distance','queue','node','lastColor']});
add(1131,'Maximum of Absolute Value Expression','math',[[1,2,3,4],[-1,4,5,6]],13,`
class Solution:
    def maxAbsValExpr(self, arr1, arr2):
        answer = 0
        for a,b in [(1,1),(1,-1),(-1,1),(-1,-1)]:
            transformed = [a*x+b*y+i for i,(x,y) in enumerate(zip(arr1,arr2))]
            answer = max(answer,max(transformed)-min(transformed))
        return answer
`,'Mở dấu trị tuyệt đối thành bốn tổ hợp dấu của arr1,arr2; mỗi tổ hợp lấy max−min của biểu thức đã cộng chỉ số.','O(n)','O(n)');
add(1132,'Reported Posts II','sql',[[{post_id:1,action_date:'2019-07-01',action:'report',extra:'spam'},{post_id:2,action_date:'2019-07-01',action:'report',extra:'spam'},{post_id:3,action_date:'2019-07-02',action:'report',extra:'spam'}],[1,3]],75,`
class Solution:
    def averageRemoval(self, actions, removedPosts):
        from decimal import Decimal,ROUND_HALF_UP
        removed,groups = set(removedPosts),{}
        for row in actions:
            if row['action'] == 'report' and row['extra'] == 'spam':
                groups.setdefault(row['action_date'],set()).add(row['post_id'])
        rates = [Decimal(len(posts & removed))/len(posts)*100 for posts in groups.values()]
        return float((sum(rates)/len(rates)).quantize(Decimal('.01'),rounding=ROUND_HALF_UP)) if rates else 0.0
`,'Mỗi ngày lấy tỉ lệ bài spam đã báo sau đó bị gỡ, đếm bài khác nhau. Lấy trung bình các tỉ lệ ngày, không gộp tất cả bài thành một tỉ lệ.','O(n)','O(n)');
add(1133,'Largest Unique Number','array',[[5,7,3,9,4,9,8,3,1]],8,`
class Solution:
    def largestUniqueNumber(self, nums):
        from collections import Counter
        counts = Counter(nums)
        return max((value for value,count in counts.items() if count == 1),default=-1)
`,'Đếm tần suất rồi lấy giá trị lớn nhất xuất hiện đúng một lần; nếu không có thì −1.','O(n)','O(n)',{difficulty:'easy'});
add(1134,'Armstrong Number','math',[153],true,`
class Solution:
    def isArmstrong(self, n):
        digits = [int(ch) for ch in str(n)]
        power = len(digits)
        total = sum(digit**power for digit in digits)
        return total == n
`,'Nâng từng chữ số lên lũy thừa bằng số chữ số; số Armstrong bằng tổng các lũy thừa đó.','O(digits)','O(digits)',{difficulty:'easy'});
add(1138,'Alphabet Board Path','string',['leet'],'DDR!UURRR!!DDD!',`
class Solution:
    def alphabetBoardPath(self, target):
        r,c,answer = 0,0,''
        for ch in target:
            nr,nc = divmod(ord(ch)-ord('a'),5)
            answer += 'U'*max(0,r-nr)+'L'*max(0,c-nc)
            answer += 'D'*max(0,nr-r)+'R'*max(0,nc-c)+'!'
            r,c = nr,nc
        return answer
`,'Bảng chữ có hàng cuối chỉ chứa z. Đi lên/trái trước rồi xuống/phải để không bước vào ô trống khi vào hoặc rời z.','O(output length)','O(output length)',{focus:['target','answer','r','c']});
add(1139,'Largest 1-Bordered Square','dp',[[[1,1,1],[1,0,1],[1,1,1]]],9,`
class Solution:
    def largest1BorderedSquare(self, grid):
        m,n,best = len(grid),len(grid[0]),0
        horizontal,vertical = [[0]*n for _ in grid],[[0]*n for _ in grid]
        for r in range(m):
            for c in range(n):
                if grid[r][c]:
                    horizontal[r][c] = 1+(horizontal[r][c-1] if c else 0)
                    vertical[r][c] = 1+(vertical[r-1][c] if r else 0)
                    size = min(horizontal[r][c],vertical[r][c])
                    while size > best:
                        if horizontal[r-size+1][c] >= size and vertical[r][c-size+1] >= size:
                            best = size
                            break
                        size -= 1
        return best*best
`,'Tại góc phải dưới, biết độ dài dãy 1 bên trái và bên trên. Thử cạnh lớn, rồi kiểm tra thêm viền trên và trái; bên trong không cần toàn 1.','O(mn·min(m,n))','O(mn)',{focus:['grid','horizontal','vertical','best']});
add(1141,'User Activity for the Past 30 Days I','sql',[[{user_id:1,activity_date:'2019-07-20'},{user_id:1,activity_date:'2019-07-20'},{user_id:2,activity_date:'2019-07-20'},{user_id:3,activity_date:'2019-06-01'}]],[{day:'2019-07-20',active_users:2}],`
class Solution:
    def activeUsers(self, activity):
        groups = {}
        for row in activity:
            if '2019-06-28' <= row['activity_date'] <= '2019-07-27':
                groups.setdefault(row['activity_date'],set()).add(row['user_id'])
        return [{'day':day,'active_users':len(users)} for day,users in sorted(groups.items())]
`,'Lọc 30 ngày kết thúc 2019-07-27; mỗi ngày đếm user_id khác nhau, không đếm lặp nhiều hoạt động của cùng người.','O(n log n)','O(n)',{difficulty:'easy'});
add(1142,'User Activity for the Past 30 Days II','sql',[[{user_id:1,session_id:1,activity_date:'2019-07-20'},{user_id:1,session_id:2,activity_date:'2019-07-20'},{user_id:2,session_id:3,activity_date:'2019-07-20'}]],1.5,`
class Solution:
    def averageSessions(self, activity):
        from decimal import Decimal,ROUND_HALF_UP
        sessions,users = set(),set()
        for row in activity:
            if '2019-06-28' <= row['activity_date'] <= '2019-07-27':
                sessions.add(row['session_id'])
                users.add(row['user_id'])
        return float((Decimal(len(sessions))/len(users)).quantize(Decimal('.01'),rounding=ROUND_HALF_UP)) if users else 0.0
`,'Trong cửa sổ 30 ngày, tổng phiên khác nhau chia cho tổng người dùng hoạt động khác nhau; không có người dùng thì trả 0.','O(n)','O(n)',{difficulty:'easy'});
add(1144,'Decrease Elements To Make Array Zigzag','array',[[1,2,3]],2,`
class Solution:
    def movesToMakeZigzag(self, nums):
        costs = [0,0]
        for i,value in enumerate(nums):
            neighbor = min(nums[i-1] if i else float('inf'),nums[i+1] if i+1 < len(nums) else float('inf'))
            costs[i%2] += max(0,value-neighbor+1)
        return min(costs)
`,'Thử hai mẫu: vị trí chẵn làm đáy hoặc vị trí lẻ làm đáy. Mỗi đáy chỉ cần giảm tới nhỏ hơn cả hai hàng xóm.','O(n)','O(1)');
add(1145,'Binary Tree Coloring Game','tree',[[1,2,3,4,5,6,7,8,9,10,11],11,3],true,`
class Solution:
    def btreeGameWinningMove(self, root, n, x):
        regions = []
        def size(node):
            if not node:
                return 0
            left,right = size(node.left),size(node.right)
            if node.val == x:
                regions.extend([left,right,n-1-left-right])
            return left+right+1
        assert size(root) == n
        return max(regions) > n//2
`,'Node x chia cây thành ba vùng: trái, phải và phía cha. Người thứ hai thắng nếu chiếm được vùng lớn hơn nửa tổng node.','O(n)','O(h)',{kinds:['tree']});
add(1147,'Longest Chunked Palindrome Decomposition','greedy',['ghiabcdefhelloadamhelloabcdefghi'],7,`
class Solution:
    def longestDecomposition(self, text):
        i,j,left,right,chunks = 0,len(text)-1,'','',0
        while i <= j:
            left += text[i]
            right = text[j]+right
            if left == right:
                chunks += 1 if i == j else 2
                left,right = '',''
            i,j = i+1,j-1
        return chunks+int(bool(left))
`,'Gom chữ từ hai đầu; hễ hai khối bằng nhau thì chốt ngay để tạo nhiều khối nhất. Phần chưa ghép ở giữa tính là một khối.','O(n²)','O(n)',{difficulty:'hard',focus:['text','left','right','chunks']});
add(1148,'Article Views I','sql',[[{article_id:1,author_id:3,viewer_id:3,view_date:'2019-08-01'},{article_id:2,author_id:7,viewer_id:4,view_date:'2019-08-01'}]],[3],`
class Solution:
    def selfViews(self, views):
        authors = set()
        for row in views:
            if row['author_id'] == row['viewer_id']:
                authors.add(row['author_id'])
        return sorted(authors)
`,'Chọn lượt xem mà tác giả chính là người xem; lấy ID khác nhau theo thứ tự tăng.','O(n log n)','O(n)',{difficulty:'easy'});
add(1149,'Article Views II','sql',[[{article_id:1,viewer_id:3,view_date:'2019-08-01'},{article_id:2,viewer_id:3,view_date:'2019-08-01'},{article_id:1,viewer_id:4,view_date:'2019-08-01'}]],[3],`
class Solution:
    def multipleViews(self, views):
        groups = {}
        for row in views:
            key = (row['viewer_id'],row['view_date'])
            groups.setdefault(key,set()).add(row['article_id'])
        return sorted({viewer for (viewer,day),articles in groups.items() if len(articles) > 1})
`,'Nhóm theo người xem và ngày; một người được chọn nếu có ngày xem nhiều hơn một bài khác nhau.','O(n log n)','O(n)');
add(1150,'Check If a Number Is Majority Element in a Sorted Array','search',[[2,4,5,5,5,5,5,6,6],5],true,`
class Solution:
    def isMajorityElement(self, nums, target):
        from bisect import bisect_left,bisect_right
        first = bisect_left(nums,target)
        after = bisect_right(nums,target)
        frequency = after-first
        return frequency*2 > len(nums)
`,'Tìm hai biên của target trong mảng tăng; số lần xuất hiện phải lớn hơn nửa độ dài.','O(log n)','O(1)',{difficulty:'easy'});
add(1151,'Minimum Swaps to Group All 1s Together','sliding',[[1,0,1,0,1]],1,`
class Solution:
    def minSwaps(self, data):
        width = sum(data)
        if width <= 1:
            return 0
        ones = sum(data[:width])
        best = width-ones
        for right in range(width,len(data)):
            ones += data[right]-data[right-width]
            best = min(best,width-ones)
        return best
`,'Nhóm cuối có độ dài bằng tổng số 1. Chọn cửa sổ độ dài đó có ít số 0 nhất; mỗi 0 cần một lần đổi với số 1 bên ngoài.','O(n)','O(1)');
add(1152,'Analyze User Website Visit Pattern','string',[[ 'joe','joe','joe','james','james','james','james','mary','mary','mary'],[1,2,3,4,5,6,7,8,9,10],['home','about','career','home','cart','maps','home','home','about','career']],['home','about','career'],`
class Solution:
    def mostVisitedPattern(self, username, timestamp, website):
        from itertools import combinations
        from collections import Counter
        visits = {}
        for time,user,site in sorted(zip(timestamp,username,website)):
            visits.setdefault(user,[]).append(site)
        counts = Counter()
        for sites in visits.values():
            counts.update(set(combinations(sites,3)))
        best = min(counts,key=lambda pattern:(-counts[pattern],pattern))
        return list(best)
`,'Sắp lịch sử mỗi người theo thời gian, lấy các bộ ba theo đúng thứ tự. Mỗi người chỉ tính một lần cho một mẫu; hòa số người thì chọn mẫu nhỏ nhất theo từ điển.','O(n³)','O(n³)');
add(1153,'String Transforms Into Another String','string',['aabcc','ccdee'],true,`
class Solution:
    def canConvert(self, str1, str2):
        if str1 == str2:
            return True
        mapping = {}
        for a,b in zip(str1,str2):
            if a in mapping and mapping[a] != b:
                return False
            mapping[a] = b
        return len(str1) == len(str2) and len(set(str2)) < 26
`,'Một chữ nguồn phải luôn đổi sang cùng một chữ đích. Nếu còn thay đổi, cần ít nhất một chữ không dùng ở đích làm bộ đệm để phá chu trình.','O(n)','O(26)',{difficulty:'hard'});
add(1154,'Day of the Year','math',['2019-02-10'],41,`
class Solution:
    def dayOfYear(self, date):
        from datetime import date as Date
        today = Date.fromisoformat(date)
        first = Date(today.year,1,1)
        return (today-first).days+1
`,'Ngày thứ mấy trong năm bằng số ngày từ 1/1 tới ngày nhập, cộng 1; lịch tự xử lý năm nhuận.','O(1)','O(1)',{difficulty:'easy'});
add(1156,'Swap For Longest Repeated Character Substring','string',['ababa'],3,`
class Solution:
    def maxRepOpt1(self, text):
        from collections import Counter
        from itertools import groupby
        counts = Counter(text)
        groups = [(ch,len(list(g))) for ch,g in groupby(text)]
        best = 0
        for i,(ch,length) in enumerate(groups):
            best = max(best,min(counts[ch],length+1))
            if i+2 < len(groups) and groups[i+1][1] == 1 and groups[i+2][0] == ch:
                best = max(best,min(counts[ch],length+groups[i+2][1]+1))
        return best
`,'Một lần đổi có thể kéo dài một nhóm thêm 1, hoặc nối hai nhóm cùng chữ cách đúng một ký tự. Không được vượt tổng số chữ đó trong chuỗi.','O(n)','O(n)',{focus:['text','groups','counts','best']});
add(1157,'Online Majority Element In Subarray','design',[[1,1,2,2,1,1],[[0,5,4],[0,3,3],[2,3,2]]],[1,-1,2],`
class Solution:
    def majorityQueries(self, arr, queries):
        from collections import Counter
        answer = []
        for left,right,threshold in queries:
            counts = Counter(arr[left:right+1])
            value = next((v for v,count in counts.items() if count >= threshold),-1)
            answer.append(value)
        return answer
`,'Bản minh họa đếm trực tiếp từng cửa sổ truy vấn; trả phần tử đạt threshold hoặc −1. Điều kiện threshold lớn hơn nửa cửa sổ bảo đảm nhiều nhất một đáp án.','O(sum query lengths)','O(n+q)',{difficulty:'hard',description:'The teaching version explicitly counts each query range instead of using a randomized or indexed data structure.',focus:['arr','queries','counts','answer']});
add(1158,'Market Analysis I','sql',[[{user_id:1,join_date:'2018-01-01'},{user_id:2,join_date:'2018-02-01'}],[{buyer_id:1,order_date:'2019-08-01'},{buyer_id:1,order_date:'2018-08-01'}]],[{buyer_id:1,join_date:'2018-01-01',orders_in_2019:1},{buyer_id:2,join_date:'2018-02-01',orders_in_2019:0}],`
class Solution:
    def market(self, users, orders):
        from collections import Counter
        counts = Counter(row['buyer_id'] for row in orders if row['order_date'][:4] == '2019')
        return [{'buyer_id':u['user_id'],'join_date':u['join_date'],'orders_in_2019':counts[u['user_id']]} for u in users]
`,'Đếm đơn mua trong năm 2019 theo buyer_id rồi nối trái với toàn bộ người dùng; người không mua vẫn hiện với 0.','O(u+o)','O(u+o)');
add(1159,'Market Analysis II','sql',[[{user_id:1,favorite_brand:'Lenovo'},{user_id:2,favorite_brand:'Samsung'}],[{seller_id:1,item_id:1,order_date:'2019-08-01'},{seller_id:1,item_id:2,order_date:'2019-08-02'}],[{item_id:1,item_brand:'Samsung'},{item_id:2,item_brand:'Lenovo'}]],[{seller_id:1,'2nd_item_fav_brand':'yes'},{seller_id:2,'2nd_item_fav_brand':'no'}],`
class Solution:
    def secondSale(self, users, orders, items):
        brands = {row['item_id']:row['item_brand'] for row in items}
        sales = {}
        for row in sorted(orders,key=lambda r:r['order_date']):
            sales.setdefault(row['seller_id'],[]).append(row['item_id'])
        answer = []
        for user in users:
            items = sales.get(user['user_id'],[])
            matches = len(items) >= 2 and brands[items[1]] == user['favorite_brand']
            answer.append({'seller_id':user['user_id'],'2nd_item_fav_brand':'yes' if matches else 'no'})
        return answer
`,'Sắp các lần bán theo ngày riêng từng người; so thương hiệu của món bán thứ hai với favorite_brand. Chưa bán đủ hai món thì no.','O(o log o+u+i)','O(o+u+i)',{difficulty:'hard'});
add(1160,'Find Words That Can Be Formed by Characters','string',[[ 'cat','bt','hat','tree'],'atach'],6,`
class Solution:
    def countCharacters(self, words, chars):
        from collections import Counter
        available,answer = Counter(chars),0
        for word in words:
            needed = Counter(word)
            if all(count <= available[ch] for ch,count in needed.items()):
                answer += len(word)
        return answer
`,'Mỗi từ kiểm tra riêng với bộ chữ ban đầu; nếu đủ số lần từng chữ thì cộng độ dài từ, không tiêu thụ chữ cho từ tiếp theo.','O(total characters)','O(alphabet)',{difficulty:'easy'});
add(1161,'Maximum Level Sum of a Binary Tree','tree',[[1,7,0,7,-8,null,null]],2,`
class Solution:
    def maxLevelSum(self, root):
        level,nodes,best,bestLevel = 1,[root],-float('inf'),1
        while nodes:
            total = sum(node.val for node in nodes)
            if total > best:
                best,bestLevel = total,level
            nodes = [child for node in nodes for child in (node.left,node.right) if child]
            level += 1
        return bestLevel
`,'BFS theo tầng, cộng giá trị tất cả node cùng tầng. Chỉ cập nhật khi lớn hơn để hòa tổng thì giữ tầng nhỏ nhất.','O(n)','O(n)',{kinds:['tree']});
add(1163,'Last Substring in Lexicographical Order','string',['abab'],'bab',`
class Solution:
    def lastSubstring(self, s):
        i,j,offset = 0,1,0
        while j+offset < len(s):
            if s[i+offset] == s[j+offset]:
                offset += 1
            elif s[i+offset] > s[j+offset]:
                j = j+offset+1
                offset = 0
            else:
                i = max(i+offset+1,j)
                j,offset = i+1,0
        return s[i:]
`,'So hai hậu tố ứng viên i,j; offset là độ dài tiền tố đang bằng nhau. Gặp chữ khác, bỏ cả nhóm vị trí không thể thắng rồi bắt đầu so lại.','O(n)','O(1)',{difficulty:'hard',focus:['s','i','j','offset']});
add(1164,'Product Price at a Given Date','sql',[[{product_id:1,new_price:20,change_date:'2019-08-14'},{product_id:1,new_price:30,change_date:'2019-08-16'},{product_id:2,new_price:50,change_date:'2019-08-17'}]],[{product_id:1,price:30},{product_id:2,price:10}],`
class Solution:
    def prices(self, products):
        price = {row['product_id']:10 for row in products}
        for row in sorted(products,key=lambda r:r['change_date']):
            if row['change_date'] <= '2019-08-16':
                price[row['product_id']] = row['new_price']
        return [{'product_id':p,'price':v} for p,v in sorted(price.items())]
`,'Mọi sản phẩm bắt đầu giá 10. Áp dụng các lần đổi giá theo thứ tự ngày, chỉ tới hết 2019-08-16.','O(n log n)','O(n)');
add(1165,'Single-Row Keyboard','string',['abcdefghijklmnopqrstuvwxyz','cba'],4,`
class Solution:
    def calculateTime(self, keyboard, word):
        position = {ch:i for i,ch in enumerate(keyboard)}
        previous,answer = 0,0
        for ch in word:
            current = position[ch]
            answer += abs(current-previous)
            previous = current
        return answer
`,'Ngón tay bắt đầu ở vị trí 0; mỗi chữ tốn khoảng cách tuyệt đối từ vị trí trước tới vị trí chữ đó trên bàn phím.','O(|keyboard|+|word|)','O(alphabet)',{difficulty:'easy'});
add(1167,'Minimum Cost to Connect Sticks','greedy',[[2,4,3]],14,`
class Solution:
    def connectSticks(self, sticks):
        import heapq
        heap,answer = sticks[:],0
        heapq.heapify(heap)
        while len(heap) > 1:
            a,b = heapq.heappop(heap),heapq.heappop(heap)
            merged = a+b
            answer += merged
            heapq.heappush(heap,merged)
        return answer
`,'Mỗi lần nối tốn tổng độ dài. Luôn ghép hai que ngắn nhất trước để phần bị tính lặp ở các lần sau nhỏ nhất.','O(n log n)','O(n)',{focus:['heap','merged','answer']});
add(1169,'Invalid Transactions','string',[[ 'alice,20,800,mtv','alice,50,100,beijing']],['alice,20,800,mtv','alice,50,100,beijing'],`
class Solution:
    def invalidTransactions(self, transactions):
        rows = [text.split(',') for text in transactions]
        answer = []
        for i,(name,time,amount,city) in enumerate(rows):
            invalid = int(amount) > 1000
            for j,(other,when,value,place) in enumerate(rows):
                if i != j and name == other and city != place and abs(int(time)-int(when)) <= 60:
                    invalid = True
            if invalid:
                answer.append(transactions[i])
        return answer
`,'Giao dịch sai nếu số tiền >1000 hoặc cùng tên có giao dịch khác thành phố trong khoảng cách tối đa 60 phút. Giữ từng dòng trùng lặp riêng.','O(n²)','O(n)');
add(1170,'Compare Strings by Frequency of the Smallest Character','search',[[ 'bbb','cc'],['a','aa','aaa','aaaa']],[1,2],`
class Solution:
    def numSmallerByFrequency(self, queries, words):
        from bisect import bisect_right
        def frequency(s):
            return s.count(min(s))
        ordered = sorted(frequency(word) for word in words)
        answer = []
        for query in queries:
            value = frequency(query)
            answer.append(len(ordered)-bisect_right(ordered,value))
        return answer
`,'f(s) là số lần của chữ nhỏ nhất. Sắp f(words), rồi tìm biên phải của f(query) để đếm các giá trị lớn hơn nghiêm ngặt.','O(total characters+w log w+q log w)','O(w+q)');
add(1171,'Remove Zero Sum Consecutive Nodes from Linked List','list',[[1,2,-3,3,1]],[3,1],`
class Solution:
    def removeZeroSumSublists(self, head):
        dummy = ListNode(0,head)
        last,prefix,node = {},0,dummy
        while node:
            prefix += node.val
            last[prefix] = node
            node = node.next
        prefix,node = 0,dummy
        while node:
            prefix += node.val
            node.next = last[prefix].next
            node = node.next
        return dummy.next
`,'Hai node có cùng tổng tiền tố bao một đoạn tổng 0. Ghi lần xuất hiện cuối của mỗi tổng rồi nối next bỏ qua cả đoạn đó.','O(n)','O(n)',{kinds:['list'],answerKind:'list'});
add(1172,'Dinner Plate Stacks','design',[2,[['push',1],['push',2],['push',3],['popAtStack',0],['pop'],['pop']]],[null,null,null,2,3,1],`
class Solution:
    def dinnerPlates(self, capacity, operations):
        assert 1 <= capacity <= 20
        stacks,answer = [],[]
        for operation in operations:
            command = operation[0]
            if command == 'push':
                index = next((i for i,stack in enumerate(stacks) if len(stack) < capacity),len(stacks))
                if index == len(stacks):
                    stacks.append([])
                stacks[index].append(operation[1])
                answer.append(None)
            elif command == 'popAtStack':
                index = operation[1]
                answer.append(stacks[index].pop() if 0 <= index < len(stacks) and stacks[index] else -1)
            else:
                while stacks and not stacks[-1]:
                    stacks.pop()
                answer.append(stacks[-1].pop() if stacks else -1)
        return answer
`,'push vào stack chưa đầy bên trái nhất; pop từ stack có đồ bên phải nhất; popAtStack chỉ lấy ở stack được chỉ định. Bản hình duyệt trực tiếp để thấy quy tắc.','O(q²)','O(q)',{difficulty:'hard',focus:['stacks','answer','index']});
add(1173,'Immediate Food Delivery I','sql',[[{order_date:'2019-08-01',customer_pref_delivery_date:'2019-08-01'},{order_date:'2019-08-02',customer_pref_delivery_date:'2019-08-03'}]],50,`
class Solution:
    def immediate(self, delivery):
        from decimal import Decimal,ROUND_HALF_UP
        count = sum(r['order_date'] == r['customer_pref_delivery_date'] for r in delivery)
        return float((Decimal(count)*100/len(delivery)).quantize(Decimal('.01'),rounding=ROUND_HALF_UP))
`,'Đơn giao ngay có ngày đặt bằng ngày giao mong muốn; tính phần trăm trên tất cả đơn.','O(n)','O(1)',{difficulty:'easy'});
add(1174,'Immediate Food Delivery II','sql',[[{customer_id:1,order_date:'2019-08-01',customer_pref_delivery_date:'2019-08-01'},{customer_id:1,order_date:'2019-08-02',customer_pref_delivery_date:'2019-08-03'},{customer_id:2,order_date:'2019-08-02',customer_pref_delivery_date:'2019-08-04'}]],50,`
class Solution:
    def firstImmediate(self, delivery):
        from decimal import Decimal,ROUND_HALF_UP
        first = {}
        for row in delivery:
            customer = row['customer_id']
            if customer not in first or row['order_date'] < first[customer]['order_date']:
                first[customer] = row
        count = sum(r['order_date'] == r['customer_pref_delivery_date'] for r in first.values())
        return float((Decimal(count)*100/len(first)).quantize(Decimal('.01'),rounding=ROUND_HALF_UP))
`,'Chỉ xét đơn đầu tiên của mỗi khách rồi tính phần trăm đơn giao ngay; đơn về sau không ảnh hưởng.','O(n)','O(n)');
add(1175,'Prime Arrangements','math',[5],12,`
class Solution:
    def numPrimeArrangements(self, n):
        import math
        assert 1 <= n <= 80
        primes = [value for value in range(2,n+1) if all(value%d for d in range(2,math.isqrt(value)+1))]
        primeCount = len(primes)
        return math.factorial(primeCount)*math.factorial(n-primeCount)%1000000007
`,'Có p số nguyên tố và đúng p vị trí mang số nguyên tố. Hoán vị hai nhóm độc lập: p!×(n−p)!.','O(n√n)','O(n)',{difficulty:'easy'});
add(1176,'Diet Plan Performance','sliding',[[1,2,3,4,5],1,3,3],0,`
class Solution:
    def dietPlanPerformance(self, calories, k, lower, upper):
        total,answer = sum(calories[:k]),0
        for start in range(len(calories)-k+1):
            if start:
                total += calories[start+k-1]-calories[start-1]
            answer += 1 if total > upper else -1 if total < lower else 0
        return answer
`,'Trượt cửa sổ k ngày, cập nhật tổng bằng thêm ngày mới và bỏ ngày cũ. Tổng vượt upper +1, dưới lower −1, ở giữa 0.','O(n)','O(1)',{difficulty:'easy'});
add(1177,'Can Make Palindrome from Substring','bits',['abcda',[[3,3,0],[1,2,0],[0,3,1],[0,3,2],[0,4,1]]],[true,false,false,true,true],`
class Solution:
    def canMakePaliQueries(self, s, queries):
        prefix = [0]
        for ch in s:
            prefix.append(prefix[-1] ^ (1 << (ord(ch)-ord('a'))))
        answer = []
        for left,right,k in queries:
            mask = prefix[right+1]^prefix[left]
            odd = mask.bit_count()
            answer.append(odd//2 <= k)
        return answer
`,'Mask tiền tố lưu tính chẵn/lẻ số lần từng chữ. Đoạn có odd chữ xuất hiện lẻ cần ít nhất odd//2 lần thay để ghép cặp đối xứng.','O(n+q)','O(n+q)',{focus:['s','prefix','mask','odd','answer']});
add(1178,'Number of Valid Words for Each Puzzle','bits',[[ 'aaaa','asas','able','ability','actt','actor','access'],['aboveyz','abrodyz','abslute','absoryz','actresz','gaswxyz']],[1,1,3,2,4,0],`
class Solution:
    def findNumOfValidWords(self, words, puzzles):
        def mask(word):
            value = 0
            for ch in word:
                value |= 1 << (ord(ch)-ord('a'))
            return value
        counts = {}
        for word in words:
            bits = mask(word)
            counts[bits] = counts.get(bits,0)+1
        answer = []
        for puzzle in puzzles:
            bits,required = mask(puzzle),mask(puzzle[0])
            subset,total = bits,0
            while subset:
                if subset & required:
                    total += counts.get(subset,0)
                subset = (subset-1)&bits
            answer.append(total)
        return answer
`,'Mỗi từ thành tập bit chữ. Duyệt các tập con của 7 chữ puzzle, bắt buộc có chữ đầu; cộng tần suất từ mang đúng tập bit đó.','O(total word length+p·2^7)','O(words)',{difficulty:'hard',focus:['puzzles','counts','subset','required','answer'],traceOptions:{maxEvents:12000}});
const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const revenueRow=(id,values)=>Object.assign({id},Object.fromEntries(months.map(month=>[month+'_Revenue',values[month]??null])));
add(1179,'Reformat Department Table','sql',[[{id:1,revenue:8000,month:'Jan'},{id:1,revenue:7000,month:'Feb'},{id:2,revenue:9000,month:'Jan'}]],[revenueRow(1,{Jan:8000,Feb:7000}),revenueRow(2,{Jan:9000})],`
class Solution:
    def reformat(self, department):
        months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        groups = {}
        for row in department:
            departmentId = row['id']
            if departmentId not in groups:
                groups[departmentId] = dict(id=departmentId,**{month+'_Revenue':None for month in months})
            groups[departmentId][row['month']+'_Revenue'] = row['revenue']
        return [groups[departmentId] for departmentId in sorted(groups)]
`,'Đổi dữ liệu dọc thành ngang: mỗi phòng ban một hàng, mỗi tháng một cột; tháng không có dữ liệu để NULL.','O(n)','O(departments·12)',{difficulty:'easy'});
add(1180,'Count Substrings with Only One Distinct Letter','string',['aaaba'],8,`
class Solution:
    def countLetters(self, s):
        run,answer = 0,0
        for i,ch in enumerate(s):
            run = run+1 if i and s[i-1] == ch else 1
            answer += run
        return answer
`,'Một nhóm lặp đang dài run tạo run đoạn hợp lệ kết thúc ở ký tự hiện tại. Cộng run sau mỗi ký tự.','O(n)','O(1)',{difficulty:'easy'});
add(1181,'Before and After Puzzle','string',[[ 'writing code','code rocks']],['writing code rocks'],`
class Solution:
    def beforeAndAfterPuzzles(self, phrases):
        starts,answer = {},set()
        words = [phrase.split() for phrase in phrases]
        for i,parts in enumerate(words):
            starts.setdefault(parts[0],[]).append(i)
        for i,parts in enumerate(words):
            for j in starts.get(parts[-1],[]):
                if i != j:
                    answer.add(' '.join(parts+words[j][1:]))
        return sorted(answer)
`,'Từ cuối câu trước phải bằng từ đầu câu sau. Nối hai câu khác vị trí, chỉ giữ một bản của từ giao và loại kết quả trùng.','O(n²·L)','O(output length)');
add(1182,'Shortest Distance to Target Color','search',[[1,1,2,1,3,2,2,3,3],[[1,3],[2,2],[6,1]]],[3,0,3],`
class Solution:
    def shortestDistanceColor(self, colors, queries):
        import bisect
        positions = {}
        for i,color in enumerate(colors):
            positions.setdefault(color,[]).append(i)
        answer = []
        for index,color in queries:
            values = positions.get(color,[])
            split = bisect.bisect_left(values,index)
            candidates = values[max(0,split-1):split+1]
            answer.append(min((abs(p-index) for p in candidates),default=-1))
        return answer
`,'Lưu các vị trí mỗi màu theo thứ tự; tìm nhị phân điểm chèn của truy vấn rồi chỉ so hàng xóm trái/phải.','O(n+q log n)','O(n+q)');
add(1183,'Maximum Number of Ones','math',[3,3,2,1],4,`
class Solution:
    def maximumNumberOfOnes(self, width, height, sideLength, maxOnes):
        assert 1 <= sideLength <= min(width,height,12) and maxOnes <= sideLength**2
        counts = []
        for r in range(sideLength):
            for c in range(sideLength):
                copies = ((height-1-r)//sideLength+1)*((width-1-c)//sideLength+1)
                counts.append(copies)
        counts.sort(reverse=True)
        return sum(counts[:maxOnes])
`,'Lặp một mẫu sideLength×sideLength. Mỗi vị trí mẫu xuất hiện số lần khác nhau trên bảng; bật maxOnes vị trí có số bản sao lớn nhất.','O(side² log side)','O(side²)',{difficulty:'hard'});
add(1184,'Distance Between Bus Stops','array',[[1,2,3,4],0,1],1,`
class Solution:
    def distanceBetweenBusStops(self, distance, start, destination):
        left,right = sorted([start,destination])
        clockwise = sum(distance[left:right])
        counterclockwise = sum(distance)-clockwise
        return min(clockwise,counterclockwise)
`,'Tuyến là vòng tròn; tổng một cung là tổng đoạn chỉ số giữa hai bến, cung còn lại bằng tổng cả vòng trừ cung đó.','O(n)','O(1)',{difficulty:'easy'});
add(1185,'Day of the Week','math',[31,8,2019],'Saturday',`
class Solution:
    def dayOfTheWeek(self, day, month, year):
        from datetime import date
        names = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
        weekday = date(year,month,day).weekday()
        return names[weekday]
`,'Chuyển ngày/tháng/năm thành ngày lịch; weekday trả 0 cho thứ Hai tới 6 cho Chủ nhật rồi ánh xạ sang tên.','O(1)','O(1)',{difficulty:'easy'});
add(1186,'Maximum Subarray Sum with One Deletion','dp',[[1,-2,0,3]],4,`
class Solution:
    def maximumSum(self, arr):
        keep,drop,answer = arr[0],-float('inf'),arr[0]
        for value in arr[1:]:
            drop,keep = max(keep,drop+value),max(value,keep+value)
            answer = max(answer,keep,drop)
        return answer
`,'keep là tổng đoạn kết thúc ở đây chưa xóa; drop đã xóa một số. Có thể xóa số hiện tại hoặc nối vào đoạn từng xóa. Đoạn không được rỗng.','O(n)','O(1)');
add(1187,'Make Array Strictly Increasing','dp',[[1,5,3,6,7],[1,3,2,4]],1,`
class Solution:
    def makeArrayIncreasing(self, arr1, arr2):
        from bisect import bisect_right
        replacements = sorted(set(arr2))
        dp = {-1:0}
        for value in arr1:
            following = {}
            for previous,cost in dp.items():
                if value > previous:
                    following[value] = min(following.get(value,float('inf')),cost)
                index = bisect_right(replacements,previous)
                if index < len(replacements):
                    chosen = replacements[index]
                    following[chosen] = min(following.get(chosen,float('inf')),cost+1)
            dp = following
        return min(dp.values(),default=-1)
`,'dp[last] giữ số lần thay ít nhất sau tiền tố đã xét. Mỗi bước thử giữ số gốc hoặc thay bằng số nhỏ nhất trong arr2 lớn hơn last.','O(nm log m)','O(m)',{difficulty:'hard',focus:['arr1','replacements','dp','following'],traceOptions:{maxEvents:20000}});
add(1188,'Design Bounded Blocking Queue','concurrency',[2,[['enqueue',1],['enqueue',2],['enqueue',3],['dequeue'],['dequeue'],['dequeue']]],{results:[null,null,null,1,2,3],waiting:[],queue:[]},`
class Solution:
    def boundedQueue(self, capacity, operations):
        from collections import deque
        assert 1 <= capacity <= 20
        queue,pending,results = deque(),list(range(len(operations))),[None]*len(operations)
        while pending:
            progress = False
            for thread in pending[:]:
                operation = operations[thread]
                if operation[0] == 'enqueue' and len(queue) < capacity:
                    queue.append(operation[1])
                elif operation[0] == 'dequeue' and queue:
                    results[thread] = queue.popleft()
                else:
                    continue
                pending.remove(thread)
                progress = True
            if not progress:
                break
        return {'results':results,'waiting':pending,'queue':list(queue)}
`,'Producer chờ khi hàng đầy; consumer chờ khi hàng rỗng. Scheduler thử lại các luồng đang chờ sau mỗi vòng; waiting khác rỗng ở cuối nghĩa là lịch yêu cầu không thể hoàn tất.','O(q²)','O(q)',{description:model,focus:['queue','pending','operations','results'],difficulty:'medium'});
add(1189,'Maximum Number of Balloons','string',['loonbalxballpoon'],2,`
class Solution:
    def maxNumberOfBalloons(self, text):
        from collections import Counter
        counts,needed = Counter(text),Counter('balloon')
        possible = {ch:counts[ch]//amount for ch,amount in needed.items()}
        return min(possible.values())
`,'Mỗi balloon cần b,a,n một lần và l,o hai lần. Chia tần suất có sẵn cho số cần của từng chữ rồi lấy giới hạn nhỏ nhất.','O(n)','O(alphabet)',{difficulty:'easy'});
add(1191,'K-Concatenation Maximum Sum','dp',[[1,-2,1],5],2,`
class Solution:
    def kConcatenationMaxSum(self, arr, k):
        current,best = 0,0
        values = arr*min(k,2)
        for value in values:
            current = max(0,current+value)
            best = max(best,current)
        total = sum(arr)
        if k > 2 and total > 0:
            best += (k-2)*total
        return best%1000000007
`,'Kadane trên tối đa hai bản sao để xét đoạn vắt qua biên; nếu tổng một bản dương thì các bản ở giữa đóng góp thêm toàn bộ tổng đó.','O(n)','O(n)');
add(1193,'Monthly Transactions I','sql',[[{country:'US',state:'approved',amount:1000,trans_date:'2018-12-18'},{country:'US',state:'declined',amount:2000,trans_date:'2018-12-19'}]],[{month:'2018-12',country:'US',trans_count:2,approved_count:1,trans_total_amount:3000,approved_total_amount:1000}],`
class Solution:
    def monthly(self, transactions):
        groups = {}
        for row in transactions:
            month,country = row['trans_date'][:7],row['country']
            values = groups.setdefault((month,country),[0,0,0,0])
            values[0] += 1
            values[2] += row['amount']
            if row['state'] == 'approved':
                values[1] += 1
                values[3] += row['amount']
        return [{'month':m,'country':c,'trans_count':v[0],'approved_count':v[1],'trans_total_amount':v[2],'approved_total_amount':v[3]} for (m,c),v in sorted(groups.items(),key=lambda p:(p[0][0],p[0][1] or ''))]
`,'Nhóm theo tháng và quốc gia; song song giữ tổng mọi giao dịch và tổng riêng các giao dịch approved.','O(n log n)','O(n)');
add(1194,'Tournament Winners','sql',[[{player_id:1,group_id:1},{player_id:2,group_id:1},{player_id:3,group_id:2}],[{first_player:1,second_player:2,first_score:3,second_score:3}]],[{group_id:1,player_id:1},{group_id:2,player_id:3}],`
class Solution:
    def winners(self, players, matches):
        scores = {p['player_id']:0 for p in players}
        for match in matches:
            scores[match['first_player']] += match['first_score']
            scores[match['second_player']] += match['second_score']
        groups = {}
        for player in players:
            group,p = player['group_id'],player['player_id']
            if group not in groups or (-scores[p],p) < (-scores[groups[group]],groups[group]):
                groups[group] = p
        return [{'group_id':g,'player_id':p} for g,p in sorted(groups.items())]
`,'Cộng điểm cả hai phía mỗi trận. Mỗi bảng chọn tổng điểm cao nhất; hòa thì player_id nhỏ nhất, kể cả người chưa thi đấu có 0 điểm.','O(p+m)','O(p)',{difficulty:'hard'});
add(1195,'Fizz Buzz Multithreaded','concurrency',[15,['fizz','buzz','fizzbuzz','number']],[1,2,'fizz',4,'buzz','fizz',7,8,'fizz','buzz',11,'fizz',13,14,'fizzbuzz'],`
class Solution:
    def fizzBuzz(self, n, arrival):
        assert sorted(arrival) == ['buzz','fizz','fizzbuzz','number'] and 1 <= n <= 80
        value,output = 1,[]
        while value <= n:
            for thread in arrival:
                if value > n:
                    break
                required = 'fizzbuzz' if value%15 == 0 else 'fizz' if value%3 == 0 else 'buzz' if value%5 == 0 else 'number'
                if thread == required:
                    output.append(value if thread == 'number' else thread)
                    value += 1
        return output
`,'Bốn luồng chia sẻ số hiện tại; chỉ luồng có điều kiện khớp được in và tăng số. Luồng khác chờ giá trị tiếp theo thay vì bỏ qua số.','O(n)','O(n)',{description:model,focus:['output','value','required','thread']});
add(1196,'How Many Apples Can You Put into the Basket','greedy',[[100,200,150,1000]],4,`
class Solution:
    def maxNumberOfApples(self, weight):
        total,answer = 0,0
        for apple in sorted(weight):
            if total+apple > 5000:
                break
            total += apple
            answer += 1
        return answer
`,'Muốn nhiều táo nhất trong tải trọng 5000, lấy các quả nhẹ nhất trước; dừng khi quả kế tiếp không còn vừa.','O(n log n)','O(n)',{difficulty:'easy'});
add(1198,'Find Smallest Common Element in All Rows','array',[[[1,2,3,4,5],[2,4,5,8,10],[3,5,7,9,11],[1,3,5,7,9]]],5,`
class Solution:
    def smallestCommonElement(self, mat):
        common = set(mat[0])
        for row in mat[1:]:
            common &= set(row)
        return min(common,default=-1)
`,'Giao tập phần tử của từng hàng; cuối cùng lấy số nhỏ nhất còn lại hoặc −1 nếu giao rỗng.','O(total cells)','O(columns)');
add(1199,'Minimum Time to Build Blocks','greedy',[[1,2,3],1],4,`
class Solution:
    def minBuildTime(self, blocks, split):
        import heapq
        heap = blocks[:]
        heapq.heapify(heap)
        while len(heap) > 1:
            a,b = heapq.heappop(heap),heapq.heappop(heap)
            combined = split+max(a,b)
            heapq.heappush(heap,combined)
        return heap[0]
`,'Ghép ngược hai công việc ngắn nhất: một người tách thành hai mất split, hai nhánh chạy song song mất max(a,b). Lặp tới một gốc lịch làm việc.','O(n log n)','O(n)',{difficulty:'hard',focus:['heap','combined']});
module.exports=lessons;
