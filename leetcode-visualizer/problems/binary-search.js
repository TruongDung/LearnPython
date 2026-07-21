// LeetCode Visualizer - Binary Search problems.

function parseIntegerList(value) {
  const parts = String(value ?? "").split(",").map((part) => part.trim());
  if (!parts.length || parts.some((part) => !/^-?\d+$/.test(part))) return [];
  const numbers = parts.map(Number);
  return numbers.every(Number.isSafeInteger) ? numbers : [];
}

function formatCounts(counts) {
  const entries = [...counts.entries()].sort((a, b) => a[0] - b[0]);
  return `{${entries.map(([person, count]) => `${person}: ${count}`).join(", ")}}`;
}

function timelineLabels(persons, leaders, tags = {}) {
  return persons.map((person, index) => {
    const leader = leaders[index] == null ? "?" : leaders[index];
    const tag = tags[index] ? ` | ${tags[index]}` : "";
    return `p=${person} | L=${leader}${tag}`;
  });
}

function buildSteps911(persons, params) {
  const times = parseIntegerList(params.times);
  const queries = parseIntegerList(params.queries);
  const steps = [];

  const validTimeline = times.length === persons.length
    && times.length > 0
    && times.every((time, index) => time >= 0 && (index === 0 || times[index - 1] < time));
  const validQueries = validTimeline && queries.length > 0 && queries.every((query) => query >= times[0]);

  if (!validTimeline || !validQueries) {
    steps.push({
      title: { vi: "Input không hợp lệ", en: "Invalid input" },
      arr: times.length ? [...times] : [0],
      sub: times.length === persons.length ? timelineLabels(persons, []) : [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [],
      vars: [
        { name: "persons.length", value: persons.length },
        { name: "times.length", value: times.length },
        { name: "queries.length", value: queries.length },
      ],
      note: {
        vi: "persons và times phải cùng độ dài; times tăng nghiêm ngặt; mỗi query phải >= times[0].",
        en: "persons and times must have equal length; times must be strictly increasing; every query must be >= times[0].",
      },
    });
    return { original: { persons: [...persons], times, queries }, answer: null, steps };
  }

  const leaders = [];
  const votes = new Map();
  let leader = -1;

  steps.push({
    title: { vi: "Gọi TopVotedCandidate(persons, times)", en: "Call TopVotedCandidate(persons, times)" },
    arr: [...times],
    sub: timelineLabels(persons, leaders),
    highlight: [],
    mark: [],
    codeLines: [2],
    vars: [
      { name: "persons", value: `[${persons.join(", ")}]` },
      { name: "times", value: `[${times.join(", ")}]` },
    ],
    note: {
      vi: "Bắt đầu constructor; các thuộc tính self.times và self.leaders chưa được gán.",
      en: "Enter the constructor; self.times and self.leaders have not been assigned yet.",
    },
  });

  steps.push({
    title: { vi: "Lưu timeline", en: "Store the timeline" },
    arr: [...times],
    sub: timelineLabels(persons, leaders),
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [
      { name: "self.times", value: `[${times.join(", ")}]` },
    ],
    note: {
      vi: "times đã tăng nghiêm ngặt. Mỗi index i ghép persons[i] với times[i].",
      en: "times is strictly increasing. Each index i pairs persons[i] with times[i].",
    },
  });

  steps.push({
    title: { vi: "Khởi tạo self.leaders", en: "Initialize self.leaders" },
    arr: [...times],
    sub: timelineLabels(persons, leaders),
    highlight: [],
    mark: [],
    codeLines: [4],
    vars: [
      { name: "self.times", value: `[${times.join(", ")}]` },
      { name: "self.leaders", value: "[]" },
    ],
    note: {
      vi: "Mảng self.leaders bắt đầu rỗng và sẽ lưu leader sau từng phiếu.",
      en: "self.leaders starts empty and will store the leader after every vote.",
    },
  });

  steps.push({
    title: { vi: "Khởi tạo votes = {}", en: "Initialize votes = {}" },
    arr: [...times],
    sub: timelineLabels(persons, leaders),
    highlight: [],
    mark: [],
    codeLines: [5],
    vars: [
      { name: "self.times", value: `[${times.join(", ")}]` },
      { name: "self.leaders", value: "[]" },
      { name: "votes", value: "{}" },
    ],
    note: {
      vi: "Hash map votes chưa chứa phiếu của ứng viên nào.",
      en: "The votes hash map does not contain any candidate counts yet.",
    },
  });

  steps.push({
    title: { vi: "Khởi tạo leader = -1", en: "Initialize leader = -1" },
    arr: [...times],
    sub: timelineLabels(persons, leaders),
    highlight: [],
    mark: [],
    codeLines: [6],
    vars: [
      { name: "self.times", value: `[${times.join(", ")}]` },
      { name: "self.leaders", value: "[]" },
      { name: "votes", value: "{}" },
      { name: "leader", value: "none" },
    ],
    note: {
      vi: "Giá trị -1 là sentinel: chưa có leader trước phiếu đầu tiên.",
      en: "The value -1 is a sentinel: there is no leader before the first vote.",
    },
  });

  for (let i = 0; i < persons.length; i++) {
    const person = persons[i];

    steps.push({
      title: { vi: `Phiếu ${i}: person = ${person}`, en: `Vote ${i}: person = ${person}` },
      arr: [...times],
      sub: timelineLabels(persons, leaders),
      highlight: [i],
      mark: leaders.map((_, index) => index),
      codeLines: [7],
      vars: [
        { name: "person", value: person },
        { name: "votes", value: formatCounts(votes) },
        { name: "leader", value: leader < 0 ? "none" : leader },
        { name: "self.leaders", value: `[${leaders.join(", ")}]` },
      ],
      note: {
        vi: `Xử lý phiếu cho person ${person} tại time ${times[i]}.`,
        en: `Process a vote for person ${person} at time ${times[i]}.`,
      },
    });

    votes.set(person, (votes.get(person) || 0) + 1);
    steps.push({
      title: { vi: `votes[${person}] += 1`, en: `votes[${person}] += 1` },
      arr: [...times],
      sub: timelineLabels(persons, leaders),
      highlight: [i],
      mark: leaders.map((_, index) => index),
      codeLines: [8],
      vars: [
        { name: "person", value: person },
        { name: "votes", value: formatCounts(votes) },
        { name: "leader", value: leader < 0 ? "none" : leader },
        { name: "self.leaders", value: `[${leaders.join(", ")}]` },
      ],
      note: {
        vi: `Person ${person} hiện có ${votes.get(person)} phiếu.`,
        en: `Person ${person} now has ${votes.get(person)} vote(s).`,
      },
    });

    const leaderVotes = leader < 0 ? 0 : (votes.get(leader) || 0);
    const shouldLead = votes.get(person) >= leaderVotes;
    const tiesDifferentLeader = leader >= 0 && leader !== person && votes.get(person) === leaderVotes;
    steps.push({
      title: {
        vi: `So sánh ${votes.get(person)} >= ${leaderVotes}: ${shouldLead ? "True" : "False"}`,
        en: `Compare ${votes.get(person)} >= ${leaderVotes}: ${shouldLead ? "True" : "False"}`,
      },
      arr: [...times],
      sub: timelineLabels(persons, leaders),
      highlight: [i],
      mark: leaders.map((_, index) => index),
      codeLines: [9],
      vars: [
        { name: "person", value: person },
        { name: "votes", value: formatCounts(votes) },
        { name: "leader", value: leader < 0 ? "none" : leader },
        { name: "votes.get(leader, 0)", value: leaderVotes },
        { name: "condition", value: shouldLead ? "True" : "False" },
        { name: "self.leaders", value: `[${leaders.join(", ")}]` },
      ],
      note: {
        vi: leader < 0
          ? `Đây là phiếu đầu tiên, nên person ${person} trở thành leader.`
          : tiesDifferentLeader
          ? "Hai người hòa phiếu. Điều kiện >= cho người vừa nhận phiếu trở thành leader."
          : shouldLead
            ? `Person ${person} đang dẫn đầu và vừa nhận thêm phiếu, nên vẫn là leader.`
            : `Person ${person} ít phiếu hơn leader ${leader}, nên leader không đổi.`,
        en: leader < 0
          ? `This is the first vote, so person ${person} becomes the leader.`
          : tiesDifferentLeader
          ? "Two candidates are tied. The >= condition makes the most recently voted person the leader."
          : shouldLead
            ? `Person ${person} is already leading and just received another vote, so remains leader.`
            : `Person ${person} has fewer votes than leader ${leader}, so the leader stays unchanged.`,
      },
    });

    if (shouldLead) {
      const previousLeader = leader;
      leader = person;
      steps.push({
        title: { vi: `leader = ${person}`, en: `leader = ${person}` },
        arr: [...times],
        sub: timelineLabels(persons, leaders),
        highlight: [i],
        mark: leaders.map((_, index) => index),
        codeLines: [10],
        vars: [
          { name: "person", value: person },
          { name: "votes", value: formatCounts(votes) },
          { name: "leader", value: leader },
          { name: "self.leaders", value: `[${leaders.join(", ")}]` },
        ],
        note: {
          vi: tiesDifferentLeader
            ? `Đang hòa ${leaderVotes}-${leaderVotes}; phiếu mới nhất thuộc person ${person}, nên ${person} thắng tie.`
            : previousLeader === person
              ? `Leader ${person} nhận thêm phiếu và tiếp tục dẫn đầu với ${votes.get(person)} phiếu.`
              : `Person ${person} trở thành leader với ${votes.get(person)} phiếu.`,
          en: tiesDifferentLeader
            ? `The count is tied ${leaderVotes}-${leaderVotes}; the latest vote is for person ${person}, so ${person} wins the tie.`
            : previousLeader === person
              ? `Leader ${person} receives another vote and remains ahead with ${votes.get(person)} vote(s).`
              : `Person ${person} becomes leader with ${votes.get(person)} vote(s).`,
        },
      });
    }

    leaders.push(leader);
    steps.push({
      title: { vi: `leaders.append(${leader})`, en: `leaders.append(${leader})` },
      arr: [...times],
      sub: timelineLabels(persons, leaders),
      highlight: [i],
      mark: leaders.map((_, index) => index),
      codeLines: [11],
      vars: [
        { name: "person", value: person },
        { name: "votes", value: formatCounts(votes) },
        { name: "leader", value: leader },
        { name: "self.leaders", value: `[${leaders.join(", ")}]` },
      ],
      note: {
        vi: `Tại time ${times[i]}, leader được lưu là person ${leader}.`,
        en: `At time ${times[i]}, person ${leader} is stored as the leader.`,
      },
    });
  }

  steps.push({
    title: { vi: "Hoàn tất tiền xử lý", en: "Preprocessing complete" },
    arr: [...times],
    sub: timelineLabels(persons, leaders),
    highlight: [],
    mark: times.map((_, index) => index),
    codeLines: [],
    vars: [
      { name: "self.times", value: `[${times.join(", ")}]` },
      { name: "self.leaders", value: `[${leaders.join(", ")}]` },
      { name: "construction", value: "O(n)" },
    ],
    note: {
      vi: "Mỗi times[i] đã ghép với leaders[i]. Bây giờ mỗi q(t) chỉ cần binary search.",
      en: "Each times[i] is paired with leaders[i]. Each q(t) can now use binary search.",
    },
  });

  const answers = [];
  for (let queryIndex = 0; queryIndex < queries.length; queryIndex++) {
    const t = queries[queryIndex];

    steps.push({
      title: { vi: `Gọi q(${t})`, en: `Call q(${t})` },
      arr: [...times],
      sub: timelineLabels(persons, leaders),
      highlight: [],
      mark: [],
      codeLines: [13],
      vars: [
        { name: "t", value: t },
        { name: "self.times", value: `[${times.join(", ")}]` },
        { name: "self.leaders", value: `[${leaders.join(", ")}]` },
      ],
      note: {
        vi: `Bắt đầu một lần gọi q với tham số t=${t}; left và right chưa được gán cho lần gọi này.`,
        en: `Begin one q call with t=${t}; left and right have not been assigned for this call yet.`,
      },
    });

    let left = 0;
    let right = times.length;
    let mid = null;
    steps.push({
      title: { vi: `left, right = 0, ${right}`, en: `left, right = 0, ${right}` },
      arr: [...times],
      sub: timelineLabels(persons, leaders, { 0: "L", [times.length - 1]: "R-1" }),
      highlight: [],
      mark: [],
      codeLines: [14],
      vars: [
        { name: "t", value: t },
        { name: "left", value: left },
        { name: "right", value: right },
      ],
      note: {
        vi: `Tìm index đầu tiên có times[index] > ${t}. right=${right} là biên loại trừ.`,
        en: `Find the first index where times[index] > ${t}. right=${right} is exclusive.`,
      },
    });

    while (left < right) {
      steps.push({
        title: { vi: `Kiểm tra ${left} < ${right}`, en: `Check ${left} < ${right}` },
        arr: [...times],
        sub: timelineLabels(persons, leaders, {
          [left]: "L",
          [Math.max(left, right - 1)]: left === right - 1 ? "L,R-1" : "R-1",
        }),
        highlight: [],
        mark: [],
        codeLines: [15],
        vars: [
          { name: "t", value: t },
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "condition", value: "True" },
        ],
        note: {
          vi: "Khoảng tìm kiếm chưa rỗng, tiếp tục binary search.",
          en: "The search interval is not empty, so binary search continues.",
        },
      });

      mid = Math.floor((left + right) / 2);
      const tags = { [left]: "L", [mid]: "M" };
      if (right - 1 >= left) tags[right - 1] = tags[right - 1] ? `${tags[right - 1]},R-1` : "R-1";
      steps.push({
        title: { vi: `mid = (${left} + ${right}) // 2 = ${mid}`, en: `mid = (${left} + ${right}) // 2 = ${mid}` },
        arr: [...times],
        sub: timelineLabels(persons, leaders, tags),
        highlight: [mid],
        mark: [],
        codeLines: [16],
        vars: [
          { name: "t", value: t },
          { name: "left", value: left },
          { name: "mid", value: mid },
          { name: "right", value: right },
          { name: "times[mid]", value: times[mid] },
        ],
        note: {
          vi: `Chọn index giữa ${mid}, tương ứng time ${times[mid]} và leader ${leaders[mid]}.`,
          en: `Choose middle index ${mid}, which has time ${times[mid]} and leader ${leaders[mid]}.`,
        },
      });

      const moveRight = times[mid] <= t;
      steps.push({
        title: {
          vi: `${times[mid]} <= ${t}: ${moveRight ? "True" : "False"}`,
          en: `${times[mid]} <= ${t}: ${moveRight ? "True" : "False"}`,
        },
        arr: [...times],
        sub: timelineLabels(persons, leaders, tags),
        highlight: [mid],
        mark: [],
        codeLines: [17],
        vars: [
          { name: "t", value: t },
          { name: "left", value: left },
          { name: "mid", value: mid },
          { name: "right", value: right },
          { name: "times[mid]", value: times[mid] },
          { name: "condition", value: moveRight ? "True" : "False" },
        ],
        note: {
          vi: moveRight
            ? `time ${times[mid]} <= ${t}; index đầu tiên có time > t phải nằm sau mid, nên bỏ [left..mid].`
            : `time ${times[mid]} đã vượt query ${t}; index đầu tiên > t nằm tại mid hoặc bên trái.`,
          en: moveRight
            ? `Time ${times[mid]} <= ${t}; the first time greater than t must be after mid, so discard [left..mid].`
            : `Time ${times[mid]} exceeds query ${t}; the first index > t is at mid or to its left.`,
        },
      });

      if (moveRight) {
        left = mid + 1;
        steps.push({
          title: { vi: `left = ${mid} + 1 = ${left}`, en: `left = ${mid} + 1 = ${left}` },
          arr: [...times],
          sub: timelineLabels(persons, leaders, left < times.length ? { [left]: "new L" } : {}),
          highlight: [],
          mark: [],
          codeLines: [18],
          vars: [
            { name: "t", value: t },
            { name: "left", value: left },
            { name: "mid", value: mid },
            { name: "right", value: right },
          ],
          note: {
            vi: `Dời left qua mid. Khoảng mới là [${left}, ${right}).`,
            en: `Move left past mid. The new interval is [${left}, ${right}).`,
          },
        });
      } else {
        steps.push({
          title: { vi: "Đi vào nhánh else", en: "Enter the else branch" },
          arr: [...times],
          sub: timelineLabels(persons, leaders, tags),
          highlight: [mid],
          mark: [],
          codeLines: [19],
          vars: [
            { name: "t", value: t },
            { name: "left", value: left },
            { name: "mid", value: mid },
            { name: "right", value: right },
            { name: "times[mid]", value: times[mid] },
          ],
          note: {
            vi: `${times[mid]} <= ${t} là False; chưa đổi right cho đến khi chạy dòng 20.`,
            en: `${times[mid]} <= ${t} is False; right does not change until line 20 runs.`,
          },
        });

        right = mid;
        steps.push({
          title: { vi: `right = mid = ${right}`, en: `right = mid = ${right}` },
          arr: [...times],
          sub: timelineLabels(persons, leaders, right > left ? { [right - 1]: "new R-1" } : {}),
          highlight: [],
          mark: [],
          codeLines: [20],
          vars: [
            { name: "t", value: t },
            { name: "left", value: left },
            { name: "mid", value: mid },
            { name: "right", value: right },
          ],
          note: {
            vi: `Giữ mid trong phía có thể chứa index đầu tiên > t. Khoảng mới là [${left}, ${right}).`,
            en: `Keep mid in the side that may contain the first index > t. The new interval is [${left}, ${right}).`,
          },
        });
      }
    }

    steps.push({
      title: { vi: `Kiểm tra ${left} < ${right}: False`, en: `Check ${left} < ${right}: False` },
      arr: [...times],
      sub: timelineLabels(persons, leaders),
      highlight: [],
      mark: [],
      codeLines: [15],
      vars: [
        { name: "t", value: t },
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "mid", value: mid },
        { name: "condition", value: "False" },
      ],
      note: {
        vi: `Khoảng [${left}, ${right}) đã rỗng. left=${left} là index đầu tiên có time > ${t}.`,
        en: `The interval [${left}, ${right}) is empty. left=${left} is the first index whose time is greater than ${t}.`,
      },
    });

    const answerIndex = left - 1;
    const answer = leaders[answerIndex];
    answers.push(answer);
    steps.push({
      title: { vi: `q(${t}) = ${answer}`, en: `q(${t}) = ${answer}` },
      arr: [...times],
      sub: timelineLabels(persons, leaders, { [answerIndex]: "answer" }),
      highlight: [],
      mark: [answerIndex],
      codeLines: [21],
      vars: [
        { name: "t", value: t },
        { name: "left", value: left },
        { name: "left - 1", value: answerIndex },
        { name: "self.leaders[left - 1]", value: answer },
      ],
      note: {
        vi: `left=${left} là index đầu tiên có time > ${t}; vì vậy time gần nhất <= ${t} nằm tại left-1=${answerIndex}.`,
        en: `left=${left} is the first index with time > ${t}; therefore the latest time <= ${t} is at left-1=${answerIndex}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả tất cả truy vấn", en: "All query results" },
    arr: [...times],
    sub: timelineLabels(persons, leaders),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [],
    vars: [
      { name: "queries", value: `[${queries.join(", ")}]` },
      { name: "answers", value: `[${answers.join(", ")}]` },
    ],
    note: {
      vi: `Hoàn tất ${queries.length} truy vấn. Mỗi truy vấn dùng O(log n).`,
      en: `Completed ${queries.length} queries. Each query uses O(log n).`,
    },
  });

  return {
    original: { persons: [...persons], times, queries },
    answer: answers,
    steps,
  };
}

module.exports = {
  __meta: {
    order: [34, 911],
    label: { vi: "Thứ tự học Binary Search", en: "Binary Search learning order" },
  },
  911: {
    id: 911,
    difficulty: "medium",
    slug: "online-election",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    title: { vi: "Online Election", en: "Online Election" },
    titleVi: { vi: "Bầu cử trực tuyến", en: "Track election leaders over time" },
    statement: {
      vi: "Cho persons[i] là người nhận phiếu tại times[i]. Với mỗi q(t), trả về người đang dẫn đầu tại thời điểm t; nếu hòa, người nhận phiếu gần nhất thắng.",
      en: "persons[i] receives a vote at times[i]. For each q(t), return the leader at time t; ties are won by the most recently voted person.",
    },
    defaultInput: [0, 1, 1, 0, 0, 1, 0],
    inputKind: "nonneg",
    inputLabel: { vi: "persons (ứng viên nhận từng phiếu)", en: "persons (candidate receiving each vote)" },
    extraParams: [
      {
        key: "times",
        type: "string",
        label: { vi: "times (tăng nghiêm ngặt, phẩy ngăn)", en: "times (strictly increasing, comma separated)" },
        default: "0,5,10,15,20,25,30",
      },
      {
        key: "queries",
        type: "string",
        label: { vi: "queries q(t) (phẩy ngăn)", en: "q(t) queries (comma separated)" },
        default: "3,12,25,15,24,8",
      },
    ],
    approach: [
      {
        vi: "Constructor: đếm phiếu theo thứ tự thời gian và lưu leader sau mỗi phiếu. Dùng >= để người nhận phiếu mới nhất thắng khi hòa.",
        en: "Constructor: count votes chronologically and store the leader after every vote. Use >= so the latest vote wins ties.",
      },
      {
        vi: "q(t): binary search index đầu tiên có times[index] > t, rồi trả leaders[index - 1].",
        en: "q(t): binary-search the first index where times[index] > t, then return leaders[index - 1].",
      },
    ],
    complexity: {
      time: "Constructor O(n), q(t) O(log n)",
      space: "O(n)",
      note: {
        vi: "Tiền xử lý một lần O(n). Mảng leaders cho phép mỗi truy vấn chỉ binary search trên times.",
        en: "Preprocess once in O(n). The leaders array lets every query use only a binary search over times.",
      },
    },
    code: [
      "class TopVotedCandidate:",
      "    def __init__(self, persons, times):",
      "        self.times = times",
      "        self.leaders = []",
      "        votes = {}",
      "        leader = -1",
      "        for person in persons:",
      "            votes[person] = votes.get(person, 0) + 1",
      "            if votes[person] >= votes.get(leader, 0):",
      "                leader = person",
      "            self.leaders.append(leader)",
      "",
      "    def q(self, t: int) -> int:",
      "        left, right = 0, len(self.times)",
      "        while left < right:",
      "            mid = (left + right) // 2",
      "            if self.times[mid] <= t:",
      "                left = mid + 1",
      "            else:",
      "                right = mid",
      "        return self.leaders[left - 1]",
    ],
    builder: buildSteps911,
  },
};

/**
 * LeetCode 34: Find First and Last Position of Element in Sorted Array.
 * Two half-open binary searches [left, right):
 *  - lowerBound(target): first index where nums[i] >= target.
 *  - lowerBound(target + 1): first index where nums[i] >= target + 1,
 *    i.e. first index where nums[i] > target. Subtract 1 to get the last
 *    occurrence of target.
 * If lowerBound(target) is out of range or doesn't actually equal target,
 * target isn't present → return [-1, -1].
 */
function buildSteps34(nums, params) {
  const target = Number(params && params.target !== undefined ? params.target : nums[0]);
  const n = nums.length;
  const steps = [];

  function labels(l, r, m) {
    return nums.map((_, i) => {
      const tags = [];
      if (i === l) tags.push("L");
      if (m !== undefined && i === m) tags.push("M");
      if (i === r) tags.push("R");
      return tags.length ? `[${i}] ${tags.join("/")}` : `[${i}]`;
    });
  }
  function activeRange(l, r) {
    return Array.from({ length: Math.max(0, r - l) }, (_, k) => l + k);
  }

  // lowerBound(x): first index where nums[i] >= x. Emits one step per line,
  // codeBlock 1 = lowerBound helper, tagged with which call site (first/second).
  function lowerBound(x, callLabel) {
    let left = 0;
    let right = n;
    steps.push({
      title: { vi: `lowerBound(${x}): left, right = 0, len(nums)`, en: `lowerBound(${x}): left, right = 0, len(nums)` },
      arr: [...nums],
      sub: labels(left, right),
      highlight: activeRange(left, right),
      mark: [],
      codeLines: [4],
      vars: [{ name: "call", value: callLabel }, { name: "x", value: x }, { name: "left (L)", value: left }, { name: "right (R)", value: right }],
      note: {
        vi: `${callLabel}: tìm chỉ số đầu tiên có nums[i] ≥ ${x}. Vùng tìm kiếm ban đầu là toàn bộ mảng.`,
        en: `${callLabel}: find the first index where nums[i] ≥ ${x}. The initial search range is the whole array.`,
      },
    });

    while (left < right) {
      steps.push({
        title: { vi: `while L=${left} < R=${right} → True`, en: `while L=${left} < R=${right} → True` },
        arr: [...nums],
        sub: labels(left, right),
        highlight: activeRange(left, right),
        mark: [],
        codeLines: [5],
        vars: [{ name: "left (L)", value: left }, { name: "right (R)", value: right }],
        note: {
          vi: `L=${left} < R=${right} → còn vùng để thu hẹp.`,
          en: `L=${left} < R=${right} → there's still a range to narrow.`,
        },
      });

      const mid = Math.floor((left + right) / 2);
      steps.push({
        title: { vi: `M = (L+R)//2 = ${mid}`, en: `M = (L+R)//2 = ${mid}` },
        arr: [...nums],
        sub: labels(left, right, mid),
        highlight: activeRange(left, right),
        mark: [mid],
        codeLines: [6],
        vars: [{ name: "mid (M)", value: mid }, { name: "nums[M]", value: nums[mid] }],
        note: { vi: `Điểm giữa vùng [${left}, ${right}) là M=${mid}. nums[${mid}] = ${nums[mid]}.`, en: `The midpoint of [${left}, ${right}) is M=${mid}. nums[${mid}] = ${nums[mid]}.` },
      });

      const goRight = nums[mid] < x;
      steps.push({
        title: { vi: `nums[M]=${nums[mid]} < x=${x} → ${goRight}`, en: `nums[M]=${nums[mid]} < x=${x} → ${goRight}` },
        arr: [...nums],
        sub: labels(left, right, mid),
        highlight: activeRange(left, right),
        mark: [mid],
        codeLines: [7],
        vars: [{ name: "nums[M] < x?", value: goRight }],
        note: goRight
          ? { vi: `${nums[mid]} < ${x} → M quá nhỏ, đáp án nằm bên PHẢI của M → bỏ nửa trái.`, en: `${nums[mid]} < ${x} → M is too small, the answer is to the RIGHT of M → discard the left half.` }
          : { vi: `${nums[mid]} ≥ ${x} → M có thể là đáp án → giữ M, bỏ nửa phải.`, en: `${nums[mid]} ≥ ${x} → M could be the answer → keep M, discard the right half.` },
      });

      if (goRight) {
        const oldLeft = left;
        left = mid + 1;
        steps.push({
          title: { vi: `L = M + 1 = ${left}`, en: `L = M + 1 = ${left}` },
          arr: [...nums],
          sub: labels(left, right),
          highlight: activeRange(left, right),
          mark: [],
          codeLines: [8],
          vars: [{ name: "left before", value: oldLeft }, { name: "left after (L)", value: left }],
          note: { vi: `Vùng tìm kiếm co lại thành [${left}, ${right}).`, en: `The search range shrinks to [${left}, ${right}).` },
        });
      } else {
        const oldRight = right;
        right = mid;
        steps.push({
          title: { vi: `R = M = ${right}`, en: `R = M = ${right}` },
          arr: [...nums],
          sub: labels(left, right),
          highlight: activeRange(left, right),
          mark: [],
          codeLines: [9],
          vars: [{ name: "right before", value: oldRight }, { name: "right after (R)", value: right }],
          note: { vi: `Vùng tìm kiếm co lại thành [${left}, ${right}) — M vẫn có thể là đáp án nên không bị loại.`, en: `The search range shrinks to [${left}, ${right}) — M might still be the answer, so it's kept.` },
        });
      }
    }

    steps.push({
      title: { vi: `while L=${left} < R=${right} → False`, en: `while L=${left} < R=${right} → False` },
      arr: [...nums],
      sub: labels(left, right),
      highlight: [],
      mark: [left].filter((i) => i >= 0 && i < n),
      codeLines: [5],
      vars: [{ name: "left (L)", value: left }, { name: "right (R)", value: right }],
      note: { vi: `L và R gặp nhau tại ${left} → return ${left}.`, en: `L and R meet at ${left} → return ${left}.` },
    });
    steps.push({
      title: { vi: `lowerBound(${x}) return left = ${left}`, en: `lowerBound(${x}) return left = ${left}` },
      arr: [...nums],
      sub: labels(left, right),
      highlight: [],
      mark: [left].filter((i) => i >= 0 && i < n),
      codeLines: [11],
      vars: [{ name: "returns", value: left }],
      note: { vi: `${callLabel} trả về ${left}.`, en: `${callLabel} returns ${left}.` },
    });
    return left;
  }

  steps.push({
    title: { vi: `Bắt đầu findFirstLast(nums, ${target})`, en: `Start findFirstLast(nums, ${target})` },
    arr: [...nums],
    sub: labels(0, n),
    highlight: activeRange(0, n),
    mark: [],
    codeLines: [12],
    vars: [{ name: "nums", value: `[${nums.join(", ")}]` }, { name: "target", value: target }],
    note: {
      vi: `Cần tìm vị trí đầu và cuối của ${target}. Gọi lowerBound(target) để tìm biên trái.`,
      en: `Need to find the first and last position of ${target}. Call lowerBound(target) to find the left boundary.`,
    },
  });

  const first = lowerBound(target, "lowerBound(target) — first call, finds left boundary");

  const notFound = first === n || nums[first] !== target;
  steps.push({
    title: { vi: `first==len(nums) or nums[first]!=target? ${notFound}`, en: `first==len(nums) or nums[first]!=target? ${notFound}` },
    arr: [...nums],
    sub: labels(first, first),
    highlight: [],
    mark: first < n ? [first] : [],
    codeLines: [13],
    vars: [{ name: "first", value: first }, { name: "nums[first]", value: first < n ? nums[first] : "out of range" }],
    note: notFound
      ? { vi: `first=${first}: ${first === n ? "vượt quá mảng" : `nums[${first}]=${nums[first]} ≠ ${target}`} → target không tồn tại.`, en: `first=${first}: ${first === n ? "out of bounds" : `nums[${first}]=${nums[first]} ≠ ${target}`} → target does not exist.` }
      : { vi: `first=${first}: nums[${first}]=${target} → target tồn tại, tiếp tục tìm biên phải.`, en: `first=${first}: nums[${first}]=${target} → target exists, proceed to find the right boundary.` },
  });

  if (notFound) {
    steps.push({
      title: { vi: "return [-1, -1]", en: "return [-1, -1]" },
      arr: [...nums],
      sub: labels(-1, -1),
      highlight: [],
      mark: [],
      final: true,
      codeLines: [14],
      vars: [{ name: "answer", value: "[-1, -1]" }],
      note: { vi: `${target} không có trong mảng.`, en: `${target} is not in the array.` },
    });
    return { original: [...nums], answer: "[-1, -1]", steps };
  }

  steps.push({
    title: { vi: `Bắt đầu gọi lowerBound(target + 1) = lowerBound(${target + 1})`, en: `Begin calling lowerBound(target + 1) = lowerBound(${target + 1})` },
    arr: [...nums],
    sub: labels(first, first),
    highlight: [],
    mark: [first],
    codeLines: [15],
    vars: [{ name: "target + 1", value: target + 1 }],
    note: {
      vi: `Biên phải = chỉ số đầu tiên có nums[i] > target, trừ 1. Tính bằng lowerBound(target+1) - 1.`,
      en: `The right boundary = the first index where nums[i] > target, minus 1. Computed as lowerBound(target+1) - 1.`,
    },
  });

  const lastBoundStart = lowerBound(target + 1, "lowerBound(target + 1) — second call, finds right boundary");
  const last = lastBoundStart - 1;

  steps.push({
    title: { vi: `last = lowerBound(target+1) - 1 = ${lastBoundStart} - 1 = ${last}`, en: `last = lowerBound(target+1) - 1 = ${lastBoundStart} - 1 = ${last}` },
    arr: [...nums],
    sub: labels(first, last),
    highlight: [],
    mark: [first, last].filter((i, idx, arr) => arr.indexOf(i) === idx),
    codeLines: [15],
    vars: [{ name: "last", value: last }],
    note: { vi: `Chỉ số cuối cùng của ${target} là ${last}.`, en: `The last index of ${target} is ${last}.` },
  });

  steps.push({
    title: { vi: `return [first, last] = [${first}, ${last}]`, en: `return [first, last] = [${first}, ${last}]` },
    arr: [...nums],
    sub: labels(first, last),
    highlight: Array.from({ length: last - first + 1 }, (_, i) => first + i),
    mark: [first, last].filter((i, idx, arr) => arr.indexOf(i) === idx),
    final: true,
    codeLines: [16],
    vars: [{ name: "answer", value: `[${first}, ${last}]` }],
    note: { vi: `${target} xuất hiện từ index ${first} đến ${last}.`, en: `${target} appears from index ${first} to ${last}.` },
  });

  return { original: [...nums], answer: `[${first}, ${last}]`, steps };
}

