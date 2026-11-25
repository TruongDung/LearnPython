"use strict";
const {defineEasy}=require('./easy-lesson');
const lessons={};const add=(...args)=>{const p=defineEasy(...args);lessons[p.id]=p;};
add(800,'Similar RGB Color','math',['#09f166'],'#11ee66',`
class Solution:
    def similarRGB(self, color):
        answer = '#'
        for i in (1,3,5):
            value = int(color[i:i+2],16)
            digit = (value+8)//17
            answer += format(digit,'x')*2
        return answer
`,'Mỗi kênh màu rút gọn phải có hai chữ số hex giống nhau, tức bội của 17; làm tròn tới bội gần nhất.','O(1)','O(1)',{focus:['color','answer','value','digit']});
add(806,'Number of Lines To Write String','array',[Array(26).fill(10),'abcdefghijklmnopqrstuvwxyz'],[3,60],`
class Solution:
    def numberOfLines(self, widths, s):
        lines, used = 1, 0
        for ch in s:
            width = widths[ord(ch)-ord('a')]
            if used+width > 100:
                lines, used = lines+1, 0
            used += width
        return [lines,used]
`,'Cộng độ rộng từng chữ vào dòng; nếu vượt 100 thì mở dòng mới trước khi đặt chữ.','O(n)','O(1)',{difficulty:'easy'});
add(807,'Max Increase to Keep City Skyline','array',[[[3,0,8,4],[2,4,5,7],[9,2,6,3],[0,3,1,0]]],35,`
class Solution:
    def maxIncreaseKeepingSkyline(self, grid):
        rows = [max(row) for row in grid]
        cols = [max(column) for column in zip(*grid)]
        answer = 0
        for r,row in enumerate(grid):
            for c,height in enumerate(row):
                ceiling = min(rows[r],cols[c])
                answer += ceiling-height
        return answer
`,'Nhà cao tối đa bằng min(đỉnh hàng, đỉnh cột); cộng phần có thể nâng của mọi ô.','O(mn)','O(m+n)',{focus:['grid','rows','cols','ceiling','answer']});
add(808,'Soup Servings','dp',[50],0.625,`
class Solution:
    def soupServings(self, n):
        from functools import lru_cache
        if n >= 4800:
            return 1.0
        assert 0 <= n <= 800, 'Use n <= 800 or n >= 4800 for the picture view'
        @lru_cache(None)
        def probability(a,b):
            if a <= 0 and b <= 0:
                return 0.5
            if a <= 0:
                return 1.0
            if b <= 0:
                return 0.0
            return (probability(a-4,b)+probability(a-3,b-1)+probability(a-2,b-2)+probability(a-1,b-3))/4
        units = (n+24)//25
        return probability(units,units)
`,'Chia thể tích theo đơn vị 25 ml. Mỗi trạng thái lấy trung bình xác suất của 4 cách múc; cùng hết tính nửa điểm.','O((n/25)²)','O((n/25)²)',{description:'For a readable trace use n ≤ 800; n ≥ 4800 uses the standard probability approximation within 1e-5.',traceOptions:{maxEvents:20000}});
add(809,'Expressive Words','string',['heeellooo',['hello','hi','helo']],1,`
class Solution:
    def expressiveWords(self, s, words):
        from itertools import groupby
        target = [(ch,len(list(g))) for ch,g in groupby(s)]
        answer = 0
        for word in words:
            groups = [(ch,len(list(g))) for ch,g in groupby(word)]
            if len(groups) != len(target):
                continue
            valid = all(a == b and y <= x and (x == y or x >= 3) for (a,x),(b,y) in zip(target,groups))
            answer += valid
        return answer
`,'So từng nhóm chữ lặp; nhóm ở s chỉ được kéo dài khác từ gốc khi có ít nhất 3 chữ.','O(|s|+Σ|word|)','O(max word length)',{focus:['target','groups','word','valid','answer']});
add(811,'Subdomain Visit Count','string',[[ '9001 discuss.leetcode.com']],['9001 discuss.leetcode.com','9001 leetcode.com','9001 com'],`
class Solution:
    def subdomainVisits(self, cpdomains):
        counts = {}
        for entry in cpdomains:
            visits, domain = entry.split()
            parts = domain.split('.')
            for i in range(len(parts)):
                suffix = '.'.join(parts[i:])
                counts[suffix] = counts.get(suffix,0)+int(visits)
        return [str(count)+' '+domain for domain,count in counts.items()]
`,'Mỗi lượt ghé tên miền cũng tính cho mọi hậu tố của nó: discuss.leetcode.com → leetcode.com → com.','O(L²)','O(L²)');
add(812,'Largest Triangle Area','math',[[[0,0],[0,1],[1,0],[0,2],[2,0]]],2,`
class Solution:
    def largestTriangleArea(self, points):
        from itertools import combinations
        best = 0
        for a,b,c in combinations(points,3):
            area = abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))/2
            best = max(best,area)
        return best
`,'Thử từng bộ ba điểm; trị tuyệt đối tích chéo chia 2 là diện tích tam giác.','O(n³)','O(1)',{difficulty:'easy'});
add(813,'Largest Sum of Averages','dp',[[9,1,2,3,9],3],20,`
class Solution:
    def largestSumOfAverages(self, nums, k):
        prefix = [0]
        for value in nums:
            prefix.append(prefix[-1]+value)
        n = len(nums)
        dp = [-float('inf')]*(n+1)
        dp[0] = 0
        for groups in range(1,k+1):
            following = [-float('inf')]*(n+1)
            for end in range(groups,n+1):
                for start in range(groups-1,end):
                    average = (prefix[end]-prefix[start])/(end-start)
                    following[end] = max(following[end],dp[start]+average)
            dp = following
        return dp[n]
`,'Chia thành k đoạn liên tiếp. Thử mọi chỗ bắt đầu đoạn cuối; điểm = điểm các đoạn trước + trung bình đoạn cuối.','O(kn²)','O(n)',{focus:['nums','prefix','dp','following'],traceOptions:{maxEvents:20000}});
add(814,'Binary Tree Pruning','tree',[[1,null,0,0,1]],[1,null,0,null,1],`
class Solution:
    def pruneTree(self, root):
        def prune(node):
            if not node:
                return None
            node.left, node.right = prune(node.left), prune(node.right)
            if node.val == 0 and not node.left and not node.right:
                return None
            return node
        return prune(root)
`,'Cắt từ lá lên: sau khi xử lý hai con, node 0 không còn con nào thì cả cây con không chứa 1.','O(n)','O(h)',{kinds:['tree'],answerKind:'tree'});
add(816,'Ambiguous Coordinates','string',['(123)'],['(1, 23)','(1, 2.3)','(12, 3)','(1.2, 3)'],`
class Solution:
    def ambiguousCoordinates(self, s):
        digits = s[1:-1]
        def forms(text):
            result = []
            if text == '0' or not text.startswith('0'):
                result.append(text)
            for split in range(1,len(text)):
                left, right = text[:split], text[split:]
                if (left == '0' or not left.startswith('0')) and not right.endswith('0'):
                    result.append(left+'.'+right)
            return result
        answer = []
        for split in range(1,len(digits)):
            for x in forms(digits[:split]):
                for y in forms(digits[split:]):
                    answer.append('('+x+', '+y+')')
        return answer
`,'Chọn dấu phẩy rồi thử dấu thập phân hai bên. Loại số có 0 thừa ở đầu và phần thập phân kết thúc bằng 0.','O(n⁴) output included','O(n⁴)');
add(817,'Linked List Components','list',[[0,1,2,3],[0,1,3]],2,`
class Solution:
    def numComponents(self, head, nums):
        allowed, answer, inside = set(nums), 0, False
        node = head
        while node:
            selected = node.val in allowed
            if selected and not inside:
                answer += 1
            inside = selected
            node = node.next
        return answer
`,'Một thành phần bắt đầu khi gặp node được chọn ngay sau node không chọn hoặc đầu list.','O(n+m)','O(m)',{kinds:['list']});
add(819,'Most Common Word','string',['Bob hit a ball, the hit BALL flew far after it was hit.',['hit']],'ball',`
class Solution:
    def mostCommonWord(self, paragraph, banned):
        import re
        from collections import Counter
        blocked = set(banned)
        words = re.findall('[a-z]+',paragraph.lower())
        counts = Counter(word for word in words if word not in blocked)
        return max(counts,key=counts.get)
`,'Đổi sang chữ thường, tách từ bằng dấu câu, bỏ từ cấm rồi lấy từ có tần suất cao nhất.','O(L)','O(L)',{difficulty:'easy',focus:['words','counts','blocked']});
add(820,'Short Encoding of Words','string',[[ 'time','me','bell']],10,`
class Solution:
    def minimumLengthEncoding(self, words):
        remaining = set(words)
        for word in words:
            for i in range(1,len(word)):
                remaining.discard(word[i:])
        return sum(len(word)+1 for word in remaining)
`,'Từ là hậu tố của từ khác đã được chứa trong mã hóa. Loại các hậu tố rồi cộng độ dài + ký tự #.','O(Σ|word|²)','O(Σ|word|)');
add(821,'Shortest Distance to a Character','array',['loveleetcode','e'],[3,2,1,0,1,0,0,1,2,2,1,0],`
class Solution:
    def shortestToChar(self, s, c):
        n, previous = len(s), -len(s)
        answer = [0]*n
        for i,ch in enumerate(s):
            if ch == c:
                previous = i
            answer[i] = i-previous
        previous = 2*n
        for i in range(n-1,-1,-1):
            if s[i] == c:
                previous = i
            answer[i] = min(answer[i],previous-i)
        return answer
`,'Quét trái sang phải tìm chữ c gần nhất bên trái, rồi quét ngược lấy min với khoảng cách bên phải.','O(n)','O(n)',{difficulty:'easy',focus:['s','answer','previous']});
add(822,'Card Flipping Game','array',[[1,2,4,4,7],[1,3,4,1,3]],2,`
class Solution:
    def flipgame(self, fronts, backs):
        blocked = {a for a,b in zip(fronts,backs) if a == b}
        candidates = [value for value in fronts+backs if value not in blocked]
        return min(candidates,default=0)
`,'Số nằm cả hai mặt cùng một thẻ không thể tốt. Trong các số còn lại, số nhỏ nhất luôn có thể làm mặt sau và giấu khỏi mặt trước.','O(n)','O(n)');
add(823,'Binary Trees With Factors','dp',[[2,4,5,10]],7,`
class Solution:
    def numFactoredBinaryTrees(self, arr):
        arr = sorted(arr)
        dp = {}
        for i,value in enumerate(arr):
            dp[value] = 1
            for left in arr[:i]:
                if value % left == 0 and value//left in dp:
                    right = value//left
                    dp[value] = (dp[value]+dp[left]*dp[right])%1000000007
        return sum(dp.values())%1000000007
`,'Mỗi số có một cây lá. Nếu value = left×right, ghép mọi cây trái với mọi cây phải; hai thứ tự được tính riêng.','O(n²)','O(n)');
add(824,'Goat Latin','string',['I speak Goat Latin'],'Imaa peaksmaaa oatGmaaaa atinLmaaaaa',`
class Solution:
    def toGoatLatin(self, sentence):
        answer = []
        for i,word in enumerate(sentence.split(),1):
            converted = word if word[0].lower() in 'aeiou' else word[1:]+word[0]
            answer.append(converted+'ma'+'a'*i)
        return ' '.join(answer)
`,'Nguyên âm giữ nguyên đầu; phụ âm chuyển xuống cuối. Thêm ma rồi thêm số chữ a theo thứ tự từ.','O(output length)','O(output length)',{difficulty:'easy'});
add(825,'Friends Of Appropriate Ages','array',[[16,16]],2,`
class Solution:
    def numFriendRequests(self, ages):
        answer = 0
        for i,a in enumerate(ages):
            for j,b in enumerate(ages):
                if i != j and 2*b > a+14 and b <= a:
                    answer += 1
        return answer
`,'Xét từng yêu cầu có hướng A→B, bỏ chính mình. B phải lớn hơn A/2+7 và không lớn tuổi hơn A.','O(n²)','O(1)',{description:'The teaching version checks ordered pairs explicitly; requests A→B and B→A are separate.'});
add(826,'Most Profit Assigning Work','greedy',[[2,4,6,8,10],[10,20,30,40,50],[4,5,6,7]],100,`
class Solution:
    def maxProfitAssignment(self, difficulty, profit, worker):
        jobs = sorted(zip(difficulty,profit))
        index, best, answer = 0, 0, 0
        for ability in sorted(worker):
            while index < len(jobs) and jobs[index][0] <= ability:
                best = max(best,jobs[index][1])
                index += 1
            answer += best
        return answer
`,'Sắp việc và năng lực tăng dần; mỗi người chọn lợi nhuận tốt nhất trong các việc đủ khả năng làm.','O(n log n+m log m)','O(n+m)');
add(828,'Count Unique Characters of All Substrings of a Given String','string',['ABC'],10,`
class Solution:
    def uniqueLetterString(self, s):
        last, answer = {}, 0
        for i,ch in enumerate(s):
            before, previous = last.get(ch,(-1,-1))
            answer += (previous-before)*(i-previous)
            last[ch] = (previous,i)
        for before,previous in last.values():
            answer += (previous-before)*(len(s)-previous)
        return answer
`,'Mỗi lần xuất hiện đóng góp (khoảng cách tới lần trước)×(khoảng cách tới lần sau), vì nó phải là chữ đó duy nhất trong đoạn.','O(n)','O(alphabet)',{focus:['s','last','before','previous','answer']});
add(829,'Consecutive Numbers Sum','math',[15],4,`
class Solution:
    def consecutiveNumbersSum(self, n):
        assert 1 <= n <= 1000000
        length, answer = 1, 0
        while length*(length-1)//2 < n:
            remainder = n-length*(length-1)//2
            if remainder % length == 0:
                answer += 1
            length += 1
        return answer
`,'Dãy dài k bắt đầu ở a có tổng k·a+k(k−1)/2. Phần còn lại phải dương và chia hết cho k.','O(√n)','O(1)',{traceOptions:{maxEvents:12000}});
add(830,'Positions of Large Groups','string',['abbxxxxzzy'],[[3,6]],`
class Solution:
    def largeGroupPositions(self, s):
        start, answer = 0, []
        for end in range(len(s)):
            if end+1 == len(s) or s[end+1] != s[start]:
                if end-start+1 >= 3:
                    answer.append([start,end])
                start = end+1
        return answer
`,'Theo dõi đầu và cuối mỗi nhóm chữ giống nhau; chỉ lưu nhóm dài từ 3.','O(n)','O(n)',{difficulty:'easy'});
add(831,'Masking Personal Information','string',['LeetCode@LeetCode.com'],'l*****e@leetcode.com',`
class Solution:
    def maskPII(self, s):
        if '@' in s:
            name, domain = s.lower().split('@')
            return name[0]+'*****'+name[-1]+'@'+domain
        digits = ''.join(ch for ch in s if ch.isdigit())
        local = '***-***-'+digits[-4:]
        country = len(digits)-10
        return ('+'+'*'*country+'-' if country else '')+local
`,'Email: viết thường và giữ chữ đầu/cuối tên. Điện thoại: chỉ lấy chữ số, che mọi chữ số trừ 4 số cuối.','O(n)','O(n)');
add(837,'New 21 Game','dp',[21,17,10],0.7327777870686082,`
class Solution:
    def new21Game(self, n, k, maxPts):
        if k == 0 or n >= k-1+maxPts:
            return 1.0
        assert 0 <= n <= 150 and 1 <= maxPts <= 80
        dp = [1.0]+[0.0]*n
        window, answer = 1.0, 0.0
        for score in range(1,n+1):
            dp[score] = window/maxPts
            if score < k:
                window += dp[score]
            else:
                answer += dp[score]
            previous = score-maxPts
            if 0 <= previous < k:
                window -= dp[previous]
        return answer
`,'dp[s] là xác suất tới s điểm; chỉ các điểm dưới k còn rút bài. Cửa sổ cộng xác suất nguồn trong maxPts điểm trước.','O(n)','O(n)',{focus:['dp','window','score','answer']});
add(838,'Push Dominoes','array',['.L.R...LR..L..'],'LL.RR.LLRRLL..',`
class Solution:
    def pushDominoes(self, dominoes):
        n, force = len(dominoes), 0
        forces = [0]*n
        for i,ch in enumerate(dominoes):
            force = n if ch == 'R' else 0 if ch == 'L' else max(0,force-1)
            forces[i] += force
        force = 0
        for i in range(n-1,-1,-1):
            ch = dominoes[i]
            force = n if ch == 'L' else 0 if ch == 'R' else max(0,force-1)
            forces[i] -= force
        return ''.join('R' if value > 0 else 'L' if value < 0 else '.' for value in forces)
`,'Quét lực đẩy phải rồi trừ lực đẩy trái. Lực suy giảm theo khoảng cách; tổng 0 nghĩa là đứng yên hoặc hai phía cân bằng.','O(n)','O(n)',{focus:['dominoes','forces','force']});
add(840,'Magic Squares In Grid','array',[[[4,3,8,4],[9,5,1,9],[2,7,6,2]]],1,`
class Solution:
    def numMagicSquaresInside(self, grid):
        answer = 0
        for r in range(len(grid)-2):
            for c in range(len(grid[0])-2):
                square = [row[c:c+3] for row in grid[r:r+3]]
                if sorted(v for row in square for v in row) != list(range(1,10)):
                    continue
                totals = [sum(row) for row in square]+[sum(col) for col in zip(*square)]
                totals += [sum(square[i][i] for i in range(3)),sum(square[i][2-i] for i in range(3))]
                if all(total == 15 for total in totals):
                    answer += 1
        return answer
`,'Trượt cửa sổ 3×3; phải có đúng số 1..9 và mọi hàng, cột, hai đường chéo đều tổng 15.','O(mn)','O(1)',{focus:['grid','square','totals','answer']});
add(842,'Split Array into Fibonacci Sequence','backtracking',['123456579'],[123,456,579],`
class Solution:
    def splitIntoFibonacci(self, num):
        path = []
        def solve(start):
            if start == len(num):
                return len(path) >= 3
            for end in range(start+1,min(len(num),start+10)+1):
                if end > start+1 and num[start] == '0':
                    break
                value = int(num[start:end])
                if value >= 2**31:
                    break
                if len(path) >= 2:
                    target = path[-1]+path[-2]
                    if value < target:
                        continue
                    if value > target:
                        break
                path.append(value)
                if solve(end):
                    return True
                path.pop()
            return False
        return path if solve(0) else []
`,'Chọn hai số đầu; từ số thứ ba phải bằng tổng hai số trước. Không chấp nhận 0 thừa ở đầu hoặc số vượt int32.','O(d²·n)','O(n)',{focus:['num','path','value','target'],traceOptions:{maxEvents:20000}});
add(845,'Longest Mountain in Array','dp',[[2,1,4,7,3,2,5]],5,`
class Solution:
    def longestMountain(self, arr):
        n = len(arr)
        up, down = [0]*n, [0]*n
        for i in range(1,n):
            if arr[i] > arr[i-1]:
                up[i] = up[i-1]+1
        for i in range(n-2,-1,-1):
            if arr[i] > arr[i+1]:
                down[i] = down[i+1]+1
        answer = 0
        for i in range(n):
            if up[i] and down[i]:
                answer = max(answer,up[i]+down[i]+1)
        return answer
`,'Tại mỗi đỉnh, ghép số bước tăng bên trái với số bước giảm bên phải; cả hai phải khác 0.','O(n)','O(n)',{focus:['arr','up','down','answer']});
add(846,'Hand of Straights','greedy',[[1,2,3,6,2,3,4,7,8],3],true,`
class Solution:
    def isNStraightHand(self, hand, groupSize):
        from collections import Counter
        if len(hand) % groupSize:
            return False
        counts = Counter(hand)
        for start in sorted(counts):
            needed = counts[start]
            if not needed:
                continue
            for value in range(start,start+groupSize):
                if counts[value] < needed:
                    return False
                counts[value] -= needed
        return True
`,'Lá nhỏ nhất còn lại bắt buộc mở đầu một nhóm; lấy cùng số lượng ở mọi giá trị liên tiếp trong nhóm đó.','O(n log n)','O(n)');
add(848,'Shifting Letters','string',['abc',[3,5,9]],'rpl',`
class Solution:
    def shiftingLetters(self, s, shifts):
        answer, total = list(s), 0
        for i in range(len(s)-1,-1,-1):
            total = (total+shifts[i])%26
            answer[i] = chr((ord(s[i])-ord('a')+total)%26+ord('a'))
        return ''.join(answer)
`,'Lệnh shifts[i] tác động cả tiền tố; đi ngược để cộng dồn mọi lần dịch tác động lên chữ hiện tại.','O(n)','O(n)',{focus:['s','shifts','answer','total']});
add(849,'Maximize Distance to Closest Person','array',[[1,0,0,0,1,0,1]],2,`
class Solution:
    def maxDistToClosest(self, seats):
        previous, best = -1, 0
        for i,occupied in enumerate(seats):
            if occupied:
                distance = i if previous < 0 else (i-previous)//2
                best = max(best,distance)
                previous = i
        return max(best,len(seats)-1-previous)
`,'Khoảng trống giữa hai người chọn ghế giữa; khoảng trống ở hai đầu chọn ghế sát mép ngoài.','O(n)','O(1)');
add(852,'Peak Index in a Mountain Array','search',[[0,2,1,0]],1,`
class Solution:
    def peakIndexInMountainArray(self, arr):
        left, right = 0, len(arr)-1
        while left < right:
            mid = (left+right)//2
            if arr[mid] < arr[mid+1]:
                left = mid+1
            else:
                right = mid
        return left
`,'Nếu mid đang lên dốc thì đỉnh ở bên phải; nếu xuống dốc thì đỉnh ở mid hoặc bên trái.','O(log n)','O(1)');
add(854,'K-Similar Strings','graph',['ab','ba'],1,`
class Solution:
    def kSimilarity(self, s1, s2):
        from collections import deque
        assert sorted(s1) == sorted(s2) and len(s1) <= 12
        queue, seen = deque([(s1,0)]), {s1}
        while queue:
            state, distance = queue.popleft()
            if state == s2:
                return distance
            i = next(i for i in range(len(state)) if state[i] != s2[i])
            for j in range(i+1,len(state)):
                if state[j] == s2[i] and state[j] != s2[j]:
                    values = list(state)
                    values[i],values[j] = values[j],values[i]
                    following = ''.join(values)
                    if following not in seen:
                        seen.add(following)
                        queue.append((following,distance+1))
`,'BFS số lần đổi chỗ. Ở mỗi trạng thái chỉ sửa vị trí sai đầu tiên bằng ký tự cần thiết ở phía sau.','O(n!·n)','O(n!·n)',{focus:['s2','state','queue','seen'],traceOptions:{maxEvents:20000}});
add(855,'Exam Room','design',[10,[['seat'],['seat'],['seat'],['seat'],['leave',4],['seat']]],[0,9,4,2,null,5],`
class Solution:
    def examRoom(self, n, operations):
        import bisect
        assert 1 <= n <= 1000000000
        occupied, answer = [], []
        for operation in operations:
            if operation[0] == 'leave':
                occupied.remove(operation[1])
                answer.append(None)
                continue
            assert len(occupied) < n
            seat, distance = 0, occupied[0] if occupied else n
            for left,right in zip(occupied,occupied[1:]):
                candidate = (right-left)//2
                if candidate > distance:
                    distance, seat = candidate, (left+right)//2
            if occupied and n-1-occupied[-1] > distance:
                seat = n-1
            bisect.insort(occupied,seat)
            answer.append(seat)
        return answer
`,'So ghế đầu, điểm giữa các khoảng trống và ghế cuối; khoảng cách bằng nhau thì giữ ghế có số nhỏ hơn.','O(q²)','O(q)',{focus:['occupied','answer','seat','distance']});
add(858,'Mirror Reflection','math',[2,1],2,`
class Solution:
    def mirrorReflection(self, p, q):
        import math
        divisor = math.gcd(p,q)
        horizontal, vertical = p//divisor, q//divisor
        if horizontal % 2 == 0:
            return 2
        return 0 if vertical % 2 == 0 else 1
`,'Trải gương thành các phòng nối nhau; rút gọn p,q rồi dùng tính chẵn/lẻ để xác định góc gặp tia.','O(log p)','O(1)');
add(859,'Buddy Strings','string',['ab','ba'],true,`
class Solution:
    def buddyStrings(self, s, goal):
        if len(s) != len(goal):
            return False
        if s == goal:
            return len(set(s)) < len(s)
        differences = [i for i in range(len(s)) if s[i] != goal[i]]
        if len(differences) != 2:
            return False
        i,j = differences
        return s[i] == goal[j] and s[j] == goal[i]
`,'Phải đổi đúng hai vị trí: hai chỗ sai cần khớp chéo. Nếu chuỗi đã giống nhau, cần hai chữ trùng để đổi mà không thay kết quả.','O(n)','O(n)',{difficulty:'easy'});
add(860,'Lemonade Change','greedy',[[5,5,5,10,20]],true,`
class Solution:
    def lemonadeChange(self, bills):
        five, ten = 0, 0
        for bill in bills:
            if bill == 5:
                five += 1
            elif bill == 10:
                five, ten = five-1, ten+1
            elif ten:
                five, ten = five-1, ten-1
            else:
                five -= 3
            if five < 0:
                return False
        return True
`,'Giữ số tờ 5 và 10; trả 15 ưu tiên 10+5 để dành nhiều tờ 5 cho khách sau.','O(n)','O(1)',{difficulty:'easy'});
add(861,'Score After Flipping Matrix','greedy',[[[0,0,1,1],[1,0,1,0],[1,1,0,0]]],39,`
class Solution:
    def matrixScore(self, grid):
        board = [row[:] for row in grid]
        m,n = len(board),len(board[0])
        for r in range(m):
            if board[r][0] == 0:
                board[r] = [1-value for value in board[r]]
        for c in range(1,n):
            if sum(board[r][c] for r in range(m))*2 < m:
                for r in range(m):
                    board[r][c] ^= 1
        return sum(sum(value*2**(n-1-c) for c,value in enumerate(row)) for row in board)
`,'Bật bit cao nhất của mọi hàng thành 1 trước; sau đó đảo cột khi số 0 nhiều hơn số 1.','O(mn)','O(mn)',{focus:['board']});
add(865,'Smallest Subtree with all the Deepest Nodes','tree',[[3,5,1,6,2,0,8,null,null,7,4]],[2,7,4],`
class Solution:
    def subtreeWithAllDeepest(self, root):
        def visit(node):
            if not node:
                return None,0
            left, ld = visit(node.left)
            right, rd = visit(node.right)
            if ld == rd:
                return node,ld+1
            return (left,ld+1) if ld > rd else (right,rd+1)
        return visit(root)[0]
`,'Mỗi cây con trả node bao hết các lá sâu nhất và độ sâu. Hai phía cùng sâu thì node hiện tại là tổ tiên chung cần tìm.','O(n)','O(h)',{kinds:['tree'],answerKind:'tree'});
add(866,'Prime Palindrome','math',[6],7,`
class Solution:
    def primePalindrome(self, n):
        import math
        assert 1 <= n <= 100000000
        def prime(value):
            return value >= 2 and (value == 2 or value%2 and all(value%d for d in range(3,math.isqrt(value)+1,2)))
        if 8 <= n <= 11:
            return 11
        for length in (1,3,5,7,9):
            if length < len(str(n)):
                continue
            half = (length+1)//2
            start = int(str(n)[:half]) if length == len(str(n)) else 10**(half-1)
            for prefix in range(start,10**half):
                text = str(prefix)
                candidate = int(text+text[-2::-1])
                if candidate >= n and prime(candidate):
                    return candidate
`,'Trừ số 11, palindrome nguyên tố có độ dài lẻ. Tạo palindrome từ nửa đầu rồi thử chia tới căn bậc hai.','O(C√answer)','O(log answer)',{focus:['candidate','prefix'],traceOptions:{maxEvents:20000}});
add(869,'Reordered Power of 2','math',[46],true,`
class Solution:
    def reorderedPowerOf2(self, n):
        signature = sorted(str(n))
        for exponent in range(31):
            power = 1 << exponent
            if sorted(str(power)) == signature:
                return True
        return False
`,'Đảo chữ số không đổi tần suất chữ số. So chữ ký đã sắp xếp với các lũy thừa 2 trong giới hạn đề.','O(log n·log log n)','O(log n)');
add(870,'Advantage Shuffle','greedy',[[2,7,11,15],[1,10,4,11]],[2,11,7,15],`
class Solution:
    def advantageCount(self, nums1, nums2):
        order = sorted(range(len(nums2)),key=lambda i:nums2[i])
        low, high = 0,len(order)-1
        answer = [0]*len(nums1)
        for value in sorted(nums1):
            if value > nums2[order[low]]:
                answer[order[low]] = value
                low += 1
            else:
                answer[order[high]] = value
                high -= 1
        return answer
`,'Số nhỏ nhất của A nếu thắng được đối thủ nhỏ nhất thì dùng để thắng; nếu không thì hi sinh trước đối thủ lớn nhất.','O(n log n)','O(n)');
add(873,'Length of Longest Fibonacci Subsequence','dp',[[1,2,3,4,5,6,7,8]],5,`
class Solution:
    def lenLongestFibSubseq(self, arr):
        index = {value:i for i,value in enumerate(arr)}
        dp, best = {}, 0
        for j in range(len(arr)):
            for i in range(j):
                k = index.get(arr[j]-arr[i],-1)
                if 0 <= k < i:
                    dp[i,j] = dp.get((k,i),2)+1
                    best = max(best,dp[i,j])
        return best
`,'Với hai số cuối arr[i],arr[j], số trước bắt buộc là arr[j]−arr[i]. Nếu có ở bên trái, nối thêm vào dãy đó.','O(n²)','O(n²)');
add(874,'Walking Robot Simulation','array',[[4,-1,4,-2,4],[[2,4]]],65,`
class Solution:
    def robotSim(self, commands, obstacles):
        blocked = {tuple(p) for p in obstacles}
        directions = [(0,1),(1,0),(0,-1),(-1,0)]
        x,y,direction,best = 0,0,0,0
        for command in commands:
            if command == -1:
                direction = (direction+1)%4
            elif command == -2:
                direction = (direction-1)%4
            else:
                assert 1 <= command <= 9
                dx,dy = directions[direction]
                for step in range(command):
                    if (x+dx,y+dy) in blocked:
                        break
                    x,y = x+dx,y+dy
                    best = max(best,x*x+y*y)
        return best
`,'Theo dõi hướng N/E/S/W; di chuyển từng ô để dừng trước vật cản. Giữ bình phương khoảng cách xa nhất từng đạt.','O(total movement+obstacles)','O(obstacles)',{focus:['commands','blocked','x','y','direction','best']});
add(880,'Decoded String at Index','string',['leet2code3',10],'o',`
class Solution:
    def decodeAtIndex(self, s, k):
        size = 0
        for ch in s:
            size = size*int(ch) if ch.isdigit() else size+1
        assert 1 <= k <= size
        for ch in reversed(s):
            k %= size
            if k == 0 and ch.isalpha():
                return ch
            size = size//int(ch) if ch.isdigit() else size-1
`,'Không tạo chuỗi khổng lồ. Tính độ dài rồi đi ngược; qua phép lặp thì dùng modulo để quay về bản sao đầu.','O(n)','O(1)',{focus:['s','size','k','ch']});
add(881,'Boats to Save People','greedy',[[3,2,2,1],3],3,`
class Solution:
    def numRescueBoats(self, people, limit):
        people = sorted(people)
        left,right,boats = 0,len(people)-1,0
        while left <= right:
            if people[left]+people[right] <= limit:
                left += 1
            right -= 1
            boats += 1
        return boats
`,'Mỗi thuyền luôn chở người nặng nhất còn lại; ghép người nhẹ nhất nếu còn đủ tải.','O(n log n)','O(n)',{focus:['people','left','right','boats']});
add(883,'Projection Area of 3D Shapes','array',[[[1,2],[3,4]]],17,`
class Solution:
    def projectionArea(self, grid):
        top = sum(value > 0 for row in grid for value in row)
        front = sum(max(row) for row in grid)
        side = sum(max(column) for column in zip(*grid))
        return top+front+side
`,'Nhìn từ trên đếm ô có khối; nhìn hai bên lấy chiều cao lớn nhất mỗi hàng và mỗi cột.','O(mn)','O(1)',{difficulty:'easy'});
add(884,'Uncommon Words from Two Sentences','string',['this apple is sweet','this apple is sour'],['sweet','sour'],`
class Solution:
    def uncommonFromSentences(self, s1, s2):
        from collections import Counter
        counts = Counter((s1+' '+s2).split())
        return [word for word,count in counts.items() if count == 1]
`,'Gộp hai câu rồi đếm; từ chỉ xuất hiện đúng một lần trong toàn bộ hai câu là từ không chung.','O(L)','O(L)',{difficulty:'easy'});
add(885,'Spiral Matrix III','array',[1,4,0,0],[[0,0],[0,1],[0,2],[0,3]],`
class Solution:
    def spiralMatrixIII(self, rows, cols, rStart, cStart):
        assert 1 <= rows <= 12 and 1 <= cols <= 12
        r,c,length,direction = rStart,cStart,1,0
        directions = [(0,1),(1,0),(0,-1),(-1,0)]
        answer = [[r,c]]
        while len(answer) < rows*cols:
            for turn in range(2):
                dr,dc = directions[direction%4]
                for step in range(length):
                    r,c = r+dr,c+dc
                    if 0 <= r < rows and 0 <= c < cols:
                        answer.append([r,c])
                direction += 1
            length += 1
        return answer
`,'Đi phải–xuống–trái–lên với độ dài 1,1,2,2,3,3,...; vẫn đi ngoài bảng nhưng chỉ lưu ô nằm trong bảng.','O((rows+cols)²)','O(rows·cols)',{focus:['answer','r','c','length','direction'],traceOptions:{maxEvents:16000}});
add(888,'Fair Candy Swap','array',[[1,1],[2,2]],[1,2],`
class Solution:
    def fairCandySwap(self, aliceSizes, bobSizes):
        difference = sum(bobSizes)-sum(aliceSizes)
        if difference%2:
            return []
        bob = set(bobSizes)
        for a in sorted(set(aliceSizes)):
            b = a+difference//2
            if b in bob:
                return [a,b]
        return []
`,'Sau đổi a lấy b, tổng Alice tăng b−a còn Bob giảm b−a. Vì vậy b−a bằng nửa chênh lệch tổng ban đầu.','O(n log n+m)','O(n+m)',{difficulty:'easy'});
add(889,'Construct Binary Tree from Preorder and Postorder Traversal','tree',[[1,2,4,5,3,6,7],[4,5,2,6,7,3,1]],[1,2,3,4,5,6,7],`
class Solution:
    def constructFromPrePost(self, preorder, postorder):
        positions = {value:i for i,value in enumerate(postorder)}
        def build(pre, post, size):
            if size == 0:
                return None
            node = TreeNode(preorder[pre])
            if size > 1:
                leftSize = positions[preorder[pre+1]]-post+1
                node.left = build(pre+1,post,leftSize)
                node.right = build(pre+leftSize+1,post+leftSize,size-leftSize-1)
            return node
        return build(0,0,len(preorder))
`,'Preorder cho gốc trước; node kế là gốc cây trái. Tìm nó trong postorder để biết số node bên trái, rồi chia hai cây con.','O(n)','O(n)',{answerKind:'tree'});
add(890,'Find and Replace Pattern','string',[[ 'abc','deq','mee','aqq','dkd','ccc'],'abb'],['mee','aqq'],`
class Solution:
    def findAndReplacePattern(self, words, pattern):
        def signature(word):
            mapping, result = {}, []
            for ch in word:
                mapping.setdefault(ch,len(mapping))
                result.append(mapping[ch])
            return result
        target = signature(pattern)
        return [word for word in words if signature(word) == target]
`,'Đổi mỗi chữ mới thành ID 0,1,2,...; hai từ khớp khi mẫu ID giống hệt nhau, bảo đảm ánh xạ hai chiều.','O(Σ|word|)','O(max word length)');
add(891,'Sum of Subsequence Widths','math',[[2,1,3]],6,`
class Solution:
    def sumSubseqWidths(self, nums):
        nums = sorted(nums)
        n, mod = len(nums), 1000000007
        powers = [1]
        for i in range(n):
            powers.append(powers[-1]*2%mod)
        answer = 0
        for i,value in enumerate(nums):
            contribution = value*(powers[i]-powers[n-1-i])
            answer = (answer+contribution)%mod
        return answer
`,'Sau sắp xếp, nums[i] làm max trong 2^i dãy con và làm min trong 2^(n−1−i) dãy. Cộng đóng góp max−min.','O(n log n)','O(n)');
add(892,'Surface Area of 3D Shapes','array',[[[1,2],[3,4]]],34,`
class Solution:
    def surfaceArea(self, grid):
        answer = 0
        for r,row in enumerate(grid):
            for c,height in enumerate(row):
                if height:
                    answer += 2+4*height
                if r:
                    answer -= 2*min(height,grid[r-1][c])
                if c:
                    answer -= 2*min(height,grid[r][c-1])
        return answer
`,'Mỗi cột cao h có 2+4h mặt ngoài nếu đứng riêng; mỗi cặp cột kề che 2·min(h1,h2) mặt.','O(mn)','O(1)',{difficulty:'easy'});
add(893,'Groups of Special-Equivalent Strings','string',[[ 'abcd','cdab','cbad','xyzz','zzxy','zzyx']],3,`
class Solution:
    def numSpecialEquivGroups(self, words):
        groups = set()
        for word in words:
            signature = (''.join(sorted(word[::2])),''.join(sorted(word[1::2])))
            groups.add(signature)
        return len(groups)
`,'Đổi chỗ chỉ trong cùng tính chẵn/lẻ của vị trí; chữ ký nhóm là hai tập chữ đã sắp xếp ở vị trí chẵn và lẻ.','O(n·L log L)','O(nL)',{difficulty:'easy'});
add(894,'All Possible Full Binary Trees','tree',[5],[[0,0,0,null,null,0,0],[0,0,0,0,0]],`
class Solution:
    def allPossibleFBT(self, n):
        from functools import lru_cache
        assert 1 <= n <= 9
        @lru_cache(None)
        def build(size):
            if size == 1:
                return [TreeNode(0)]
            trees = []
            for leftSize in range(1,size-1,2):
                for left in build(leftSize):
                    for right in build(size-leftSize-1):
                        trees.append(TreeNode(0,left,right))
            return trees
        return [_tree_values(root) for root in build(n)]
`,'Cây đầy đủ có 0 hoặc 2 con nên tổng node phải lẻ. Chia n−1 node thành hai số lẻ rồi ghép mọi cặp cây trái/phải. Kết quả dùng level-order.','O(Catalan(n))','O(Catalan(n))');
add(895,'Maximum Frequency Stack','design',[[['push',5],['push',7],['push',5],['push',7],['push',4],['push',5],['pop'],['pop'],['pop'],['pop']]],[null,null,null,null,null,null,5,7,5,4],`
class Solution:
    def freqStack(self, operations):
        frequency, groups, maximum, answer = {}, {}, 0, []
        for operation in operations:
            if operation[0] == 'push':
                value = operation[1]
                frequency[value] = frequency.get(value,0)+1
                count = frequency[value]
                groups.setdefault(count,[]).append(value)
                maximum = max(maximum,count)
                answer.append(None)
            else:
                value = groups[maximum].pop()
                frequency[value] -= 1
                if not groups[maximum]:
                    maximum -= 1
                answer.append(value)
        return answer
`,'Mỗi tần suất có một stack. Pop từ tầng tần suất cao nhất; trong tầng đó, thứ tự stack giải quyết ưu tiên gần đỉnh.','O(q)','O(q)',{focus:['frequency','groups','maximum','answer']});
add(896,'Monotonic Array','array',[[1,2,2,3]],true,`
class Solution:
    def isMonotonic(self, nums):
        increasing, decreasing = True, True
        for i in range(1,len(nums)):
            increasing = increasing and nums[i] >= nums[i-1]
            decreasing = decreasing and nums[i] <= nums[i-1]
        return increasing or decreasing
`,'Theo dõi hai khả năng: không giảm và không tăng. Chỉ cần một khả năng còn đúng sau khi duyệt hết.','O(n)','O(1)',{difficulty:'easy'});
add(897,'Increasing Order Search Tree','tree',[[5,3,6,2,4,null,8,1,null,null,null,7,9]],[1,null,2,null,3,null,4,null,5,null,6,null,7,null,8,null,9],`
class Solution:
    def increasingBST(self, root):
        dummy = tail = TreeNode(0)
        def visit(node):
            nonlocal tail
            if not node:
                return
            visit(node.left)
            node.left = None
            tail.right = node
            tail = node
            visit(node.right)
        visit(root)
        tail.right = None
        return dummy.right
`,'Duyệt inorder để gặp node theo thứ tự tăng; xóa con trái và nối mỗi node vào cuối chuỗi con phải.','O(n)','O(h)',{kinds:['tree'],answerKind:'tree',difficulty:'easy'});
add(898,'Bitwise ORs of Subarrays','bits',[[1,2,4]],6,`
class Solution:
    def subarrayBitwiseORs(self, arr):
        ending, seen = set(), set()
        for value in arr:
            ending = {value} | {previous | value for previous in ending}
            seen.update(ending)
        return len(seen)
`,'ending chứa OR của mọi đoạn kết thúc tại vị trí hiện tại; nối số mới vào các OR cũ và thêm đoạn một phần tử.','O(nB)','O(nB)',{focus:['arr','ending','seen']});
module.exports=lessons;
