"use strict";
const {defineEasy}=require('./easy-lesson');const lessons={};const add=(...args)=>{const p=defineEasy(...args);lessons[p.id]=p;};
add(1501,'Countries You Can Safely Invest In','sql',[[{id:1,name:'Ada',phone_number:'0011234567'},{id:2,name:'Bob',phone_number:'0027654321'}],[{country_code:'001',name:'A'},{country_code:'002',name:'B'}],[{caller_id:1,callee_id:2,duration:10},{caller_id:1,callee_id:1,duration:30}]],[{country:'A'}],`
class Solution:
    def safeCountries(self, people, countries, calls):
        owners = {p['id']:p['phone_number'][:3] for p in people}
        globalAverage = sum(c['duration'] for c in calls)/len(calls)
        durations = {c['country_code']:[] for c in countries}
        for call in calls:
            for person in ('caller_id','callee_id'):
                durations[owners[call[person]]].append(call['duration'])
        answer = []
        for country in countries:
            values = durations[country['country_code']]
            if values and sum(values)/len(values) > globalAverage:
                answer.append({'country':country['name']})
        return answer
`,'Lấy ba ký tự đầu phone_number để JOIN mã quốc gia. Mỗi cuộc gọi đóng góp cho cả người gọi lẫn người nhận; so trung bình theo quốc gia với trung bình tất cả cuộc gọi, chỉ giữ quốc gia cao hơn nghiêm ngặt.','O(people+calls+countries)','O(people+calls)',{focus:['owners','durations','globalAverage','answer']});
add(1502,'Can Make Arithmetic Progression From Sequence','array',[[3,5,1]],true,`
class Solution:
    def canMakeArithmeticProgression(self, arr):
        ordered = sorted(arr)
        difference = ordered[1]-ordered[0]
        for i in range(2,len(ordered)):
            if ordered[i]-ordered[i-1] != difference:
                return False
        return True
`,'Sắp xếp rồi so từng khoảng cách kề nhau với khoảng cách đầu tiên. Một khoảng cách khác là đủ kết luận sai.','O(n log n)','O(n)');
add(1503,'Last Moment Before All Ants Fall Out of a Plank','math',[4,[4,3],[0,1]],4,`
class Solution:
    def getLastMoment(self, n, left, right):
        times = left+[n-position for position in right]
        answer = max(times,default=0)
        return answer
`,'Hai kiến đổi hướng khi gặp nhau tương đương đi xuyên qua nhau và đổi tên. Mỗi kiến đi trái cần position giây, đi phải cần n-position giây.','O(ants)','O(ants)');
add(1506,'Find Root of N-Ary Tree','tree',[[[1,[2,3]],[2,[]],[3,[]]]],1,`
class Solution:
    def findRoot(self, nodes):
        children = set()
        for value,childValues in nodes:
            children.update(childValues)
        for value,childValues in nodes:
            if value not in children:
                return value
`,'Đầu vào là [giá trị, danh sách giá trị con] của từng node. Node gốc là node duy nhất không xuất hiện trong tập con; thứ tự các node không quan trọng.','O(n)','O(n)');
add(1507,'Reformat Date','string',['20th Oct 2052'],'2052-10-20',`
class Solution:
    def reformatDate(self, date):
        day,month,year = date.split()
        months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split()
        number = months.index(month)+1
        return year+'-'+str(number).zfill(2)+'-'+day[:-2].zfill(2)
`,'Bỏ hậu tố st/nd/rd/th, đổi tên tháng thành số và thêm số 0 bên trái để được YYYY-MM-DD.','O(1)','O(1)');
add(1508,'Range Sum of Sorted Subarray Sums','array',[[1,2,3,4],4,1,5],13,`
class Solution:
    def rangeSum(self, nums, n, left, right):
        assert n == len(nums)
        sums = []
        for i in range(n):
            total = 0
            for j in range(i,n):
                total += nums[j]
                sums.append(total)
        sums.sort()
        selected = sums[left-1:right]
        return sum(selected)%1000000007
`,'Mở rộng từng đoạn con, lưu tổng rồi sắp xếp. left/right tính từ 1 nên lấy lát cắt [left-1:right]. Bản trực quan dùng cách liệt kê để thấy từng tổng.','O(n² log n)','O(n²)',{focus:['nums','sums','selected']});
add(1509,'Minimum Difference Between Largest and Smallest Value in Three Moves','greedy',[[5,3,2,4]],0,`
class Solution:
    def minDifference(self, nums):
        if len(nums) <= 4:
            return 0
        ordered = sorted(nums)
        answer = float('inf')
        for left in range(4):
            right = 3-left
            difference = ordered[len(nums)-1-right]-ordered[left]
            answer = min(answer,difference)
        return answer
`,'Ba lần đổi chỉ cần xử lý hai đầu mảng đã sắp xếp. Thử bỏ 0/1/2/3 phần tử nhỏ nhất và phần còn lại ở phía lớn nhất.','O(n log n)','O(n)');
add(1511,'Customer Order Frequency','sql',[[{customer_id:1,name:'Ada'},{customer_id:2,name:'Bob'}],[{product_id:1,price:100}],[{customer_id:1,product_id:1,order_date:'2020-06-01',quantity:1},{customer_id:1,product_id:1,order_date:'2020-07-01',quantity:2},{customer_id:2,product_id:1,order_date:'2020-06-01',quantity:1}]],[{customer_id:1,name:'Ada'}],`
class Solution:
    def orderFrequency(self, customers, products, orders):
        prices = {p['product_id']:p['price'] for p in products}
        totals = {}
        for order in orders:
            month = order['order_date'][:7]
            key = (order['customer_id'],month)
            totals[key] = totals.get(key,0)+order['quantity']*prices[order['product_id']]
        answer = []
        for customer in customers:
            user = customer['customer_id']
            if totals.get((user,'2020-06'),0) >= 100 and totals.get((user,'2020-07'),0) >= 100:
                answer.append(customer.copy())
        return answer
`,'JOIN đơn hàng với giá sản phẩm; cộng tiền theo khách và tháng. Chỉ giữ khách đạt ít nhất 100 ở cả tháng 6 và tháng 7 năm 2020.','O(products+orders+customers)','O(products+orders)',{focus:['totals','answer']});
add(1512,'Number of Good Pairs','array',[[1,2,3,1,1,3]],4,`
class Solution:
    def numIdenticalPairs(self, nums):
        counts,answer = {},0
        for value in nums:
            answer += counts.get(value,0)
            counts[value] = counts.get(value,0)+1
        return answer
`,'Khi gặp value, ghép nó với mọi lần xuất hiện trước của cùng giá trị. Cộng trước rồi mới tăng bộ đếm để không ghép với chính nó.','O(n)','O(n)');
add(1513,'Number of Substrings With Only 1s','string',['0110111'],9,`
class Solution:
    def numSub(self, s):
        run,answer = 0,0
        for char in s:
            run = run+1 if char == '1' else 0
            answer = (answer+run)%1000000007
        return answer
`,'Nếu chuỗi 1 liên tiếp kết thúc tại vị trí hiện tại dài run, có đúng run đoạn chỉ gồm 1 kết thúc ở đó. Gặp 0 thì run về 0.','O(n)','O(1)');
add(1515,'Best Position for a Service Centre','math',[[[0,1],[1,0],[1,2],[2,1]]],4,`
class Solution:
    def getMinDistSum(self, positions):
        import math
        x = sum(p[0] for p in positions)/len(positions)
        y = sum(p[1] for p in positions)/len(positions)
        def cost(a,b):
            return sum(math.hypot(a-p,b-q) for p,q in positions)
        answer,step = cost(x,y),100.0
        while step > 0.0000001:
            improved = False
            for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
                candidate = cost(x+dx*step,y+dy*step)
                if candidate < answer:
                    x,y,answer = x+dx*step,y+dy*step,candidate
                    improved = True
                    break
            if not improved:
                step /= 2
        return answer
`,'Dịch tâm theo bốn hướng để giảm tổng khoảng cách Euclid. Khi không hướng nào cải thiện, giảm bước một nửa; đây là tìm kiếm số gần đúng trên hàm lồi.','O(n·iterations)','O(1)',{focus:['x','y','step','answer'],traceOptions:{maxEvents:12000},description:'Numerical pattern search, stopping at a step below 1e-7.'});
add(1516,'Move Sub-Tree of N-Ary Tree','tree',[[[1,[2,3]],[2,[4]],[3,[]],[4,[]]],1,2,3],{root:1,nodes:[[1,[3]],[2,[4]],[3,[2]],[4,[]]]},`
class Solution:
    def moveSubTree(self, nodes, root, p, q):
        children = {value:childValues[:] for value,childValues in nodes}
        parent = {child:value for value,childValues in nodes for child in childValues}
        if parent.get(p) != q:
            stack,below = [p],set()
            while stack:
                node = stack.pop()
                below.add(node)
                stack.extend(children[node])
            old = parent.get(p)
            if q in below:
                children[parent[q]].remove(q)
                if old is None:
                    root = q
                else:
                    index = children[old].index(p)
                    children[old][index] = q
            elif old is not None:
                children[old].remove(p)
            children[q].append(p)
        return {'root':root,'nodes':[[value,children[value]] for value in sorted(children)]}
`,'Mỗi hàng mô tả node và danh sách con có thứ tự. Nếu q ở dưới p, tháo q ra và đặt q vào chỗ cũ của p trước khi nối p dưới q để tránh chu trình. Nếu p đã là con trực tiếp của q thì giữ nguyên.','O(n)','O(n)',{focus:['children','parent','below','root']});
add(1517,'Find Users With Valid E-Mails','sql',[[{user_id:1,name:'Ada',mail:'ada@leetcode.com'},{user_id:2,name:'Bob',mail:'.bob@leetcode.com'}]],[{user_id:1,name:'Ada',mail:'ada@leetcode.com'}],`
class Solution:
    def validEmails(self, users):
        import re
        answer = []
        for user in users:
            valid = re.fullmatch(r'[A-Za-z][A-Za-z0-9_.-]*@leetcode[.]com',user['mail']) is not None
            if valid:
                answer.append(user.copy())
        return answer
`,'Dùng khớp toàn bộ chuỗi: tên phải bắt đầu bằng chữ, phần còn lại chỉ chứa chữ/số/_, dấu chấm hoặc gạch ngang; miền phải đúng leetcode.com.','O(total characters)','O(rows)');
add(1518,'Water Bottles','math',[9,3],13,`
class Solution:
    def numWaterBottles(self, numBottles, numExchange):
        assert numExchange >= 2
        answer,empty = numBottles,numBottles
        while empty >= numExchange:
            full,remainder = divmod(empty,numExchange)
            answer += full
            empty = full+remainder
        return answer
`,'Sau khi uống, chai đầy trở thành chai rỗng. Mỗi vòng đổi floor(empty/rate) chai và giữ phần dư; đừng bỏ mất chai rỗng vừa uống.','O(log bottles)','O(1)');
add(1522,'Diameter of N-Ary Tree','tree',[[1,[[2,[[4,[]]]],[3,[]]]]],3,`
class Solution:
    def diameter(self, root):
        answer = 0
        def depth(node):
            nonlocal answer
            if not node:
                return 0
            heights = sorted((depth(child) for child in node[1]),reverse=True)+[0,0]
            answer = max(answer,heights[0]+heights[1])
            return heights[0]+1
        depth(root)
        return answer
`,'Node được nhập [giá trị, các cây con]. Tại mỗi node, đường kính đi qua nó là tổng hai nhánh cao nhất; kết quả đo bằng số cạnh.','O(n log degree)','O(n)',{focus:['node','heights','answer'],diagram:'nary'});
add(1523,'Count Odd Numbers in an Interval Range','math',[3,7],3,`
class Solution:
    def countOdds(self, low, high):
        throughHigh = (high+1)//2
        beforeLow = low//2
        return throughHigh-beforeLow
`,'Có (x+1)//2 số lẻ từ 0 đến x. Lấy số lẻ không vượt high trừ số lẻ nằm trước low.','O(1)','O(1)');
add(1525,'Number of Good Ways to Split a String','string',['aacaba'],2,`
class Solution:
    def numSplits(self, s):
        from collections import Counter
        right,left,answer = Counter(s),set(),0
        for char in s[:-1]:
            left.add(char)
            right[char] -= 1
            if right[char] == 0:
                del right[char]
            if len(left) == len(right):
                answer += 1
        return answer
`,'Dịch đường cắt sang phải một chữ mỗi lần. Set đếm chữ khác nhau bên trái; Counter chỉ giữ các chữ còn ở bên phải.','O(n)','O(alphabet)');
add(1527,'Patients With a Condition','sql',[[{patient_id:1,patient_name:'A',conditions:'ACNE DIAB100'},{patient_id:2,patient_name:'B',conditions:'XDIAB100'}]],[{patient_id:1,patient_name:'A',conditions:'ACNE DIAB100'}],`
class Solution:
    def findPatients(self, patients):
        answer = []
        for patient in patients:
            tokens = patient['conditions'].split()
            if any(code.startswith('DIAB1') for code in tokens):
                answer.append(patient.copy())
        return answer
`,'Tách conditions thành từng mã bệnh. Chỉ mã bắt đầu bằng DIAB1 mới hợp lệ; DIAB1 ở giữa một mã khác không được tính.','O(total characters)','O(rows)');
add(1528,'Shuffle String','string',['codeleet',[4,5,6,7,0,2,1,3]],'leetcode',`
class Solution:
    def restoreString(self, s, indices):
        answer = ['']*len(s)
        for i,char in enumerate(s):
            destination = indices[i]
            answer[destination] = char
        return ''.join(answer)
`,'indices[i] là vị trí đích của s[i]. Tô từng ô được điền để tránh nhầm ánh xạ nguồn và đích.','O(n)','O(n)');
add(1529,'Minimum Suffix Flips','greedy',['10111'],3,`
class Solution:
    def minFlips(self, target):
        state,answer = '0',0
        for char in target:
            if char != state:
                answer += 1
                state = char
        return answer
`,'Mỗi lần lật tác động toàn bộ hậu tố. state cho biết bit đang thấy sau các lần lật trước; chỉ lật khi bit đó khác target.','O(n)','O(1)');
add(1530,'Number of Good Leaf Nodes Pairs','tree',[[1,2,3,null,4],3],1,`
class Solution:
    def countPairs(self, root, distance):
        answer = 0
        def visit(node):
            nonlocal answer
            if not node:
                return []
            if not node.left and not node.right:
                return [0]
            left,right = visit(node.left),visit(node.right)
            for a in left:
                for b in right:
                    if a+b+2 <= distance:
                        answer += 1
            return [d+1 for d in left+right if d+1 < distance]
        visit(root)
        return answer
`,'Mỗi node trả khoảng cách đến lá ở dưới nó. Ghép một lá bên trái với một lá bên phải qua hai cạnh nối node hiện tại; bỏ khoảng cách quá xa.','O(n·leaves²)','O(n)',{kinds:['tree'],focus:['left','right','distance','answer']});
add(1532,'The Most Recent Three Orders','sql',[[{customer_id:1,name:'Ada'}],[{order_id:1,customer_id:1,order_date:'2020-01-01'},{order_id:2,customer_id:1,order_date:'2020-02-01'}]],[{customer_name:'Ada',customer_id:1,order_id:2,order_date:'2020-02-01'},{customer_name:'Ada',customer_id:1,order_id:1,order_date:'2020-01-01'}],`
class Solution:
    def recentOrders(self, customers, orders):
        answer = []
        for customer in sorted(customers,key=lambda c:(c['name'],c['customer_id'])):
            selected = sorted((o for o in orders if o['customer_id'] == customer['customer_id']),key=lambda o:o['order_date'],reverse=True)[:3]
            for order in selected:
                answer.append({'customer_name':customer['name'],'customer_id':customer['customer_id'],'order_id':order['order_id'],'order_date':order['order_date']})
        return answer
`,'Chia đơn theo khách, xếp ngày giảm dần rồi lấy tối đa ba đơn mỗi khách. Bảng kết quả xếp tên khách, ID khách và ngày đơn giảm dần.','O(customers·orders log orders)','O(rows)',{focus:['customer','selected','answer']});
add(1533,'Find the Index of the Large Integer','search',[[7,7,7,10,7,7,7,7]],3,`
class Solution:
    def getIndex(self, values):
        left,right = 0,len(values)-1
        while left < right:
            length = right-left+1
            half = length//2
            a = sum(values[left:left+half])
            start = right-half+1
            b = sum(values[start:right+1])
            if a == b:
                return left+half
            if a > b:
                right = left+half-1
            else:
                left = start
        return left
`,'Mô phỏng ArrayReader.compareSub bằng tổng hai đoạn cùng độ dài. Nếu độ dài lẻ, bỏ ô giữa khi so; hai tổng bằng nhau thì số lớn nằm đúng ở giữa.','O(n) model work; O(log n) reader comparisons','O(n) slices',{description:'ArrayReader is modeled by equal-length slice sums; no hidden-array API is called.',focus:['values','left','right','a','b']});
add(1534,'Count Good Triplets','array',[[3,0,1,1,9,7],7,2,3],4,`
class Solution:
    def countGoodTriplets(self, arr, a, b, c):
        answer = 0
        for i in range(len(arr)):
            for j in range(i+1,len(arr)):
                for k in range(j+1,len(arr)):
                    if abs(arr[i]-arr[j]) <= a and abs(arr[j]-arr[k]) <= b and abs(arr[i]-arr[k]) <= c:
                        answer += 1
        return answer
`,'Chỉ xét i<j<k để mỗi bộ xuất hiện đúng một lần. Cả ba điều kiện khoảng cách phải cùng đúng mới tăng kết quả.','O(n³)','O(1)',{focus:['arr','i','j','k','answer']});
add(1535,'Find the Winner of an Array Game','array',[[2,1,3,5,4,6,7],2],5,`
class Solution:
    def getWinner(self, arr, k):
        champion,wins = arr[0],0
        for challenger in arr[1:]:
            if challenger > champion:
                champion,wins = challenger,0
            wins += 1
            if wins == k:
                return champion
        return champion
`,'Giữ nhà vô địch ở đầu hàng. Người thách đấu lớn hơn sẽ thay thế và bắt đầu chuỗi thắng mới; nếu duyệt hết, số lớn nhất sẽ thắng mọi vòng tiếp theo.','O(n)','O(n)');
add(1536,'Minimum Swaps to Arrange a Binary Grid','greedy',[[[0,0,1],[1,1,0],[1,0,0]]],3,`
class Solution:
    def minSwaps(self, grid):
        n,zeros = len(grid),[]
        for row in grid:
            count = 0
            for value in reversed(row):
                if value:
                    break
                count += 1
            zeros.append(count)
        answer = 0
        for i in range(n):
            j = i
            while j < n and zeros[j] < n-i-1:
                j += 1
            if j == n:
                return -1
            answer += j-i
            zeros.insert(i,zeros.pop(j))
        return answer
`,'Hàng i cần ít nhất n-i-1 số 0 ở cuối. Chọn hàng gần nhất phía dưới thỏa điều kiện rồi kéo lên bằng các đổi chỗ kề nhau.','O(n²)','O(n)',{focus:['grid','zeros','i','j','answer']});
add(1537,'Get the Maximum Score','dp',[[2,4,5,8,10],[4,6,8,9]],30,`
class Solution:
    def maxSum(self, nums1, nums2):
        i,j,a,b = 0,0,0,0
        while i < len(nums1) and j < len(nums2):
            if nums1[i] < nums2[j]:
                a += nums1[i]
                i += 1
            elif nums1[i] > nums2[j]:
                b += nums2[j]
                j += 1
            else:
                a = b = max(a,b)+nums1[i]
                i,j = i+1,j+1
        return (max(a+sum(nums1[i:]),b+sum(nums2[j:])))%1000000007
`,'Hai con trỏ đi trên hai đường tăng dần. Chỉ tại giá trị chung mới được đổi đường; khi gặp nhau, cả hai tổng cùng nhận tổng tốt hơn cộng giá trị chung một lần.','O(n+m)','O(n+m)');
add(1538,'Guess the Majority in a Hidden Array','array',[[0,0,1,0,1,1,1,1]],4,`
class Solution:
    def guessMajority(self, bits):
        assert len(bits) >= 5
        def query(a,b,c,d):
            count = bits[a]+bits[b]+bits[c]+bits[d]
            return 4 if count in (0,4) else 2 if count in (1,3) else 0
        base = query(0,1,2,3)
        fourth = query(0,1,2,4)
        same = [3]
        different = []
        for i in range(4,len(bits)):
            (same if query(0,1,2,i) == base else different).append(i)
        for i in range(3):
            others = [j for j in range(3) if j != i]
            value = query(others[0],others[1],3,4)
            (same if value == fourth else different).append(i)
        if len(same) == len(different):
            return -1
        return same[0] if len(same) > len(different) else different[0]
`,'Mô phỏng query chỉ trả 0/2/4 cho bốn bit. So hai query chung ba vị trí để biết hai vị trí còn lại giống hay khác nhau; đếm nhóm so với bit ở index 3, không đọc bit khi quyết định.','O(n) queries','O(n)',{description:'Hidden reader is modeled locally by query(a,b,c,d). Returned index may be any majority element.',focus:['same','different','base','fourth']});
add(1540,'Can Convert String in K Moves','string',['input','ouput',9],true,`
class Solution:
    def canConvertString(self, s, t, k):
        if len(s) != len(t):
            return False
        used = {}
        for a,b in zip(s,t):
            shift = (ord(b)-ord(a))%26
            if shift:
                move = shift+26*used.get(shift,0)
                if move > k:
                    return False
                used[shift] = used.get(shift,0)+1
        return True
`,'Một độ dịch d chỉ dùng ở các lượt d,d+26,d+52,… vì mỗi lượt được chọn tối đa một ký tự. Bộ đếm used phân phối đúng lượt cho các ký tự cần cùng độ dịch.','O(n)','O(26)');
add(1542,'Find Longest Awesome Substring','bits',['3242415'],5,`
class Solution:
    def longestAwesome(self, s):
        first,mask,answer = {0:-1},0,0
        for i,char in enumerate(s):
            mask ^= 1<<int(char)
            for candidate in [mask]+[mask^(1<<bit) for bit in range(10)]:
                if candidate in first:
                    answer = max(answer,i-first[candidate])
            if mask not in first:
                first[mask] = i
        return answer
`,'Mask lưu chẵn/lẻ của 10 chữ số. Một đoạn sắp xếp thành palindrome khi có tối đa một số xuất hiện lẻ; tìm prefix cùng mask hoặc khác đúng một bit.','O(10n)','O(1024)',{focus:['s','mask','first','answer']});
add(1543,'Fix Product Name Format','sql',[[{sale_id:1,product_name:' Lc Phone ',sale_date:'2000-01-16'},{sale_id:2,product_name:'LC PHONE',sale_date:'2000-01-17'}]],[{product_name:'lc phone',sale_date:'2000-01',total:2}],`
class Solution:
    def fixNames(self, sales):
        counts = {}
        for sale in sales:
            key = (sale['product_name'].strip().lower(),sale['sale_date'][:7])
            counts[key] = counts.get(key,0)+1
        return [{'product_name':name,'sale_date':month,'total':counts[name,month]} for name,month in sorted(counts)]
`,'Chuẩn hóa tên bằng trim rồi lower trước khi GROUP BY. Nhóm theo tên chuẩn và tháng YYYY-MM; đếm số lượt bán.','O(rows log rows)','O(rows)');
add(1544,'Make The String Great','string',['leEeetcode'],'leetcode',`
class Solution:
    def makeGood(self, s):
        stack = []
        for char in s:
            if stack and abs(ord(stack[-1])-ord(char)) == 32:
                stack.pop()
            else:
                stack.append(char)
        return ''.join(stack)
`,'Stack chỉ giữ phần đã xử lý không còn cặp xấu. Hai chữ cùng tên nhưng trái hoa/thường triệt tiêu; sau pop, cặp mới lộ ra sẽ được xét ở lần tiếp theo.','O(n)','O(n)');
add(1545,'Find Kth Bit in Nth Binary String','string',[3,1],'0',`
class Solution:
    def findKthBit(self, n, k):
        inverted = False
        while n > 1:
            middle = 1<<(n-1)
            if k == middle:
                return '0' if inverted else '1'
            if k > middle:
                k = 2*middle-k
                inverted = not inverted
            n -= 1
        return '1' if inverted else '0'
`,'Không tạo chuỗi dài. Nửa phải là nửa trái đảo thứ tự rồi đảo bit: phản chiếu k qua tâm và đổi cờ inverted; ô tâm luôn là 1 trước khi đảo.','O(n)','O(1)');
add(1546,'Maximum Number of Non-Overlapping Subarrays With Sum Equals Target','greedy',[[1,1,1,1,1],2],2,`
class Solution:
    def maxNonOverlapping(self, nums, target):
        seen,total,answer = {0},0,0
        for value in nums:
            total += value
            if total-target in seen:
                answer += 1
                total,seen = 0,{0}
            else:
                seen.add(total)
        return answer
`,'Khi tìm thấy đoạn tổng target kết thúc sớm nhất, chốt ngay để dành phần đuôi dài nhất. Xóa các prefix cũ để đoạn tiếp theo không chồng lên đoạn đã chọn.','O(n)','O(n)');
add(1548,'The Most Similar Path in a Graph','dp',[5,[[0,2],[0,3],[1,2],[1,3],[1,4],[2,4]],['ATL','PEK','LAX','DXB','HND'],['ATL','DXB','HND']],[0,2,4],`
class Solution:
    def mostSimilar(self, n, roads, names, targetPath):
        graph = [[] for _ in range(n)]
        for a,b in roads:
            graph[a].append(b)
            graph[b].append(a)
        states = [(int(names[node] != targetPath[0]),[node]) for node in range(n)]
        for wanted in targetPath[1:]:
            nextStates = []
            for node in range(n):
                choices = [(states[old][0]+int(names[node] != wanted),states[old][1]+[node]) for old in graph[node] if states[old][1]]
                nextStates.append(min(choices) if choices else (float('inf'),[]))
            states = nextStates
        return min(states)[1]
`,'DP theo vị trí trong target và thành phố kết thúc. Mỗi bước chỉ nối từ hàng xóm; chi phí tăng 1 nếu tên khác. Lưu cả đường đi để truy ngược, hòa điểm chọn đường nhỏ theo từ điển.','O(target·edges·target)','O(n·target)',{focus:['graph','states','nextStates','wanted']});
add(1549,'The Most Recent Orders for Each Product','sql',[[{product_id:1,product_name:'Keyboard'}],[{order_id:1,product_id:1,order_date:'2020-01-01'},{order_id:2,product_id:1,order_date:'2020-02-01'}]],[{product_name:'Keyboard',product_id:1,order_id:2,order_date:'2020-02-01'}],`
class Solution:
    def recentProductOrders(self, products, orders):
        answer = []
        for product in sorted(products,key=lambda p:(p['product_name'],p['product_id'])):
            rows = [o for o in orders if o['product_id'] == product['product_id']]
            latest = max((o['order_date'] for o in rows),default=None)
            for order in sorted(rows,key=lambda o:o['order_id']):
                if order['order_date'] == latest:
                    answer.append({'product_name':product['product_name'],'product_id':product['product_id'],'order_id':order['order_id'],'order_date':latest})
        return answer
`,'Tìm ngày mới nhất riêng cho mỗi sản phẩm rồi giữ tất cả đơn cùng ngày đó; không bỏ các đơn đồng hạng.','O(products·orders log orders)','O(rows)',{focus:['rows','latest','answer']});
add(1550,'Three Consecutive Odds','array',[[2,6,4,1,3,5]],true,`
class Solution:
    def threeConsecutiveOdds(self, arr):
        run = 0
        for value in arr:
            run = run+1 if value%2 else 0
            if run == 3:
                return True
        return False
`,'Đếm độ dài dãy lẻ liên tiếp đang kết thúc ở ô hiện tại. Số chẵn ngắt dãy và đưa run về 0.','O(n)','O(1)');
add(1551,'Minimum Operations to Make Array Equal','math',[3],2,`
class Solution:
    def minOperations(self, n):
        values = [2*i+1 for i in range(n)]
        answer = 0
        for value in values:
            if value < n:
                answer += n-value
        return answer
`,'Trung bình của 1,3,…,2n-1 là n. Mỗi thao tác chuyển một đơn vị từ bên lớn sang bên nhỏ; cộng lượng thiếu của các số nhỏ hơn n.','O(n)','O(n)');
add(1553,'Minimum Number of Days to Eat N Oranges','dp',[10],4,`
class Solution:
    def minDays(self, n):
        from functools import lru_cache
        @lru_cache(None)
        def days(value):
            if value <= 1:
                return value
            byTwo = value%2+days(value//2)
            byThree = value%3+days(value//3)
            return 1+min(byTwo,byThree)
        return days(n)
`,'Để ăn theo nhóm 2 hoặc 3, trước hết ăn lẻ value%2 hoặc value%3 quả cho chia hết. Một ngày ăn nhóm rồi giải phần còn lại; cache tránh tính lại.','O(log² n)','O(log² n)');
add(1555,'Bank Account Summary','sql',[[{user_id:1,user_name:'Ada',credit:100},{user_id:2,user_name:'Bob',credit:50}],[{paid_by:1,paid_to:2,amount:120}]],[{user_id:1,user_name:'Ada',credit:-20,credit_limit_breached:'Yes'},{user_id:2,user_name:'Bob',credit:170,credit_limit_breached:'No'}],`
class Solution:
    def bankSummary(self, users, transactions):
        balance = {u['user_id']:u['credit'] for u in users}
        for transaction in transactions:
            balance[transaction['paid_by']] -= transaction['amount']
            balance[transaction['paid_to']] += transaction['amount']
        answer = []
        for user in users:
            credit = balance[user['user_id']]
            answer.append({'user_id':user['user_id'],'user_name':user['user_name'],'credit':credit,'credit_limit_breached':'Yes' if credit < 0 else 'No'})
        return answer
`,'Mỗi giao dịch giảm số dư người gửi và tăng số dư người nhận đúng cùng số tiền. Sau tất cả giao dịch, credit âm mới là vượt hạn mức.','O(users+transactions)','O(users)',{focus:['balance','transaction','answer']});
add(1556,'Thousand Separator','string',[987654321],'987.654.321',`
class Solution:
    def thousandSeparator(self, n):
        digits,groups = str(n),[]
        while digits:
            groups.append(digits[-3:])
            digits = digits[:-3]
        return '.'.join(reversed(groups))
`,'Tách từng nhóm ba chữ số từ phải sang trái. Đảo thứ tự nhóm rồi nối bằng dấu chấm; số 0 vẫn là một nhóm.','O(digits)','O(digits)');
add(1557,'Minimum Number of Vertices to Reach All Nodes','graph',[6,[[0,1],[0,2],[2,5],[3,4],[4,2]]],[0,3],`
class Solution:
    def findSmallestSetOfVertices(self, n, edges):
        indegree = [0]*n
        for a,b in edges:
            indegree[b] += 1
        return [node for node in range(n) if indegree[node] == 0]
`,'Trong DAG, node có bậc vào 0 không thể được tới từ node khác nên bắt buộc chọn. Mọi node còn lại đều có thể lần ngược đến một nguồn.','O(n+edges)','O(n)');
add(1558,'Minimum Numbers of Function Calls to Make Target Array','bits',[[1,5]],5,`
class Solution:
    def minOperations(self, nums):
        increments,doublings = 0,0
        for value in nums:
            increments += value.bit_count()
            doublings = max(doublings,max(0,value.bit_length()-1))
        return increments+doublings
`,'Làm ngược: xóa các bit 1 bằng giảm riêng từng số, rồi chia đôi cả mảng. Mỗi bit 1 cần một tăng; số lần nhân đôi chung bằng vị trí bit cao nhất.','O(n log max)','O(1)');
add(1560,'Most Visited Sector in a Circular Track','array',[4,[1,3,1,2]],[1,2],`
class Solution:
    def mostVisited(self, n, rounds):
        counts = [0]*n
        sector = rounds[0]
        counts[sector-1] += 1
        for end in rounds[1:]:
            while sector != end:
                sector = sector%n+1
                counts[sector-1] += 1
        highest = max(counts)
        return [i+1 for i,value in enumerate(counts) if value == highest]
`,'Đi từng sector theo chiều tăng và quấn từ n về 1. Đếm vị trí xuất phát đúng một lần, sau đó chỉ đếm khi bước sang ô mới.','O(n·rounds)','O(n)',{focus:['counts','sector','end']});
add(1561,'Maximum Number of Coins You Can Get','greedy',[[2,4,1,2,7,8]],9,`
class Solution:
    def maxCoins(self, piles):
        ordered = sorted(piles)
        left,right,answer = 0,len(piles)-1,0
        while left < right:
            alice = ordered[right]
            yours = ordered[right-1]
            bob = ordered[left]
            answer += yours
            left,right = left+1,right-2
        return answer
`,'Mỗi vòng cho Alice đống lớn nhất, mình lấy đống lớn thứ hai và Bob nhận đống nhỏ nhất. Hai đầu mảng đã sắp xếp cho thấy rõ ba lựa chọn.','O(n log n)','O(n)');
add(1562,'Find Latest Group of Size M','array',[[3,5,1,2,4],1],4,`
class Solution:
    def findLatestStep(self, arr, m):
        n = len(arr)
        lengths,groups,answer = [0]*(n+2),0,-1
        for step,position in enumerate(arr,1):
            left,right = lengths[position-1],lengths[position+1]
            groups -= int(left == m)+int(right == m)
            size = left+right+1
            lengths[position-left] = lengths[position+right] = size
            lengths[position] = size
            groups += int(size == m)
            if groups:
                answer = step
        return answer
`,'Bật một bit sẽ nối nhóm trái, ô mới và nhóm phải. Chỉ độ dài ở hai biên nhóm được đọc; cập nhật số nhóm dài m trước và sau phép gộp.','O(n)','O(n)',{focus:['lengths','position','left','right','groups','answer']});
add(1564,'Put Boxes Into the Warehouse I','greedy',[[4,3,4,1],[5,3,3,4,1]],3,`
class Solution:
    def maxBoxesInWarehouse(self, boxes, warehouse):
        capacity = warehouse[:]
        for i in range(1,len(capacity)):
            capacity[i] = min(capacity[i],capacity[i-1])
        ordered,index = sorted(boxes),0
        for room in reversed(capacity):
            if index < len(ordered) and ordered[index] <= room:
                index += 1
        return index
`,'Chỉ đưa hộp từ bên trái. Sức chứa thực của phòng là chiều cao nhỏ nhất trên đường vào; ghép hộp nhỏ nhất vào các phòng từ sâu nhất trở ra.','O(b log b+w)','O(b+w)');
add(1565,'Unique Orders and Customers Per Month','sql',[[{order_id:1,order_date:'2020-01-01',customer_id:1,invoice:21},{order_id:2,order_date:'2020-01-02',customer_id:1,invoice:30},{order_id:3,order_date:'2020-01-03',customer_id:2,invoice:20}]],[{month:'2020-01',order_count:2,customer_count:1}],`
class Solution:
    def monthlyOrders(self, orders):
        groups = {}
        for order in orders:
            if order['invoice'] > 20:
                month = order['order_date'][:7]
                if month not in groups:
                    groups[month] = [set(),set()]
                groups[month][0].add(order['order_id'])
                groups[month][1].add(order['customer_id'])
        return [{'month':month,'order_count':len(ids),'customer_count':len(users)} for month,(ids,users) in sorted(groups.items())]
`,'Lọc invoice >20 trước khi nhóm theo tháng. Hai set riêng đếm đơn và khách duy nhất; một khách đặt nhiều đơn vẫn chỉ được tính một lần.','O(rows log rows)','O(rows)');
add(1566,'Detect Pattern of Length M Repeated K or More Times','array',[[1,2,4,4,4,4],1,3],true,`
class Solution:
    def containsPattern(self, arr, m, k):
        for start in range(len(arr)-m*k+1):
            block = arr[start:start+m]
            candidate = arr[start:start+m*k]
            if candidate == block*k:
                return True
        return False
`,'Chọn điểm bắt đầu rồi so đoạn m·k phần tử với k bản sao liên tiếp của block dài m. Các lần lặp không được có khoảng trống.','O(nmk)','O(mk)');
add(1567,'Maximum Length of Subarray With Positive Product','dp',[[1,-2,-3,4]],4,`
class Solution:
    def getMaxLen(self, nums):
        positive,negative,answer = 0,0,0
        for value in nums:
            if value == 0:
                positive,negative = 0,0
            elif value > 0:
                positive,negative = positive+1,negative+1 if negative else 0
            else:
                positive,negative = negative+1 if negative else 0,positive+1
            answer = max(answer,positive)
        return answer
`,'Giữ độ dài lớn nhất của đoạn kết thúc tại đây có tích dương và tích âm. Số âm đổi hai vai; số 0 cắt cả hai đoạn.','O(n)','O(1)');
add(1569,'Number of Ways to Reorder Array to Get Same BST','dp',[[2,1,3]],1,`
class Solution:
    def numOfWays(self, nums):
        from math import comb
        def ways(values):
            if len(values) <= 2:
                return 1
            left = [x for x in values[1:] if x < values[0]]
            right = [x for x in values[1:] if x > values[0]]
            interleavings = comb(len(left)+len(right),len(left))
            return interleavings*ways(left)*ways(right)%1000000007
        return (ways(nums)-1)%1000000007
`,'Gốc phải giữ nguyên. Chia phần còn lại thành nhánh nhỏ/lớn; thứ tự tương đối trong từng nhánh phải tạo đúng BST. Chọn vị trí xen kẽ hai nhánh bằng tổ hợp rồi nhân số cách con.','O(n²)','O(n²)',{focus:['values','left','right','interleavings']});
add(1571,'Warehouse Manager','sql',[[{name:'A',product_id:1,units:3},{name:'A',product_id:2,units:2}],[{product_id:1,Width:2,Length:3,Height:4},{product_id:2,Width:1,Length:1,Height:1}]],[{warehouse_name:'A',volume:74}],`
class Solution:
    def warehouseVolume(self, warehouse, products):
        size = {p['product_id']:p['Width']*p['Length']*p['Height'] for p in products}
        volumes = {}
        for row in warehouse:
            volumes[row['name']] = volumes.get(row['name'],0)+row['units']*size[row['product_id']]
        return [{'warehouse_name':name,'volume':volume} for name,volume in sorted(volumes.items())]
`,'JOIN theo product_id để có thể tích một đơn vị. Nhân số lượng từng sản phẩm rồi cộng theo tên kho.','O(products+rows log rows)','O(products+warehouses)');
add(1572,'Matrix Diagonal Sum','array',[[[1,2,3],[4,5,6],[7,8,9]]],25,`
class Solution:
    def diagonalSum(self, mat):
        n,answer = len(mat),0
        for r in range(n):
            for c in {r,n-1-r}:
                answer += mat[r][c]
        return answer
`,'Mỗi hàng chọn c=r và c=n-1-r. Dùng set của hai cột để ô giữa ma trận lẻ chỉ được cộng một lần.','O(n)','O(1)');
add(1573,'Number of Ways to Split a String','math',['10101'],4,`
class Solution:
    def numWays(self, s):
        ones = [i for i,char in enumerate(s) if char == '1']
        if len(ones)%3:
            return 0
        if not ones:
            return ((len(s)-1)*(len(s)-2)//2)%1000000007
        k = len(ones)//3
        firstGap = ones[k]-ones[k-1]
        secondGap = ones[2*k]-ones[2*k-1]
        return firstGap*secondGap%1000000007
`,'Ba đoạn phải có số bit 1 bằng nhau. Hai đường cắt chỉ được nằm trong hai khoảng giữa các nhóm 1; số cách là tích độ dài hai khoảng. Chuỗi toàn 0 dùng tổ hợp chọn hai đường cắt.','O(n)','O(n)');
add(1575,'Count All Possible Routes','dp',[[2,3,6,8,4],1,3,5],4,`
class Solution:
    def countRoutes(self, locations, start, finish, fuel):
        from functools import lru_cache
        assert len(set(locations)) == len(locations)
        @lru_cache(None)
        def routes(city,left):
            answer = int(city == finish)
            for nextCity in range(len(locations)):
                cost = abs(locations[city]-locations[nextCity])
                if nextCity != city and cost <= left:
                    answer += routes(nextCity,left-cost)
            return answer%1000000007
        return routes(start,fuel)
`,'Trạng thái là thành phố và nhiên liệu còn lại. Đến finish được tính một tuyến nhưng vẫn có thể đi tiếp rồi quay lại. Mọi chặng tiêu nhiên liệu dương nên đệ quy luôn tiến đến điểm dừng.','O(n²·fuel)','O(n·fuel)');
add(1576,'Replace All Question Marks to Avoid Consecutive Repeating Characters','string',['?zs'],'azs',`
class Solution:
    def modifyString(self, s):
        chars = list(s)
        for i in range(len(chars)):
            if chars[i] == '?':
                neighbors = (chars[i-1] if i else '',chars[i+1] if i+1 < len(chars) else '')
                chars[i] = next(c for c in 'abc' if c not in neighbors)
        return ''.join(chars)
`,'Tại dấu ?, tránh tối đa hai chữ hàng xóm. Ba lựa chọn a/b/c luôn đủ; ô bên trái đã cố định, ô bên phải là chữ có sẵn hoặc sẽ được xử lý sau.','O(n)','O(n)');
add(1577,'Number of Ways Where Square of Number Is Equal to Product of Two Numbers','array',[[7,4],[5,2,8,9]],1,`
class Solution:
    def numTriplets(self, nums1, nums2):
        def count(squares,values):
            answer = 0
            for value in squares:
                seen = {}
                for other in values:
                    if value*value%other == 0:
                        answer += seen.get(value*value//other,0)
                    seen[other] = seen.get(other,0)+1
            return answer
        return count(nums1,nums2)+count(nums2,nums1)
`,'Cố định số cần bình phương. Quét mảng còn lại, tìm bạn ghép đã xuất hiện trước để tích bằng bình phương; sau đó đổi vai hai mảng.','O(nm)','O(n+m)');
add(1578,'Minimum Time to Make Rope Colorful','greedy',['abaac',[1,2,3,4,5]],3,`
class Solution:
    def minCost(self, colors, neededTime):
        answer,largest = 0,0
        for i,cost in enumerate(neededTime):
            if i == 0 or colors[i] != colors[i-1]:
                largest = 0
            answer += min(largest,cost)
            largest = max(largest,cost)
        return answer
`,'Trong mỗi nhóm cùng màu liên tiếp chỉ giữ một quả. Giữ quả tốn thời gian xóa lớn nhất; khi thêm quả mới, xóa quả rẻ hơn giữa nó và quả đang giữ.','O(n)','O(1)');
add(1580,'Put Boxes Into the Warehouse II','greedy',[[1,2,2,3,4],[3,4,1,2]],4,`
class Solution:
    def maxBoxesInWarehouse(self, boxes, warehouse):
        left,right = warehouse[:],warehouse[:]
        for i in range(1,len(left)):
            left[i] = min(left[i-1],left[i])
        for i in range(len(right)-2,-1,-1):
            right[i] = min(right[i+1],right[i])
        capacities = sorted(max(a,b) for a,b in zip(left,right))
        ordered,index = sorted(boxes),0
        for capacity in capacities:
            if index < len(ordered) and ordered[index] <= capacity:
                index += 1
        return index
`,'Hộp có thể vào từ hai đầu. Với mỗi phòng, tính nút thắt từ trái và từ phải, lấy đường tốt hơn; ghép hộp nhỏ nhất với sức chứa nhỏ nhất còn dùng được.','O(b log b+w log w)','O(b+w)',{focus:['left','right','capacities','ordered','index']});
add(1581,'Customer Who Visited but Did Not Make Any Transactions','sql',[[{visit_id:1,customer_id:23},{visit_id:2,customer_id:9},{visit_id:3,customer_id:23}],[{transaction_id:1,visit_id:2,amount:50}]],[{customer_id:23,count_no_trans:2}],`
class Solution:
    def visitsWithoutTransactions(self, visits, transactions):
        paid = {row['visit_id'] for row in transactions}
        counts = {}
        for visit in visits:
            if visit['visit_id'] not in paid:
                user = visit['customer_id']
                counts[user] = counts.get(user,0)+1
        return [{'customer_id':user,'count_no_trans':count} for user,count in sorted(counts.items())]
`,'Tạo tập visit_id đã có giao dịch. Chỉ lượt ghé không nằm trong tập này mới được cộng vào khách tương ứng.','O(visits+transactions+customers log customers)','O(visits)');
add(1582,'Special Positions in a Binary Matrix','array',[[[1,0,0],[0,0,1],[1,0,0]]],1,`
class Solution:
    def numSpecial(self, mat):
        rows = [sum(row) for row in mat]
        cols = [sum(row[c] for row in mat) for c in range(len(mat[0]))]
        answer = 0
        for r in range(len(mat)):
            for c in range(len(mat[0])):
                if mat[r][c] == 1 and rows[r] == cols[c] == 1:
                    answer += 1
        return answer
`,'Ô đặc biệt phải là 1 duy nhất trong cả hàng lẫn cột. Tính tổng hàng và tổng cột trước để kiểm tra mỗi ô trong O(1).','O(rows·cols)','O(rows+cols)');
add(1583,'Count Unhappy Friends','array',[4,[[1,2,3],[3,2,0],[3,1,0],[1,2,0]],[[0,1],[2,3]]],2,`
class Solution:
    def unhappyFriends(self, n, preferences, pairs):
        rank = [{person:i for i,person in enumerate(row)} for row in preferences]
        partner = {}
        for a,b in pairs:
            partner[a],partner[b] = b,a
        unhappy = []
        for x in range(n):
            for u in preferences[x][:rank[x][partner[x]]]:
                if rank[u][x] < rank[u][partner[u]]:
                    unhappy.append(x)
                    break
        return len(unhappy)
`,'x không vui nếu có u mà x thích hơn bạn hiện tại và u cũng thích x hơn bạn của u. Bảng rank chuyển so sở thích thành so số nhỏ hơn.','O(n²)','O(n²)');
add(1585,'Check If String Is Transformable With Substring Sort Operations','greedy',['84532','34852'],true,`
class Solution:
    def isTransformable(self, s, t):
        from collections import deque
        positions = [deque() for _ in range(10)]
        for i,char in enumerate(s):
            positions[int(char)].append(i)
        for char in t:
            digit = int(char)
            if not positions[digit]:
                return False
            index = positions[digit][0]
            if any(positions[small] and positions[small][0] < index for small in range(digit)):
                return False
            positions[digit].popleft()
        return True
`,'Tạo t từ trái qua phải, luôn lấy lần xuất hiện sớm nhất của chữ số cần. Một chữ số nhỏ hơn ở phía trước sẽ chặn nó: sort tăng dần không cho chữ số lớn vượt qua chữ nhỏ.','O(10n)','O(n)',{focus:['positions','digit','index']});
add(1586,'Binary Search Tree Iterator II','design',[[7,3,15,null,null,9,20],['next','next','hasPrev','prev','next','next','hasNext']],[3,7,true,3,7,9,true],`
class Solution:
    def iterate(self, root, operations):
        stack,history,index,answer = [],[],-1,[]
        node = root
        for operation in operations:
            if operation == 'next':
                if index+1 == len(history):
                    while node:
                        stack.append(node)
                        node = node.left
                    node = stack.pop()
                    history.append(node.val)
                    node = node.right
                index += 1
                answer.append(history[index])
            elif operation == 'prev':
                assert index > 0
                index -= 1
                answer.append(history[index])
            elif operation == 'hasNext':
                answer.append(index+1 < len(history) or bool(stack) or node is not None)
            else:
                answer.append(index > 0)
        return answer
`,'Duyệt inorder lười bằng stack, lưu các giá trị đã thăm trong history. prev chỉ lùi con trỏ; next chỉ duyệt cây khi lịch sử chưa có phần tử kế tiếp.','O(n+operations)','O(n)',{kinds:['tree'],focus:['history','index','stack','answer']});
add(1587,'Bank Account Summary II','sql',[[{account:1,name:'Ada'},{account:2,name:'Bob'}],[{account:1,amount:12000},{account:1,amount:-1000},{account:2,amount:10000}]],[{name:'Ada',balance:11000}],`
class Solution:
    def wealthyAccounts(self, users, transactions):
        balances = {}
        for transaction in transactions:
            account = transaction['account']
            balances[account] = balances.get(account,0)+transaction['amount']
        return [{'name':u['name'],'balance':balances[u['account']]} for u in users if balances.get(u['account'],0) > 10000]
`,'Cộng amount có dấu theo account rồi JOIN tên người dùng. Điều kiện là lớn hơn 10000, nên đúng 10000 bị loại.','O(users+transactions)','O(accounts)');
add(1588,'Sum of All Odd Length Subarrays','math',[[1,4,2,5,3]],58,`
class Solution:
    def sumOddLengthSubarrays(self, arr):
        answer = 0
        for i,value in enumerate(arr):
            containing = (i+1)*(len(arr)-i)
            odd = (containing+1)//2
            answer += value*odd
        return answer
`,'Ô i nằm trong (i+1)(n-i) đoạn. Trong số đó có ceil(count/2) đoạn dài lẻ; cộng đóng góp của từng ô thay vì cộng lại mỗi đoạn.','O(n)','O(1)');
add(1592,'Rearrange Spaces Between Words','string',['  this   is  a sentence '],'this   is   a   sentence',`
class Solution:
    def reorderSpaces(self, text):
        spaces,words = text.count(' '),text.split()
        gaps = len(words)-1
        between,tail = divmod(spaces,gaps) if gaps else (0,spaces)
        return (' '*between).join(words)+' '*tail
`,'Đếm tổng dấu cách rồi chia đều vào các khe giữa từ. Dư bao nhiêu đặt cuối chuỗi; nếu chỉ có một từ thì toàn bộ khoảng trắng nằm cuối.','O(n)','O(n)');
add(1593,'Split a String Into the Max Number of Unique Substrings','backtracking',['ababccc'],5,`
class Solution:
    def maxUniqueSplit(self, s):
        assert len(s) <= 16
        used,answer = set(),0
        def visit(start):
            nonlocal answer
            if len(used)+len(s)-start <= answer:
                return
            if start == len(s):
                answer = max(answer,len(used))
            for end in range(start+1,len(s)+1):
                part = s[start:end]
                if part not in used:
                    used.add(part)
                    visit(end)
                    used.remove(part)
        visit(0)
        return answer
`,'Thử từng điểm cắt, chỉ chọn đoạn chưa có trong used. Sau đệ quy phải bỏ đoạn vừa chọn để thử nhánh khác; nếu mỗi ký tự còn lại cũng không vượt đáp án thì cắt nhánh.','O(n·2^n)','O(n²)',{focus:['s','start','part','used','answer']});
add(1595,'Minimum Cost to Connect Two Groups of Points','dp',[[[15,96],[36,2]]],17,`
class Solution:
    def connectTwoGroups(self, cost):
        from functools import lru_cache
        rows,cols = len(cost),len(cost[0])
        assert cols <= 10
        cheapest = [min(cost[r][c] for r in range(rows)) for c in range(cols)]
        @lru_cache(None)
        def visit(row,mask):
            if row == rows:
                return sum(cheapest[c] for c in range(cols) if not mask>>c&1)
            return min(cost[row][c]+visit(row+1,mask|1<<c) for c in range(cols))
        return visit(0,0)
`,'Mỗi điểm nhóm trái chọn ít nhất một cạnh; mask ghi điểm nhóm phải đã nối. Khi hết hàng, nối riêng từng cột còn thiếu bằng cạnh rẻ nhất của cột đó.','O(rows·cols·2^cols)','O(rows·2^cols)');
add(1596,'The Most Frequently Ordered Products for Each Customer','sql',[[{order_id:1,customer_id:1,product_id:2},{order_id:2,customer_id:1,product_id:2},{order_id:3,customer_id:1,product_id:3}],[{product_id:2,product_name:'Tea'},{product_id:3,product_name:'Cake'}]],[{customer_id:1,product_id:2,product_name:'Tea'}],`
class Solution:
    def frequentProducts(self, orders, products):
        names = {p['product_id']:p['product_name'] for p in products}
        counts = {}
        for order in orders:
            key = (order['customer_id'],order['product_id'])
            counts[key] = counts.get(key,0)+1
        answer = []
        for user,product in sorted(counts):
            highest = max(count for (customer,_),count in counts.items() if customer == user)
            if counts[user,product] == highest:
                answer.append({'customer_id':user,'product_id':product,'product_name':names[product]})
        return answer
`,'Đếm đơn theo cặp khách–sản phẩm. So với số đơn lớn nhất của riêng khách đó và giữ tất cả sản phẩm đồng hạng.','O(unique pairs²+orders)','O(unique pairs)');
add(1597,'Build Binary Expression Tree From Infix Expression','tree',['3*4-2*5'],['-', ['*','3','4'], ['*','2','5']],`
class Solution:
    def expTree(self, s):
        values,operators = [],[]
        precedence = {'+':1,'-':1,'*':2,'/':2}
        def reduce():
            right,left = values.pop(),values.pop()
            values.append([operators.pop(),left,right])
        for char in s:
            if char.isdigit():
                values.append(char)
            elif char == '(':
                operators.append(char)
            elif char == ')':
                while operators[-1] != '(':
                    reduce()
                operators.pop()
            else:
                while operators and operators[-1] != '(' and precedence[operators[-1]] >= precedence[char]:
                    reduce()
                operators.append(char)
        while operators:
            reduce()
        return values[0]
`,'Hai stack lưu cây con và toán tử. Trước khi đẩy toán tử mới, gộp các toán tử có ưu tiên cao hơn hoặc bằng; ngoặc mở ngăn việc gộp. Cây trả về có dạng [toán tử,trái,phải], lá là chữ số.','O(n)','O(n)',{focus:['values','operators','left','right'],description:'Expression-tree nodes are represented as nested [operator,left,right] arrays.'});
add(1599,'Maximum Profit of Operating a Centennial Wheel','array',[[8,3],5,6],3,`
class Solution:
    def minOperationsMaxProfit(self, customers, boardingCost, runningCost):
        waiting,profit,best,answer,rotation = 0,0,0,-1,0
        while rotation < len(customers) or waiting:
            if rotation < len(customers):
                waiting += customers[rotation]
            boarded = min(4,waiting)
            waiting -= boarded
            profit += boarded*boardingCost-runningCost
            rotation += 1
            if profit > best:
                best,answer = profit,rotation
        return answer
`,'Mỗi vòng thêm khách mới vào hàng đợi, cho tối đa bốn người lên rồi tính lợi nhuận lũy kế. Chỉ cập nhật khi lời cao hơn để giữ số vòng sớm nhất đạt cực đại; không lời thì -1.','O(customers+total customers/4)','O(1)',{focus:['waiting','boarded','profit','best','answer']});
module.exports=lessons;

