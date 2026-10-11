"use strict";

const bi = (vi, en) => ({ vi, en });
const MAX_EMPLOYEES_9022 = 12;

const SOURCE_9022 = [
  "def count_underpaid(employees, root_name):",
  "    employee_by_name = {item['name']: item for item in employees}",
  "    unpaid = 0",
  "",
  "    def dfs(name):",
  "        nonlocal unpaid",
  "        node = employee_by_name[name]",
  "        sum_employee_salary = 0",
  "        number_employees = 0",
  "        for employee_name in node['reports']:",
  "            each_employee, number_each_employee = dfs(employee_name)",
  "            sum_employee_salary += each_employee",
  "            number_employees += number_each_employee",
  "        if number_employees:",
  "            average_salary = sum_employee_salary / number_employees",
  "            if node['salary'] < average_salary:",
  "                unpaid += 1",
  "        return node['salary'] + sum_employee_salary, 1 + number_employees",
  "",
  "    dfs(root_name)",
  "    return unpaid",
];

function parseCompany9022(input) {
  let data = input;
  if (typeof input === "string") {
    try {
      data = JSON.parse(input);
    } catch (error) {
      throw new Error('9022: enter JSON like {"root":"A","employees":[{"name":"A","salary":100,"reports":["B"]},{"name":"B","salary":80,"reports":[]}]}');
    }
  }
  const employees = data && data.employees;
  if (!Array.isArray(employees) || employees.length < 1 || employees.length > MAX_EMPLOYEES_9022) {
    throw new Error(`9022: employees must contain 1–${MAX_EMPLOYEES_9022} records for this visualization.`);
  }
  const names = new Set();
  for (const employee of employees) {
    if (!employee || typeof employee.name !== "string" || !employee.name.trim() || employee.name.length > 16) {
      throw new Error("9022: every employee needs a unique, nonempty name (up to 16 characters).");
    }
    if (names.has(employee.name)) throw new Error(`9022: employee name "${employee.name}" is duplicated.`);
    names.add(employee.name);
    if (typeof employee.salary !== "number" || !Number.isFinite(employee.salary) || employee.salary < 0 || employee.salary > 1_000_000_000_000) {
      throw new Error(`9022: salary for "${employee.name}" must be between 0 and 1,000,000,000,000.`);
    }
    if (!Array.isArray(employee.reports) || employee.reports.some((name) => typeof name !== "string")) {
      throw new Error(`9022: reports for "${employee.name}" must be an array of employee names.`);
    }
    if (new Set(employee.reports).size !== employee.reports.length) {
      throw new Error(`9022: reports for "${employee.name}" cannot contain duplicates.`);
    }
  }
  const byName = new Map(employees.map((employee) => [employee.name, employee]));
  const parent = new Map();
  for (const employee of employees) {
    for (const report of employee.reports) {
      if (!byName.has(report)) throw new Error(`9022: "${report}" reports to "${employee.name}" but is not in employees.`);
      if (report === employee.name) throw new Error(`9022: "${employee.name}" cannot report to themself.`);
      if (parent.has(report)) throw new Error(`9022: "${report}" has more than one manager.`);
      parent.set(report, employee.name);
    }
  }
  const roots = employees.filter((employee) => !parent.has(employee.name)).map((employee) => employee.name);
  const rootName = data.root === undefined ? roots[0] : data.root;
  if (typeof rootName !== "string" || !byName.has(rootName) || parent.has(rootName)) {
    throw new Error("9022: root must be the name of the company's top-level manager.");
  }
  if (roots.length !== 1 || roots[0] !== rootName) {
    throw new Error("9022: employees must form one reporting tree rooted at root.");
  }
  const seen = new Set();
  const pending = [rootName];
  while (pending.length) {
    const name = pending.pop();
    if (seen.has(name)) throw new Error(`9022: reporting cycle detected at "${name}".`);
    seen.add(name);
    pending.push(...byName.get(name).reports);
  }
  if (seen.size !== employees.length) throw new Error("9022: every employee must be reachable from root.");
  return {
    employees: employees.map((employee) => ({
      name: employee.name,
      salary: employee.salary,
      reports: [...employee.reports],
    })),
    root: rootName,
  };
}

