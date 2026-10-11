function renderUnderpaidManagers9022View(step) {
  const view = step.underpaidManagers9022View;
  const vi = lang === "vi";
  const t = (vietnamese, english) => vi ? vietnamese : english;
  const employeeByName = new Map(view.employees.map((employee) => [employee.name, employee]));
  const aggregateByName = new Map(view.aggregates.map((aggregate) => [aggregate.name, aggregate]));
  const parent = view.parent;
  const layout = new Map();
  let nextLeaf = 0;
  let maxDepth = 0;

  function place(name, depth) {
    maxDepth = Math.max(maxDepth, depth);
    const employee = employeeByName.get(name);
    const childXs = employee.reports.map((report) => place(report, depth + 1));
    const x = childXs.length
      ? (childXs[0] + childXs[childXs.length - 1]) / 2
      : 95 + nextLeaf++ * 145;
    layout.set(name, { x, y: 54 + depth * 112 });
    return x;
  }
  place(view.root, 0);
  const width = Math.max(190, nextLeaf * 145 + 30);
  const height = Math.max(125, (maxDepth + 1) * 112 + 20);
  const done = step.final;
  const unpaid = new Set(view.unpaid);
  const evaluated = new Set(view.evaluated);
  const childrenDone = new Set(view.childrenDone);
  const edge = view.activeEdge;
  const edgeMarkup = view.employees.flatMap((employee) => employee.reports.map((report) => {
    const from = layout.get(employee.name);
    const to = layout.get(report);
    const active = edge && edge[0] === employee.name && edge[1] === report;
    const complete = childrenDone.has(report);
    const middle = Math.round((from.y + 34 + to.y - 34) / 2);
    return `<path class="um9022-edge${active ? " active" : ""}${complete ? " complete" : ""}"
      d="M ${from.x} ${from.y + 34} V ${middle} H ${to.x} V ${to.y - 34}" />`;
  }).join("")).join("");
  const nodeMarkup = view.employees.map((employee) => {
    const point = layout.get(employee.name);
    const aggregate = aggregateByName.get(employee.name);
    const state = unpaid.has(employee.name)
      ? "underpaid"
      : evaluated.has(employee.name)
        ? "fair"
        : employee.name === view.current
          ? "current"
          : aggregate.totalSalary !== null
            ? "returned"
            : "pending";
    const active = employee.name === view.current;
    const parentName = parent[employee.name];
    const nodeLabel = `${employee.name}: salary ${employee.salary}, ${employee.reports.length} direct report(s)`;
    return `<g class="um9022-node ${state}${active ? " active" : ""}" transform="translate(${point.x},${point.y})" aria-label="${escapeHtml(nodeLabel)}">
      <title>${escapeHtml(nodeLabel)}</title>
      <rect x="-59" y="-34" width="118" height="68" rx="11" />
      <text class="name" y="-12">${escapeHtml(employee.name)}${employee.name === view.root ? ` · ${t("GỐC", "ROOT")}` : ""}</text>
      <text class="salary" y="7">$${escapeHtml(String(employee.salary))}</text>
      <text class="status" y="23">${state === "underpaid" ? t("underpaid", "underpaid") : state === "fair" ? t("đạt", "not underpaid") : state === "returned" ? t("đã trả", "returned") : state === "current" ? t("đang DFS", "in DFS") : t("chờ DFS", "pending")}</text>
      ${parentName ? `<text class="parent" y="48">${t("quản lý", "manager")}: ${escapeHtml(parentName)}</text>` : ""}
    </g>`;
  }).join("");
  const rows = view.aggregates.map((aggregate) => {
    const state = unpaid.has(aggregate.name) ? "underpaid" : evaluated.has(aggregate.name) ? "fair" : "";
    const average = aggregate.averageSalary === null ? "—" : `$${Number(aggregate.averageSalary.toFixed(2))}`;
    const returned = aggregate.totalSalary === null ? "—" : `$${aggregate.totalSalary} / ${aggregate.totalCount}`;
    return `<tr class="${state}${aggregate.name === view.current ? " active" : ""}">
      <th>${escapeHtml(aggregate.name)}<small>$${aggregate.salary}</small></th>
      <td>${aggregate.descendantCount ? `$${aggregate.descendantSalary} / ${aggregate.descendantCount}` : "—"}</td>
      <td>${average}</td><td>${returned}</td>
      <td>${state === "underpaid" ? t("underpaid", "underpaid") : state === "fair" ? t("không", "no") : aggregate.decision === "no-reports" ? t("không có cấp dưới", "no reports") : t("chưa xét", "pending")}</td>
    </tr>`;
  }).join("");
  const status = done
    ? t("Kết quả cuối cùng", "Final result")
    : view.event === "aggregate"
      ? t("Đang gộp kết quả DFS", "Aggregating DFS result")
      : view.event === "average"
        ? t("Tính trung bình cấp dưới", "Calculate report average")
        : view.event === "underpaid" || view.event === "fair"
          ? t("Đánh giá quản lý", "Evaluate manager")
          : t("DFS hậu tự", "Postorder DFS");
  const averageLine = view.current && aggregateByName.get(view.current).averageSalary !== null
    ? `<div class="um9022-formula"><strong>$${aggregateByName.get(view.current).salary} ${aggregateByName.get(view.current).decision === "underpaid" ? "&lt;" : "≥"} $${Number(aggregateByName.get(view.current).averageSalary.toFixed(2))}</strong><span>${t("lương quản lý so với trung bình cấp dưới", "manager salary vs report average")}</span></div>`
    : "";
  $("treeView").innerHTML = `<article class="um9022-viz" role="region" aria-label="${t("Mô phỏng quản lý có lương thấp", "Underpaid managers visualization")}">
    <header class="um9022-heading">
      <div><small>9022 · ${status}</small><h3>${t("Lương quản lý so với cấp dưới", "Manager salary vs reports")}</h3>
        <p>${t("Trung bình gồm mọi cấp dưới trực tiếp và gián tiếp; không gồm chính quản lý.", "Average includes all direct and indirect reports, but excludes the manager.")}</p></div>
      <div class="um9022-answer"><small>${done ? t("UNDERPAID", "UNDERPAID") : t("ĐÃ TÌM THẤY", "FOUND SO FAR")}</small><strong>${view.unpaid.length}</strong></div>
    </header>
    <section class="um9022-action"><small>${t("BƯỚC HIỆN TẠI", "CURRENT STEP")}</small><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></section>
    <section class="um9022-card"><header><strong>${t("CÂY BÁO CÁO", "REPORTING TREE")}</strong><span>${view.stack.length ? `${t("DFS stack", "DFS stack")}: ${view.stack.map(escapeHtml).join(" → ")}` : t("Hoàn tất DFS", "DFS complete")}</span></header>
      <div class="um9022-tree-scroll"><svg class="um9022-tree" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${t("Cây nhân viên và trạng thái đánh giá", "Employee tree and evaluation status")}">
        ${edgeMarkup}${nodeMarkup}
      </svg></div>
      <div class="um9022-legend"><span class="pending">${t("Chờ DFS", "Pending")}</span><span class="current">${t("Đang xét", "Current")}</span><span class="returned">${t("Đã trả tổng", "Returned")}</span><span class="fair">${t("Không underpaid", "Not underpaid")}</span><span class="underpaid">${t("Underpaid", "Underpaid")}</span></div>
    </section>
    <div class="um9022-summary"><section class="um9022-card"><header><strong>${t("TỔNG HỢP HẬU TỰ", "POSTORDER AGGREGATES")}</strong><span>${t("sum / count chỉ gồm cấp dưới", "sum / count includes reports only")}</span></header>
      <div class="um9022-table-scroll"><table><thead><tr><th>${t("Quản lý", "Manager")}</th><th>Σ ${t("lương", "salary")} / #</th><th>${t("Trung bình", "Average")}</th><th>${t("Trả lên", "Return")}</th><th>${t("Kết luận", "Decision")}</th></tr></thead><tbody>${rows}</tbody></table></div>
      ${averageLine}
    </section>
    <section class="um9022-card um9022-rule"><strong>${t("Quy tắc", "Rule")}</strong>
      <code>salary(manager) &lt; sum(report subtree salaries) / report count</code>
      <p>${t("Node lá không có mẫu số nên không được xét. Bằng trung bình thì không tính là underpaid.", "A leaf has no denominator and is skipped. Equal to the average does not count as underpaid.")}</p>
    </section></div>
    <footer>${done ? `${t("Tổng công ty", "Company total")}: $${view.aggregates.find((item) => item.name === view.root).totalSalary} · ${view.employees.length} ${t("nhân viên", "employees")}` : t("Mỗi lời gọi DFS trả tổng lương và số nhân viên của cây con.", "Each DFS call returns the salary sum and employee count for its subtree.")}</footer>
  </article>`;
}
