"use strict";
const {defineEasy}=require('./easy-lesson');const lessons={};const add=(...args)=>{const p=defineEasy(...args);lessons[p.id]=p;};
add(1601,'Maximum Number of Achievable Transfer Requests','backtracking',[3,[[0,0],[1,2],[2,1]]],3,`
class Solution:
    def maximumRequests(self, n, requests):
        assert len(requests) <= 14
        balance,answer = [0]*n,0
        def visit(i,count):
            nonlocal answer
            if count+len(requests)-i <= answer:
                return
            if i == len(requests):
                if not any(balance):
                    answer = count
                return
            a,b = requests[i]
            balance[a] -= 1
            balance[b] += 1
            visit(i+1,count+1)
            balance[a] += 1
            balance[b] -= 1
            visit(i+1,count)
        visit(0,0)
        return answer
`,'Chọn hoặc bỏ từng yêu cầu. balance theo dõi số người tăng/giảm của từng tòa nhà; chỉ một tập yêu cầu đưa mọi balance về 0 mới hợp lệ.','O(n·2^requests)','O(n+requests)',{focus:['balance','i','count','answer']});
add(1602,'Find Nearest Right Node in Binary Tree','tree',[[1,2,3,null,4,5,6],4],5,`
class Solution:
    def findNearestRightNode(self, root, target):
        level = [root] if root else []
        while level:
            for i,node in enumerate(level):
                if node.val == target:
                    return level[i+1].val if i+1 < len(level) else None
            level = [child for node in level for child in (node.left,node.right) if child]
        return None
`,'BFS tách riêng từng tầng. Khi gặp node đích, lấy phần tử ngay sau trong cùng tầng; node cuối tầng không có hàng xóm bên phải. Đích nhập bằng giá trị duy nhất.','O(n)','O(width)',{kinds:['tree'],focus:['level','i','node']});
add(1603,'Design Parking System','design',[1,1,0,[1,2,3,1]],[true,true,false,false],`
class Solution:
    def parkingSystem(self, big, medium, small, cars):
        slots,answer = [0,big,medium,small],[]
        for carType in cars:
            accepted = slots[carType] > 0
            if accepted:
                slots[carType] -= 1
            answer.append(accepted)
        return answer
`,'Ba loại xe chỉ dùng chỗ đúng loại. Kiểm tra chỗ còn trước khi giảm; xe bị từ chối không thay đổi số chỗ.','O(cars)','O(cars)',{focus:['slots','carType','accepted','answer']});
add(1604,'Alert Using Same Key-Card Three or More Times in a One Hour Period','array',[['daniel','daniel','daniel','luis','luis'],['10:00','10:40','11:00','09:00','11:00']],['daniel'],`
class Solution:
    def alertNames(self, keyName, keyTime):
        times = {}
        for name,time in zip(keyName,keyTime):
            hour,minute = map(int,time.split(':'))
            times.setdefault(name,[]).append(60*hour+minute)
        answer = []
        for name,values in sorted(times.items()):
            values.sort()
            if any(values[i]-values[i-2] <= 60 for i in range(2,len(values))):
                answer.append(name)
        return answer
`,'Đổi giờ thành phút rồi sắp xếp riêng cho mỗi người. Chỉ cần xét từng bộ ba kề nhau; chênh lệch đầu-cuối ≤60 phút sẽ phát cảnh báo. Không quấn qua nửa đêm.','O(n log n)','O(n)');
add(1605,'Find Valid Matrix Given Row and Column Sums','greedy',[[3,8],[4,7]],[[3,0],[1,7]],`
class Solution:
    def restoreMatrix(self, rowSum, colSum):
        rows,cols = rowSum[:],colSum[:]
        answer = [[0]*len(cols) for _ in rows]
        r,c = 0,0
        while r < len(rows) and c < len(cols):
            value = min(rows[r],cols[c])
            answer[r][c] = value
            rows[r] -= value
            cols[c] -= value
            if rows[r] == 0:
                r += 1
            if cols[c] == 0:
                c += 1
        return answer
`,'Điền ít hơn giữa tổng còn lại của hàng và cột. Ít nhất một tổng về 0 sau mỗi ô, cho phép chuyển hàng/cột mà vẫn giữ mọi số không âm.','O(rows·cols)','O(rows·cols)',{focus:['answer','rows','cols','r','c']});
add(1607,'Sellers With No Sales','sql',[[{seller_id:1,seller_name:'Ada'},{seller_id:2,seller_name:'Bob'}],[{seller_id:1,sale_date:'2020-01-01'},{seller_id:2,sale_date:'2019-01-01'}]],[{seller_name:'Bob'}],`
class Solution:
    def sellersWithoutSales(self, sellers, orders):
        active = {o['seller_id'] for o in orders if o['sale_date'][:4] == '2020'}
        return [{'seller_name':s['seller_name']} for s in sorted(sellers,key=lambda s:s['seller_name']) if s['seller_id'] not in active]
`,'Tạo tập người bán có giao dịch trong năm 2020 rồi lấy phần bù. Có giao dịch năm khác vẫn được giữ nếu không bán trong 2020.','O(rows+sellers log sellers)','O(sellers)');
add(1608,'Special Array With X Elements Greater Than or Equal X','array',[[3,5]],2,`
class Solution:
    def specialArray(self, nums):
        for x in range(len(nums)+1):
            count = sum(value >= x for value in nums)
            if count == x:
                return x
        return -1
`,'x không thể vượt số phần tử. Thử từng x và đếm bao nhiêu giá trị ≥x; điều kiện cần bằng đúng x, không phải ít nhất x.','O(n²)','O(1)');
add(1611,'Minimum One Bit Operations to Make Integers Zero','bits',[3],2,`
class Solution:
    def minimumOneBitOperations(self, n):
        answer = 0
        while n:
            answer ^= n
            n >>= 1
        return answer
`,'Các trạng thái hợp lệ đi theo thứ tự Gray code. Số bước từ n về 0 là giải mã Gray: XOR n với mọi bản dịch phải của nó. Theo dõi từng hàng bit và answer tích lũy.','O(log n)','O(1)',{focus:['n','answer']});
add(1612,'Check If Two Expression Trees are Equivalent','tree',[['+','a',['+','b','c']],['+',['+','a','b'],'c']],true,`
class Solution:
    def checkEquivalence(self, root1, root2):
        from collections import Counter
        def count(node):
            if isinstance(node,str):
                return Counter(node)
            assert node[0] == '+'
            left,right = count(node[1]),count(node[2])
            return left+right
        first,second = count(root1),count(root2)
        return first == second
`,'Cây chỉ có toán tử + nên thứ tự và cách đặt ngoặc không làm thay đổi giá trị. Hai biểu thức tương đương khi mỗi biến lá xuất hiện cùng số lần. Node nhập [+,trái,phải], lá là một chữ.','O(nodes)','O(nodes)',{focus:['node','first','second']});
add(1613,'Find the Missing IDs','sql',[[{customer_id:1},{customer_id:4},{customer_id:5}]],[{ids:2},{ids:3}],`
class Solution:
    def missingIds(self, customers):
        present = {c['customer_id'] for c in customers}
        answer = []
        for value in range(1,max(present,default=0)+1):
            if value not in present:
                answer.append({'ids':value})
        return answer
`,'Sinh các ID từ 1 đến ID lớn nhất, rồi loại những ID đã có. Kết quả tăng dần theo thứ tự sinh.','O(max ID+rows)','O(max ID)');
add(1615,'Maximal Network Rank','graph',[4,[[0,1],[0,3],[1,2],[1,3]]],4,`
class Solution:
    def maximalNetworkRank(self, n, roads):
        degree,connected = [0]*n,set()
        for a,b in roads:
            degree[a] += 1
            degree[b] += 1
            connected.add((min(a,b),max(a,b)))
        answer = 0
        for a in range(n):
            for b in range(a+1,n):
                rank = degree[a]+degree[b]-int((a,b) in connected)
                answer = max(answer,rank)
        return answer
`,'Cộng số đường chạm hai thành phố. Nếu hai thành phố nối trực tiếp, đường chung vừa bị đếm hai lần nên trừ 1.','O(n²+roads)','O(n+roads)');
add(1616,'Split Two Strings to Make Palindrome','string',['ulacfd','jizalu'],true,`
class Solution:
    def checkPalindromeFormation(self, a, b):
        def check(first,second):
            left,right = 0,len(first)-1
            while left < right and first[left] == second[right]:
                left += 1
                right -= 1
            x,y = first[left:right+1],second[left:right+1]
            return x == x[::-1] or y == y[::-1]
        return check(a,b) or check(b,a)
`,'Ghép prefix của chuỗi đầu với suffix chuỗi sau từ hai đầu vào. Khi gặp cặp không khớp, phần giữa còn lại phải là palindrome hoàn toàn trong một trong hai chuỗi.','O(n)','O(n)');
add(1617,'Count Subtrees With Max Distance Between Cities','graph',[4,[[1,2],[2,3],[2,4]]],[3,4,0],`
class Solution:
    def countSubgraphsForEachDiameter(self, n, edges):
        assert n <= 10
        graph = [[] for _ in range(n)]
        for a,b in edges:
            graph[a-1].append(b-1)
            graph[b-1].append(a-1)
        answer = [0]*(n-1)
        for mask in range(1,1<<n):
            nodes = [i for i in range(n) if mask>>i&1]
            diameter,connected = 0,True
            for start in nodes:
                distance,queue = {start:0},[start]
                for node in queue:
                    for other in graph[node]:
                        if mask>>other&1 and other not in distance:
                            distance[other] = distance[node]+1
                            queue.append(other)
                connected = connected and len(distance) == len(nodes)
                diameter = max(diameter,max(distance.values()))
            if connected and diameter:
                answer[diameter-1] += 1
        return answer
`,'Liệt kê tập thành phố được chọn bằng mask. BFS chỉ đi trong tập đó để kiểm tra liên thông và tìm khoảng cách lớn nhất; chỉ tập liên thông mới là cây con.','O(2^n·n²)','O(n²)',{focus:['mask','nodes','distance','diameter','answer']});
add(1618,'Maximum Font to Fit a Sentence in a Screen','search',['hello world',100,20,[8,12,16,24],{h:0.5,e:0.5,l:0.5,o:0.5,' ':0.5,w:0.5,r:0.5,d:0.5}],16,`
class Solution:
    def maxFont(self, text, w, h, fonts, widthFactors):
        left,right,answer = 0,len(fonts)-1,-1
        while left <= right:
            mid = (left+right)//2
            font = fonts[mid]
            height = font
            width = sum(widthFactors[char]*font for char in text)
            fits = height <= h and width <= w
            if fits:
                answer = font
                left = mid+1
            else:
                right = mid-1
        return answer
`,'FontInfo được mô phỏng bằng hệ số rộng mỗi ký tự và chiều cao bằng cỡ chữ. Tính tổng rộng, kiểm tra cả hai chiều rồi tìm nhị phân cỡ lớn nhất vừa màn hình.','O(text·log fonts)','O(1)',{description:'Local monotone FontInfo model: getWidth(font,char)=font*widthFactors[char], getHeight(font)=font.',focus:['fonts','mid','width','height','fits','answer']});
add(1619,'Mean of Array After Removing Some Elements','array',[[6,2,7,5,1,2,0,3,4,5,6,8,7,6,5,4,3,2,1,9]],4.277777777777778,`
class Solution:
    def trimMean(self, arr):
        ordered = sorted(arr)
        cut = len(arr)//20
        selected = ordered[cut:len(arr)-cut]
        return sum(selected)/len(selected)
`,'Bỏ đúng 5% nhỏ nhất và 5% lớn nhất sau khi sắp xếp, rồi lấy trung bình 90% còn lại. Độ dài đầu vào theo đề là bội của 20.','O(n log n)','O(n)');
add(1620,'Coordinate With Maximum Network Quality','math',[[[1,2,5],[2,1,7],[3,1,9]],2],[2,1],`
class Solution:
    def bestCoordinate(self, towers, radius):
        import math
        assert max(max(x,y) for x,y,_ in towers) <= 12
        best,answer = -1,[0,0]
        for x in range(max(t[0] for t in towers)+1):
            for y in range(max(t[1] for t in towers)+1):
                quality = 0
                for tx,ty,q in towers:
                    distance = math.hypot(x-tx,y-ty)
                    if distance <= radius:
                        quality += int(q/(1+distance))
                if quality > best:
                    best,answer = quality,[x,y]
        return answer
`,'Thử tọa độ nguyên không âm. Mỗi trạm trong bán kính đóng góp floor(q/(1+d)); quét x rồi y và chỉ cập nhật khi lớn hơn để giữ tọa độ nhỏ nhất khi hòa. Giới hạn hình: tọa độ trạm ≤12.','O(maxX·maxY·towers)','O(1)',{focus:['x','y','quality','best','answer']});
add(1622,'Fancy Sequence','design',[[['append',2],['addAll',3],['append',7],['multAll',2],['getIndex',0]]],[null,null,null,null,10],`
class Solution:
    def fancy(self, operations):
        values,answer = [],[]
        for operation in operations:
            name,value = operation
            result = None
            if name == 'append':
                values.append(value%1000000007)
            elif name == 'addAll':
                values = [(x+value)%1000000007 for x in values]
            elif name == 'multAll':
                values = [x*value%1000000007 for x in values]
            else:
                result = values[value] if 0 <= value < len(values) else -1
            answer.append(result)
        return answer
`,'Bản trực quan cập nhật trực tiếp từng ô khi addAll/multAll để thấy giá trị thật thay đổi. getIndex ngoài phạm vi trả -1; mọi phép tính lấy modulo 1e9+7.','O(operations·sequence length)','O(sequence+operations)',{description:'Direct teaching implementation; operations update every stored value.',focus:['values','operation','answer']});
add(1623,'All Valid Triplets That Can Represent a Country','sql',[[{student_id:1,student_name:'A'}],[{student_id:2,student_name:'B'},{student_id:1,student_name:'C'}],[{student_id:3,student_name:'D'}]],[{member_A:'A',member_B:'B',member_C:'D'}],`
class Solution:
    def validTriplets(self, schoolA, schoolB, schoolC):
        answer = []
        for a in schoolA:
            for b in schoolB:
                for c in schoolC:
                    ids = {a['student_id'],b['student_id'],c['student_id']}
                    names = {a['student_name'],b['student_name'],c['student_name']}
                    if len(ids) == len(names) == 3:
                        answer.append({'member_A':a['student_name'],'member_B':b['student_name'],'member_C':c['student_name']})
        return answer
`,'CROSS JOIN ba trường rồi giữ bộ ba có ba ID khác nhau và ba tên khác nhau. Hai điều kiện độc lập đều phải đúng.','O(A·B·C)','O(result)');
add(1624,'Largest Substring Between Two Equal Characters','string',['abca'],2,`
class Solution:
    def maxLengthBetweenEqualCharacters(self, s):
        first,answer = {},-1
        for i,char in enumerate(s):
            if char in first:
                answer = max(answer,i-first[char]-1)
            else:
                first[char] = i
        return answer
`,'Lưu lần xuất hiện đầu của mỗi chữ để đoạn ở giữa dài nhất. Hai đầu không thuộc đoạn nên độ dài là i-first-1.','O(n)','O(alphabet)');
add(1625,'Lexicographically Smallest String After Applying Operations','graph',['5525',9,2],'2050',`
class Solution:
    def findLexSmallestString(self, s, a, b):
        assert len(s) <= 8
        seen,queue,answer = {s},[s],s
        for state in queue:
            answer = min(answer,state)
            added = ''.join(str((int(c)+a)%10) if i%2 else c for i,c in enumerate(state))
            rotated = state[-b:]+state[:-b] if b else state
            for nextState in (added,rotated):
                if nextState not in seen:
                    seen.add(nextState)
                    queue.append(nextState)
        return answer
`,'Xem mỗi chuỗi là một trạng thái đồ thị. Hai cạnh là cộng a vào vị trí lẻ và quay phải b; BFS duyệt mọi trạng thái khác nhau rồi lấy chuỗi nhỏ nhất.','O(reachable states·n)','O(reachable states·n)',{traceOptions:{maxEvents:12000,summarizeLocals:{seen:12,queue:12}},focus:['state','added','rotated','answer']});
add(1626,'Best Team With No Conflicts','dp',[[1,3,5,10,15],[1,2,3,4,5]],34,`
class Solution:
    def bestTeamScore(self, scores, ages):
        players = sorted(zip(ages,scores))
        dp = [score for age,score in players]
        for i in range(len(players)):
            for j in range(i):
                if players[j][1] <= players[i][1]:
                    dp[i] = max(dp[i],dp[j]+players[i][1])
        return max(dp,default=0)
`,'Sắp theo tuổi, rồi theo điểm khi cùng tuổi. Một đội không xung đột tương ứng dãy điểm không giảm; DP[i] là tổng tốt nhất kết thúc tại cầu thủ i.','O(n²)','O(n)');
add(1628,'Design an Expression Tree With Evaluate Function','tree',[['3','4','+','2','*','7','/']],2,`
class Solution:
    def evaluateTree(self, postfix):
        stack = []
        for token in postfix:
            node = TreeNode(token)
            if token in ('+','-','*','/'):
                node.right = stack.pop()
                node.left = stack.pop()
            stack.append(node)
        root = stack[0]
        def evaluate(node):
            if node.val.lstrip('-').isdigit():
                return int(node.val)
            left,right = evaluate(node.left),evaluate(node.right)
            if node.val == '+':
                return left+right
            if node.val == '-':
                return left-right
            if node.val == '*':
                return left*right
            return (abs(left)//abs(right))*(-1 if (left < 0) != (right < 0) else 1)
        return evaluate(root)
`,'Tạo node cho từng token hậu tố. Toán tử lấy cây con phải rồi cây con trái từ stack để nối thành cây mới. Sau khi xây xong, evaluate đi hậu tự và tính giá trị các cây con; phép chia làm tròn về 0.','O(tokens)','O(tokens)',{focus:['postfix','stack','root','node','left','right']});
add(1629,'Slowest Key','array',[[9,29,49,50],'cbcd'],'c',`
class Solution:
    def slowestKey(self, releaseTimes, keysPressed):
        previous,best,answer = 0,-1,''
        for time,key in zip(releaseTimes,keysPressed):
            duration = time-previous
            if (duration,key) > (best,answer):
                best,answer = duration,key
            previous = time
        return answer
`,'Thời gian giữ phím là hiệu hai lần thả liên tiếp, phím đầu tính từ 0. So cặp (thời gian,ký tự) để hòa thời gian chọn chữ lớn hơn.','O(n)','O(1)');
add(1630,'Arithmetic Subarrays','array',[[4,6,5,9,3,7],[0,0,2],[2,3,5]],[true,false,true],`
class Solution:
    def checkArithmeticSubarrays(self, nums, l, r):
        answer = []
        for left,right in zip(l,r):
            ordered = sorted(nums[left:right+1])
            difference = ordered[1]-ordered[0]
            valid = all(ordered[i]-ordered[i-1] == difference for i in range(2,len(ordered)))
            answer.append(valid)
        return answer
`,'Mỗi truy vấn lấy đoạn đóng [l,r], sắp xếp bản sao và kiểm tra mọi khoảng cách kề nhau bằng nhau. Mảng gốc giữ nguyên.','O(queries·n log n)','O(n+queries)');
add(1633,'Percentage of Users Attended a Contest','sql',[[{user_id:1},{user_id:2},{user_id:3}],[{contest_id:10,user_id:1},{contest_id:10,user_id:2},{contest_id:20,user_id:1}]],[{contest_id:10,percentage:66.67},{contest_id:20,percentage:33.33}],`
class Solution:
    def contestPercentages(self, users, register):
        from decimal import Decimal,ROUND_HALF_UP
        counts = {}
        for row in register:
            counts.setdefault(row['contest_id'],set()).add(row['user_id'])
        answer = []
        for contest,people in counts.items():
            percentage = float((Decimal(100)*len(people)/len(users)).quantize(Decimal('0.01'),rounding=ROUND_HALF_UP))
            answer.append({'contest_id':contest,'percentage':percentage})
        return sorted(answer,key=lambda r:(-r['percentage'],r['contest_id']))
`,'Mẫu số là tổng tất cả người dùng, không phải tổng lượt đăng ký. Làm tròn hai chữ số rồi xếp tỷ lệ giảm dần, ID tăng dần khi hòa.','O(rows+contests log contests)','O(rows)');
add(1634,'Add Two Polynomials Represented as Linked Lists','list',[[[1,1]],[[1,0]]],[[1,1],[1,0]],`
class Solution:
    def addPoly(self, poly1, poly2):
        i,j,answer = 0,0,[]
        while i < len(poly1) or j < len(poly2):
            if j == len(poly2) or i < len(poly1) and poly1[i][1] > poly2[j][1]:
                coefficient,power = poly1[i]
                i += 1
            elif i == len(poly1) or poly2[j][1] > poly1[i][1]:
                coefficient,power = poly2[j]
                j += 1
            else:
                coefficient,power = poly1[i][0]+poly2[j][0],poly1[i][1]
                i,j = i+1,j+1
            if coefficient:
                answer.append([coefficient,power])
        return answer
`,'Danh sách hạng tử nhập [hệ số,số mũ] theo số mũ giảm dần. Hai con trỏ trộn các hạng; số mũ bằng nhau thì cộng hệ số và bỏ hạng tổng bằng 0.','O(n+m)','O(n+m)',{focus:['poly1','poly2','i','j','answer']});
add(1635,'Hopper Company Queries I','sql',[[{driver_id:1,join_date:'2019-12-01'},{driver_id:2,join_date:'2020-02-01'}],[{ride_id:1,requested_at:'2020-01-02'}],[{ride_id:1,driver_id:1}] ],Array.from({length:12},(_,i)=>({month:i+1,active_drivers:i?2:1,accepted_rides:i?0:1})),`
class Solution:
    def hopper(self, drivers, rides, accepted):
        acceptedIds = {r['ride_id'] for r in accepted}
        answer = []
        for month in range(1,13):
            end = '2020-'+str(month).zfill(2)
            active = sum(d['join_date'][:7] <= end for d in drivers)
            count = sum(r['requested_at'][:7] == end and r['ride_id'] in acceptedIds for r in rides)
            answer.append({'month':month,'active_drivers':active,'accepted_rides':count})
        return answer
`,'Sinh đủ 12 tháng kể cả tháng không có chuyến. active_drivers là lũy kế đến cuối tháng; accepted_rides chỉ đếm chuyến được nhận trong riêng tháng đó.','O(12·(drivers+rides))','O(accepted+12)');
add(1636,'Sort Array by Increasing Frequency','array',[[1,1,2,2,2,3]],[3,1,1,2,2,2],`
class Solution:
    def frequencySort(self, nums):
        from collections import Counter
        counts = Counter(nums)
        ordered = sorted(nums,key=lambda value:(counts[value],-value))
        return ordered
`,'Khóa sắp xếp gồm tần suất tăng dần, rồi giá trị giảm dần. Dùng -value ở khóa thứ hai để xử lý trường hợp đồng tần suất.','O(n log n)','O(n)');
add(1637,'Widest Vertical Area Between Two Points Containing No Points','math',[[[8,7],[9,9],[7,4],[9,7]]],1,`
class Solution:
    def maxWidthOfVerticalArea(self, points):
        xs = sorted(x for x,y in points)
        answer = 0
        for i in range(1,len(xs)):
            answer = max(answer,xs[i]-xs[i-1])
        return answer
`,'Dải dọc chỉ phụ thuộc tọa độ x; y không ảnh hưởng. Khoảng trống rộng nhất nằm giữa hai tọa độ x kề nhau sau sắp xếp.','O(n log n)','O(n)');
add(1638,'Count Substrings That Differ by One Character','dp',['aba','baba'],6,`
class Solution:
    def countSubstrings(self, s, t):
        answer = 0
        for i in range(len(s)):
            for j in range(len(t)):
                differences,k = 0,0
                while i+k < len(s) and j+k < len(t):
                    differences += s[i+k] != t[j+k]
                    if differences > 1:
                        break
                    answer += differences == 1
                    k += 1
        return answer
`,'Cố định hai điểm bắt đầu rồi kéo dài đồng thời. Đếm khi có đúng một vị trí khác; dừng ngay khi khác hai vị trí vì kéo dài nữa không thể hợp lệ.','O(nm·min(n,m))','O(1)');
add(1640,'Check Array Formation Through Concatenation','array',[[85],[[85]]],true,`
class Solution:
    def canFormArray(self, arr, pieces):
        byFirst = {piece[0]:piece for piece in pieces}
        i = 0
        while i < len(arr):
            piece = byFirst.get(arr[i])
            if piece is None or arr[i:i+len(piece)] != piece:
                return False
            i += len(piece)
        return True
`,'Mỗi giá trị chỉ xuất hiện một lần theo đề nên phần tử đầu xác định duy nhất piece cần dùng. So cả piece rồi nhảy qua; được đổi thứ tự pieces nhưng không đảo bên trong piece.','O(n+pieces)','O(pieces)');
add(1641,'Count Sorted Vowel Strings','dp',[2],15,`
class Solution:
    def countVowelStrings(self, n):
        dp = [1]*5
        for length in range(2,n+1):
            for vowel in range(3,-1,-1):
                dp[vowel] += dp[vowel+1]
        return sum(dp)
`,'dp[v] đếm chuỗi bắt đầu bằng nguyên âm v. Với độ dài mới, phần sau chỉ được dùng v hoặc nguyên âm lớn hơn; tổng hậu tố được cập nhật từ phải sang trái.','O(5n)','O(5)');
add(1642,'Furthest Building You Can Reach','greedy',[[4,2,7,6,9,14,12],5,1],4,`
class Solution:
    def furthestBuilding(self, heights, bricks, ladders):
        import heapq
        climbs = []
        for i in range(len(heights)-1):
            difference = heights[i+1]-heights[i]
            if difference > 0:
                heapq.heappush(climbs,difference)
                if len(climbs) > ladders:
                    bricks -= heapq.heappop(climbs)
                if bricks < 0:
                    return i
        return len(heights)-1
`,'Tạm dành thang cho mọi bước leo. Nếu số bước vượt số thang, trả bước leo nhỏ nhất bằng gạch; như vậy thang luôn dành cho các khoảng cao nhất đã gặp.','O(n log n)','O(n)',{focus:['heights','climbs','bricks','difference','i']});
add(1643,'Kth Smallest Instructions','math',[[2,3],1],'HHHVV',`
class Solution:
    def kthSmallestPath(self, destination, k):
        from math import comb
        vertical,horizontal = destination
        answer = ''
        while vertical or horizontal:
            withH = comb(vertical+horizontal-1,vertical) if horizontal else 0
            if k <= withH:
                answer += 'H'
                horizontal -= 1
            else:
                answer += 'V'
                vertical -= 1
                k -= withH
        return answer
`,'H đứng trước V theo từ điển. Đếm số đường bắt đầu bằng H bằng tổ hợp; nếu k vượt nhóm đó, bỏ cả nhóm và chọn V.','O(row+col) combination calls','O(row+col)');
add(1645,'Hopper Company Queries II','sql',[[{driver_id:1,join_date:'2019-01-01'},{driver_id:2,join_date:'2020-01-01'}],[{ride_id:1,requested_at:'2020-01-02'}],[{ride_id:1,driver_id:1}] ],Array.from({length:12},(_,i)=>({month:i+1,working_percentage:i?0:50})),`
class Solution:
    def workingDrivers(self, drivers, rides, accepted):
        from decimal import Decimal,ROUND_HALF_UP
        dates = {r['ride_id']:r['requested_at'][:7] for r in rides}
        answer = []
        for month in range(1,13):
            period = '2020-'+str(month).zfill(2)
            active = {d['driver_id'] for d in drivers if d['join_date'][:7] <= period}
            working = {a['driver_id'] for a in accepted if dates[a['ride_id']] == period}
            ratio = Decimal(100)*len(working)/len(active) if active else Decimal(0)
            answer.append({'month':month,'working_percentage':float(ratio.quantize(Decimal('0.01'),rounding=ROUND_HALF_UP))})
        return answer
`,'Mẫu số là tài xế đã gia nhập đến cuối tháng. Mẫu số tử là số tài xế khác nhau có chuyến được nhận trong tháng, không phải số chuyến; không có tài xế thì 0%.','O(12·(drivers+accepted)+rides)','O(drivers+rides)');
add(1646,'Get Maximum in Generated Array','array',[7],3,`
class Solution:
    def getMaximumGenerated(self, n):
        nums = [0]*(n+1)
        if n:
            nums[1] = 1
        for i in range(2,n+1):
            nums[i] = nums[i//2] if i%2 == 0 else nums[i//2]+nums[i//2+1]
        return max(nums)
`,'Sinh mảng từ trái sang phải. Chỉ số chẵn sao chép nums[i/2], chỉ số lẻ cộng hai ô ở nửa chỉ số; mọi phụ thuộc đều đã tính.','O(n)','O(n)');
add(1647,'Minimum Deletions to Make Character Frequencies Unique','greedy',['aaabbbcc'],2,`
class Solution:
    def minDeletions(self, s):
        from collections import Counter
        used,answer = set(),0
        for frequency in sorted(Counter(s).values(),reverse=True):
            while frequency and frequency in used:
                frequency -= 1
                answer += 1
            if frequency:
                used.add(frequency)
        return answer
`,'Xử lý tần suất lớn trước. Nếu một tần suất đã dùng, xóa dần tới tần suất dương chưa dùng hoặc 0; tần suất 0 không cần duy nhất.','O(n+alphabet log alphabet)','O(alphabet)');
add(1648,'Sell Diminishing-Valued Colored Balls','greedy',[[2,5],4],14,`
class Solution:
    def maxProfit(self, inventory, orders):
        levels = sorted(inventory,reverse=True)+[0]
        answer = 0
        for i in range(len(levels)-1):
            high,low,count = levels[i],levels[i+1],i+1
            take = min(orders,(high-low)*count)
            whole,remainder = divmod(take,count)
            answer += count*(high+high-whole+1)*whole//2+remainder*(high-whole)
            orders -= take
            if orders == 0:
                break
        return answer%1000000007
`,'Bán theo tầng giá từ cao xuống. Khi count màu cùng độ cao, mỗi tầng bán count quả; dùng tổng cấp số cộng cho whole tầng và bán remainder quả ở tầng kế.','O(colors log colors)','O(colors)',{focus:['levels','high','low','count','whole','remainder','answer']});
add(1651,'Hopper Company Queries III','sql',[[{ride_id:1,requested_at:'2020-01-02'}],[{ride_id:1,ride_distance:30,ride_duration:60}]],Array.from({length:10},(_,i)=>({month:i+1,average_ride_distance:i?0:10,average_ride_duration:i?0:20})),`
class Solution:
    def rollingRides(self, rides, accepted):
        from decimal import Decimal,ROUND_HALF_UP
        dates = {r['ride_id']:r['requested_at'] for r in rides}
        distance,duration = [0]*13,[0]*13
        for row in accepted:
            date = dates[row['ride_id']]
            if date[:4] == '2020':
                month = int(date[5:7])
                distance[month] += row['ride_distance']
                duration[month] += row['ride_duration']
        answer = []
        for month in range(1,11):
            d = (Decimal(sum(distance[month:month+3]))/3).quantize(Decimal('0.01'),rounding=ROUND_HALF_UP)
            t = (Decimal(sum(duration[month:month+3]))/3).quantize(Decimal('0.01'),rounding=ROUND_HALF_UP)
            answer.append({'month':month,'average_ride_distance':float(d),'average_ride_duration':float(t)})
        return answer
`,'Cộng quãng đường/thời gian theo tháng, rồi mỗi hàng lấy cửa sổ ba tháng bắt đầu tại month. Chia cho 3 tháng, kể cả tháng không có chuyến; trả tháng 1 đến 10.','O(rides+accepted+12)','O(rides+12)',{focus:['distance','duration','month','answer']});
add(1652,'Defuse the Bomb','array',[[5,7,1,4],3],[12,10,16,13],`
class Solution:
    def decrypt(self, code, k):
        answer,n = [],len(code)
        for i in range(n):
            direction = 1 if k > 0 else -1
            total = 0
            for offset in range(1,abs(k)+1):
                total += code[(i+direction*offset)%n]
            answer.append(total)
        return answer
`,'k dương cộng k ô kế tiếp, k âm cộng |k| ô trước. Modulo n quấn vòng; đọc từ mảng gốc để mọi ô được thay cùng lúc.','O(n·|k|)','O(n)');
add(1654,'Minimum Jumps to Reach Home','graph',[[14,4,18,1,15],3,15,9],3,`
class Solution:
    def minimumJumps(self, forbidden, a, b, x):
        limit = max([x]+forbidden)+a+b
        banned,seen,queue = set(forbidden),{(0,False)},[(0,False,0)]
        for position,back,distance in queue:
            if position == x:
                return distance
            for nextPosition,nextBack in ((position+a,False),(position-b,True)):
                state = (nextPosition,nextBack)
                if 0 <= nextPosition <= limit and nextPosition not in banned and not (back and nextBack) and state not in seen:
                    seen.add(state)
                    queue.append((nextPosition,nextBack,distance+1))
        return -1
`,'BFS cần trạng thái (vị trí,lần trước nhảy lùi?) vì không được lùi hai lần liên tiếp. Ô bị cấm và vị trí âm không được vào; giới hạn trên đủ để quay về đích.','O(max forbidden+x+a+b)','O(max forbidden+x+a+b)',{focus:['position','back','distance','nextPosition'],traceOptions:{summarizeLocals:{queue:15,seen:15}}});
add(1656,'Design an Ordered Stream','design',[5,[[3,'ccccc'],[1,'aaaaa'],[2,'bbbbb'],[5,'eeeee'],[4,'ddddd']]],[[],['aaaaa'],['bbbbb','ccccc'],[],['ddddd','eeeee']],`
class Solution:
    def orderedStream(self, n, insertions):
        values,pointer,answer = [None]*n,0,[]
        for identifier,value in insertions:
            values[identifier-1] = value
            chunk = []
            while pointer < n and values[pointer] is not None:
                chunk.append(values[pointer])
                pointer += 1
            answer.append(chunk)
        return answer
`,'pointer luôn chỉ ID nhỏ nhất chưa xuất. Sau mỗi insert, chỉ nhả đoạn liên tiếp bắt đầu tại pointer; phần tử đến sớm ở xa phải chờ lấp chỗ trống.','O(n+insertions)','O(n)',{focus:['values','pointer','chunk','answer']});
add(1659,'Maximize Grid Happiness','dp',[1,2,1,1],150,`
class Solution:
    def getMaxGridHappiness(self, m, n, introvertsCount, extrovertsCount):
        from functools import lru_cache
        assert m*n <= 9
        @lru_cache(None)
        def visit(position,mask,intro,extro):
            if position == m*n:
                return 0
            row,col = divmod(position,n)
            above = mask//(3**(n-1))
            left = mask%3 if col else 0
            nextMask = mask%(3**(n-1))*3
            answer = visit(position+1,nextMask,intro,extro)
            for kind,remaining in ((1,intro),(2,extro)):
                if remaining:
                    gain = 120 if kind == 1 else 40
                    for neighbor in (left,above):
                        if neighbor:
                            gain += (-30 if kind == 1 else 20)+(-30 if neighbor == 1 else 20)
                    answer = max(answer,gain+visit(position+1,nextMask+kind,intro-(kind == 1),extro-(kind == 2)))
            return answer
        return visit(0,0,introvertsCount,extrovertsCount)
`,'Điền từng ô với 0=trống, 1=hướng nội, 2=hướng ngoại. Mask cơ số 3 lưu hàng gần nhất; chỉ tính cạnh trái và trên để mỗi quan hệ được cộng một lần, gồm thay đổi hạnh phúc của cả hai người. Giới hạn hình: tối đa 9 ô.','O(mn·3^n·intro·extro)','O(mn·3^n·intro·extro)',{focus:['row','col','mask','kind','gain','answer']});
add(1660,'Correct a Binary Tree','tree',[[1,2,3],2,3],[1,null,3],`
class Solution:
    def correctBinaryTree(self, values, badValue, targetValue):
        root = _tree(values)
        nodes,queue = {},[root]
        for node in queue:
            nodes[node.val] = node
            queue.extend(child for child in (node.left,node.right) if child)
        nodes[badValue].right = nodes[targetValue]
        seen = set()
        def repair(node):
            if not node or node.right in seen:
                return None
            seen.add(node)
            node.right = repair(node.right)
            node.left = repair(node.left)
            return node
        return _tree_values(repair(root))
`,'Nhập cây hợp lệ và hai giá trị để tạo con trỏ right sai sang node cùng tầng ở bên phải. DFS phải trước trái: nếu right đã được thăm, node hiện tại là node hỏng và toàn bộ nhánh của nó bị cắt.','O(n)','O(n)',{focus:['root','node','seen'],description:'The malformed right edge is constructed from badValue to targetValue after loading the tree.'});
add(1661,'Average Time of Process per Machine','sql',[[{machine_id:0,process_id:0,activity_type:'start',timestamp:0.5},{machine_id:0,process_id:0,activity_type:'end',timestamp:1.5},{machine_id:0,process_id:1,activity_type:'start',timestamp:2},{machine_id:0,process_id:1,activity_type:'end',timestamp:4}]],[{machine_id:0,processing_time:1.5}],`
class Solution:
    def averageTime(self, activity):
        from decimal import Decimal,ROUND_HALF_UP
        starts,totals,counts = {},{},{}
        for row in activity:
            key = (row['machine_id'],row['process_id'])
            if row['activity_type'] == 'start':
                starts[key] = Decimal(str(row['timestamp']))
        for row in activity:
            if row['activity_type'] == 'end':
                machine = row['machine_id']
                elapsed = Decimal(str(row['timestamp']))-starts[machine,row['process_id']]
                totals[machine] = totals.get(machine,Decimal(0))+elapsed
                counts[machine] = counts.get(machine,0)+1
        return [{'machine_id':m,'processing_time':float((totals[m]/counts[m]).quantize(Decimal('0.001'),rounding=ROUND_HALF_UP))} for m in sorted(totals)]
`,'Ghép start/end theo cả machine_id và process_id, bất kể thứ tự hàng. Lấy tổng thời gian chia số tiến trình của mỗi máy rồi làm tròn ba chữ số.','O(rows+machines log machines)','O(rows)');
add(1663,'Smallest String With A Given Numeric Value','greedy',[3,27],'aay',`
class Solution:
    def getSmallestString(self, n, k):
        values = [1]*n
        extra = k-n
        for i in range(n-1,-1,-1):
            add = min(25,extra)
            values[i] += add
            extra -= add
        return ''.join(chr(96+value) for value in values)
`,'Khởi đầu mọi chữ là a để đủ độ dài. Dồn phần giá trị dư vào bên phải trước, tối đa 25 mỗi ô, để prefix càng nhỏ càng tốt.','O(n)','O(n)');
add(1664,'Ways to Make a Fair Array','array',[[2,1,6,4]],1,`
class Solution:
    def waysToMakeFair(self, nums):
        right = [sum(nums[::2]),sum(nums[1::2])]
        left,answer = [0,0],0
        for i,value in enumerate(nums):
            right[i%2] -= value
            even,odd = left[0]+right[1],left[1]+right[0]
            answer += even == odd
            left[i%2] += value
        return answer
`,'Khi xóa ô i, mọi chỉ số bên phải đổi chẵn/lẻ, bên trái giữ nguyên. Bỏ ô hiện tại khỏi right, ghép trái-chẵn với phải-lẻ để tính tổng mới.','O(n)','O(1)');
add(1665,'Minimum Initial Energy to Finish Tasks','greedy',[[[1,2],[2,4],[4,8]]],8,`
class Solution:
    def minimumEffort(self, tasks):
        ordered = sorted(tasks,key=lambda task:task[1]-task[0],reverse=True)
        energy,initial = 0,0
        for actual,minimum in ordered:
            if energy < minimum:
                initial += minimum-energy
                energy = minimum
            energy -= actual
        return initial
`,'Ưu tiên nhiệm vụ có khoảng cách minimum-actual lớn để tận dụng ngưỡng năng lượng cao trước. Chỉ nạp thêm đúng lượng thiếu khi không đạt minimum.','O(n log n)','O(n)');
add(1666,'Change the Root of a Binary Tree','tree',[[1,2,3,4],4],[4,2,null,1,null,null,3],`
class Solution:
    def flipBinaryTree(self, values, leafValue):
        root = _tree(values)
        parent,queue = {root:None},[root]
        for node in queue:
            for child in (node.left,node.right):
                if child:
                    parent[child] = node
                    queue.append(child)
        leaf = next(node for node in queue if node.val == leafValue)
        assert not leaf.left and not leaf.right
        node,child = leaf,None
        while node:
            oldParent = parent[node]
            if node.left is child:
                node.left = None
            elif node.right is child:
                node.right = None
            if oldParent:
                if node.left:
                    node.right = node.left
                node.left = oldParent
            child,node = node,oldParent
        return _tree_values(leaf)
`,'Đi từ lá mới lên gốc cũ, đảo từng cạnh cha thành con trái. Nếu node đã có con trái ngoài đường đi, chuyển nó sang phải trước; xóa con trỏ về node vừa đi qua để tránh chu trình.','O(n)','O(n)',{focus:['leaf','node','oldParent','child']});
add(1667,'Fix Names in a Table','sql',[[{user_id:1,name:'aLice'},{user_id:2,name:'bOB'}]],[{user_id:1,name:'Alice'},{user_id:2,name:'Bob'}],`
class Solution:
    def fixNames(self, users):
        answer = []
        for user in sorted(users,key=lambda u:u['user_id']):
            name = user['name']
            answer.append({'user_id':user['user_id'],'name':name[:1].upper()+name[1:].lower()})
        return answer
`,'Chỉ chữ đầu viết hoa, toàn bộ phần còn lại viết thường. Xếp kết quả theo user_id, không theo tên mới.','O(characters+users log users)','O(characters)');
add(1668,'Maximum Repeating Substring','string',['ababc','ab'],2,`
class Solution:
    def maxRepeating(self, sequence, word):
        k = 0
        while word*(k+1) in sequence:
            k += 1
        return k
`,'Kiểm tra word lặp liên tiếp k+1 lần có là một đoạn con hay không. Khi lần kế tiếp không tồn tại thì mọi số lần lớn hơn cũng không thể có.','O(sequence²)','O(sequence)');
add(1669,'Merge In Between Linked Lists','list',[[0,1,2,3,4,5],3,4,[1000000,1000001,1000002]],[0,1,2,1000000,1000001,1000002,5],`
class Solution:
    def mergeInBetween(self, list1, a, b, list2):
        dummy = ListNode(0,list1)
        before = dummy
        for i in range(a):
            before = before.next
        after = before.next
        for i in range(b-a+1):
            after = after.next
        before.next = list2
        tail = list2
        while tail.next:
            tail = tail.next
        tail.next = after
        return dummy.next
`,'Giữ node trước a và node sau b. Nối node trước a vào đầu list2, rồi nối đuôi list2 với node sau b; đoạn [a,b] bị bỏ khỏi đường đi.','O(n+m)','O(1)',{kinds:['list',null,null,'list'],answerKind:'list',focus:['before','after','tail','list2']});
add(1671,'Minimum Number of Removals to Make Mountain Array','dp',[[2,1,1,5,6,2,3,1]],3,`
class Solution:
    def minimumMountainRemovals(self, nums):
        n = len(nums)
        up,down = [1]*n,[1]*n
        for i in range(n):
            for j in range(i):
                if nums[j] < nums[i]:
                    up[i] = max(up[i],up[j]+1)
        for i in range(n-1,-1,-1):
            for j in range(i+1,n):
                if nums[j] < nums[i]:
                    down[i] = max(down[i],down[j]+1)
        longest = max((up[i]+down[i]-1 for i in range(n) if up[i] > 1 and down[i] > 1),default=0)
        return n-longest
`,'Tính dãy tăng kết thúc tại i và dãy giảm bắt đầu tại i. Đỉnh núi phải có cả hai phía dài hơn 1; cộng hai chiều rồi trừ đỉnh bị đếm đôi.','O(n²)','O(n)');
add(1672,'Richest Customer Wealth','array',[[[1,2,3],[3,2,1]]],6,`
class Solution:
    def maximumWealth(self, accounts):
        answer = 0
        for row in accounts:
            wealth = sum(row)
            answer = max(answer,wealth)
        return answer
`,'Mỗi hàng là tài khoản của một khách. Cộng từng hàng rồi giữ tổng lớn nhất, không so riêng từng ô.','O(rows·cols)','O(1)');
add(1674,'Minimum Moves to Make Array Complementary','array',[[1,2,4,3],4],1,`
class Solution:
    def minMoves(self, nums, limit):
        assert limit <= 35
        changes = [0]*(2*limit+3)
        for i in range(len(nums)//2):
            a,b = sorted((nums[i],nums[-1-i]))
            changes[2] += 2
            changes[a+1] -= 1
            changes[a+b] -= 1
            changes[a+b+1] += 1
            changes[b+limit+1] += 1
        moves,answer = 0,len(nums)
        for total in range(2,2*limit+1):
            moves += changes[total]
            answer = min(answer,moves)
        return answer
`,'Mỗi cặp đối xứng mặc định cần 2 đổi. Tổng trong [min+1,max+limit] chỉ cần 1 đổi, tổng hiện tại cần 0. Mảng hiệu cộng các khoảng chi phí rồi quét mọi tổng chung.','O(n+limit)','O(limit)',{focus:['changes','total','moves','answer']});
add(1675,'Minimize Deviation in Array','greedy',[[1,2,3,4]],1,`
class Solution:
    def minimumDeviation(self, nums):
        import heapq
        values = [x*2 if x%2 else x for x in nums]
        minimum = min(values)
        heap = [-x for x in values]
        heapq.heapify(heap)
        answer = -heap[0]-minimum
        while -heap[0]%2 == 0:
            maximum = -heapq.heappop(heap)
            half = maximum//2
            minimum = min(minimum,half)
            heapq.heappush(heap,-half)
            answer = min(answer,-heap[0]-minimum)
        return answer
`,'Đưa mọi số lên giá trị lớn nhất có thể bằng nhân đôi số lẻ. Sau đó chỉ có phép giảm số chẵn; luôn giảm phần tử lớn nhất và theo dõi min để thu hẹp độ lệch.','O(n log n·log max)','O(n)');
add(1677,'Products Worth Over Invoices','sql',[[{product_id:1,name:'Tea'},{product_id:2,name:'Cake'}],[{product_id:1,rest:2,paid:3,canceled:4,refunded:5}]],[{name:'Cake',rest:0,paid:0,canceled:0,refunded:0},{name:'Tea',rest:2,paid:3,canceled:4,refunded:5}],`
class Solution:
    def invoiceTotals(self, products, invoices):
        totals = {p['product_id']:{key:0 for key in ('rest','paid','canceled','refunded')} for p in products}
        for invoice in invoices:
            for key in totals[invoice['product_id']]:
                totals[invoice['product_id']][key] += invoice[key]
        return [dict(name=p['name'],**totals[p['product_id']]) for p in sorted(products,key=lambda p:p['name'])]
`,'LEFT JOIN giữ cả sản phẩm chưa có hóa đơn. Cộng riêng rest/paid/canceled/refunded và thay các tổng thiếu bằng 0; xếp theo tên sản phẩm.','O(invoices+products log products)','O(products)');
add(1679,'Max Number of K-Sum Pairs','array',[[1,2,3,4],5],2,`
class Solution:
    def maxOperations(self, nums, k):
        waiting,answer = {},0
        for value in nums:
            other = k-value
            if waiting.get(other,0):
                waiting[other] -= 1
                answer += 1
            else:
                waiting[value] = waiting.get(value,0)+1
        return answer
`,'Mỗi số mới ghép ngay với một k-value chưa dùng nếu có. Giảm bộ đếm người ghép để không tái sử dụng một phần tử trong hai cặp.','O(n)','O(n)');
add(1680,'Concatenation of Consecutive Binary Numbers','bits',[3],27,`
class Solution:
    def concatenatedBinary(self, n):
        answer = 0
        for value in range(1,n+1):
            width = value.bit_length()
            answer = ((answer<<width)|value)%1000000007
        return answer
`,'Nối nhị phân value bằng cách dịch kết quả sang trái đúng số bit của value rồi OR value vào phần trống. Lấy modulo sau mỗi lần nối.','O(n log n)','O(1)');
add(1681,'Minimum Incompatibility','dp',[[1,2,1,4],2],4,`
class Solution:
    def minimumIncompatibility(self, nums, k):
        from functools import lru_cache
        from itertools import combinations
        n,size = len(nums),len(nums)//k
        assert n <= 10 and n%k == 0
        @lru_cache(None)
        def visit(mask):
            if mask == (1<<n)-1:
                return 0
            first = next(i for i in range(n) if not mask>>i&1)
            answer = float('inf')
            rest = [i for i in range(first+1,n) if not mask>>i&1]
            for extra in combinations(rest,size-1):
                group = (first,)+extra
                values = [nums[i] for i in group]
                if len(set(values)) == size:
                    nextMask = mask|sum(1<<i for i in group)
                    answer = min(answer,max(values)-min(values)+visit(nextMask))
            return answer
        answer = visit(0)
        return -1 if answer == float('inf') else answer
`,'Mask đánh dấu phần tử đã chia nhóm. Nhóm tiếp theo bắt buộc chứa phần tử chưa dùng đầu tiên để tránh hoán vị các nhóm; trong nhóm không được trùng giá trị.','O(3^n·n)','O(2^n)',{focus:['mask','group','values','answer']});
add(1683,'Invalid Tweets','sql',[[{tweet_id:1,content:'Vote for Biden'},{tweet_id:2,content:'Let us make America great again!'}]],[{tweet_id:2}],`
class Solution:
    def invalidTweets(self, tweets):
        answer = []
        for tweet in tweets:
            length = len(tweet['content'])
            if length > 15:
                answer.append({'tweet_id':tweet['tweet_id']})
        return answer
`,'Đếm ký tự nội dung và chỉ giữ tweet có độ dài lớn hơn 15. Đúng 15 vẫn hợp lệ.','O(total characters)','O(result)');
add(1684,'Count the Number of Consistent Strings','string',['ab',['ad','bd','aaab','baa','badab']],2,`
class Solution:
    def countConsistentStrings(self, allowed, words):
        letters,answer = set(allowed),0
        for word in words:
            consistent = all(char in letters for char in word)
            answer += consistent
        return answer
`,'Set allowed cho phép kiểm tra từng chữ. Một từ được tính chỉ khi tất cả chữ thuộc set; chữ lặp trong từ không gây vấn đề.','O(total characters)','O(alphabet)');
add(1685,'Sum of Absolute Differences in a Sorted Array','array',[[2,3,5]],[4,3,5],`
class Solution:
    def getSumAbsoluteDifferences(self, nums):
        total,left,answer = sum(nums),0,[]
        for i,value in enumerate(nums):
            right = total-left-value
            difference = value*i-left+right-value*(len(nums)-i-1)
            answer.append(difference)
            left += value
        return answer
`,'Mảng đã tăng dần nên bên trái đóng góp value·count-sum, bên phải đóng góp sum-value·count. Prefix sum tính hai phần mà không cần abs từng cặp.','O(n)','O(n)');
add(1686,'Stone Game VI','greedy',[[1,3],[2,1]],1,`
class Solution:
    def stoneGameVI(self, aliceValues, bobValues):
        order = sorted(range(len(aliceValues)),key=lambda i:aliceValues[i]+bobValues[i],reverse=True)
        alice,bob = 0,0
        for turn,i in enumerate(order):
            if turn%2 == 0:
                alice += aliceValues[i]
            else:
                bob += bobValues[i]
        return (alice > bob)-(alice < bob)
`,'Chọn viên đá vừa thu điểm cho mình vừa tước điểm đối thủ, nên ưu tiên tổng hai giá trị. Sau sắp xếp, chia lượt chẵn cho Alice và lẻ cho Bob.','O(n log n)','O(n)');
add(1687,'Delivering Boxes from Storage to Ports','dp',[[[1,1],[2,1],[1,1]],2,3,3],4,`
class Solution:
    def boxDelivering(self, boxes, portsCount, maxBoxes, maxWeight):
        n = len(boxes)
        dp = [0]+[float('inf')]*n
        for start in range(n):
            weight,changes = 0,0
            for end in range(start,min(n,start+maxBoxes)):
                weight += boxes[end][1]
                if weight > maxWeight:
                    break
                changes += int(end > start and boxes[end][0] != boxes[end-1][0])
                dp[end+1] = min(dp[end+1],dp[start]+2+changes)
        return dp[n]
`,'Giữ nguyên thứ tự hộp. Thử mỗi chuyến là một đoạn liên tiếp không vượt số hộp và tải trọng; chi phí = đi ra kho + các lần đổi cảng + quay về kho. DP chọn điểm kết thúc chuyến.','O(n·maxBoxes)','O(n)',{focus:['boxes','dp','start','end','weight','changes']});
add(1688,'Count of Matches in Tournament','math',[7],6,`
class Solution:
    def numberOfMatches(self, n):
        answer = 0
        while n > 1:
            matches = n//2
            answer += matches
            n = matches+n%2
        return answer
`,'Mỗi vòng ghép đôi n//2 trận, đội lẻ được đi tiếp. Mỗi trận loại một đội nên tổng cuối cùng cũng bằng n ban đầu trừ 1.','O(log n)','O(1)');
add(1689,'Partitioning Into Minimum Number Of Deci-Binary Numbers','greedy',['32'],3,`
class Solution:
    def minPartitions(self, n):
        answer = 0
        for digit in n:
            answer = max(answer,int(digit))
        return answer
`,'Mỗi số deci-binary đóng góp tối đa 1 ở mỗi hàng. Chữ số lớn nhất là cận dưới và luôn đạt được bằng xếp các lớp 0/1, nên chỉ cần tìm max digit.','O(digits)','O(1)');
add(1691,'Maximum Height by Stacking Cuboids','dp',[[[50,45,20],[95,37,53],[45,23,12]]],190,`
class Solution:
    def maxHeight(self, cuboids):
        ordered = sorted(sorted(box) for box in cuboids)
        dp = [box[2] for box in ordered]
        for i in range(len(ordered)):
            for j in range(i):
                if all(ordered[j][d] <= ordered[i][d] for d in range(3)):
                    dp[i] = max(dp[i],dp[j]+ordered[i][2])
        return max(dp,default=0)
`,'Chuẩn hóa mỗi khối bằng sắp ba chiều và dùng chiều lớn nhất làm cao. Sắp các khối rồi DP: khối trên phải không vượt khối dưới ở cả ba chiều.','O(n²)','O(n)');
add(1692,'Count Ways to Distribute Candies','dp',[3,2],3,`
class Solution:
    def waysToDistribute(self, n, k):
        dp = [[0]*(k+1) for _ in range(n+1)]
        dp[0][0] = 1
        for candies in range(1,n+1):
            for bags in range(1,min(candies,k)+1):
                dp[candies][bags] = (bags*dp[candies-1][bags]+dp[candies-1][bags-1])%1000000007
        return dp[n][k]
`,'Kẹo phân biệt, túi không phân biệt và không được rỗng. Kẹo mới hoặc vào một trong bags túi đã có, hoặc tự tạo túi mới; đây là truy hồi số Stirling loại hai.','O(nk)','O(nk)');
add(1693,'Daily Leads and Partners','sql',[[{date_id:'2020-12-08',make_name:'toyota',lead_id:0,partner_id:1},{date_id:'2020-12-08',make_name:'toyota',lead_id:0,partner_id:2}]],[{date_id:'2020-12-08',make_name:'toyota',unique_leads:1,unique_partners:2}],`
class Solution:
    def dailyCounts(self, sales):
        groups = {}
        for row in sales:
            key = (row['date_id'],row['make_name'])
            if key not in groups:
                groups[key] = [set(),set()]
            groups[key][0].add(row['lead_id'])
            groups[key][1].add(row['partner_id'])
        return [{'date_id':date,'make_name':make,'unique_leads':len(leads),'unique_partners':len(partners)} for (date,make),(leads,partners) in sorted(groups.items())]
`,'Nhóm theo cả ngày và hãng. Dùng hai set riêng để COUNT DISTINCT lead_id và partner_id; hàng trùng không làm tăng số lượng.','O(rows log rows)','O(rows)');
add(1694,'Reformat Phone Number','string',['1-23-45 6'],'123-456',`
class Solution:
    def reformatNumber(self, number):
        digits = ''.join(char for char in number if char.isdigit())
        groups = []
        while len(digits) > 4:
            groups.append(digits[:3])
            digits = digits[3:]
        if len(digits) == 4:
            groups.extend((digits[:2],digits[2:]))
        else:
            groups.append(digits)
        return '-'.join(groups)
`,'Bỏ dấu cách/gạch ngang. Chia nhóm 3 cho tới khi còn tối đa 4 chữ số; phần cuối 4 phải chia 2+2 để không tạo nhóm một chữ số.','O(digits²) slicing','O(digits)');
add(1696,'Jump Game VI','dp',[[1,-1,-2,4,-7,3],2],7,`
class Solution:
    def maxResult(self, nums, k):
        from collections import deque
        dp,queue = [nums[0]],deque([0])
        for i in range(1,len(nums)):
            while queue[0] < i-k:
                queue.popleft()
            dp.append(nums[i]+dp[queue[0]])
            while queue and dp[queue[-1]] <= dp[i]:
                queue.pop()
            queue.append(i)
        return dp[-1]
`,'DP[i] cộng nums[i] với điểm tốt nhất trong k ô trước. Deque giữ chỉ số có DP giảm dần: bỏ ô ngoài cửa sổ ở đầu, bỏ ứng viên bị ô mới lấn át ở cuối.','O(n)','O(n)',{focus:['nums','dp','queue','i']});
add(1698,'Number of Distinct Substrings in a String','string',['aabbaba'],21,`
class Solution:
    def countDistinct(self, s):
        assert len(s) <= 40
        seen = set()
        for left in range(len(s)):
            for right in range(left+1,len(s)+1):
                seen.add(s[left:right])
        return len(seen)
`,'Liệt kê từng cặp biên trái/phải và đưa đoạn con vào set. Cùng nội dung dù xuất hiện ở nhiều vị trí cũng chỉ được tính một lần. Bản hình dùng liệt kê trực tiếp thay suffix automaton.','O(n³) copied characters','O(n³)',{focus:['s','left','right','seen'],traceOptions:{summarizeLocals:{seen:20}}});
add(1699,'Number of Calls Between Two Persons','sql',[[{from_id:1,to_id:2,duration:10},{from_id:2,to_id:1,duration:20}]],[{person1:1,person2:2,call_count:2,total_duration:30}],`
class Solution:
    def callsBetween(self, calls):
        groups = {}
        for call in calls:
            pair = tuple(sorted((call['from_id'],call['to_id'])))
            count,duration = groups.get(pair,(0,0))
            groups[pair] = (count+1,duration+call['duration'])
        return [{'person1':a,'person2':b,'call_count':count,'total_duration':duration} for (a,b),(count,duration) in sorted(groups.items())]
`,'Chuẩn hóa cặp người thành (ID nhỏ,ID lớn) để hai chiều gọi vào cùng một nhóm. Cộng cả số cuộc gọi và tổng thời lượng.','O(rows+groups log groups)','O(groups)');
lessons[1659]=require('./dp-physical-replays').gridLesson(lessons[1659]);
module.exports=lessons;