function buildSteps9022(input) {
  const { employees, root } = parseCompany9022(input);
  const byName = new Map(employees.map((employee) => [employee.name, employee]));
  const parent = new Map();
  employees.forEach((employee) => employee.reports.forEach((report) => parent.set(report, employee.name)));
  const aggregates = new Map(employees.map((employee) => [employee.name, {
    descendantSalary: 0,
    descendantCount: 0,
    totalSalary: null,
    totalCount: null,
    averageSalary: null,
    decision: "pending",
  }]));
  const childrenDone = new Set();
  const evaluated = new Set();
  const stack = [];
  const steps = [];
  const unpaid = [];
  let current = null;
  let activeEdge = null;

  const rounded = (value) => Number(value.toFixed(2));
  const formatMoney = (value) => Number.isInteger(value) ? String(value) : String(rounded(value));
  const reportLabel = (name) => byName.get(name).reports.length;

  function emit(event, title, note, codeLines, { final = false, edge = activeEdge } = {}) {
    const aggregateRows = employees.map((employee) => {
      const aggregate = aggregates.get(employee.name);
      return { name: employee.name, salary: employee.salary, ...aggregate };
    });
    steps.push({
      title,
      note,
      codeLines,
      final,
      arr: [],
      highlight: current === null ? [] : [employees.findIndex((employee) => employee.name === current)],
      mark: unpaid.map((name) => employees.findIndex((employee) => employee.name === name)),
      vars: [
        { name: "current", value: current ?? "—" },
        { name: "dfs stack", value: `[${stack.join(" → ")}]` },
        { name: "unpaid", value: `[${unpaid.join(", ")}]` },
        ...(current === null ? [] : [
          { name: "sum_employee_salary", value: aggregates.get(current).descendantSalary },
          { name: "number_employees", value: aggregates.get(current).descendantCount },
        ]),
      ],
      underpaidManagers9022View: {
        event,
        employees: employees.map((employee) => ({ ...employee, reports: [...employee.reports] })),
        root,
        parent: Object.fromEntries(parent),
        aggregates: aggregateRows,
        childrenDone: [...childrenDone],
        evaluated: [...evaluated],
        stack: [...stack],
        current,
        activeEdge: edge ? [...edge] : null,
        unpaid: [...unpaid],
        answer: final ? unpaid.length : null,
      },
    });
  }

  emit(
    "intro",
    bi("Duyệt cây báo cáo từ trên xuống", "Traverse the reporting tree"),
    bi(
      `${employees.length} nhân viên trong một cây. DFS hậu tự tính xong mọi cấp dưới trước khi đánh giá quản lý.`,
      `${employees.length} employees form one tree. Postorder DFS finishes all reports before evaluating their manager.`,
    ),
    [1, 2, 3, 5],
    { edge: null },
  );

  function dfs(name) {
    current = name;
    stack.push(name);
    const employee = byName.get(name);
    emit(
      "enter",
      bi(`Gọi dfs("${name}")`, `Call dfs("${name}")`),
      bi(
        `${name} có lương $${formatMoney(employee.salary)} và ${reportLabel(name)} cấp dưới trực tiếp. Khởi tạo tổng cấp dưới = 0.`,
        `${name} earns $${formatMoney(employee.salary)} and has ${reportLabel(name)} direct report(s). Start the descendant totals at 0.`,
      ),
      [5, 6, 7, 8, 9, 10],
      { edge: parent.has(name) ? [parent.get(name), name] : null },
    );

    if (!employee.reports.length) {
      emit(
        "leaf",
        bi(`${name} là nhân viên lá`, `${name} is a leaf employee`),
        bi("Không có cấp dưới để tính trung bình; trả lương và số lượng của chính nhân viên này về cho quản lý.", "No reports to average; return this employee's salary and count to the manager."),
        [10, 18],
        { edge: null },
      );
    }

    for (const report of employee.reports) {
      activeEdge = [name, report];
      emit(
        "call-report",
        bi(`${name} → dfs("${report}")`, `${name} → dfs("${report}")`),
        bi(`Tạm dừng ${name}; tính toàn bộ cây con của ${report} trước.`, `Pause ${name}; finish ${report}'s entire subtree first.`),
        [10, 11],
      );
      const branch = dfs(report);
      current = name;
      activeEdge = [name, report];
      childrenDone.add(report);
      const aggregate = aggregates.get(name);
      const beforeSalary = aggregate.descendantSalary;
      const beforeCount = aggregate.descendantCount;
      aggregate.descendantSalary += branch.totalSalary;
      aggregate.descendantCount += branch.totalCount;
      emit(
        "aggregate",
        bi(
          `Cộng nhánh ${report}: ${beforeSalary} + ${branch.totalSalary} = ${aggregate.descendantSalary}`,
          `Add branch ${report}: ${beforeSalary} + ${branch.totalSalary} = ${aggregate.descendantSalary}`,
        ),
        bi(
          `Nhánh ${report} trả về tổng lương ${branch.totalSalary} của ${branch.totalCount} người (gồm ${report}).`,
          `Branch ${report} returned total salary ${branch.totalSalary} across ${branch.totalCount} employees (including ${report}).`,
        ),
        [11, 12, 13],
      );
    }

    current = name;
    activeEdge = null;
    const aggregate = aggregates.get(name);
    if (aggregate.descendantCount > 0) {
      aggregate.averageSalary = aggregate.descendantSalary / aggregate.descendantCount;
      emit(
        "average",
        bi(
          `Trung bình cấp dưới = ${aggregate.descendantSalary} / ${aggregate.descendantCount} = ${formatMoney(aggregate.averageSalary)}`,
          `Report average = ${aggregate.descendantSalary} / ${aggregate.descendantCount} = ${formatMoney(aggregate.averageSalary)}`,
        ),
        bi(
          "Chỉ tính cấp dưới trực tiếp và gián tiếp; không đưa lương của chính quản lý vào trung bình.",
          "Include all direct and indirect reports; do not include the manager's own salary in the average.",
        ),
        [14, 15],
      );
      const isUnderpaid = employee.salary < aggregate.averageSalary;
      aggregate.decision = isUnderpaid ? "underpaid" : "not-underpaid";
      if (isUnderpaid) unpaid.push(name);
      evaluated.add(name);
      emit(
        isUnderpaid ? "underpaid" : "fair",
        isUnderpaid
          ? bi(`${name}: $${formatMoney(employee.salary)} < $${formatMoney(aggregate.averageSalary)} → underpaid`, `${name}: $${formatMoney(employee.salary)} < $${formatMoney(aggregate.averageSalary)} → underpaid`)
          : bi(`${name}: $${formatMoney(employee.salary)} ≥ $${formatMoney(aggregate.averageSalary)} → không underpaid`, `${name}: $${formatMoney(employee.salary)} ≥ $${formatMoney(aggregate.averageSalary)} → not underpaid`),
        isUnderpaid
          ? bi(`Lương ${name} thấp hơn trung bình ${aggregate.descendantCount} cấp dưới; tăng bộ đếm lên ${unpaid.length}.`, `${name}'s salary is below the average of ${aggregate.descendantCount} reports; increment the count to ${unpaid.length}.`)
          : bi("Điều kiện là lương quản lý phải thấp hơn nghiêm ngặt; bằng trung bình thì không tính.", "The condition is strictly lower; a salary equal to the average does not count."),
        [16, 17],
      );
    } else {
      aggregate.decision = "no-reports";
      emit(
        "no-reports",
        bi(`${name} không có cấp dưới`, `${name} has no reports`),
        bi("Không tính nhân viên lá là quản lý underpaid vì không có cấp dưới để lấy trung bình.", "A leaf is not counted as an underpaid manager because it has no reports to average."),
        [14, 18],
      );
    }

    aggregate.totalSalary = employee.salary + aggregate.descendantSalary;
    aggregate.totalCount = 1 + aggregate.descendantCount;
    const result = { totalSalary: aggregate.totalSalary, totalCount: aggregate.totalCount };
    emit(
      "return",
      bi(
        `return (${aggregate.totalSalary}, ${aggregate.totalCount}) từ ${name}`,
        `Return (${aggregate.totalSalary}, ${aggregate.totalCount}) from ${name}`,
      ),
      bi(
        `Trả tổng lương của ${name} và toàn cây con về cho cấp trên.`,
        `Return ${name}'s salary plus the entire subtree total to the manager.`,
      ),
      [18],
    );
    stack.pop();
    return result;
  }

  const total = dfs(root);
  current = null;
  activeEdge = null;
  emit(
    "done",
    bi(`Có ${unpaid.length} quản lý underpaid`, `${unpaid.length} underpaid manager(s)`),
    bi(
      unpaid.length ? `Danh sách: ${unpaid.join(", ")}. Mỗi quản lý được xét đúng một lần sau khi DFS xong các cấp dưới.` : "Không có quản lý nào có lương thấp hơn trung bình cấp dưới.",
      unpaid.length ? `Managers: ${unpaid.join(", ")}. Each manager is evaluated once after its reports finish.` : "No manager earns less than the average salary of their reports.",
    ),
    [20, 21],
    { final: true, edge: null },
  );
  return { original: employees, answer: unpaid.length, totalSalary: total.totalSalary, totalEmployees: total.totalCount, steps };
}

