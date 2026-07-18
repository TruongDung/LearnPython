// LeetCode Visualizer - Binary Search problems.

function parseIntegerList(value) {
  return String(value || "")
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((number) => Number.isInteger(number));
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
      codeLines: [2],
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
    title: { vi: "Lưu timeline", en: "Store the timeline" },
    arr: [...times],
    sub: timelineLabels(persons, leaders),
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [
      { name: "self.times", value: `[${times.join(", ")}]` },
      { name: "n", value: times.length },
    ],
    note: {
      vi: "times đã tăng nghiêm ngặt. Mỗi index i ghép persons[i] với times[i].",
      en: "times is strictly increasing. Each index i pairs persons[i] with times[i].",
    },
  });

  steps.push({
    title: { vi: "Khởi tạo trạng thái đếm phiếu", en: "Initialize vote state" },
    arr: [...times],
    sub: timelineLabels(persons, leaders),
    highlight: [],
    mark: [],
    codeLines: [4, 5, 6],
    vars: [
      { name: "self.leaders", value: "[]" },
      { name: "votes", value: "{}" },
      { name: "leader", value: "none" },
    ],
    note: {
      vi: "leaders[i] sẽ lưu người đang dẫn đầu ngay sau phiếu tại index i.",
      en: "leaders[i] will store the leader immediately after the vote at index i.",
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
        { name: "i", value: i },
        { name: "time", value: times[i] },
        { name: "person", value: person },
        { name: "leader before", value: leader < 0 ? "none" : leader },
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
        { name: `votes[${person}]`, value: votes.get(person) },
        { name: "votes", value: formatCounts(votes) },
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
      title: { vi: `So sánh ${votes.get(person)} >= ${leaderVotes}`, en: `Compare ${votes.get(person)} >= ${leaderVotes}` },
      arr: [...times],
      sub: timelineLabels(persons, leaders),
      highlight: [i],
      mark: leaders.map((_, index) => index),
      codeLines: [9],
      vars: [
        { name: "candidate", value: person },
        { name: "candidate votes", value: votes.get(person) },
        { name: "current leader", value: leader < 0 ? "none" : leader },
        { name: "leader votes", value: leaderVotes },
        { name: "condition", value: shouldLead },
      ],
      note: {
        vi: tiesDifferentLeader
          ? "Hai người hòa phiếu. Điều kiện >= cho người vừa nhận phiếu trở thành leader."
          : shouldLead
            ? `Person ${person} đang dẫn đầu và vừa nhận thêm phiếu, nên vẫn là leader.`
            : `Person ${person} ít phiếu hơn leader ${leader}, nên leader không đổi.`,
        en: tiesDifferentLeader
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
          { name: "old leader", value: previousLeader < 0 ? "none" : previousLeader },
          { name: "leader", value: leader },
          {
            name: "reason",
            value: tiesDifferentLeader
              ? "latest vote wins tie"
              : previousLeader === person ? "leader received vote" : "more votes",
          },
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
        { name: "i", value: i },
        { name: "time", value: times[i] },
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
    codeLines: [11],
    vars: [
      { name: "times", value: `[${times.join(", ")}]` },
      { name: "leaders", value: `[${leaders.join(", ")}]` },
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
    let left = 0;
    let right = times.length;

    steps.push({
      title: { vi: `q(${t}): khởi tạo [left, right)`, en: `q(${t}): initialize [left, right)` },
      arr: [...times],
      sub: timelineLabels(persons, leaders, { 0: "L", [times.length - 1]: "R-1" }),
      highlight: [],
      mark: [],
      codeLines: [13, 14],
      vars: [
        { name: "query", value: t },
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "interval", value: `[${left}, ${right})` },
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
          { name: "query", value: t },
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "condition", value: true },
        ],
        note: {
          vi: "Khoảng tìm kiếm chưa rỗng, tiếp tục binary search.",
          en: "The search interval is not empty, so binary search continues.",
        },
      });

      const mid = Math.floor((left + right) / 2);
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
        title: { vi: `${times[mid]} <= ${t} là ${moveRight}`, en: `${times[mid]} <= ${t} is ${moveRight}` },
        arr: [...times],
        sub: timelineLabels(persons, leaders, tags),
        highlight: [mid],
        mark: [],
        codeLines: [17],
        vars: [
          { name: "query", value: t },
          { name: "mid", value: mid },
          { name: "times[mid]", value: times[mid] },
          { name: "condition", value: moveRight },
        ],
        note: {
          vi: moveRight
            ? `time ${times[mid]} không vượt quá query ${t}; đáp án nằm tại mid hoặc bên phải, nên bỏ [left..mid].`
            : `time ${times[mid]} đã vượt query ${t}; index đầu tiên > t nằm tại mid hoặc bên trái.`,
          en: moveRight
            ? `Time ${times[mid]} does not exceed query ${t}; the answer is at mid or to its right, so discard [left..mid].`
            : `Time ${times[mid]} exceeds query ${t}; the first index > t is at mid or to its left.`,
        },
      });

      if (moveRight) {
        const oldLeft = left;
        left = mid + 1;
        steps.push({
          title: { vi: `left = ${mid} + 1 = ${left}`, en: `left = ${mid} + 1 = ${left}` },
          arr: [...times],
          sub: timelineLabels(persons, leaders, left < times.length ? { [left]: "new L" } : {}),
          highlight: [],
          mark: [],
          codeLines: [18],
          vars: [
            { name: "old left", value: oldLeft },
            { name: "left", value: left },
            { name: "right", value: right },
          ],
          note: {
            vi: `Dời left qua mid. Khoảng mới là [${left}, ${right}).`,
            en: `Move left past mid. The new interval is [${left}, ${right}).`,
          },
        });
      } else {
        const oldRight = right;
        right = mid;
        steps.push({
          title: { vi: `right = mid = ${right}`, en: `right = mid = ${right}` },
          arr: [...times],
          sub: timelineLabels(persons, leaders, right > left ? { [right - 1]: "new R-1" } : {}),
          highlight: [],
          mark: [],
          codeLines: [20],
          vars: [
            { name: "left", value: left },
            { name: "old right", value: oldRight },
            { name: "right", value: right },
          ],
          note: {
            vi: `Giữ mid trong phía có thể chứa index đầu tiên > t. Khoảng mới là [${left}, ${right}).`,
            en: `Keep mid in the side that may contain the first index > t. The new interval is [${left}, ${right}).`,
          },
        });
      }
    }

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
        { name: "left", value: left },
        { name: "answer index", value: answerIndex },
        { name: "times[index]", value: times[answerIndex] },
        { name: "leader", value: answer },
        { name: "answers", value: `[${answers.join(", ")}]` },
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
    codeLines: [21],
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
    order: [911],
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
