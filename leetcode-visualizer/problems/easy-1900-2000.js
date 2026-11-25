"use strict";
const {defineEasy}=require('./easy-lesson');const lessons={};const add=(...args)=>{const p=defineEasy(...args);lessons[p.id]=p;};
add(1900,'The Earliest and Latest Rounds Where Players Compete','backtracking',[4,1,2],[2,2],`
class Solution:
    def earliestAndLatest(self, n, firstPlayer, secondPlayer):
        from functools import lru_cache
        assert n <= 10
        @lru_cache(None)
        def rounds(players):
            winners = [()]
            for i in range(len(players)//2):
                a,b = players[i],players[-1-i]
                if {a,b} == {firstPlayer,secondPlayer}:
                    return (1,1)
                options = [p for p in (a,b) if p in (firstPlayer,secondPlayer)] or [a,b]
                winners = [old+(winner,) for old in winners for winner in options]
            if len(players)%2:
                winners = [old+(players[len(players)//2],) for old in winners]
            results = [rounds(tuple(sorted(group))) for group in winners]
            return (1+min(x[0] for x in results),1+max(x[1] for x in results))
        return list(rounds(tuple(range(1,n+1))))
`,'Mỗi vòng ghép đầu với cuối theo thứ tự người chơi còn lại. Hai người đặc biệt luôn thắng tới lúc gặp nhau; thử mọi kết quả các trận khác và lấy vòng sớm/muộn nhất. Giới hạn hình: n≤10.','O(reachable tournament states·2^(n/2))','O(reachable states)',{focus:['players','a','b','winners','results']});
add(1901,'Find a Peak Element II','array',[[[1,4],[3,2]]],[0,1],`
class Solution:
    def findPeakGrid(self, mat):
        for r in range(len(mat)):
            for c in range(len(mat[0])):
                neighbors = [mat[nr][nc] for nr,nc in ((r-1,c),(r+1,c),(r,c-1),(r,c+1)) if 0 <= nr < len(mat) and 0 <= nc < len(mat[0])]
                if all(mat[r][c] > value for value in neighbors):
                    return [r,c]
`,'Bản trực quan quét từng ô và so bốn hàng xóm trực tiếp, không xét chéo. Đề đảm bảo hai ô kề không bằng nhau và biên ngoài là -1 nên tồn tại đỉnh.','O(rows·cols)','O(1)',{focus:['mat','r','c','neighbors']});
add(1902,'Depth of BST Given Insertion Order','tree',[[2,1,4,3]],3,`
class Solution:
    def maxDepthBST(self, order):
        root = None
        answer = 0
        for value in order:
            if root is None:
                root = TreeNode(value)
                answer = 1
                continue
            node,depth = root,1
            while True:
                side = 'left' if value < node.val else 'right'
                child = getattr(node,side)
                depth += 1
                if child is None:
                    setattr(node,side,TreeNode(value))
                    answer = max(answer,depth)
                    break
                node = child
        return answer
`,'Chèn từng giá trị đúng thứ tự vào BST. Theo nhánh trái khi nhỏ hơn, phải khi lớn hơn và đếm chiều sâu tới ô trống; hình node thể hiện đúng cây được tạo.','O(n²)','O(n)',{focus:['root','node','value','depth','answer']});
add(1903,'Largest Odd Number in String','string',['35427'],'35427',`
class Solution:
    def largestOddNumber(self, num):
        for i in range(len(num)-1,-1,-1):
            if int(num[i])%2:
                return num[:i+1]
        return ''
`,'Số lẻ phải kết thúc bằng chữ số lẻ. Chọn chữ số lẻ xa bên phải nhất rồi giữ toàn bộ prefix để số có nhiều chữ số nhất.','O(n)','O(n)');
add(1904,'The Number of Full Rounds You Have Played','math',['12:01','12:44'],1,`
class Solution:
    def numberOfRounds(self, loginTime, logoutTime):
        def minutes(time):
            h,m = map(int,time.split(':'))
            return 60*h+m
        start,end = minutes(loginTime),minutes(logoutTime)
        if end < start:
            end += 1440
        first = (start+14)//15*15
        last = end//15*15
        return max(0,(last-first)//15)
`,'Round bắt đầu ở các mốc 00/15/30/45 và phải nằm trọn trong phiên. Làm tròn login lên và logout xuống; nếu logout sớm hơn login thì cộng một ngày.','O(1)','O(1)');
add(1906,'Minimum Absolute Difference Queries','array',[[1,3,4,8],[[0,1],[1,2],[2,3],[0,3]]],[2,1,4,1],`
class Solution:
    def minDifference(self, nums, queries):
        answer = []
        for left,right in queries:
            values = sorted(set(nums[left:right+1]))
            smallest = min((values[i]-values[i-1] for i in range(1,len(values))),default=-1)
            answer.append(smallest)
        return answer
`,'Hiệu cần giữa hai giá trị khác nhau nên loại trùng trước. Sau sắp xếp chỉ cần xét hai giá trị kề nhau; đoạn chỉ có một loại số trả -1.','O(queries·n log n)','O(n+queries)');
add(1907,'Count Salary Categories','sql',[[{account_id:1,income:10000},{account_id:2,income:50000}]],[{category:'Low Salary',accounts_count:1},{category:'Average Salary',accounts_count:1},{category:'High Salary',accounts_count:0}],`
class Solution:
    def countSalaryCategories(self, accounts):
        counts = {'Low Salary':0,'Average Salary':0,'High Salary':0}
        for account in accounts:
            income = account['income']
            category = 'Low Salary' if income < 20000 else 'High Salary' if income > 50000 else 'Average Salary'
            counts[category] += 1
        return [{'category':category,'accounts_count':count} for category,count in counts.items()]
`,'Khởi tạo đủ ba nhóm để nhóm rỗng vẫn xuất hiện. Low <20000, Average từ 20000 tới 50000 kể cả biên, High >50000.','O(accounts)','O(1)');
add(1908,'Game of Nim','bits',[[1,2,3]],false,`
class Solution:
    def nimGame(self, piles):
        xor = 0
        for pile in piles:
            xor ^= pile
        return xor != 0
`,'Trong Nim, một lượt bỏ ít nhất một viên ở đúng một đống. XOR mọi đống bằng 0 là thế thua khi hai bên tối ưu; khác 0 luôn có nước đưa XOR về 0.','O(piles)','O(1)');
add(1909,'Remove One Element to Make the Array Strictly Increasing','array',[[1,2,10,5,7]],true,`
class Solution:
    def canBeIncreasing(self, nums):
        for removed in range(len(nums)):
            remaining = nums[:removed]+nums[removed+1:]
            if all(remaining[i-1] < remaining[i] for i in range(1,len(remaining))):
                return True
        return False
`,'Thử bỏ đúng một ô rồi kiểm tra mọi cặp kề tăng nghiêm ngặt. Bản hình giữ remaining để thấy ô bị loại và cặp nào làm hỏng tính tăng.','O(n²)','O(n)');
add(1910,'Remove All Occurrences of a Substring','string',['daabcbaabcbc','abc'],'dab',`
class Solution:
    def removeOccurrences(self, s, part):
        stack = []
        for char in s:
            stack.append(char)
            if len(stack) >= len(part) and ''.join(stack[-len(part):]) == part:
                del stack[-len(part):]
        return ''.join(stack)
`,'Thêm từng chữ vào stack, nếu suffix vừa tạo bằng part thì xóa ngay. Điều này tương đương xóa lần xuất hiện trái nhất lặp lại và tự xử lý các mẫu mới lộ ra.','O(n·part length)','O(n)');
add(1911,'Maximum Alternating Subsequence Sum','dp',[[4,2,5,3]],7,`
class Solution:
    def maxAlternatingSum(self, nums):
        plus,minus = float('-inf'),0
        for value in nums:
            plus,minus = max(plus,minus+value),max(minus,plus-value)
        return max(plus,minus)
`,'plus là tổng tốt nhất kết thúc bằng dấu cộng, minus kết thúc bằng dấu trừ hoặc chưa chọn gì. Mỗi số được bỏ qua hoặc nối với trạng thái dấu đối diện; dùng giá trị cũ của cả hai trạng thái.','O(n)','O(1)');
add(1912,'Design Movie Rental System','design',[3,[[0,1,5],[0,2,6],[1,1,4],[2,1,5]],[['search',1],['rent',0,1],['report'],['drop',0,1],['search',1]]],[[1,0,2],null,[[0,1]],null,[1,0,2]],`
class Solution:
    def movieRenting(self, n, entries, operations):
        price = {(shop,movie):cost for shop,movie,cost in entries}
        rented,answer = set(),[]
        for operation in operations:
            name = operation[0]
            if name == 'rent':
                rented.add(tuple(operation[1:]))
                answer.append(None)
            elif name == 'drop':
                rented.remove(tuple(operation[1:]))
                answer.append(None)
            elif name == 'search':
                movie = operation[1]
                shops = [shop for shop,m in price if m == movie and (shop,m) not in rented]
                answer.append(sorted(shops,key=lambda shop:(price[shop,movie],shop))[:5])
            else:
                pairs = sorted(rented,key=lambda pair:(price[pair],pair[0],pair[1]))[:5]
                answer.append([list(pair) for pair in pairs])
        return answer
`,'price cố định theo (shop,movie), rented ghi trạng thái thuê. search chỉ lấy phim còn sẵn, report chỉ lấy phim đã thuê; cả hai ưu tiên giá rẻ rồi shop ID và lấy tối đa 5.','O(operations·entries log entries)','O(entries+operations)',{focus:['price','rented','operation','answer']});
add(1913,'Maximum Product Difference Between Two Pairs','array',[[5,6,2,7,4]],34,`
class Solution:
    def maxProductDifference(self, nums):
        ordered = sorted(nums)
        largest = ordered[-1]*ordered[-2]
        smallest = ordered[0]*ordered[1]
        return largest-smallest
`,'Các số dương nên tích lớn nhất dùng hai số lớn nhất, tích nhỏ nhất dùng hai số nhỏ nhất. Hai cặp dùng bốn vị trí riêng theo đề.','O(n log n)','O(n)');
add(1914,'Cyclically Rotating a Grid','array',[[[40,10],[30,20]],1],[[10,20],[40,30]],`
class Solution:
    def rotateGrid(self, grid, k):
        answer = [row[:] for row in grid]
        rows,cols = len(grid),len(grid[0])
        for layer in range(min(rows,cols)//2):
            top,left,bottom,right = layer,layer,rows-1-layer,cols-1-layer
            ring = [(top,c) for c in range(left,right)]+[(r,right) for r in range(top,bottom)]
            ring += [(bottom,c) for c in range(right,left,-1)]+[(r,left) for r in range(bottom,top,-1)]
            values = [grid[r][c] for r,c in ring]
            for i,(r,c) in enumerate(ring):
                answer[r][c] = values[(i+k)%len(ring)]
        return answer
`,'Tách từng vòng thành dãy tọa độ theo chiều kim đồng hồ. Quay ngược k bước nghĩa là ô i nhận giá trị cũ ở i+k; modulo độ dài vòng để bỏ số vòng đầy.','O(rows·cols)','O(rows·cols)',{focus:['grid','ring','values','r','c','answer']});
add(1917,'Leetcodify Friends Recommendations','sql',[[{user_id:1,song_id:1,day:'2021-01-01'},{user_id:1,song_id:2,day:'2021-01-01'},{user_id:1,song_id:3,day:'2021-01-01'},{user_id:2,song_id:1,day:'2021-01-01'},{user_id:2,song_id:2,day:'2021-01-01'},{user_id:2,song_id:3,day:'2021-01-01'}],[]],[{user_id:1,recommended_id:2},{user_id:2,recommended_id:1}],`
class Solution:
    def recommendFriends(self, listens, friendship):
        songs = {}
        for row in listens:
            songs.setdefault((row['user_id'],row['day']),set()).add(row['song_id'])
        friends = {tuple(sorted((r['user1_id'],r['user2_id']))) for r in friendship}
        pairs = set()
        for (a,day),values in songs.items():
            for (b,otherDay),others in songs.items():
                if a != b and day == otherDay and len(values&others) >= 3 and tuple(sorted((a,b))) not in friends:
                    pairs.add((a,b))
        return [{'user_id':a,'recommended_id':b} for a,b in sorted(pairs)]
`,'Gom bài hát khác nhau theo user và ngày. Đề xuất hai chiều khi hai người nghe chung ít nhất 3 bài trong cùng một ngày và chưa là bạn; set loại trùng qua nhiều ngày.','O(user-days²·songs)','O(listens+friendships)');
add(1918,'Kth Smallest Subarray Sum','array',[[2,1,3],4],3,`
class Solution:
    def kthSmallestSubarraySum(self, nums, k):
        sums = []
        for left in range(len(nums)):
            total = 0
            for right in range(left,len(nums)):
                total += nums[right]
                sums.append(total)
        sums.sort()
        return sums[k-1]
`,'Liệt kê tổng mọi đoạn liên tiếp bằng kéo dài từng điểm bắt đầu. Sắp xếp có giữ các tổng trùng vì đó là các đoạn khác nhau, rồi lấy vị trí k-1.','O(n² log n)','O(n²)');
add(1919,'Leetcodify Similar Friends','sql',[[{user_id:1,song_id:1,day:'2021-01-01'},{user_id:1,song_id:2,day:'2021-01-01'},{user_id:1,song_id:3,day:'2021-01-01'},{user_id:2,song_id:1,day:'2021-01-01'},{user_id:2,song_id:2,day:'2021-01-01'},{user_id:2,song_id:3,day:'2021-01-01'}],[{user1_id:1,user2_id:2}]],[{user1_id:1,user2_id:2}],`
class Solution:
    def similarFriends(self, listens, friendship):
        songs = {}
        for row in listens:
            songs.setdefault((row['user_id'],row['day']),set()).add(row['song_id'])
        answer = []
        for pair in friendship:
            a,b = pair['user1_id'],pair['user2_id']
            similar = any(user == a and len(values&songs.get((b,day),set())) >= 3 for (user,day),values in songs.items())
            if similar:
                answer.append({'user1_id':a,'user2_id':b})
        return answer
`,'Chỉ xét các cặp đã là bạn. Tìm ít nhất một ngày có ba bài khác nhau được cả hai nghe; các lần nghe lặp cùng bài không làm tăng số bài chung.','O(friendships·listens·songs)','O(listens)');
add(1920,'Build Array from Permutation','array',[[0,2,1,5,3,4]],[0,1,2,4,5,3],`
class Solution:
    def buildArray(self, nums):
        answer = []
        for i in range(len(nums)):
            index = nums[i]
            answer.append(nums[index])
        return answer
`,'Mỗi ô kết quả đọc hai lần chỉ số: trước lấy index=nums[i], sau đó lấy nums[index]. Luôn đọc mảng gốc.','O(n)','O(n)');
add(1921,'Eliminate Maximum Number of Monsters','greedy',[[1,3,4],[1,1,1]],3,`
class Solution:
    def eliminateMaximum(self, dist, speed):
        deadlines = sorted((distance+velocity-1)//velocity for distance,velocity in zip(dist,speed))
        for minute,arrival in enumerate(deadlines):
            if arrival <= minute:
                return minute
        return len(dist)
`,'Vũ khí bắn ở phút 0,1,2,… Quái có hạn đến ceil(distance/speed); ưu tiên hạn sớm nhất. Nếu arrival≤phút hiện tại thì quái đã tới trước khi bắn.','O(n log n)','O(n)');
add(1922,'Count Good Numbers','math',[4],400,`
class Solution:
    def countGoodNumbers(self, n):
        evenPositions = (n+1)//2
        oddPositions = n//2
        return pow(5,evenPositions,1000000007)*pow(4,oddPositions,1000000007)%1000000007
`,'Chỉ số chẵn chọn một trong 5 chữ số chẵn, chỉ số lẻ chọn một trong 4 số nguyên tố 2/3/5/7. Nhân số lựa chọn độc lập bằng lũy thừa modulo.','O(log n)','O(1)');
add(1924,'Erect the Fence II','math',[[[0,0],[2,0]]],[1,0,1],`
class Solution:
    def outerTrees(self, trees):
        import math
        assert len(trees) <= 12
        candidates = [(float(x),float(y),0.0) for x,y in trees]
        for i,(ax,ay) in enumerate(trees):
            for j in range(i):
                bx,by = trees[j]
                x,y = (ax+bx)/2,(ay+by)/2
                candidates.append((x,y,math.hypot(ax-bx,ay-by)/2))
                for k in range(j):
                    cx,cy = trees[k]
                    determinant = 2*(ax*(by-cy)+bx*(cy-ay)+cx*(ay-by))
                    if determinant == 0:
                        continue
                    a,b,c = ax*ax+ay*ay,bx*bx+by*by,cx*cx+cy*cy
                    x = (a*(by-cy)+b*(cy-ay)+c*(ay-by))/determinant
                    y = (a*(cx-bx)+b*(ax-cx)+c*(bx-ax))/determinant
                    candidates.append((x,y,math.hypot(x-ax,y-ay)))
        best = min((circle for circle in candidates if all(math.hypot(px-circle[0],py-circle[1]) <= circle[2]+1e-8 for px,py in trees)),key=lambda c:c[2])
        return list(best)
`,'Đường tròn bao nhỏ nhất được xác định bởi một điểm, hai điểm làm đường kính hoặc ba điểm trên biên. Bản trực quan liệt kê các tâm ứng viên, loại đường tròn không chứa hết cây và chọn bán kính nhỏ nhất. Giới hạn 12 điểm.','O(n^4)','O(n³)',{focus:['trees','candidates','x','y','best']});
add(1925,'Count Square Sum Triples','math',[5],2,`
class Solution:
    def countTriples(self, n):
        import math
        answer = 0
        for a in range(1,n+1):
            for b in range(1,n+1):
                c = math.isqrt(a*a+b*b)
                if c <= n and c*c == a*a+b*b:
                    answer += 1
        return answer
`,'Thử a,b dương rồi dùng căn nguyên để kiểm tra a²+b² có là số chính phương không. (a,b,c) và (b,a,c) là hai bộ khác nhau.','O(n²)','O(1)');
add(1929,'Concatenation of Array','array',[[1,2,1]],[1,2,1,1,2,1],`
class Solution:
    def getConcatenation(self, nums):
        answer = []
        for copy in range(2):
            for value in nums:
                answer.append(value)
        return answer
`,'Sao chép nguyên thứ tự mảng hai lần vào kết quả. Chỉ số ở nửa sau tương ứng cùng vị trí của nửa trước.','O(n)','O(n)');
add(1930,'Unique Length-3 Palindromic Subsequences','string',['aabca'],3,`
class Solution:
    def countPalindromicSubsequence(self, s):
        answer = 0
        for char in sorted(set(s)):
            left,right = s.index(char),s.rindex(char)
            middle = set(s[left+1:right])
            answer += len(middle)
        return answer
`,'Palindrome dài 3 có dạng a?a. Với mỗi chữ ngoài, dùng lần đầu và lần cuối để mở rộng vùng giữa; mỗi chữ giữa khác nhau tạo đúng một nội dung palindrome.','O(alphabet·n)','O(alphabet)');
add(1932,'Merge BSTs to Create Single BST','tree',[[[2,1],[3,2,5],[5,4]]],[3,2,5,1,null,4],`
class Solution:
    def canMerge(self, trees):
        roots = [_tree(values) for values in trees]
        available = {node.val:node for node in roots}
        leaves = {child.val for node in roots for child in (node.left,node.right) if child}
        candidates = [node for node in roots if node.val not in leaves]
        if len(candidates) != 1:
            return None
        root = candidates[0]
        del available[root.val]
        def merge(node,low,high):
            if node is None:
                return True
            if not low < node.val < high:
                return False
            if node.left is None and node.right is None and node.val in available:
                replacement = available.pop(node.val)
                node.left,node.right = replacement.left,replacement.right
            return merge(node.left,low,node.val) and merge(node.right,node.val,high)
        return _tree_values(root) if merge(root,float('-inf'),float('inf')) and not available else None
`,'Mỗi cây nhỏ nhập level-order. Gốc cuối cùng là gốc không xuất hiện như lá của cây khác. Khi DFS gặp lá bằng gốc chưa dùng, ghép cây vào đó; đồng thời kiểm tra khoảng giá trị BST và bắt buộc dùng hết cây.','O(total nodes)','O(total nodes)',{focus:['root','node','available','low','high']});
add(1933,'Check if String Is Decomposable Into Value-Equal Substrings','string',['00011111222'],true,`
class Solution:
    def isDecomposable(self, s):
        from itertools import groupby
        pairs = 0
        for char,group in groupby(s):
            length = sum(1 for _ in group)
            remainder = length%3
            if remainder == 1:
                return False
            pairs += remainder == 2
        return pairs == 1
`,'Chia từng run cùng chữ thành đoạn dài 3, riêng đúng một đoạn phải dài 2. Run có dư 1 không thể chia; tổng số run dư 2 phải đúng một.','O(n)','O(1)');
add(1934,'Confirmation Rate','sql',[[{user_id:1},{user_id:2}],[{user_id:1,action:'confirmed'},{user_id:1,action:'timeout'}]],[{user_id:1,confirmation_rate:0.5},{user_id:2,confirmation_rate:0}],`
class Solution:
    def confirmationRate(self, signups, confirmations):
        from decimal import Decimal,ROUND_HALF_UP
        answer = []
        for user in signups:
            actions = [c['action'] for c in confirmations if c['user_id'] == user['user_id']]
            ratio = Decimal(actions.count('confirmed'))/len(actions) if actions else Decimal(0)
            answer.append({'user_id':user['user_id'],'confirmation_rate':float(ratio.quantize(Decimal('0.01'),rounding=ROUND_HALF_UP))})
        return answer
`,'LEFT JOIN giữ người chưa yêu cầu xác nhận với tỷ lệ 0. Mẫu số đếm mọi yêu cầu, tử số chỉ confirmed; làm tròn hai chữ số.','O(users·confirmations)','O(confirmations)');
add(1935,'Maximum Number of Words You Can Type','string',['hello world','ad'],1,`
class Solution:
    def canBeTypedWords(self, text, brokenLetters):
        broken,answer = set(brokenLetters),0
        for word in text.split():
            if not set(word)&broken:
                answer += 1
        return answer
`,'Một từ gõ được khi không có chữ nào thuộc tập phím hỏng. Lấy giao hai set để kiểm tra rồi đếm theo từng từ.','O(text length)','O(alphabet)');
add(1936,'Add Minimum Number of Rungs','greedy',[[1,3,5,10],2],2,`
class Solution:
    def addRungs(self, rungs, dist):
        previous,answer = 0,0
        for height in rungs:
            gap = height-previous
            added = (gap-1)//dist
            answer += added
            previous = height
        return answer
`,'Xét cả khoảng từ mặt đất 0. Khoảng gap cần ceil(gap/dist)-1 bậc mới, bằng (gap-1)//dist; khoảng đúng bằng dist không cần thêm.','O(rungs)','O(1)');
add(1938,'Maximum Genetic Difference Query','tree',[[-1,0,1,1],[[0,2],[3,2],[2,5]]],[2,3,7],`
class Solution:
    def maxGeneticDifference(self, parents, queries):
        answer = []
        for node,value in queries:
            ancestor,best,path = node,0,[]
            while ancestor != -1:
                path.append(ancestor)
                best = max(best,ancestor^value)
                ancestor = parents[ancestor]
            answer.append(best)
        return answer
`,'Genetic difference là XOR giữa value và ID của một tổ tiên, kể cả chính node. Bản hình đi ngược parents từng query và giữ đường tổ tiên để thấy các ứng viên.','O(queries·height)','O(height+queries)',{focus:['parents','node','value','path','best']});
add(1939,'Users That Actively Request Confirmation Messages','sql',[[{user_id:1,time_stamp:'2021-01-01 10:00:00'},{user_id:1,time_stamp:'2021-01-02 10:00:00'},{user_id:2,time_stamp:'2021-01-01 00:00:00'}]],[{user_id:1}],`
class Solution:
    def activeRequests(self, confirmations):
        from datetime import datetime
        times = {}
        for row in confirmations:
            times.setdefault(row['user_id'],[]).append(datetime.fromisoformat(row['time_stamp']))
        answer = []
        for user,values in sorted(times.items()):
            ordered = sorted(values)
            if any((b-a).total_seconds() <= 86400 for a,b in zip(ordered,ordered[1:])):
                answer.append({'user_id':user})
        return answer
`,'Sắp các lần yêu cầu riêng theo user. Chỉ cần hai lần kề nhau cách không quá 24 giờ; khoảng đúng 24 giờ cũng được tính, không dựa vào cùng ngày lịch.','O(rows log rows)','O(rows)');
add(1940,'Longest Common Subsequence Between Sorted Arrays','array',[[[1,3,4],[1,4,7,9]]],[1,4],`
class Solution:
    def longestCommonSubsequence(self, arrays):
        common = set(arrays[0])
        for row in arrays[1:]:
            common &= set(row)
        return sorted(common)
`,'Các mảng đã tăng nghiêm ngặt nên mọi giá trị chung tự xuất hiện cùng thứ tự. LCS chính là giao các tập, xuất tăng dần.','O(total values+common log common)','O(values)');
add(1941,'Check if All Characters Have Equal Number of Occurrences','string',['abacbc'],true,`
class Solution:
    def areOccurrencesEqual(self, s):
        from collections import Counter
        counts = Counter(s)
        frequencies = set(counts.values())
        return len(frequencies) == 1
`,'Đếm số lần từng chữ có xuất hiện. Nếu tập các tần suất chỉ có một giá trị thì mọi chữ xuất hiện bằng nhau.','O(n)','O(alphabet)');
add(1945,'Sum of Digits of String After Convert','string',['iiii',1],36,`
class Solution:
    def getLucky(self, s, k):
        digits = ''.join(str(ord(char)-96) for char in s)
        for operation in range(k):
            total = sum(int(digit) for digit in digits)
            digits = str(total)
        return int(digits)
`,'Chuyển a=1..z=26 thành chuỗi chữ số trước. Sau đó lặp k lần: cộng các chữ số của toàn bộ số hiện tại và thay bằng tổng.','O(n+k·digits)','O(n)');
add(1946,'Largest Number After Mutating Substring','greedy',['132',[9,8,5,0,3,6,4,2,6,8]],'832',`
class Solution:
    def maximumNumber(self, num, change):
        digits,started = list(num),False
        for i,char in enumerate(digits):
            old = int(char)
            if change[old] > old or started and change[old] == old:
                digits[i] = str(change[old])
                started = True
            elif started:
                break
        return ''.join(digits)
`,'Bắt đầu đoạn đổi ở chữ số đầu tiên được tăng. Sau khi bắt đầu, tiếp tục qua các chữ bằng hoặc tăng; dừng trước chữ bị giảm vì chỉ được đổi một đoạn liên tiếp.','O(n)','O(n)');
add(1948,'Delete Duplicate Folders in System','tree',[[['a'],['c'],['d'],['a','b'],['c','b'],['d','a']]],[['d'],['d','a']],`
class Solution:
    def deleteDuplicateFolder(self, paths):
        from collections import Counter
        root = {}
        for path in paths:
            node = root
            for name in path:
                node = node.setdefault(name,{})
        signatures,counts = {},Counter()
        def signature(node):
            result = tuple((name,signature(child)) for name,child in sorted(node.items()))
            signatures[id(node)] = result
            if result:
                counts[result] += 1
            return result
        for child in root.values():
            signature(child)
        answer = []
        def collect(node,path):
            for name,child in sorted(node.items()):
                key = signatures[id(child)]
                if key and counts[key] > 1:
                    continue
                answer.append(path+[name])
                collect(child,path+[name])
        collect(root,[])
        return answer
`,'Chữ ký thư mục là cấu trúc tên và chữ ký các thư mục con, không gồm tên của chính nó. Chỉ thư mục có con mới có thể bị đánh dấu trùng; đánh dấu toàn bộ trước rồi xóa đồng thời đúng một lần.','O(total path length·log siblings)','O(total path length)',{focus:['root','node','result','counts','answer']});
add(1949,'Strong Friendship','sql',[[{user1_id:1,user2_id:2},{user1_id:1,user2_id:3},{user1_id:1,user2_id:4},{user1_id:1,user2_id:5},{user1_id:2,user2_id:3},{user1_id:2,user2_id:4},{user1_id:2,user2_id:5}]],[{user1_id:1,user2_id:2,common_friend:3}],`
class Solution:
    def strongFriendship(self, friendship):
        graph = {}
        for row in friendship:
            a,b = row['user1_id'],row['user2_id']
            graph.setdefault(a,set()).add(b)
            graph.setdefault(b,set()).add(a)
        answer = []
        for row in friendship:
            a,b = row['user1_id'],row['user2_id']
            count = len(graph[a]&graph[b])
            if count >= 3:
                answer.append({'user1_id':a,'user2_id':b,'common_friend':count})
        return answer
`,'Chỉ cặp đã là bạn mới được xét. Tình bạn hai chiều nên xây set hàng xóm cho cả hai phía; giao hai set cho số bạn chung, giữ từ 3 trở lên.','O(friendships·users)','O(friendships)');
add(1951,'All the Pairs With the Maximum Number of Common Followers','sql',[[{user_id:1,follower_id:3},{user_id:1,follower_id:4},{user_id:2,follower_id:3}]],[{user1_id:1,user2_id:2}],`
class Solution:
    def maximumCommonFollowers(self, relations):
        followers = {}
        for row in relations:
            followers.setdefault(row['user_id'],set()).add(row['follower_id'])
        users,counts = sorted(followers),{}
        for i,a in enumerate(users):
            for b in users[i+1:]:
                counts[a,b] = len(followers[a]&followers[b])
        maximum = max(counts.values(),default=0)
        return [{'user1_id':a,'user2_id':b} for (a,b),count in counts.items() if count == maximum]
`,'Gom follower_id theo người được theo dõi. Với mỗi cặp user1<user2, đếm giao hai set, tìm cực đại chung rồi giữ tất cả cặp đạt cực đại.','O(users²·followers per user)','O(relations+users²)');
add(1952,'Three Divisors','math',[4],true,`
class Solution:
    def isThree(self, n):
        import math
        root = math.isqrt(n)
        if root*root != n or root < 2:
            return False
        for divisor in range(2,math.isqrt(root)+1):
            if root%divisor == 0:
                return False
        return True
`,'Đúng ba ước chỉ xảy ra khi n=p² với p nguyên tố: ba ước là 1,p,p². Kiểm tra căn nguyên và tính nguyên tố của căn.','O(n^0.25)','O(1)');
add(1953,'Maximum Number of Weeks for Which You Can Work','greedy',[[1,2,3]],6,`
class Solution:
    def numberOfWeeks(self, milestones):
        total,largest = sum(milestones),max(milestones)
        other = total-largest
        return min(total,2*other+1)
`,'Không được làm cùng dự án hai tuần liên tiếp. Nếu dự án lớn nhất quá áp đảo, xen từng tuần của các dự án khác vào và chỉ thêm được một tuần dư; nếu không thì làm hết mọi milestone.','O(projects)','O(1)');
add(1954,'Minimum Garden Perimeter to Collect Enough Apples','search',[13],16,`
class Solution:
    def minimumPerimeter(self, neededApples):
        left,right = 1,1000000
        while left < right:
            mid = (left+right)//2
            apples = 2*mid*(mid+1)*(2*mid+1)
            if apples >= neededApples:
                right = mid
            else:
                left = mid+1
        return 8*left
`,'Vườn vuông [-r,r]² chứa tổng 2r(r+1)(2r+1) quả vì mỗi cây có |x|+|y| quả. Tìm r nhỏ nhất đủ quả rồi trả chu vi 8r.','O(log neededApples)','O(1)');
add(1955,'Count Number of Special Subsequences','dp',[[0,1,2,2]],3,`
class Solution:
    def countSpecialSubsequences(self, nums):
        dp = [0,0,0]
        for value in nums:
            previous = 1 if value == 0 else dp[value-1]
            dp[value] = (2*dp[value]+previous)%1000000007
        return dp[2]
`,'Ba trạng thái là dãy 0+, dãy 0+1+, dãy 0+1+2+. Số mới hoặc bỏ qua/ghép vào dãy cùng loại (nhân 2), hoặc chuyển từ trạng thái trước; số 0 bắt đầu dãy mới.','O(n)','O(1)');
add(1956,'Minimum Time For K Virus Variants to Spread','math',[[[1,1],[3,1]],2],1,`
class Solution:
    def minDayskVariants(self, points, k):
        xs,ys = [p[0] for p in points],[p[1] for p in points]
        assert max(xs)-min(xs) <= 12 and max(ys)-min(ys) <= 12
        answer = float('inf')
        for x in range(min(xs),max(xs)+1):
            for y in range(min(ys),max(ys)+1):
                arrivals = sorted(abs(x-a)+abs(y-b) for a,b in points)
                answer = min(answer,arrivals[k-1])
        return answer
`,'Mỗi biến thể lan một bước ngang/dọc mỗi ngày, nên ngày đến ô (x,y) là khoảng cách Manhattan. Ngày có k biến thể ở cùng ô là thời gian đến nhỏ thứ k; thử các tâm nguyên trong hộp giới hạn.','O(width·height·points log points)','O(points)',{description:'Teaching grid is bounded to a span of 12 in each coordinate.',focus:['points','x','y','arrivals','answer']});
add(1957,'Delete Characters to Make Fancy String','string',['leeetcode'],'leetcode',`
class Solution:
    def makeFancyString(self, s):
        answer = []
        for char in s:
            if len(answer) >= 2 and answer[-1] == answer[-2] == char:
                continue
            answer.append(char)
        return ''.join(answer)
`,'Chỉ bỏ chữ khi thêm nó sẽ tạo ba chữ giống nhau liên tiếp. Hai chữ cuối kết quả đã đủ để quyết định, không cần quay lại chuỗi gốc.','O(n)','O(n)');
add(1958,'Check if Move is Legal','array',[[['.','.','.'],['B','W','.'],['.','.','.']],1,2,'B'],true,`
class Solution:
    def checkMove(self, board, rMove, cMove, color):
        for dr,dc in ((-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)):
            r,c,count = rMove+dr,cMove+dc,0
            while 0 <= r < len(board) and 0 <= c < len(board[0]):
                cell = board[r][c]
                if cell == '.':
                    break
                if cell == color:
                    if count:
                        return True
                    break
                count += 1
                r,c = r+dr,c+dc
        return False
`,'Thử tám hướng từ ô đặt quân. Một hướng hợp lệ phải gặp ít nhất một quân đối thủ liên tiếp rồi kết thúc bằng quân cùng màu, không có ô trống ở giữa.','O(rows+cols)','O(1)',{focus:['board','r','c','dr','dc','count']});
add(1959,'Minimum Total Space Wasted With K Resizing Operations','dp',[[10,20,15,30,20],2],15,`
class Solution:
    def minSpaceWastedKResizing(self, nums, k):
        from functools import lru_cache
        @lru_cache(None)
        def visit(start,segments):
            if start == len(nums):
                return 0
            if segments == 0:
                return float('inf')
            maximum,total,answer = 0,0,float('inf')
            for end in range(start,len(nums)):
                maximum = max(maximum,nums[end])
                total += nums[end]
                waste = maximum*(end-start+1)-total
                answer = min(answer,waste+visit(end+1,segments-1))
            return answer
        return visit(0,k+1)
`,'k lần đổi kích thước tạo tối đa k+1 đoạn. Trong một đoạn, dung lượng tối ưu là giá trị lớn nhất; lãng phí bằng max·length-sum. DP thử điểm kết thúc đoạn.','O(n²k)','O(nk)',{focus:['nums','start','end','maximum','waste','answer']});
add(1960,'Maximum Product of the Length of Two Palindromic Substrings','dp',['ababbb'],9,`
class Solution:
    def maxProduct(self, s):
        n = len(s)
        ending,starting = [1]*n,[1]*n
        for center in range(n):
            left,right = center,center
            while left >= 0 and right < n and s[left] == s[right]:
                length = right-left+1
                ending[right] = max(ending[right],length)
                starting[left] = max(starting[left],length)
                left,right = left-1,right+1
        for i in range(1,n):
            ending[i] = max(ending[i],ending[i-1])
        for i in range(n-2,-1,-1):
            starting[i] = max(starting[i],starting[i+1])
        return max(ending[i]*starting[i+1] for i in range(n-1))
`,'Đề chỉ lấy palindrome độ dài lẻ. Mở rộng quanh mọi tâm để tìm đoạn kết thúc/bắt đầu tại mỗi ô; prefix/suffix max cho palindrome tốt nhất hai bên một đường cắt, bảo đảm không chồng nhau.','O(n²)','O(n)',{focus:['s','left','right','ending','starting']});
add(1961,'Check If String Is a Prefix of Array','string',['iloveleetcode',['i','love','leetcode','apples']],true,`
class Solution:
    def isPrefixString(self, s, words):
        prefix = ''
        for word in words:
            prefix += word
            if prefix == s:
                return True
            if not s.startswith(prefix):
                return False
        return False
`,'Nối nguyên từng từ từ đầu mảng. Chỉ thành công ở ranh giới giữa các từ; s kết thúc giữa một từ không phải prefix hợp lệ của mảng.','O(total prefix characters)','O(s length)');
add(1962,'Remove Stones to Minimize the Total','greedy',[[5,4,9],2],12,`
class Solution:
    def minStoneSum(self, piles, k):
        import heapq
        heap = [-value for value in piles]
        heapq.heapify(heap)
        for operation in range(k):
            value = -heapq.heappop(heap)
            remaining = value-value//2
            heapq.heappush(heap,-remaining)
        return -sum(heap)
`,'Mỗi lần bỏ floor(pile/2) nên đống lớn nhất cho mức giảm lớn nhất. Max-heap dùng số âm lấy đống đó nhanh rồi đẩy lượng còn lại trở vào.','O(n+k log n)','O(n)');
add(1964,'Find the Longest Valid Obstacle Course at Each Position','dp',[[1,2,3,2]],[1,2,3,3],`
class Solution:
    def longestObstacleCourseAtEachPosition(self, obstacles):
        from bisect import bisect_right
        tails,answer = [],[]
        for height in obstacles:
            position = bisect_right(tails,height)
            if position == len(tails):
                tails.append(height)
            else:
                tails[position] = height
            answer.append(position+1)
        return answer
`,'tails[length-1] là đuôi nhỏ nhất của dãy không giảm dài length. Dùng bisect_right để giá trị bằng nhau vẫn được nối; đáp án mỗi ô là vị trí chèn+1.','O(n log n)','O(n)',{focus:['obstacles','tails','height','position','answer']});
add(1965,'Employees With Missing Information','sql',[[{employee_id:1,name:'Ada'},{employee_id:2,name:'Bob'}],[{employee_id:1,salary:100},{employee_id:3,salary:200}]],[{employee_id:2},{employee_id:3}],`
class Solution:
    def missingInformation(self, employees, salaries):
        names = {e['employee_id'] for e in employees}
        paid = {s['employee_id'] for s in salaries}
        missing = names^paid
        return [{'employee_id':identifier} for identifier in sorted(missing)]
`,'Thiếu thông tin khi ID chỉ có ở một trong hai bảng. Hiệu đối xứng của hai tập ID giữ người thiếu tên hoặc thiếu lương, loại người có đủ cả hai.','O(rows+missing log missing)','O(rows)');
add(1966,'Binary Searchable Numbers in an Unsorted Array','array',[[7,1,5,2,6,3]],0,`
class Solution:
    def binarySearchableNumbers(self, nums):
        suffix = [float('inf')]*(len(nums)+1)
        for i in range(len(nums)-1,-1,-1):
            suffix[i] = min(suffix[i+1],nums[i])
        left,answer = float('-inf'),0
        for i,value in enumerate(nums):
            answer += left < value < suffix[i+1]
            left = max(left,value)
        return answer
`,'Một số luôn tìm được bằng binary search dù chọn pivot thế nào khi mọi số bên trái nhỏ hơn và mọi số bên phải lớn hơn nó. Prefix max và suffix min kiểm tra điều đó ở mỗi ô.','O(n)','O(n)');
add(1968,'Array With Elements Not Equal to Average of Neighbors','array',[[1,2,3,4,5]],[1,3,2,5,4],`
class Solution:
    def rearrangeArray(self, nums):
        answer = sorted(nums)
        for i in range(1,len(answer)-1,2):
            answer[i],answer[i+1] = answer[i+1],answer[i]
        return answer
`,'Các số phân biệt. Sắp tăng rồi đổi từng cặp từ chỉ số 1 để tạo đỉnh/đáy xen kẽ; ô giữa nằm ngoài khoảng hai hàng xóm nên không thể bằng trung bình của chúng.','O(n log n)','O(n)');
add(1969,'Minimum Non-Zero Product of the Array Elements','math',[3],1512,`
class Solution:
    def minNonZeroProduct(self, p):
        largest = (1<<p)-1
        pairs = (1<<(p-1))-1
        return largest%1000000007*pow(largest-1,pairs,1000000007)%1000000007
`,'Đổi các bit cùng vị trí bảo toàn tổng số bit 1 ở mỗi cột. Tích không-zero nhỏ nhất đạt khi một số là 2^p-1, các cặp còn lại là 1 và 2^p-2; dùng lũy thừa modulo.','O(p)','O(1)');
add(1972,'First and Last Call On the Same Day','sql',[[{caller_id:1,recipient_id:2,call_time:'2021-01-01 09:00:00'},{caller_id:1,recipient_id:2,call_time:'2021-01-01 17:00:00'}]],[{user_id:1},{user_id:2}],`
class Solution:
    def sameFirstLast(self, calls):
        groups = {}
        for call in calls:
            for a,b in ((call['caller_id'],call['recipient_id']),(call['recipient_id'],call['caller_id'])):
                key = (a,call['call_time'][:10])
                groups.setdefault(key,[]).append((call['call_time'],b))
        selected = set()
        for (user,day),values in groups.items():
            earliest,latest = min(t for t,p in values),max(t for t,p in values)
            first = {p for t,p in values if t == earliest}
            last = {p for t,p in values if t == latest}
            if first&last:
                selected.add(user)
        return [{'user_id':user} for user in sorted(selected)]
`,'Một cuộc gọi tính cho cả người gọi và nhận. Nhóm theo user/ngày, tìm người ở cuộc gọi sớm nhất và muộn nhất; chỉ cần có một ngày cùng đối tác là giữ user.','O(calls+users log users)','O(calls)');
add(1974,'Minimum Time to Type Word Using Special Typewriter','string',['abc'],5,`
class Solution:
    def minTimeToType(self, word):
        previous,answer = 'a',0
        for char in word:
            distance = abs(ord(char)-ord(previous))
            answer += min(distance,26-distance)+1
            previous = char
        return answer
`,'Con trỏ bắt đầu ở a và có thể quay hai chiều trên vòng 26 chữ. Mỗi ký tự tốn khoảng cách vòng ngắn hơn cộng 1 giây gõ.','O(n)','O(1)');
add(1975,'Maximum Matrix Sum','math',[[[1,-1],[-1,1]]],4,`
class Solution:
    def maxMatrixSum(self, matrix):
        total,negative,smallest = 0,0,float('inf')
        for row in matrix:
            for value in row:
                total += abs(value)
                negative += value < 0
                smallest = min(smallest,abs(value))
        return total-2*smallest if negative%2 else total
`,'Đổi dấu hai ô kề giữ parity số âm. Có thể chuyển dấu âm qua lưới để triệt tiêu từng cặp; nếu còn một âm, đặt nó ở trị tuyệt đối nhỏ nhất. Có ô 0 thì không mất điểm.','O(rows·cols)','O(1)');
add(1978,'Employees Whose Manager Left the Company','sql',[[{employee_id:1,name:'Ada',manager_id:9,salary:20000},{employee_id:2,name:'Bob',manager_id:null,salary:10000}]],[{employee_id:1}],`
class Solution:
    def missingManagers(self, employees):
        identifiers = {e['employee_id'] for e in employees}
        return [{'employee_id':e['employee_id']} for e in sorted(employees,key=lambda e:e['employee_id']) if e['salary'] < 30000 and e['manager_id'] is not None and e['manager_id'] not in identifiers]
`,'Chỉ xét lương <30000 và có manager_id. Quản lý đã rời công ty khi ID đó không có trong bảng Employees; NULL không có nghĩa quản lý đã nghỉ.','O(employees log employees)','O(employees)');
add(1980,'Find Unique Binary String','string',[[ '01','10' ]],'11',`
class Solution:
    def findDifferentBinaryString(self, nums):
        answer = ''
        for i,row in enumerate(nums):
            answer += '1' if row[i] == '0' else '0'
        return answer
`,'Đảo bit trên đường chéo: đáp án khác dòng i ở chính bit i, nên chắc chắn khác tất cả n chuỗi mà không cần liệt kê 2^n khả năng.','O(n)','O(n)');
add(1982,'Find Array Given Subset Sums','backtracking',[2,[0,1,2,3]],[1,2],`
class Solution:
    def recoverArray(self, n, sums):
        from collections import Counter
        assert len(sums) == 1<<n
        def recover(values):
            if len(values) == 1:
                return []
            difference = values[1]-values[0]
            counts = Counter(values)
            lower,upper = [],[]
            for value in values:
                if counts[value]:
                    counts[value] -= 1
                    counts[value+difference] -= 1
                    lower.append(value)
                    upper.append(value+difference)
            if 0 in lower:
                return recover(lower)+[difference]
            return recover(upper)+[-difference]
        return sorted(recover(sorted(sums)))
`,'Hiệu hai tổng nhỏ nhất là trị tuyệt đối một phần tử. Ghép các tổng thành cặp x,x+diff, tách hai nửa; nửa chứa tổng rỗng 0 quyết định phần tử đó dương hay âm. Tổng trùng cần Counter.','O(n·2^n)','O(n·2^n)',{focus:['values','difference','counts','lower','upper']});
add(1983,'Widest Pair of Indices With Equal Range Sum','array',[[1,1,0,1],[0,1,1,0]],3,`
class Solution:
    def widestPairOfIndices(self, nums1, nums2):
        first,difference,answer = {0:-1},0,0
        for i,(a,b) in enumerate(zip(nums1,nums2)):
            difference += a-b
            if difference in first:
                answer = max(answer,i-first[difference])
            else:
                first[difference] = i
        return answer
`,'Hai đoạn cùng chỉ số có tổng bằng nhau khi prefix của nums1-nums2 lặp lại. Lưu chỉ số đầu của mỗi hiệu để độ rộng lớn nhất khi gặp lại.','O(n)','O(n)');
add(1984,'Minimum Difference Between Highest and Lowest of K Scores','array',[[9,4,1,7],2],2,`
class Solution:
    def minimumDifference(self, nums, k):
        ordered = sorted(nums)
        answer = float('inf')
        for left in range(len(nums)-k+1):
            answer = min(answer,ordered[left+k-1]-ordered[left])
        return answer
`,'Sau sắp xếp, nhóm k điểm tối ưu luôn có thể chọn liên tiếp. Hiệu lớn nhất-nhỏ nhất là hai đầu mỗi cửa sổ k.','O(n log n)','O(n)');
add(1985,'Find the Kth Largest Integer in the Array','string',[[ '3','6','7','10' ],4],'3',`
class Solution:
    def kthLargestNumber(self, nums, k):
        ordered = sorted(nums,key=lambda number:(len(number),number),reverse=True)
        return ordered[k-1]
`,'Số nguyên không có 0 đầu: nhiều chữ số hơn thì lớn hơn; cùng độ dài so từ điển. Giữ bản chuỗi để hỗ trợ số rất dài và vẫn tính các phần tử trùng riêng.','O(n log n·digits)','O(n)');
add(1986,'Minimum Number of Work Sessions to Finish the Tasks','dp',[[1,2,3],3],2,`
class Solution:
    def minSessions(self, tasks, sessionTime):
        n = len(tasks)
        assert n <= 12 and max(tasks) <= sessionTime
        dp = [(n+1,0)]*(1<<n)
        dp[0] = (1,0)
        for mask in range(1<<n):
            sessions,used = dp[mask]
            for i,duration in enumerate(tasks):
                if not mask>>i&1:
                    candidate = (sessions,used+duration) if used+duration <= sessionTime else (sessions+1,duration)
                    following = mask|1<<i
                    dp[following] = min(dp[following],candidate)
        return dp[-1][0]
`,'Mask đánh dấu việc đã làm. Mỗi trạng thái lưu cặp (số phiên,thời gian đã dùng ở phiên cuối); ít phiên hơn ưu tiên, hòa thì ít dùng hơn để dễ ghép việc sau.','O(n·2^n)','O(2^n)',{focus:['tasks','mask','sessions','used','candidate'],traceOptions:{summarizeLocals:{dp:20}}});
add(1988,'Find Cutoff Score for Each School','sql',[[{school_id:1,capacity:100},{school_id:2,capacity:10}],[{score:900,student_count:20},{score:800,student_count:80}]],[{school_id:1,score:800},{school_id:2,score:-1}],`
class Solution:
    def cutoffScores(self, schools, exams):
        answer = []
        for school in schools:
            eligible = [e['score'] for e in exams if e['student_count'] <= school['capacity']]
            answer.append({'school_id':school['school_id'],'score':min(eligible,default=-1)})
        return answer
`,'Mỗi score cho biết tổng học sinh đạt ngưỡng. Chọn điểm chuẩn nhỏ nhất mà student_count không vượt sức chứa trường; không có ngưỡng phù hợp trả -1.','O(schools·exams)','O(exams)');
add(1989,'Maximum Number of People That Can Be Caught in Tag','greedy',[[0,1,0,1,0],3],2,`
class Solution:
    def catchMaximumAmountofPeople(self, team, dist):
        runners = [i for i,value in enumerate(team) if value == 0]
        catchers = [i for i,value in enumerate(team) if value == 1]
        i,j,answer = 0,0,0
        while i < len(runners) and j < len(catchers):
            if abs(runners[i]-catchers[j]) <= dist:
                answer += 1
                i,j = i+1,j+1
            elif runners[i] < catchers[j]:
                i += 1
            else:
                j += 1
        return answer
`,'0 là người chạy, 1 là người bắt; mỗi người chỉ ghép một lần. Hai con trỏ từ trái: nếu trong dist thì ghép, nếu quá xa thì bỏ người ở trái vì không thể ghép với người phía sau.','O(n)','O(n)');
add(1990,'Count the Number of Experiments','sql',[[{experiment_id:1,platform:'Android',experiment_name:'Reading'}]],['Android','IOS','Web'].flatMap(platform=>['Programming','Sports','Reading'].map(experiment_name=>({platform,experiment_name,num_experiments:platform==='Android'&&experiment_name==='Reading'?1:0}))),`
class Solution:
    def countExperiments(self, experiments):
        counts = {}
        for row in experiments:
            key = (row['platform'],row['experiment_name'])
            counts[key] = counts.get(key,0)+1
        answer = []
        for platform in ('Android','IOS','Web'):
            for name in ('Programming','Sports','Reading'):
                answer.append({'platform':platform,'experiment_name':name,'num_experiments':counts.get((platform,name),0)})
        return answer
`,'Sinh CROSS JOIN ba nền tảng với ba loại thí nghiệm để luôn có 9 hàng. LEFT JOIN bộ đếm theo cặp và thay nhóm thiếu bằng 0.','O(experiments+9)','O(9)');
add(1991,'Find the Middle Index in Array','array',[[2,3,-1,8,4]],3,`
class Solution:
    def findMiddleIndex(self, nums):
        total,left = sum(nums),0
        for i,value in enumerate(nums):
            right = total-left-value
            if left == right:
                return i
            left += value
        return -1
`,'Ô giữa không thuộc tổng bên trái hay bên phải. Duyệt từ trái và trả ngay lần đầu hai tổng bằng nhau để lấy chỉ số nhỏ nhất.','O(n)','O(1)');
add(1993,'Operations on Tree','design',[[-1,0,0,1,1,2,2],[['lock',2,2],['unlock',2,3],['unlock',2,2],['lock',4,5],['upgrade',0,1],['lock',0,1]]],[true,false,true,true,true,false],`
class Solution:
    def lockingTree(self, parent, operations):
        children = [[] for _ in parent]
        for node,p in enumerate(parent):
            if p != -1:
                children[p].append(node)
        locks,answer = {},[]
        for operation,node,user in operations:
            success = False
            if operation == 'lock' and node not in locks:
                locks[node],success = user,True
            elif operation == 'unlock' and locks.get(node) == user:
                del locks[node]
                success = True
            elif operation == 'upgrade':
                ancestor,blocked = node,False
                while ancestor != -1:
                    blocked = blocked or ancestor in locks
                    ancestor = parent[ancestor]
                descendants = children[node][:]
                for child in descendants:
                    descendants.extend(children[child])
                locked = [child for child in descendants if child in locks]
                if not blocked and locked:
                    for child in locked:
                        del locks[child]
                    locks[node],success = user,True
            answer.append(success)
        return answer
`,'lock chỉ cần node chưa khóa; unlock phải đúng user. upgrade cần node và mọi tổ tiên chưa khóa, có ít nhất một hậu duệ khóa, rồi mở khóa tất cả hậu duệ và khóa node bằng user hiện tại.','O(operations·nodes)','O(nodes)',{focus:['parent','children','locks','locked','success','answer']});
add(1994,'The Number of Good Subsets','bits',[[1,2,3,4]],6,`
class Solution:
    def numberOfGoodSubsets(self, nums):
        from collections import Counter
        counts = Counter(nums)
        primes = [2,3,5,7,11,13,17,19,23,29]
        dp = {0:1}
        for value,count in sorted(counts.items()):
            if value == 1 or any(value%(p*p) == 0 for p in primes):
                continue
            mask = sum(1<<i for i,p in enumerate(primes) if value%p == 0)
            nextDp = dp.copy()
            for old,ways in dp.items():
                if not old&mask:
                    nextDp[old|mask] = (nextDp.get(old|mask,0)+ways*count)%1000000007
            dp = nextDp
        return (sum(dp.values())-1)*pow(2,counts[1],1000000007)%1000000007
`,'Tích tốt phải là tích các nguyên tố khác nhau. Bỏ số chứa bình phương nguyên tố; mask ghi nguyên tố đã dùng và chỉ ghép khi không giao bit. Các số 1 chọn/bỏ tùy ý nhưng tập chỉ gồm 1 không hợp lệ.','O(30·2^10)','O(2^10)',{focus:['counts','value','mask','dp','nextDp']});
add(1995,'Count Special Quadruplets','array',[[1,2,3,6]],1,`
class Solution:
    def countQuadruplets(self, nums):
        answer = 0
        for a in range(len(nums)):
            for b in range(a+1,len(nums)):
                for c in range(b+1,len(nums)):
                    for d in range(c+1,len(nums)):
                        answer += nums[a]+nums[b]+nums[c] == nums[d]
        return answer
`,'Duyệt a<b<c<d để đảm bảo bốn ô khác nhau và đúng thứ tự. Chỉ cộng khi tổng ba ô đầu bằng ô thứ tư.','O(n^4)','O(1)');
add(1997,'First Day Where You Have Been in All the Rooms','dp',[[0,0]],2,`
class Solution:
    def firstDayBeenInAllRooms(self, nextVisit):
        dp = [0]*len(nextVisit)
        for room in range(1,len(nextVisit)):
            previous = room-1
            dp[room] = (2*dp[previous]-dp[nextVisit[previous]]+2)%1000000007
        return dp[-1]
`,'dp[i] là ngày đầu tới phòng i. Từ phòng i-1 phải quay lại nextVisit[i-1], đi lại quãng đã biết để lần thăm thành chẵn, rồi mới sang i; truy hồi dùng hiệu ngày để tránh mô phỏng rất lâu.','O(n)','O(n)');
add(1998,'GCD Sort of an Array','graph',[[7,21,3]],true,`
class Solution:
    def gcdSort(self, nums):
        parent = {}
        def find(value):
            parent.setdefault(value,value)
            if parent[value] != value:
                parent[value] = find(parent[value])
            return parent[value]
        for value in nums:
            remaining,prime = value,2
            while prime*prime <= remaining:
                if remaining%prime == 0:
                    parent[find(value)] = find(prime)
                    while remaining%prime == 0:
                        remaining //= prime
                prime += 1
            if remaining > 1:
                parent[find(value)] = find(remaining)
        ordered = sorted(nums)
        return all(find(a) == find(b) for a,b in zip(nums,ordered))
`,'Hai giá trị có chung thừa số nguyên tố thuộc cùng nhóm có thể đổi chỗ qua chuỗi swap. DSU nối giá trị với các nguyên tố của nó; mỗi ô chỉ cần thuộc cùng nhóm với giá trị đích sau sắp xếp.','O(n·sqrt max+n log n)','O(unique factors)',{focus:['nums','parent','value','prime','ordered']});
add(1999,'Smallest Greater Multiple Made of Two Digits','graph',[3,0,1],111,`
class Solution:
    def findInteger(self, k, digit1, digit2):
        digits = sorted({digit1,digit2})
        assert k > 0 and all(0 <= digit <= 9 for digit in digits)
        queue,seen = [digit for digit in digits if digit],set()
        for value in queue:
            if value > 2147483647:
                continue
            if value > k and value%k == 0:
                return value
            state = (value%k,value > k)
            if state in seen:
                continue
            seen.add(state)
            queue.extend(value*10+digit for digit in digits)
        return -1
`,'BFS sinh số chỉ dùng digit1/digit2, không có 0 đầu. Thứ tự sinh là tăng dần nên bội lớn hơn k đầu tiên là nhỏ nhất; dừng xét số vượt giới hạn int32. Trạng thái gồm phần dư và cờ đã lớn hơn k.','O(reachable remainders)','O(reachable remainders)',{focus:['digits','value','queue','seen','state']});
add(2000,'Reverse Prefix of Word','string',['abcdefd','d'],'dcbaefd',`
class Solution:
    def reversePrefix(self, word, ch):
        index = word.find(ch)
        if index == -1:
            return word
        prefix,suffix = word[:index+1],word[index+1:]
        return prefix[::-1]+suffix
`,'Tìm lần xuất hiện đầu của ch, đảo prefix bao gồm chính chữ đó rồi nối suffix nguyên vẹn. Nếu không có ch thì giữ nguyên word.','O(n)','O(n)');
module.exports=lessons;