const DEFAULT_COMPANY_9022 = {
  root: "A",
  employees: [
    { name: "A", salary: 100, reports: ["B", "C"] },
    { name: "B", salary: 100, reports: [] },
    { name: "C", salary: 100, reports: ["D"] },
    { name: "D", salary: 200, reports: [] },
  ],
};

module.exports = {
  9022: {
    id: 9022,
    difficulty: "medium",
    slug: "underpaid-managers",
    category: { key: "tree", vi: "Cây", en: "Tree" },
    tags: [
      { key: "dfs", vi: "DFS", en: "DFS" },
      { key: "tree", vi: "Cây", en: "Tree" },
    ],
    title: bi("Underpaid Managers", "Underpaid Managers"),
    titleVi: bi("Đếm quản lý có lương thấp", "Count underpaid managers"),
    statement: bi(
      `Cho cây nhân viên của công ty, mỗi người có tên, lương và các báo cáo trực tiếp. Đếm quản lý có lương thấp hơn trung bình lương của tất cả cấp dưới trực tiếp và gián tiếp (không tính chính quản lý). Quản lý không có cấp dưới không được tính. Nhập JSON với tối đa ${MAX_EMPLOYEES_9022} nhân viên.`,
      `Given a company reporting tree, each employee has a name, salary, and direct reports. Count managers whose salary is strictly below the average salary of all direct and indirect reports (excluding themselves). Employees with no reports are not managers. Enter JSON with up to ${MAX_EMPLOYEES_9022} employees.`,
    ),
    inputKind: "string",
    inputLabel: bi(
      'Cây nhân viên JSON: {"root":"A","employees":[{"name":"A","salary":100,"reports":["B"]},...]}',
      'Company tree JSON: {"root":"A","employees":[{"name":"A","salary":100,"reports":["B"]},...]}',
    ),
    defaultInput: JSON.stringify(DEFAULT_COMPANY_9022),
    debugMode: "line-by-line",
    approach: [
      bi("DFS đệ quy theo cây báo cáo. Mỗi lời gọi trả tổng lương và số người trong cây con, bao gồm chính nhân viên đó.", "Run recursive DFS on the reporting tree. Each call returns subtree salary and employee count, including the employee."),
      bi("Khi các nhánh con đã trả về, tổng và số lượng tích lũy tại node chỉ chứa cấp dưới, trực tiếp lẫn gián tiếp.", "After child calls return, the node's accumulated salary and count cover all its direct and indirect reports."),
      bi("So sánh lương quản lý với trung bình cấp dưới bằng điều kiện nghiêm ngặt <; node lá không được xét.", "Compare the manager's salary to the reports' average using strict <; skip leaf nodes."),
      bi("Độ phức tạp O(n): mỗi nhân viên được duyệt một lần; stack DFS tối đa O(h).", "Complexity is O(n): each employee is visited once; DFS stack uses up to O(h)."),
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: bi("n là số nhân viên; stack đệ quy dùng O(h), với h là chiều cao cây.", "n is the employee count; recursion uses O(h) stack space for tree height h."),
    },
    code: SOURCE_9022,
    builder: buildSteps9022,
    liveArgs: (input) => {
      const { employees, root } = parseCompany9022(input);
      return [employees, root];
    },
  },
};