/**
 * LeetCode 35: Search Insert Position.
 * Classic binary search on a sorted array. If target is found, return its
 * index. Otherwise return the index where it would be inserted to keep the
 * array sorted — which is exactly what `left` converges to when the loop
 * ends (left === right, the first index where nums[i] >= target).
 */
function buildSteps35(nums, params) {
  const target = Number(params && params.target !== undefined ? params.target : nums[0]);
  const n = nums.length;
  const steps = [];

  // Build sub-labels: index, plus L/M/R tags for the pointers that land on it.
  // right can equal n (one past the last bar), so it never gets a tag on a bar.
  function labels(l, r, m) {
    return nums.map((_, i) => {
      const tags = [];
      if (i === l) tags.push("L");
      if (m !== undefined && i === m) tags.push("M");
      if (i === r) tags.push("R");
      return tags.length ? `[${i}] ${tags.join("/")}` : `[${i}]`;
    });
  }
  // The active search range is [left, right) — everything else is "discarded".
  function activeRange(l, r) {
    return Array.from({ length: Math.max(0, r - l) }, (_, k) => l + k);
  }

  // Line 3: left, right = 0, len(nums)
  let left = 0;
  let right = n;
  steps.push({
    title: { vi: "left, right = 0, len(nums)", en: "left, right = 0, len(nums)" },
    arr: [...nums],
    sub: labels(left, right),
    highlight: activeRange(left, right),
    mark: [],
    codeLines: [3],
    vars: [
      { name: "nums", value: `[${nums.join(", ")}]` },
      { name: "target", value: target },
      { name: "left (L)", value: left },
      { name: "right (R)", value: right === n ? `${right} (past last index)` : right },
    ],
    note: {
      vi: `Tìm target=${target} trong nums đã sắp xếp. Vùng tìm kiếm ban đầu là TOÀN BỘ mảng: L=${left}, R=${right} (một bước sau chỉ số cuối). Các cột sáng = vùng đang xét.`,
      en: `Find target=${target} in the sorted nums. The initial search range is the WHOLE array: L=${left}, R=${right} (one past the last index). Highlighted bars = the active range.`,
    },
  });

  while (left < right) {
    // Line 4: while left < right
    steps.push({
      title: { vi: `while L=${left} < R=${right} → True`, en: `while L=${left} < R=${right} → True` },
      arr: [...nums],
      sub: labels(left, right),
      highlight: activeRange(left, right),
      mark: [],
      codeLines: [4],
      vars: [{ name: "left (L)", value: left }, { name: "right (R)", value: right }],
      note: {
        vi: `L=${left} < R=${right} → vùng tìm kiếm còn hơn 0 phần tử, tiếp tục thu hẹp.`,
        en: `L=${left} < R=${right} → the range still has elements, keep narrowing it.`,
      },
    });

    // Line 5: mid = (left + right) // 2
    const mid = Math.floor((left + right) / 2);
    steps.push({
      title: { vi: `M = (L+R)//2 = (${left}+${right})//2 = ${mid}`, en: `M = (L+R)//2 = (${left}+${right})//2 = ${mid}` },
      arr: [...nums],
      sub: labels(left, right, mid),
      highlight: activeRange(left, right),
      mark: [mid],
      codeLines: [5],
      vars: [{ name: "mid (M)", value: mid }, { name: "nums[M]", value: nums[mid] }],
      note: {
        vi: `Điểm giữa của vùng [${left}, ${right}) là M=${mid}. nums[${mid}] = ${nums[mid]} (cột màu xanh).`,
        en: `The midpoint of range [${left}, ${right}) is M=${mid}. nums[${mid}] = ${nums[mid]} (highlighted in green).`,
      },
    });

    // Line 6: if nums[mid] < target
    const goRight = nums[mid] < target;
    steps.push({
      title: { vi: `nums[M]=${nums[mid]} < target=${target} → ${goRight}`, en: `nums[M]=${nums[mid]} < target=${target} → ${goRight}` },
      arr: [...nums],
      sub: labels(left, right, mid),
      highlight: activeRange(left, right),
      mark: [mid],
      codeLines: [6],
      vars: [{ name: "nums[M] < target?", value: goRight }],
      note: goRight
        ? { vi: `${nums[mid]} < ${target} → M và mọi thứ bên trái M đều quá nhỏ. target chắc chắn nằm bên PHẢI của M → bỏ nửa trái.`, en: `${nums[mid]} < ${target} → M and everything left of M is too small. target must be to the RIGHT of M → discard the left half.` }
        : { vi: `${nums[mid]} ≥ ${target} → M có thể LÀ vị trí đúng (hoặc vị trí đúng nằm bên trái M) → giữ M lại, bỏ nửa phải.`, en: `${nums[mid]} ≥ ${target} → M could BE the answer (or the answer is left of M) → keep M, discard the right half.` },
    });

    if (goRight) {
      // Line 7: left = mid + 1
      const oldLeft = left;
      left = mid + 1;
      steps.push({
        title: { vi: `L = M + 1 = ${left}  (bỏ [${oldLeft}..${mid}])`, en: `L = M + 1 = ${left}  (discard [${oldLeft}..${mid}])` },
        arr: [...nums],
        sub: labels(left, right),
        highlight: activeRange(left, right),
        mark: [],
        codeLines: [7],
        vars: [{ name: "left before", value: oldLeft }, { name: "left after (L)", value: left }],
        note: {
          vi: `Vùng tìm kiếm co lại thành [${left}, ${right}) — các cột mờ đã bị loại.`,
          en: `The search range shrinks to [${left}, ${right}) — dimmed bars have been eliminated.`,
        },
      });
    } else {
      // Line 9: right = mid
      const oldRight = right;
      right = mid;
      steps.push({
        title: { vi: `R = M = ${right}  (bỏ [${right}..${oldRight - 1}], giữ M làm ứng viên)`, en: `R = M = ${right}  (discard [${right}..${oldRight - 1}], keep M as a candidate)` },
        arr: [...nums],
        sub: labels(left, right),
        highlight: activeRange(left, right),
        mark: [],
        codeLines: [9],
        vars: [{ name: "right before", value: oldRight }, { name: "right after (R)", value: right }],
        note: {
          vi: `Vùng tìm kiếm co lại thành [${left}, ${right}) — M vẫn có thể là đáp án nên KHÔNG bị loại.`,
          en: `The search range shrinks to [${left}, ${right}) — M might still be the answer, so it is NOT eliminated.`,
        },
      });
    }
  }

  // Final while check → False
  steps.push({
    title: { vi: `while L=${left} < R=${right} → False`, en: `while L=${left} < R=${right} → False` },
    arr: [...nums],
    sub: labels(left, right),
    highlight: [],
    mark: [Math.min(left, n - 1 >= 0 ? left : 0)].filter((i) => i >= 0 && i < n),
    codeLines: [4],
    vars: [{ name: "left (L)", value: left }, { name: "right (R)", value: right }],
    note: {
      vi: `L và R đã gặp nhau tại ${left} → vùng tìm kiếm chỉ còn 0 phần tử. Đây chính là vị trí đầu tiên mà nums[i] ≥ target.`,
      en: `L and R have met at ${left} → the search range is down to 0 elements. This is the first index where nums[i] ≥ target.`,
    },
  });

  // Line 10: return left
  steps.push({
    title: { vi: `return left = ${left}`, en: `return left = ${left}` },
    arr: [...nums],
    sub: labels(left, right),
    highlight: [],
    mark: [left].filter((i) => i >= 0 && i < n),
    final: true,
    codeLines: [10],
    vars: [{ name: "answer", value: left }],
    note: left < n && nums[left] === target
      ? { vi: `nums[${left}] = ${target} → target đã có sẵn trong mảng, tại index ${left}.`, en: `nums[${left}] = ${target} → target already exists in the array, at index ${left}.` }
      : { vi: `target=${target} không có trong mảng. Nếu chèn vào để giữ thứ tự tăng, nó sẽ đứng ở index ${left}.`, en: `target=${target} is not in the array. If inserted to keep the array sorted, it would sit at index ${left}.` },
  });

  return { original: [...nums], answer: left, steps };
}

