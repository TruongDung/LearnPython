"use strict";
const {defineEasy}=require('./easy-lesson');const lessons={};const add=(...args)=>{const p=defineEasy(...args);lessons[p.id]=p;};
add(1300,'Sum of Mutated Array Closest to Target','search',[[4,9,3],10],3,`
class Solution:
    def findBestValue(self, arr, target):
        left,right = 0,max(arr)
        while left < right:
            mid = (left+right+1)//2
            total = sum(min(value,mid) for value in arr)
            if total <= target:
                left = mid
            else:
                right = mid-1
        lowSum = sum(min(value,left) for value in arr)
        highSum = sum(min(value,left+1) for value in arr)
        return left if abs(lowSum-target) <= abs(highSum-target) else left+1
`,'Tổng sau khi chặn mọi số bởi cap tăng theo cap. Tìm cap lớn nhất có tổng ≤target rồi so với cap+1; hòa thì giữ cap nhỏ.','O(n log max value)','O(1)');
add(1302,'Deepest Leaves Sum','tree',[[1,2,3,4,5,null,6,7,null,null,null,null,8]],15,`
class Solution:
    def deepestLeavesSum(self, root):
        nodes = [root]
        while nodes:
            total = sum(node.val for node in nodes)
            following = [child for node in nodes for child in (node.left,node.right) if child]
            nodes = following
        return total
`,'BFS theo tầng và tính lại tổng mỗi tầng. Khi không còn tầng tiếp theo, tổng hiện tại chính là tổng các lá sâu nhất.','O(n)','O(n)',{kinds:['tree']});
add(1303,'Find the Team Size','sql',[[{employee_id:1,team_id:8},{employee_id:2,team_id:8},{employee_id:3,team_id:9}]],[{employee_id:1,team_size:2},{employee_id:2,team_size:2},{employee_id:3,team_size:1}],`
class Solution:
    def teamSize(self, employee):
        from collections import Counter
        counts = Counter(row['team_id'] for row in employee)
        return [{'employee_id':r['employee_id'],'team_size':counts[r['team_id']]} for r in employee]
`,'Đếm số thành viên theo team_id, rồi gắn lại kích thước nhóm vào từng nhân viên.','O(n)','O(n)',{difficulty:'easy'});
add(1304,'Find N Unique Integers Sum up to Zero','array',[5],[1,-1,2,-2,0],`
class Solution:
    def sumZero(self, n):
        assert 1 <= n <= 80
        answer = []
        for value in range(1,n//2+1):
            answer.extend([value,-value])
        if n%2:
            answer.append(0)
        return answer
`,'Dùng các cặp x và −x để tổng bằng 0 và không trùng; nếu n lẻ thì thêm đúng một số 0.','O(n)','O(n)',{difficulty:'easy'});
add(1305,'All Elements in Two Binary Search Trees','tree',[[2,1,4],[1,0,3]],[0,1,1,2,3,4],`
class Solution:
    def getAllElements(self, root1, root2):
        def inorder(node):
            result = []
            def visit(current):
                if current:
                    visit(current.left)
                    result.append(current.val)
                    visit(current.right)
            visit(node)
            return result
        left,right = inorder(root1),inorder(root2)
        i,j,answer = 0,0,[]
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                answer.append(left[i])
                i += 1
            else:
                answer.append(right[j])
                j += 1
        return answer+left[i:]+right[j:]
`,'Inorder biến mỗi BST thành mảng tăng; trộn hai mảng bằng hai con trỏ, luôn lấy phần tử nhỏ hơn trước.','O(n+m)','O(n+m)',{kinds:['tree','tree'],focus:['left','right','answer','i','j']});
add(1306,'Jump Game III','graph',[[4,2,3,0,3,1,2],5],true,`
class Solution:
    def canReach(self, arr, start):
        from collections import deque
        queue,seen = deque([start]),{start}
        while queue:
            i = queue.popleft()
            if arr[i] == 0:
                return True
            for following in (i-arr[i],i+arr[i]):
                if 0 <= following < len(arr) and following not in seen:
                    seen.add(following)
                    queue.append(following)
        return False
`,'Mỗi chỉ số có hai cạnh nhảy i±arr[i]. BFS/seen tránh vòng lặp; dừng khi tới ô có giá trị 0.','O(n)','O(n)',{focus:['arr','queue','seen','i']});
add(1307,'Verbal Arithmetic Puzzle','backtracking',[[ 'A','A'],'B'],true,`
class Solution:
    def isSolvable(self, words, result):
        letters = set(''.join(words)+result)
        assert len(letters) <= 10
        if max(map(len,words)) > len(result):
            return False
        leading = {word[0] for word in words+[result] if len(word) > 1}
        mapping,used = {},set()
        def solve(row,col,total):
            if col == len(result):
                return total == 0
            if row == len(words):
                ch,digit = result[-1-col],total%10
                if ch in mapping:
                    return mapping[ch] == digit and solve(0,col+1,total//10)
                if digit in used or digit == 0 and ch in leading:
                    return False
                mapping[ch] = digit
                used.add(digit)
                if solve(0,col+1,total//10):
                    return True
                used.remove(digit)
                del mapping[ch]
                return False
            if col >= len(words[row]):
                return solve(row+1,col,total)
            ch = words[row][-1-col]
            if ch in mapping:
                return solve(row+1,col,total+mapping[ch])
            for digit in range(10):
                if digit in used or digit == 0 and ch in leading:
                    continue
                mapping[ch] = digit
                used.add(digit)
                if solve(row+1,col,total+digit):
                    return True
                used.remove(digit)
                del mapping[ch]
            return False
        return solve(0,0,0)
`,'Cộng theo từng cột từ phải sang trái. Gán mỗi chữ một chữ số chưa dùng, giữ số nhớ; chữ đầu từ nhiều chữ không được bằng 0. Quay lui ngay khi cột kết quả không khớp.','O(10!·columns·words)','O(letters+columns)',{difficulty:'hard',focus:['words','result','mapping','used','row','col','total'],traceOptions:{maxEvents:50000}});
add(1308,'Running Total for Different Genders','sql',[[{gender:'F',day:'2020-01-01',score_points:10},{gender:'F',day:'2020-01-02',score_points:20},{gender:'M',day:'2020-01-01',score_points:5}]],[{gender:'F',day:'2020-01-01',total:10},{gender:'F',day:'2020-01-02',total:30},{gender:'M',day:'2020-01-01',total:5}],`
class Solution:
    def totals(self, scores):
        running,answer = {},[]
        for row in sorted(scores,key=lambda r:(r['gender'],r['day'])):
            gender = row['gender']
            running[gender] = running.get(gender,0)+row['score_points']
            answer.append({'gender':gender,'day':row['day'],'total':running[gender]})
        return answer
`,'Sắp theo giới tính và ngày; mỗi giới tính có một tổng chạy độc lập, cộng score_points theo thứ tự ngày.','O(n log n)','O(n)');
add(1309,'Decrypt String from Alphabet to Integer Mapping','string',['10#11#12'],'jkab',`
class Solution:
    def freqAlphabets(self, s):
        cursor,answer = 0,''
        while cursor < len(s):
            if cursor+2 < len(s) and s[cursor+2] == '#':
                value = int(s[cursor:cursor+2])
                cursor += 3
            else:
                value = int(s[cursor])
                cursor += 1
            answer += chr(ord('a')+value-1)
        return answer
`,'Nhìn trước dấu #: có # thì đọc hai chữ số cho j..z, không thì đọc một chữ số cho a..i.','O(n)','O(n)',{difficulty:'easy'});
add(1310,'XOR Queries of a Subarray','bits',[[1,3,4,8],[[0,1],[1,2],[0,3],[3,3]]],[2,7,14,8],`
class Solution:
    def xorQueries(self, arr, queries):
        prefix = [0]
        for value in arr:
            prefix.append(prefix[-1]^value)
        answer = []
        for left,right in queries:
            answer.append(prefix[right+1]^prefix[left])
        return answer
`,'XOR tiền tố hai lần triệt tiêu đoạn trước left; XOR đoạn [left,right] bằng prefix[right+1] XOR prefix[left].','O(n+q)','O(n+q)',{focus:['arr','prefix','queries','answer']});
add(1313,'Decompress Run-Length Encoded List','array',[[1,2,3,4]],[2,4,4,4],`
class Solution:
    def decompressRLElist(self, nums):
        assert sum(nums[::2]) <= 2000
        answer = []
        for i in range(0,len(nums),2):
            frequency,value = nums[i:i+2]
            answer.extend([value]*frequency)
        return answer
`,'Mỗi cặp [tần suất, giá trị] mở thành số lần lặp tương ứng rồi nối vào kết quả.','O(output length)','O(output length)',{difficulty:'easy'});
add(1314,'Matrix Block Sum','array',[[[1,2,3],[4,5,6],[7,8,9]],1],[[12,21,16],[27,45,33],[24,39,28]],`
class Solution:
    def matrixBlockSum(self, mat, k):
        m,n = len(mat),len(mat[0])
        prefix = [[0]*(n+1) for _ in range(m+1)]
        for r in range(m):
            for c in range(n):
                prefix[r+1][c+1] = mat[r][c]+prefix[r][c+1]+prefix[r+1][c]-prefix[r][c]
        answer = [[0]*n for _ in mat]
        for r in range(m):
            for c in range(n):
                top,left,bottom,right = max(0,r-k),max(0,c-k),min(m,r+k+1),min(n,c+k+1)
                answer[r][c] = prefix[bottom][right]-prefix[top][right]-prefix[bottom][left]+prefix[top][left]
        return answer
`,'Mỗi ô cần tổng hình chữ nhật cách tâm không quá k hàng/cột. Cắt vùng tại biên rồi dùng bốn giá trị tổng tiền tố 2D.','O(mn)','O(mn)',{focus:['mat','prefix','answer','top','left','bottom','right']});
add(1315,'Sum of Nodes with Even-Valued Grandparent','tree',[[6,7,8,2,7,1,3,9,null,1,4,null,null,null,5]],18,`
class Solution:
    def sumEvenGrandparent(self, root):
        def visit(node,parentEven,grandEven):
            if not node:
                return 0
            own = node.val if grandEven else 0
            return own+visit(node.left,node.val%2 == 0,parentEven)+visit(node.right,node.val%2 == 0,parentEven)
        return visit(root,False,False)
`,'Truyền hai cờ cha chẵn và ông/bà chẵn xuống cây; chỉ cộng node khi cờ grandEven là True.','O(n)','O(h)',{kinds:['tree']});
add(1316,'Distinct Echo Substrings','string',['abcabcabc'],3,`
class Solution:
    def distinctEchoSubstrings(self, text):
        assert len(text) <= 200
        found = set()
        for length in range(1,len(text)//2+1):
            for start in range(len(text)-2*length+1):
                left = text[start:start+length]
                right = text[start+length:start+2*length]
                if left == right:
                    found.add(left+right)
        return len(found)
`,'Echo là hai nửa liên tiếp giống hệt nhau. Thử độ dài nửa và vị trí bắt đầu; tập found loại các lần xuất hiện trùng nội dung.','O(n³)','O(n³)',{difficulty:'hard',focus:['text','left','right','found'],description:'Teaching version compares the two halves explicitly rather than using rolling hashes.'});
add(1317,'Convert Integer to the Sum of Two No-Zero Integers','math',[11],[2,9],`
class Solution:
    def getNoZeroIntegers(self, n):
        for a in range(1,n):
            b = n-a
            if '0' not in str(a) and '0' not in str(b):
                return [a,b]
`,'Thử a dương và b=n−a; dừng ở cặp đầu tiên mà biểu diễn cả hai số không chứa chữ số 0.','O(n log n)','O(log n)',{difficulty:'easy'});
add(1318,'Minimum Flips to Make a OR b Equal to c','bits',[2,6,5],3,`
class Solution:
    def minFlips(self, a, b, c):
        answer = 0
        while a or b or c:
            x,y,wanted = a&1,b&1,c&1
            answer += x+y if wanted == 0 else int(not (x or y))
            a,b,c = a >> 1,b >> 1,c >> 1
        return answer
`,'Xét từng bit độc lập. Bit đích 0 yêu cầu xóa mọi bit 1 ở a,b; bit đích 1 chỉ cần bật một bit khi cả hai đang 0.','O(bits)','O(1)');
add(1320,'Minimum Distance to Type a Word Using Two Fingers','dp',['CAKE'],3,`
class Solution:
    def minimumDistance(self, word):
        def distance(a,b):
            return 0 if a == 26 else abs(a//6-b//6)+abs(a%6-b%6)
        dp = {(26,26):0}
        for ch in word:
            key = ord(ch)-ord('A')
            following = {}
            for (left,right),cost in dp.items():
                state = (key,right)
                following[state] = min(following.get(state,float('inf')),cost+distance(left,key))
                state = (left,key)
                following[state] = min(following.get(state,float('inf')),cost+distance(right,key))
            dp = following
        return min(dp.values())
`,'Trạng thái là vị trí hai ngón tay. Với mỗi chữ, thử di chuyển ngón trái hoặc phải; vị trí 26 là ngón chưa đặt, lần đặt đầu miễn phí.','O(n·26²)','O(26²)',{difficulty:'hard',focus:['word','dp','following','left','right','key'],traceOptions:{maxEvents:30000}});
add(1321,'Restaurant Growth','sql', [Array.from({length:7},(_,i)=>({visited_on:'2019-01-0'+(i+1),amount:10}))],[{visited_on:'2019-01-07',amount:70,average_amount:10}],`
class Solution:
    def growth(self, customer):
        from datetime import date,timedelta
        from decimal import Decimal,ROUND_HALF_UP
        daily = {}
        for row in customer:
            day = date.fromisoformat(row['visited_on'])
            daily[day] = daily.get(day,0)+row['amount']
        first,answer = min(daily),[]
        for day in sorted(daily):
            if day >= first+timedelta(days=6):
                total = sum(amount for date,amount in daily.items() if day-timedelta(days=6) <= date <= day)
                average = float((Decimal(total)/7).quantize(Decimal('.01'),rounding=ROUND_HALF_UP))
                answer.append({'visited_on':str(day),'amount':total,'average_amount':average})
        return answer
`,'Gộp doanh thu theo ngày trước để không nhân đôi cửa sổ. Từ ngày thứ 7, tính tổng 7 ngày lịch gần nhất rồi chia 7.','O(days²+rows)','O(days)');
add(1322,'Ads Performance','sql',[[{ad_id:1,action:'Clicked'},{ad_id:1,action:'Viewed'},{ad_id:2,action:'Ignored'}]],[{ad_id:1,ctr:50},{ad_id:2,ctr:0}],`
class Solution:
    def adsPerformance(self, ads):
        from decimal import Decimal,ROUND_HALF_UP
        counts = {}
        for row in ads:
            values = counts.setdefault(row['ad_id'],[0,0])
            values[0] += row['action'] == 'Clicked'
            values[1] += row['action'] == 'Viewed'
        answer = []
        for ad,(clicked,viewed) in counts.items():
            ctr = float((Decimal(clicked)*100/(clicked+viewed)).quantize(Decimal('.01'),rounding=ROUND_HALF_UP)) if clicked+viewed else 0.0
            answer.append({'ad_id':ad,'ctr':ctr})
        return sorted(answer,key=lambda r:(-r['ctr'],r['ad_id']))
`,'CTR = Clicked/(Clicked+Viewed)×100, Ignored không vào mẫu số. Không có click/view thì CTR 0; xếp CTR giảm rồi ad_id tăng.','O(n log n)','O(n)',{difficulty:'easy'});
add(1323,'Maximum 69 Number','math',[9669],9969,`
class Solution:
    def maximum69Number(self, num):
        digits = list(str(num))
        for i,digit in enumerate(digits):
            if digit == '6':
                digits[i] = '9'
                break
        return int(''.join(digits))
`,'Chỉ đổi một chữ số nên đổi số 6 ở vị trí cao nhất thành 9; các vị trí bên phải không thể tạo mức tăng lớn hơn.','O(digits)','O(digits)',{difficulty:'easy'});
add(1324,'Print Words Vertically','string',['HOW ARE YOU'],['HAY','ORO','WEU'],`
class Solution:
    def printVertically(self, s):
        words = s.split()
        answer = []
        for row in range(max(map(len,words))):
            line = ''.join(word[row] if row < len(word) else ' ' for word in words)
            answer.append(line.rstrip())
        return answer
`,'Mỗi từ là một cột. Đọc ký tự thứ row của từng từ, thiếu thì chèn khoảng trắng; chỉ bỏ khoảng trắng cuối dòng, giữ khoảng trắng đầu.','O(words·max length)','O(output length)');
add(1325,'Delete Leaves With a Given Value','tree',[[1,2,3,2,null,2,4],2],[1,null,3,null,4],`
class Solution:
    def removeLeafNodes(self, root, target):
        def prune(node):
            if not node:
                return None
            node.left,node.right = prune(node.left),prune(node.right)
            if node.val == target and not node.left and not node.right:
                return None
            return node
        return prune(root)
`,'Xóa từ con lên cha. Khi hai con đã xử lý xong, node có thể vừa trở thành lá; nếu bằng target thì xóa tiếp ngay trong lượt DFS đó.','O(n)','O(h)',{kinds:['tree'],answerKind:'tree'});
add(1326,'Minimum Number of Taps to Open to Water a Garden','greedy',[5,[3,4,1,1,0,0]],1,`
class Solution:
    def minTaps(self, n, ranges):
        assert 1 <= n <= 60 and len(ranges) == n+1
        reach = [0]*(n+1)
        for i,radius in enumerate(ranges):
            left,right = max(0,i-radius),min(n,i+radius)
            reach[left] = max(reach[left],right)
        end,farthest,answer = 0,0,0
        for position in range(n):
            farthest = max(farthest,reach[position])
            if position == end:
                if farthest <= position:
                    return -1
                answer += 1
                end = farthest
        return answer
`,'Mỗi vòi là một đoạn tưới. Tại biên vùng đã phủ, chọn vòi bắt đầu trước biên có thể kéo xa nhất; không kéo thêm được thì có khoảng hở.','O(n)','O(n)',{difficulty:'hard',focus:['reach','end','farthest','answer']});
add(1327,'List the Products Ordered in a Period','sql',[[{product_id:1,product_name:'A'},{product_id:2,product_name:'B'}],[{product_id:1,order_date:'2020-02-01',unit:60},{product_id:1,order_date:'2020-02-20',unit:40},{product_id:2,order_date:'2020-03-01',unit:120}]],[{product_name:'A',unit:100}],`
class Solution:
    def orderedProducts(self, products, orders):
        totals = {}
        for row in orders:
            if row['order_date'][:7] == '2020-02':
                p = row['product_id']
                totals[p] = totals.get(p,0)+row['unit']
        return [{'product_name':p['product_name'],'unit':totals[p['product_id']]} for p in products if totals.get(p['product_id'],0) >= 100]
`,'Chỉ cộng unit của tháng 2/2020, sau đó nối tên sản phẩm và giữ tổng ít nhất 100.','O(products+orders)','O(products)',{difficulty:'easy'});
add(1328,'Break a Palindrome','string',['abccba'],'aaccba',`
class Solution:
    def breakPalindrome(self, palindrome):
        if len(palindrome) == 1:
            return ''
        letters = list(palindrome)
        for i in range(len(letters)//2):
            if letters[i] != 'a':
                letters[i] = 'a'
                return ''.join(letters)
        letters[-1] = 'b'
        return ''.join(letters)
`,'Muốn nhỏ nhất theo từ điển, đổi chữ không phải a đầu tiên ở nửa trái thành a. Nếu nửa trái toàn a thì đổi chữ cuối thành b; chuỗi một chữ không làm được.','O(n)','O(n)');
add(1329,'Sort the Matrix Diagonally','array',[[[3,3,1,1],[2,2,1,2],[1,1,1,2]]],[[1,1,1,1],[1,2,2,2],[1,2,3,3]],`
class Solution:
    def diagonalSort(self, mat):
        groups = {}
        for r,row in enumerate(mat):
            for c,value in enumerate(row):
                groups.setdefault(r-c,[]).append(value)
        for diagonal in groups.values():
            diagonal.sort(reverse=True)
        answer = [row[:] for row in mat]
        for r,row in enumerate(answer):
            for c in range(len(row)):
                answer[r][c] = groups[r-c].pop()
        return answer
`,'Các ô cùng đường chéo xuống phải có r−c không đổi. Gom và sắp từng nhóm, rồi đặt giá trị nhỏ nhất còn lại vào ô đi trước.','O(mn log min(m,n))','O(mn)',{focus:['mat','groups','answer']});
add(1330,'Reverse Subarray To Maximize Array Value','array',[[2,3,1,5,4]],10,`
class Solution:
    def maxValueAfterReverse(self, nums):
        assert 1 <= len(nums) <= 20
        best = sum(abs(a-b) for a,b in zip(nums,nums[1:]))
        for left in range(len(nums)):
            for right in range(left,len(nums)):
                candidate = nums[:left]+nums[left:right+1][::-1]+nums[right+1:]
                score = sum(abs(a-b) for a,b in zip(candidate,candidate[1:]))
                best = max(best,score)
        return best
`,'Bản minh họa thử từng đoạn đảo và tính lại tổng |hai số kề nhau|, giúp thấy chính xác phép đảo thay đổi điểm ra sao. Giữ điểm cao nhất, kể cả không đảo.','O(n³)','O(n)',{difficulty:'hard',description:'Teaching version enumerates reversals, with at most 20 entries for readable replay.',focus:['nums','candidate','left','right','score','best']});
add(1331,'Rank Transform of an Array','array',[[40,10,20,30]],[4,1,2,3],`
class Solution:
    def arrayRankTransform(self, arr):
        ordered = sorted(set(arr))
        rank = {value:i+1 for i,value in enumerate(ordered)}
        return [rank[value] for value in arr]
`,'Sắp các giá trị khác nhau và gán hạng từ 1. Các số bằng nhau dùng chung hạng; thay từng ô theo bản đồ hạng.','O(n log n)','O(n)',{difficulty:'easy'});
add(1332,'Remove Palindromic Subsequences','string',['ababa'],1,`
class Solution:
    def removePalindromeSub(self, s):
        if not s:
            return 0
        reversedString = s[::-1]
        return 1 if s == reversedString else 2
`,'Chỉ có a và b, và được xóa dãy con không cần liên tiếp. Chuỗi đối xứng xóa một lần; nếu không, xóa toàn bộ a rồi toàn bộ b trong hai lần.','O(n)','O(n)',{difficulty:'easy'});
add(1333,'Filter Restaurants by Vegan-Friendly, Price and Distance','array',[[[1,4,1,40,10],[2,8,0,50,5],[3,8,1,30,4],[4,10,0,10,3],[5,1,1,15,1]],1,50,10],[3,1,5],`
class Solution:
    def filterRestaurants(self, restaurants, veganFriendly, maxPrice, maxDistance):
        selected = []
        for row in restaurants:
            id,rating,vegan,price,distance = row
            if (not veganFriendly or vegan) and price <= maxPrice and distance <= maxDistance:
                selected.append(row)
        selected.sort(key=lambda row:(-row[1],-row[0]))
        return [row[0] for row in selected]
`,'Lọc lần lượt điều kiện ăn chay nếu được bật, giá và khoảng cách. Xếp rating giảm, hòa thì ID giảm.','O(n log n)','O(n)');
add(1335,'Minimum Difficulty of a Job Schedule','dp',[[6,5,4,3,2,1],2],7,`
class Solution:
    def minDifficulty(self, jobDifficulty, d):
        n = len(jobDifficulty)
        if n < d:
            return -1
        dp = [0]+[float('inf')]*n
        for day in range(1,d+1):
            following = [float('inf')]*(n+1)
            for end in range(day,n+1):
                hardest = 0
                for start in range(end-1,day-2,-1):
                    hardest = max(hardest,jobDifficulty[start])
                    following[end] = min(following[end],dp[start]+hardest)
            dp = following
        return dp[n]
`,'Mỗi ngày nhận một đoạn việc liên tiếp không rỗng, khó bằng việc khó nhất trong ngày. Thử mọi chỗ bắt đầu ngày cuối và cộng chi phí các ngày trước.','O(dn²)','O(n)',{difficulty:'hard',focus:['jobDifficulty','dp','following','day','hardest'],traceOptions:{maxEvents:20000}});
add(1336,'Number of Transactions per Visit','sql',[[{user_id:1,visit_date:'2020-01-01'},{user_id:1,visit_date:'2020-01-02'},{user_id:2,visit_date:'2020-01-01'}],[{user_id:1,transaction_date:'2020-01-01'},{user_id:1,transaction_date:'2020-01-01'},{user_id:2,transaction_date:'2020-01-01'}]],[{transactions_count:0,visits_count:1},{transactions_count:1,visits_count:1},{transactions_count:2,visits_count:1}],`
class Solution:
    def transactionsPerVisit(self, visits, transactions):
        from collections import Counter
        counts = Counter((r['user_id'],r['transaction_date']) for r in transactions)
        histogram = Counter(counts[r['user_id'],r['visit_date']] for r in visits)
        return [{'transactions_count':number,'visits_count':histogram[number]} for number in range(max(histogram,default=0)+1)]
`,'Đếm giao dịch trong từng lần ghé theo người/ngày, rồi lập histogram: có bao nhiêu lượt ghé có 0,1,2,... giao dịch. Phải hiện cả mức bị thiếu bằng 0.','O(v+t+max transactions)','O(v+t)',{difficulty:'hard'});
add(1338,'Reduce Array Size to The Half','greedy',[[3,3,3,3,5,5,5,2,2,7]],2,`
class Solution:
    def minSetSize(self, arr):
        from collections import Counter
        frequencies = sorted(Counter(arr).values(),reverse=True)
        removed,answer = 0,0
        for count in frequencies:
            removed += count
            answer += 1
            if removed*2 >= len(arr):
                return answer
        return 0
`,'Xóa giá trị có tần suất cao nhất trước; mỗi lần chọn một giá trị xóa được mọi bản sao của nó. Dừng khi đã xóa ít nhất nửa mảng.','O(n log n)','O(n)');
add(1339,'Maximum Product of Splitted Binary Tree','tree',[[1,2,3,4,5,6]],110,`
class Solution:
    def maxProduct(self, root):
        sums = []
        def visit(node):
            if not node:
                return 0
            total = node.val+visit(node.left)+visit(node.right)
            sums.append(total)
            return total
        total = visit(root)
        best = max(subtree*(total-subtree) for subtree in sums)
        return best%1000000007
`,'Cắt cạnh phía trên một cây con tạo hai tổng s và total−s. Thử mọi tổng cây con; chọn tích lớn nhất trước khi lấy modulo.','O(n)','O(n)',{kinds:['tree']});
add(1340,'Jump Game V','dp',[[6,4,14,6,8,13,9,7,10,6,12],2],4,`
class Solution:
    def maxJumps(self, arr, d):
        from functools import lru_cache
        @lru_cache(None)
        def visit(i):
            best = 1
            for direction in (-1,1):
                for step in range(1,min(d,len(arr))+1):
                    j = i+direction*step
                    if not 0 <= j < len(arr) or arr[j] >= arr[i]:
                        break
                    best = max(best,1+visit(j))
            return best
        return max(visit(i) for i in range(len(arr)))
`,'Chỉ nhảy tới ô thấp hơn trong khoảng d; gặp ô cao bằng hoặc cao hơn thì nó chặn cả các ô xa hơn. DFS ghi nhớ vì độ cao giảm nên không có chu trình.','O(nd)','O(n)',{difficulty:'hard',focus:['arr','i','j','best']});
add(1341,'Movie Rating','sql',[[{movie_id:1,title:'A'},{movie_id:2,title:'B'}],[{user_id:1,name:'Daniel'},{user_id:2,name:'Monica'}],[{movie_id:1,user_id:1,rating:3,created_at:'2020-02-01'},{movie_id:1,user_id:2,rating:5,created_at:'2020-02-02'},{movie_id:2,user_id:1,rating:4,created_at:'2020-02-03'}]],[{results:'Daniel'},{results:'A'}],`
class Solution:
    def ratings(self, movies, users, movieRating):
        from collections import Counter
        from fractions import Fraction
        counts = Counter(r['user_id'] for r in movieRating)
        user = min(users,key=lambda u:(-counts[u['user_id']],u['name']))
        groups = {}
        for row in movieRating:
            if row['created_at'][:7] == '2020-02':
                groups.setdefault(row['movie_id'],[]).append(row['rating'])
        movie = min((m for m in movies if m['movie_id'] in groups),key=lambda m:(-Fraction(sum(groups[m['movie_id']]),len(groups[m['movie_id']])),m['title']))
        return [{'results':user['name']},{'results':movie['title']}]
`,'Dòng đầu là người đánh giá nhiều phim nhất trong mọi thời gian. Dòng sau là phim điểm trung bình cao nhất riêng tháng 2/2020. Hòa đều chọn tên nhỏ nhất theo từ điển.','O(ratings+users+movies)','O(ratings)');
add(1344,'Angle Between Hands of a Clock','math',[3,30],75,`
class Solution:
    def angleClock(self, hour, minutes):
        hourAngle = (hour%12)*30+minutes*0.5
        minuteAngle = minutes*6
        difference = abs(hourAngle-minuteAngle)
        return min(difference,360-difference)
`,'Kim phút đi 6° mỗi phút; kim giờ vẫn dịch thêm 0.5° mỗi phút. Lấy góc nhỏ hơn giữa hai hướng quay.','O(1)','O(1)');
add(1347,'Minimum Number of Steps to Make Two Strings Anagram','string',['bab','aba'],1,`
class Solution:
    def minSteps(self, s, t):
        from collections import Counter
        source,target = Counter(s),Counter(t)
        return sum(max(0,count-source[ch]) for ch,count in target.items())
`,'Hai chuỗi cùng độ dài; mỗi chữ dư ở t cần một lần thay thành chữ đang thiếu. Cộng phần tần suất t vượt s.','O(n)','O(alphabet)');
add(1348,'Tweet Counts Per Frequency','design',[[['recordTweet','tweet3',0],['recordTweet','tweet3',60],['recordTweet','tweet3',10],['getTweetCountsPerFrequency','minute','tweet3',0,59],['getTweetCountsPerFrequency','minute','tweet3',0,60]]],[null,null,null,[2],[2,1]],`
class Solution:
    def tweetCounts(self, operations):
        history,answer = {},[]
        for operation in operations:
            if operation[0] == 'recordTweet':
                history.setdefault(operation[1],[]).append(operation[2])
                answer.append(None)
            else:
                _,frequency,name,start,end = operation
                width = {'minute':60,'hour':3600,'day':86400}[frequency]
                buckets = (end-start)//width+1
                assert 1 <= buckets <= 80
                counts = [0]*buckets
                for time in history.get(name,[]):
                    if start <= time <= end:
                        counts[(time-start)//width] += 1
                answer.append(counts)
        return answer
`,'Lưu thời điểm tweet theo tên. Truy vấn chia đoạn [start,end] thành bucket có độ rộng phút/giờ/ngày và đếm tweet vào đúng bucket, kể cả bucket rỗng.','O(total queried tweets)','O(tweets+output)',{focus:['history','counts','start','end','width','answer']});
add(1350,'Students With Invalid Departments','sql',[[{id:1,name:'Alice',department_id:1},{id:2,name:'Bob',department_id:2}],[{id:1,name:'Engineering'}]],[{id:2,name:'Bob'}],`
class Solution:
    def invalidDepartments(self, students, departments):
        valid = {row['id'] for row in departments}
        return [{'id':s['id'],'name':s['name']} for s in students if s['department_id'] not in valid]
`,'Tạo tập ID phòng ban hợp lệ rồi lấy các sinh viên có department_id không tồn tại trong tập đó.','O(s+d)','O(d)',{difficulty:'easy'});
add(1354,'Construct Target Array With Multiple Sums','greedy',[[9,3,5]],true,`
class Solution:
    def isPossible(self, target):
        import heapq
        heap,total = [-value for value in target],sum(target)
        heapq.heapify(heap)
        while True:
            largest = -heapq.heappop(heap)
            rest = total-largest
            if largest == 1 or rest == 1:
                return True
            if rest <= 0 or largest <= rest or largest%rest == 0:
                return False
            previous = largest%rest
            total = rest+previous
            heapq.heappush(heap,-previous)
`,'Đi ngược: phần tử lớn nhất là phần vừa được thay bằng tổng. Trừ tổng các số còn lại nhiều lần bằng phép %, rồi đưa giá trị trước đó về max-heap.','O(n log n+log target·log n)','O(n)',{difficulty:'hard',focus:['heap','largest','rest','previous','total']});
add(1355,'Activity Participants','sql',[[{name:'A',activity:'Eating'},{name:'B',activity:'Eating'},{name:'C',activity:'Eating'},{name:'D',activity:'Singing'},{name:'E',activity:'Singing'},{name:'F',activity:'Riding'}]],['Singing'],`
class Solution:
    def activities(self, friends):
        from collections import Counter
        counts = Counter(row['activity'] for row in friends)
        low,high = min(counts.values()),max(counts.values())
        return sorted(activity for activity,count in counts.items() if low < count < high)
`,'Nhóm những hoạt động xuất hiện trong Friends; chỉ chọn số người lớn hơn mức ít nhất và nhỏ hơn mức nhiều nhất, loại mọi nhóm đồng hạng hai đầu.','O(n log n)','O(n)');
add(1356,'Sort Integers by The Number of 1 Bits','bits',[[0,1,2,3,4,5,6,7,8]],[0,1,2,4,8,3,5,6,7],`
class Solution:
    def sortByBits(self, arr):
        counts = [(value.bit_count(),value) for value in arr]
        counts.sort()
        return [value for bits,value in counts]
`,'Khóa sắp xếp là số bit 1 trước, giá trị số sau. Hai số cùng số bit 1 vẫn được xếp tăng theo giá trị.','O(n log n)','O(n)',{difficulty:'easy'});
add(1357,'Apply Discount Every n Orders','design',[3,50,[1,2],[100,200],[[[1],[1]],[[2],[1]],[[1,2],[1,1]]]],[100,200,150],`
class Solution:
    def cashier(self, n, discount, products, prices, bills):
        catalog = dict(zip(products,prices))
        answer = []
        for order,(items,amounts) in enumerate(bills,1):
            subtotal = sum(catalog[item]*amount for item,amount in zip(items,amounts))
            total = subtotal*(100-discount)/100 if order%n == 0 else subtotal
            answer.append(total)
        return answer
`,'Đếm số hóa đơn toàn cục từ 1. Mỗi hóa đơn tính tổng giá×số lượng; chỉ hóa đơn có số thứ tự chia hết n mới nhận giảm giá.','O(total purchased entries)','O(products+orders)');
add(1359,'Count All Valid Pickup and Delivery Options','math',[3],90,`
class Solution:
    def countOrders(self, n):
        assert 0 <= n <= 80
        answer = 1
        for orders in range(1,n+1):
            placements = orders*(2*orders-1)
            answer = answer*placements%1000000007
        return answer
`,'Khi thêm đơn thứ i vào lịch có 2i−2 sự kiện, chọn hai vị trí cho nhận và giao theo đúng thứ tự có i(2i−1) cách. Nhân dồn các lựa chọn.','O(n)','O(1)',{difficulty:'hard'});
add(1360,'Number of Days Between Two Dates','math',['2019-06-29','2019-06-30'],1,`
class Solution:
    def daysBetweenDates(self, date1, date2):
        from datetime import date
        first,second = date.fromisoformat(date1),date.fromisoformat(date2)
        difference = (first-second).days
        return abs(difference)
`,'Chuyển hai chuỗi thành ngày lịch và lấy trị tuyệt đối số ngày chênh lệch; thư viện lịch xử lý tháng và năm nhuận.','O(1)','O(1)',{difficulty:'easy'});
add(1362,'Closest Divisors','math',[8],[3,3],`
class Solution:
    def closestDivisors(self, num):
        from math import isqrt
        best = None
        for value in (num+1,num+2):
            divisor = isqrt(value)
            while value%divisor:
                divisor -= 1
            pair = [divisor,value//divisor]
            if best is None or pair[1]-pair[0] < best[1]-best[0]:
                best = pair
        return best
`,'Với mỗi số num+1 và num+2, cặp ước gần nhau nhất nằm gần căn bậc hai. Đi xuống tới ước đầu tiên rồi so hai khoảng cách.','O(√num)','O(1)');
add(1363,'Largest Multiple of Three','greedy',[[8,1,9]],'981',`
class Solution:
    def largestMultipleOfThree(self, digits):
        groups = [[d for d in sorted(digits) if d%3 == r] for r in range(3)]
        remainder = sum(digits)%3
        removed = []
        if remainder:
            if groups[remainder]:
                removed = [groups[remainder][0]]
            elif len(groups[3-remainder]) >= 2:
                removed = groups[3-remainder][:2]
            else:
                return ''
        remaining = sorted(digits,reverse=True)
        for digit in removed:
            remaining.remove(digit)
        answer = ''.join(map(str,remaining))
        return answer.lstrip('0') or ('0' if answer else '')
`,'Chia hết 3 phụ thuộc tổng chữ số. Nếu dư r, bỏ một chữ nhỏ nhất dư r hoặc hai chữ nhỏ nhất dư 3−r; sắp phần còn lại giảm để tạo số lớn nhất.','O(n log n)','O(n)',{difficulty:'hard',focus:['digits','groups','removed','remaining']});
add(1364,'Number of Trusted Contacts of a Customer','sql',[[{customer_id:1,customer_name:'Alice',email:'a'},{customer_id:2,customer_name:'Bob',email:'b'}],[{user_id:1,contact_name:'Bob',contact_email:'b'},{user_id:1,contact_name:'X',contact_email:'x'}],[{invoice_id:1,user_id:1,price:100}]],[{invoice_id:1,customer_name:'Alice',price:100,contacts_cnt:2,trusted_contacts_cnt:1}],`
class Solution:
    def contacts(self, customers, contacts, invoices):
        names = {r['customer_id']:r['customer_name'] for r in customers}
        emails = {r['email'] for r in customers}
        counts = {}
        for row in contacts:
            values = counts.setdefault(row['user_id'],[0,0])
            values[0] += 1
            values[1] += row['contact_email'] in emails
        return [{'invoice_id':r['invoice_id'],'customer_name':names[r['user_id']],'price':r['price'],'contacts_cnt':counts.get(r['user_id'],[0,0])[0],'trusted_contacts_cnt':counts.get(r['user_id'],[0,0])[1]} for r in sorted(invoices,key=lambda r:r['invoice_id'])]
`,'Liên hệ đáng tin khi email của họ thuộc tập email khách hàng. Đếm mọi liên hệ và liên hệ đáng tin theo chủ sở hữu rồi nối vào từng hóa đơn.','O(customers+contacts+invoices log invoices)','O(customers+contacts)');
add(1365,'How Many Numbers Are Smaller Than the Current Number','array',[[8,1,2,2,3]],[4,0,1,1,3],`
class Solution:
    def smallerNumbersThanCurrent(self, nums):
        first = {}
        for i,value in enumerate(sorted(nums)):
            first.setdefault(value,i)
        return [first[value] for value in nums]
`,'Trong mảng đã sắp xếp, chỉ số xuất hiện đầu tiên của một số bằng đúng lượng phần tử nhỏ hơn nghiêm ngặt nó.','O(n log n)','O(n)',{difficulty:'easy'});
add(1366,'Rank Teams by Votes','array',[[ 'ABC','ACB','ABC','ACB','ACB']],'ACB',`
class Solution:
    def rankTeams(self, votes):
        counts = {team:[0]*len(votes[0]) for team in votes[0]}
        for vote in votes:
            for rank,team in enumerate(vote):
                counts[team][rank] += 1
        ordered = sorted(counts,key=lambda team:tuple(-count for count in counts[team])+(team,))
        return ''.join(ordered)
`,'So số phiếu hạng nhất trước, hòa mới so hạng nhì rồi các hạng sau. Nếu toàn bộ số phiếu bằng nhau thì xếp theo chữ cái tên đội.','O(votes·teams+teams² log teams)','O(teams²)');
add(1367,'Linked List in Binary Tree','tree',[[4,2,8],[1,4,4,null,2,2,null,1,null,6,8,null,null,null,null,1,3]],true,`
class Solution:
    def isSubPath(self, head, root):
        def match(node,current):
            if not current:
                return True
            if not node or node.val != current.val:
                return False
            return match(node.left,current.next) or match(node.right,current.next)
        def search(node):
            return bool(node and (match(node,head) or search(node.left) or search(node.right)))
        return search(root)
`,'Thử mỗi node cây làm điểm bắt đầu; match phải khớp liên tiếp các node của list theo một đường chỉ đi xuống con trái/phải.','O(tree nodes·list length)','O(tree height+list length)',{kinds:['list','tree']});
add(1369,'Get the Second Most Recent Activity','sql',[[{username:'Alice',activity:'Travel',startDate:'2020-02-01',endDate:'2020-02-02'},{username:'Alice',activity:'Dancing',startDate:'2020-02-03',endDate:'2020-02-04'},{username:'Bob',activity:'Gaming',startDate:'2020-02-01',endDate:'2020-02-02'}]],[{username:'Alice',activity:'Travel',startDate:'2020-02-01',endDate:'2020-02-02'},{username:'Bob',activity:'Gaming',startDate:'2020-02-01',endDate:'2020-02-02'}],`
class Solution:
    def secondRecent(self, userActivity):
        groups = {}
        for row in sorted(userActivity,key=lambda r:r['startDate'],reverse=True):
            groups.setdefault(row['username'],[]).append(row)
        return [rows[1] if len(rows) > 1 else rows[0] for user,rows in sorted(groups.items())]
`,'Sắp hoạt động mỗi người mới nhất trước; lấy dòng thứ hai, riêng người chỉ có một hoạt động thì lấy dòng duy nhất.','O(n log n)','O(n)',{difficulty:'hard'});
add(1370,'Increasing Decreasing String','string',['aaaabbbbcccc'],'abccbaabccba',`
class Solution:
    def sortString(self, s):
        from collections import Counter
        counts,answer = Counter(s),[]
        letters = sorted(counts)
        while len(answer) < len(s):
            for order in (letters,letters[::-1]):
                for ch in order:
                    if counts[ch]:
                        answer.append(ch)
                        counts[ch] -= 1
        return ''.join(answer)
`,'Mỗi lượt lấy tối đa một chữ theo chiều tăng, rồi tối đa một chữ theo chiều giảm; chỉ lấy chữ còn tần suất và lặp tới khi hết.','O(n·alphabet)','O(n)',{difficulty:'easy'});
add(1371,'Find the Longest Substring Containing Vowels in Even Counts','bits',['eleetminicoworoep'],13,`
class Solution:
    def findTheLongestSubstring(self, s):
        first,mask,answer = {0:-1},0,0
        for i,ch in enumerate(s):
            if ch in 'aeiou':
                mask ^= 1 << 'aeiou'.index(ch)
            if mask in first:
                answer = max(answer,i-first[mask])
            else:
                first[mask] = i
        return answer
`,'Năm bit lưu chẵn/lẻ số lần của a,e,i,o,u. Hai tiền tố cùng mask bao một đoạn có mọi nguyên âm xuất hiện chẵn; giữ lần gặp mask sớm nhất.','O(n)','O(32)',{focus:['s','first','mask','answer']});
add(1374,'Generate a String With Characters That Have Odd Counts','string',[4],'aaab',`
class Solution:
    def generateTheString(self, n):
        assert 1 <= n <= 80
        if n%2:
            return 'a'*n
        return 'a'*(n-1)+'b'
`,'n lẻ dùng một chữ a lặp n lần. n chẵn dùng n−1 chữ a và một chữ b, cả hai tần suất đều lẻ.','O(n)','O(n)',{difficulty:'easy'});
add(1375,'Number of Times Binary String Is Prefix-Aligned','array',[[2,1,3,5,4]],3,`
class Solution:
    def numTimesAllBlue(self, flips):
        farthest,answer = 0,0
        for count,position in enumerate(flips,1):
            farthest = max(farthest,position)
            if farthest == count:
                answer += 1
        return answer
`,'Sau count lần bật có đúng count bit 1. Chúng tạo đúng tiền tố khi vị trí xa nhất đã bật bằng count, nghĩa là không có khoảng hở phía trước.','O(n)','O(1)');
add(1378,'Replace Employee ID With The Unique Identifier','sql',[[{id:1,name:'Alice'},{id:2,name:'Bob'}],[{id:1,unique_id:3}]],[{unique_id:3,name:'Alice'},{unique_id:null,name:'Bob'}],`
class Solution:
    def uniqueIds(self, employees, employeeUNI):
        mapping = {r['id']:r['unique_id'] for r in employeeUNI}
        return [{'unique_id':mapping.get(r['id']),'name':r['name']} for r in employees]
`,'Nối trái theo employee id; mọi nhân viên đều xuất hiện, không có unique_id thì trả NULL.','O(e+u)','O(u)',{difficulty:'easy'});
add(1379,'Find a Corresponding Node of a Binary Tree in a Clone of That Tree','tree',[[7,4,3,null,null,6,19],[7,4,3,null,null,6,19],'R'],[3,6,19],`
class Solution:
    def getTargetCopy(self, original, cloned, targetPath):
        target = original
        for direction in targetPath:
            assert direction in 'LR' and target
            target = target.left if direction == 'L' else target.right
        assert target
        def visit(node,copy):
            if not node:
                return None
            if node is target:
                return copy
            return visit(node.left,copy.left) or visit(node.right,copy.right)
        return visit(original,cloned)
`,'targetPath dùng L/R xác định đúng node đích trong cây gốc, kể cả khi giá trị trùng. Đi hai cây song song và trả node bên clone ở cùng vị trí, không dùng giá trị để nhận diện.','O(n)','O(h)',{kinds:['tree','tree'],answerKind:'tree',description:'The target node is specified by an L/R path from the original root; an empty path selects the root.'});
add(1380,'Lucky Numbers in a Matrix','array',[[[3,7,8],[9,11,13],[15,16,17]]],[15],`
class Solution:
    def luckyNumbers(self, matrix):
        rowMin = [min(row) for row in matrix]
        colMax = [max(column) for column in zip(*matrix)]
        return [value for r,row in enumerate(matrix) for c,value in enumerate(row) if value == rowMin[r] == colMax[c]]
`,'Một ô may mắn vừa là nhỏ nhất trong hàng vừa lớn nhất trong cột; tính hai loại cực trị rồi kiểm tra từng ô.','O(mn)','O(m+n)',{difficulty:'easy'});
add(1381,'Design a Stack With Increment Operation','design',[2,[['push',1],['push',2],['increment',2,5],['pop'],['pop']]],[null,null,null,7,6],`
class Solution:
    def customStack(self, maxSize, operations):
        stack,pending,answer = [],[],[]
        for operation in operations:
            if operation[0] == 'push':
                if len(stack) < maxSize:
                    stack.append(operation[1])
                    pending.append(0)
                answer.append(None)
            elif operation[0] == 'increment':
                k,value = operation[1:]
                if stack and k:
                    pending[min(k,len(stack))-1] += value
                answer.append(None)
            else:
                if not stack:
                    answer.append(-1)
                    continue
                extra = pending.pop()
                value = stack.pop()+extra
                if pending:
                    pending[-1] += extra
                answer.append(value)
        return answer
`,'Tăng k ô đáy được ghi lười tại pending[k−1]. Khi pop, lấy phần tăng của đỉnh và truyền nó xuống ô kế, nên cả push/pop/increment đều O(1).','O(q)','O(maxSize+q)',{focus:['stack','pending','extra','answer']});
add(1383,'Maximum Performance of a Team','greedy',[6,[2,10,3,1,5,8],[5,4,3,9,7,2],2],60,`
class Solution:
    def maxPerformance(self, n, speed, efficiency, k):
        import heapq
        engineers = sorted(zip(efficiency,speed),reverse=True)
        heap,total,best = [],0,0
        for minimum,value in engineers:
            heapq.heappush(heap,value)
            total += value
            if len(heap) > k:
                total -= heapq.heappop(heap)
            best = max(best,total*minimum)
        return best%1000000007
`,'Xét hiệu suất giảm dần để người hiện tại là min efficiency. Min-heap giữ tối đa k tốc độ lớn nhất đã gặp; điểm = tổng tốc độ × min efficiency.','O(n log n+n log k)','O(n)',{difficulty:'hard',focus:['engineers','heap','total','minimum','best']});
add(1384,'Total Sales Amount by Year','sql',[[{product_id:1,product_name:'LC Phone'}],[{product_id:1,period_start:'2019-12-30',period_end:'2020-01-02',average_daily_sales:10}]],[{product_id:1,product_name:'LC Phone',report_year:'2019',total_amount:20},{product_id:1,product_name:'LC Phone',report_year:'2020',total_amount:20}],`
class Solution:
    def salesByYear(self, products, sales):
        from datetime import date
        names = {r['product_id']:r['product_name'] for r in products}
        totals = {}
        for row in sales:
            start,end = date.fromisoformat(row['period_start']),date.fromisoformat(row['period_end'])
            for year in range(start.year,end.year+1):
                left,right = max(start,date(year,1,1)),min(end,date(year,12,31))
                days = (right-left).days+1
                key = (row['product_id'],year)
                totals[key] = totals.get(key,0)+days*row['average_daily_sales']
        return [{'product_id':p,'product_name':names[p],'report_year':str(year),'total_amount':amount} for (p,year),amount in sorted(totals.items())]
`,'Cắt mỗi kỳ bán theo ranh giới năm; lấy giao khoảng ngày với từng năm, tính cả hai đầu rồi nhân số ngày với doanh số trung bình ngày.','O(total spanned years)','O(products·years)',{difficulty:'hard'});
add(1385,'Find the Distance Value Between Two Arrays','array',[[4,5,8],[10,9,1,8],2],2,`
class Solution:
    def findTheDistanceValue(self, arr1, arr2, d):
        answer = 0
        for value in arr1:
            valid = all(abs(value-other) > d for other in arr2)
            answer += valid
        return answer
`,'Mỗi phần tử arr1 chỉ được tính nếu cách mọi phần tử arr2 lớn hơn d; chỉ một phần tử quá gần cũng bị loại.','O(mn)','O(1)',{difficulty:'easy'});
add(1389,'Create Target Array in the Given Order','array',[[0,1,2,3,4],[0,1,2,2,1]],[0,4,1,3,2],`
class Solution:
    def createTargetArray(self, nums, index):
        answer = []
        for value,position in zip(nums,index):
            answer.insert(position,value)
        return answer
`,'Xử lý đúng thứ tự đầu vào; chèn value tại position làm các phần tử cũ từ vị trí đó dịch sang phải một ô.','O(n²)','O(n)',{difficulty:'easy'});
add(1390,'Four Divisors','math',[[21,4,7]],32,`
class Solution:
    def sumFourDivisors(self, nums):
        from math import isqrt
        answer = 0
        for value in nums:
            divisors = {1,value}
            for divisor in range(2,isqrt(value)+1):
                if value%divisor == 0:
                    divisors.update([divisor,value//divisor])
                if len(divisors) > 4:
                    break
            if len(divisors) == 4:
                answer += sum(divisors)
        return answer
`,'Ước đi theo cặp d và n/d, chỉ cần thử tới căn. Chỉ cộng tổng ước của số có đúng bốn ước khác nhau; vượt bốn thì dừng sớm.','O(n√max value)','O(1)');
add(1392,'Longest Happy Prefix','string',['level'],'l',`
class Solution:
    def longestPrefix(self, s):
        prefix = [0]*len(s)
        for i in range(1,len(s)):
            matched = prefix[i-1]
            while matched and s[i] != s[matched]:
                matched = prefix[matched-1]
            if s[i] == s[matched]:
                matched += 1
            prefix[i] = matched
        return s[:prefix[-1]]
`,'Bảng KMP prefix[i] lưu tiền tố dài nhất cũng là hậu tố của s[:i+1], không tính cả chuỗi. Khi lệch, lùi theo bảng thay vì so lại từ đầu.','O(n)','O(n)',{difficulty:'hard',focus:['s','prefix','i','matched']});
add(1393,'Capital Gain/Loss','sql',[[{stock_name:'A',operation:'Buy',price:100},{stock_name:'A',operation:'Sell',price:150},{stock_name:'B',operation:'Buy',price:200},{stock_name:'B',operation:'Sell',price:150}]],[{stock_name:'A',capital_gain_loss:50},{stock_name:'B',capital_gain_loss:-50}],`
class Solution:
    def gains(self, stocks):
        totals = {}
        for row in stocks:
            name = row['stock_name']
            signed = row['price'] if row['operation'] == 'Sell' else -row['price']
            totals[name] = totals.get(name,0)+signed
        return [{'stock_name':name,'capital_gain_loss':total} for name,total in sorted(totals.items())]
`,'Giao dịch Buy là dòng tiền âm, Sell là dương. Cộng riêng từng mã chứng khoán để được lãi/lỗ vốn.','O(n log n)','O(n)');
add(1396,'Design Underground System','design',[[['checkIn',45,'Leyton',3],['checkIn',32,'Paradise',8],['checkOut',45,'Waterloo',15],['checkOut',32,'Cambridge',22],['getAverageTime','Leyton','Waterloo']]],[null,null,null,null,12],`
class Solution:
    def underground(self, operations):
        active,routes,answer = {},{},[]
        for operation in operations:
            if operation[0] == 'checkIn':
                active[operation[1]] = operation[2:]
                answer.append(None)
            elif operation[0] == 'checkOut':
                station,start = active.pop(operation[1])
                key = (station,operation[2])
                total,count = routes.get(key,(0,0))
                routes[key] = total+operation[3]-start,count+1
                answer.append(None)
            else:
                total,count = routes[operation[1],operation[2]]
                answer.append(total/count)
        return answer
`,'active giữ chuyến đang đi theo ID khách. Khi checkOut mới cộng thời gian vào tuyến có hướng (ga đầu,ga cuối); trung bình = tổng thời gian / số chuyến hoàn tất.','O(q)','O(users+routes+output)',{focus:['active','routes','key','answer']});
add(1398,'Customers Who Bought Products A and B but Not C','sql',[[{customer_id:1,customer_name:'Alice'},{customer_id:2,customer_name:'Bob'}],[{customer_id:1,product_name:'A'},{customer_id:1,product_name:'B'},{customer_id:2,product_name:'A'},{customer_id:2,product_name:'B'},{customer_id:2,product_name:'C'}]],[{customer_id:1,customer_name:'Alice'}],`
class Solution:
    def customers(self, customers, orders):
        bought = {}
        for row in orders:
            bought.setdefault(row['customer_id'],set()).add(row['product_name'])
        return [c for c in customers if {'A','B'} <= bought.get(c['customer_id'],set()) and 'C' not in bought.get(c['customer_id'],set())]
`,'Tập sản phẩm của khách phải chứa cả A và B, đồng thời tuyệt đối không chứa C. Dùng tập để lượt mua lặp không làm sai điều kiện.','O(customers+orders)','O(orders)');
module.exports=lessons;