/**
 * LeetCode 35 — Approach 2: Closed-interval binary search [start, end] with
 * an early return on exact match, plus a post-loop check.
 */
function buildSteps35v2(nums, params) {
  const target = Number(params && params.target !== undefined ? params.target : nums[0]);
  const n = nums.length;
  const steps = [];

  function labels(s, e, m) {
    return nums.map((_, i) => {
      const tags = [];
      if (i === s) tags.push("S");
      if (m !== undefined && i === m) tags.push("M");
      if (i === e) tags.push("E");
      return tags.length ? `[${i}] ${tags.join("/")}` : `[${i}]`;
    });
  }
  function activeRange(s, e) {
    return Array.from({ length: Math.max(0, e - s + 1) }, (_, k) => s + k);
  }

  // Line 3: start = 0
  let start = 0;
  steps.push({
    title: { vi: "start = 0", en: "start = 0" },
    arr: [...nums],
    sub: labels(start, undefined),
    highlight: [],
    mark: [],
    codeBlock: 2,
    codeLines: [3],
    vars: [
      { name: "nums", value: `[${nums.join(", ")}]` },
      { name: "target", value: target },
      { name: "start (S)", value: start },
    ],
    note: {
      vi: `Tìm target=${target}. Đây là closed-interval binary search: cả start và end đều là chỉ số HỢP LỆ (khác với cách 1 dùng right = len(nums)).`,
      en: `Find target=${target}. This is a closed-interval binary search: both start and end are VALID indices (unlike Approach 1 which uses right = len(nums)).`,
    },
  });

  // Line 4: end = len(nums) - 1
  let end = n - 1;
  steps.push({
    title: { vi: `end = len(nums) - 1 = ${end}`, en: `end = len(nums) - 1 = ${end}` },
    arr: [...nums],
    sub: labels(start, end),
    highlight: activeRange(start, end),
    mark: [],
    codeBlock: 2,
    codeLines: [4],
    vars: [{ name: "end (E)", value: end }],
    note: {
      vi: `end = ${end} (chỉ số cuối cùng của mảng). Vùng tìm kiếm ban đầu: [S=${start}, E=${end}] — bao gồm CẢ HAI đầu.`,
      en: `end = ${end} (the array's last index). Initial search range: [S=${start}, E=${end}] — INCLUDING both ends.`,
    },
  });

  while (start < end) {
    // Line 5: while start < end
    steps.push({
      title: { vi: `while S=${start} < E=${end} → True`, en: `while S=${start} < E=${end} → True` },
      arr: [...nums],
      sub: labels(start, end),
      highlight: activeRange(start, end),
      mark: [],
      codeBlock: 2,
      codeLines: [5],
      vars: [{ name: "start (S)", value: start }, { name: "end (E)", value: end }],
      note: {
        vi: `S=${start} < E=${end} → vùng [${start}, ${end}] có hơn 1 phần tử, tiếp tục.`,
        en: `S=${start} < E=${end} → range [${start}, ${end}] has more than 1 element, continue.`,
      },
    });

    // Line 6: mid = (start + end) // 2
    const mid = Math.floor((start + end) / 2);
    steps.push({
      title: { vi: `M = (S+E)//2 = (${start}+${end})//2 = ${mid}`, en: `M = (S+E)//2 = (${start}+${end})//2 = ${mid}` },
      arr: [...nums],
      sub: labels(start, end, mid),
      highlight: activeRange(start, end),
      mark: [mid],
      codeBlock: 2,
      codeLines: [6],
      vars: [{ name: "mid (M)", value: mid }, { name: "nums[M]", value: nums[mid] }],
      note: {
        vi: `M = ${mid}. nums[${mid}] = ${nums[mid]}.`,
        en: `M = ${mid}. nums[${mid}] = ${nums[mid]}.`,
      },
    });

    // Line 7: if nums[mid] == target
    const isMatch = nums[mid] === target;
    steps.push({
      title: { vi: `if nums[M]=${nums[mid]} == target=${target} → ${isMatch}`, en: `if nums[M]=${nums[mid]} == target=${target} → ${isMatch}` },
      arr: [...nums],
      sub: labels(start, end, mid),
      highlight: activeRange(start, end),
      mark: [mid],
      codeBlock: 2,
      codeLines: [7],
      vars: [{ name: "nums[M] == target?", value: isMatch }],
      note: isMatch
        ? { vi: `${nums[mid]} == ${target} → Tìm thấy chính xác! Return luôn M=${mid}.`, en: `${nums[mid]} == ${target} → Exact match found! Return M=${mid} immediately.` }
        : { vi: `${nums[mid]} ≠ ${target} → chưa khớp, tiếp tục kiểm tra hướng.`, en: `${nums[mid]} ≠ ${target} → not a match yet, check which direction to go.` },
    });

    if (isMatch) {
      // Line 8: return mid
      steps.push({
        title: { vi: `return mid = ${mid}`, en: `return mid = ${mid}` },
        arr: [...nums],
        sub: labels(start, end, mid),
        highlight: [],
        mark: [mid],
        final: true,
        codeBlock: 2,
        codeLines: [8],
        vars: [{ name: "answer", value: mid }],
        note: {
          vi: `Trả về ngay index ${mid} vì nums[${mid}] = ${target} khớp chính xác. (Đây là điểm khác biệt so với Cách 1 — không cần đợi vòng lặp kết thúc.)`,
          en: `Return index ${mid} immediately since nums[${mid}] = ${target} matches exactly. (This is the key difference from Approach 1 — no need to wait for the loop to end.)`,
        },
      });
      return { original: [...nums], answer: mid, steps };
    }

    // Line 9: elif nums[mid] > target
    const goLeft = nums[mid] > target;
    steps.push({
      title: { vi: `elif nums[M]=${nums[mid]} > target=${target} → ${goLeft}`, en: `elif nums[M]=${nums[mid]} > target=${target} → ${goLeft}` },
      arr: [...nums],
      sub: labels(start, end, mid),
      highlight: activeRange(start, end),
      mark: [mid],
      codeBlock: 2,
      codeLines: [9],
      vars: [{ name: "nums[M] > target?", value: goLeft }],
      note: goLeft
        ? { vi: `${nums[mid]} > ${target} → M quá lớn, target nằm bên TRÁI của M → end = mid.`, en: `${nums[mid]} > ${target} → M is too large, target is to the LEFT of M → end = mid.` }
        : { vi: `${nums[mid]} < ${target} → M quá nhỏ, target nằm bên PHẢI của M → vào nhánh else.`, en: `${nums[mid]} < ${target} → M is too small, target is to the RIGHT of M → go to else.` },
    });

    if (goLeft) {
      // Line 10: end = mid
      const oldEnd = end;
      end = mid;
      steps.push({
        title: { vi: `E = M = ${end}  (bỏ [${end + 1}..${oldEnd}], giữ M làm ứng viên)`, en: `E = M = ${end}  (discard [${end + 1}..${oldEnd}], keep M as a candidate)` },
        arr: [...nums],
        sub: labels(start, end),
        highlight: activeRange(start, end),
        mark: [],
        codeBlock: 2,
        codeLines: [10],
        vars: [{ name: "end before", value: oldEnd }, { name: "end after (E)", value: end }],
        note: {
          vi: `Vùng tìm kiếm co lại thành [${start}, ${end}] — M vẫn có thể là đáp án (chèn tại vị trí M) nên giữ lại.`,
          en: `The search range shrinks to [${start}, ${end}] — M could still be the answer (insert at M), so it's kept.`,
        },
      });
    } else {
      // Line 11: else
      steps.push({
        title: { vi: `else:`, en: `else:` },
        arr: [...nums],
        sub: labels(start, end, mid),
        highlight: activeRange(start, end),
        mark: [mid],
        codeBlock: 2,
        codeLines: [11],
        vars: [],
        note: {
          vi: `nums[M] < target → vào nhánh else.`,
          en: `nums[M] < target → enter the else branch.`,
        },
      });

      // Line 12: start = mid + 1
      const oldStart = start;
      start = mid + 1;
      steps.push({
        title: { vi: `S = M + 1 = ${start}  (bỏ [${oldStart}..${mid}])`, en: `S = M + 1 = ${start}  (discard [${oldStart}..${mid}])` },
        arr: [...nums],
        sub: labels(start, end),
        highlight: activeRange(start, end),
        mark: [],
        codeBlock: 2,
        codeLines: [12],
        vars: [{ name: "start before", value: oldStart }, { name: "start after (S)", value: start }],
        note: {
          vi: `Vùng tìm kiếm co lại thành [${start}, ${end}] — M và mọi thứ bên trái M đã bị loại.`,
          en: `The search range shrinks to [${start}, ${end}] — M and everything left of M has been eliminated.`,
        },
      });
    }
  }

  // Final while check → False
  steps.push({
    title: { vi: `while S=${start} < E=${end} → False`, en: `while S=${start} < E=${end} → False` },
    arr: [...nums],
    sub: labels(start, end),
    highlight: activeRange(start, end),
    mark: [],
    codeBlock: 2,
    codeLines: [5],
    vars: [{ name: "start (S)", value: start }, { name: "end (E)", value: end }],
    note: {
      vi: `S=${start} = E=${end} → chỉ còn 1 phần tử trong vùng tìm kiếm. Thoát vòng lặp, cần kiểm tra hậu kỳ.`,
      en: `S=${start} = E=${end} → only 1 element remains in the range. Exit the loop, a post-loop check is needed.`,
    },
  });

  // Line 13: if nums[start] >= target
  const found = nums[start] >= target;
  steps.push({
    title: { vi: `if nums[S]=${nums[start]} >= target=${target} → ${found}`, en: `if nums[S]=${nums[start]} >= target=${target} → ${found}` },
    arr: [...nums],
    sub: labels(start, end),
    highlight: [start],
    mark: [],
    codeBlock: 2,
    codeLines: [13],
    vars: [{ name: "nums[S] >= target?", value: found }],
    note: found
      ? { vi: `${nums[start]} ≥ ${target} → target thuộc tại hoặc trước vị trí S=${start}. Trả về S.`, en: `${nums[start]} ≥ ${target} → target belongs at or before position S=${start}. Return S.` }
      : { vi: `${nums[start]} < ${target} → target lớn hơn cả phần tử cuối cùng còn lại → chèn NGAY SAU S.`, en: `${nums[start]} < ${target} → target is larger than the last remaining element → insert RIGHT AFTER S.` },
  });

  const answer = found ? start : start + 1;

  if (found) {
    // Line 14: return start
    steps.push({
      title: { vi: `return start = ${start}`, en: `return start = ${start}` },
      arr: [...nums],
      sub: labels(start, end),
      highlight: [],
      mark: [start],
      final: true,
      codeBlock: 2,
      codeLines: [14],
      vars: [{ name: "answer", value: answer }],
      note: nums[start] === target
        ? { vi: `nums[${start}] = ${target} → target có sẵn tại index ${start}.`, en: `nums[${start}] = ${target} → target already exists at index ${start}.` }
        : { vi: `nums[${start}] > ${target} → chèn target vào index ${start} để giữ thứ tự tăng.`, en: `nums[${start}] > ${target} → insert target at index ${start} to keep the array sorted.` },
    });
  } else {
    // Line 16: return start + 1
    steps.push({
      title: { vi: `return start + 1 = ${answer}`, en: `return start + 1 = ${answer}` },
      arr: [...nums],
      sub: labels(start, end),
      highlight: [],
      mark: [answer].filter((i) => i < n),
      final: true,
      codeBlock: 2,
      codeLines: [16],
      vars: [{ name: "answer", value: answer }],
      note: {
        vi: `target=${target} lớn hơn mọi phần tử → chèn vào cuối mảng, tại index ${answer}.`,
        en: `target=${target} is larger than every element → insert at the end of the array, at index ${answer}.`,
      },
    });
  }

  return { original: [...nums], answer, steps };
}

module.exports = Object.assign(module.exports, {
  34: {
    id: 34,
    difficulty: "medium",
    slug: "find-first-and-last-position-of-element-in-sorted-array",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    title: { vi: "Find First and Last Position of Element in Sorted Array", en: "Find First and Last Position of Element in Sorted Array" },
    titleVi: { vi: "Tìm vị trí đầu và cuối của phần tử", en: "Find first and last position of a target" },
    statement: {
      vi: "Cho mảng nums đã sắp xếp tăng dần và target. Trả về [first, last] là chỉ số đầu và cuối của target trong nums, hoặc [-1, -1] nếu target không tồn tại.",
      en: "Given a sorted array nums and a target, return [first, last], the first and last index of target in nums, or [-1, -1] if target does not exist.",
    },
    defaultInput: [5, 7, 7, 8, 8, 10],
    inputKind: "integer",
    extraParams: [
      { key: "target", label: { vi: "target", en: "target" }, default: 8 },
    ],
    approach: [
      { vi: "Viết hàm lowerBound(x): binary search half-open [left, right) trả về chỉ số đầu tiên có nums[i] ≥ x.", en: "Write a lowerBound(x) helper: half-open [left, right) binary search returning the first index where nums[i] ≥ x." },
      { vi: "first = lowerBound(target). Nếu vượt mảng hoặc nums[first] ≠ target → target không tồn tại, trả [-1, -1].", en: "first = lowerBound(target). If out of bounds or nums[first] ≠ target → target doesn't exist, return [-1, -1]." },
      { vi: "last = lowerBound(target + 1) - 1 (chỉ số đầu tiên có nums[i] > target, rồi trừ 1 để lùi về phần tử cuối bằng target).", en: "last = lowerBound(target + 1) - 1 (the first index where nums[i] > target, then subtract 1 to land on the last element equal to target)." },
    ],
    complexity: {
      time: "O(log n)",
      space: "O(1)",
      note: {
        vi: "Hai lần binary search độc lập, mỗi lần O(log n) → tổng O(log n).",
        en: "Two independent binary searches, each O(log n) → total O(log n).",
      },
    },
    code: [
      "class Solution:",
      "    def searchRange(self, nums, target):",
      "        def lowerBound(x):",
      "            left, right = 0, len(nums)",
      "            while left < right:",
      "                mid = (left + right) // 2",
      "                if nums[mid] < x:",
      "                    left = mid + 1",
      "                else:",
      "                    right = mid",
      "            return left",
      "        first = lowerBound(target)",
      "        if first == len(nums) or nums[first] != target:",
      "            return [-1, -1]",
      "        last = lowerBound(target + 1) - 1",
      "        return [first, last]",
    ],
    builder: buildSteps34,
  },
  35: {
    id: 35,
    difficulty: "easy",
    slug: "search-insert-position",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    title: { vi: "Search Insert Position", en: "Search Insert Position" },
    titleVi: { vi: "Vị trí chèn khi tìm kiếm", en: "Find the insert position" },
    statement: {
      vi: "Cho mảng nums đã sắp xếp tăng dần (không trùng) và target. Trả về index của target nếu tồn tại; nếu không, trả về index mà target sẽ được chèn vào để giữ mảng sắp xếp.",
      en: "Given a sorted array nums of distinct integers and a target, return the index if target is found. If not, return the index where it would be inserted to keep the array sorted.",
    },
    defaultInput: [1, 3, 5, 6],
    inputKind: "integer",
    extraParams: [
      { key: "target", label: { vi: "target", en: "target" }, default: 5 },
      {
        key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: Half-open [left, right)", en: "Approach 1: Half-open [left, right)" } },
          { value: "2", label: { vi: "Cách 2: Closed [start, end] + early return", en: "Approach 2: Closed [start, end] + early return" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1: Binary search half-open [left, right). Nếu nums[mid] < target → left=mid+1. Ngược lại → right=mid.", en: "Approach 1: Half-open binary search [left, right). If nums[mid] < target → left=mid+1. Otherwise → right=mid." },
      { vi: "Cách 2: Binary search closed [start, end]. Nếu nums[mid]==target → return luôn. Nếu nums[mid]>target → end=mid. Ngược lại → start=mid+1.", en: "Approach 2: Closed-interval binary search [start, end]. If nums[mid]==target → return immediately. If nums[mid]>target → end=mid. Otherwise → start=mid+1." },
      { vi: "Cách 2 cần bước hậu kỳ sau vòng lặp: so sánh nums[start] với target để quyết định trả start hay start+1.", en: "Approach 2 needs a post-loop check: compare nums[start] with target to decide whether to return start or start+1." },
    ],
    complexity: {
      time: "O(log n)",
      space: "O(1)",
      note: {
        vi: "Cả 2 cách đều O(log n) time, O(1) space. Cách 1 đơn giản hơn (không cần hậu kỳ); cách 2 có thể return sớm khi tìm thấy target chính xác.",
        en: "Both are O(log n) time, O(1) space. Approach 1 is simpler (no post-loop step); Approach 2 can return early on an exact target match.",
      },
    },
    codeLabel: { vi: "Cách 1: Half-open [left, right)", en: "Approach 1: Half-open [left, right)" },
    code2Label: { vi: "Cách 2: Closed [start, end]", en: "Approach 2: Closed [start, end]" },
    code: [
      "class Solution:",
      "    def searchInsert(self, nums, target):",
      "        left, right = 0, len(nums)",
      "        while left < right:",
      "            mid = (left + right) // 2",
      "            if nums[mid] < target:",
      "                left = mid + 1",
      "            else:",
      "                right = mid",
      "        return left",
    ],
    code2: [
      "class Solution:",
      "    def searchInsert(self, nums, target):",
      "        start = 0",
      "        end = len(nums) - 1",
      "        while start < end:",
      "            mid = (start + end) // 2",
      "            if nums[mid] == target:",
      "                return mid",
      "            elif nums[mid] > target:",
      "                end = mid",
      "            else:",
      "                start = mid + 1",
      "        if nums[start] >= target:",
      "            return start",
      "        else:",
      "            return start + 1",
    ],
    builder: (nums, params) => {
      const approach = Number(params && params.approach) || 1;
      return approach === 2 ? buildSteps35v2(nums, params) : buildSteps35(nums, params);
    },
  },
});
