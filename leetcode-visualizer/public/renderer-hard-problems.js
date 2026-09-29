(function hardProblemRendererModule(global) {
    "use strict";

    const HARD_STATES = new Set([
        "active", "answer", "base", "candidate", "chosen", "computed",
        "danger", "default", "digit", "idle", "info", "invalid", "memo",
        "muted", "path", "pending", "plain", "queued", "reachable",
        "success", "updated", "visited", "warning"
    ]);

    const LIMITS = Object.freeze({
        phases: 16,
        metrics: 24,
        nodes: 96,
        edges: 256,
        columns: 32,
        rows: 160,
        queue: 80,
        groups: 24,
        groupItems: 100,
        sequence: 160,
        legend: 32,
        arrayValue: 64
    });

    const NODE_RADIUS = 34;
    const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

    function isRecord(value) {
        return value !== null && typeof value === "object" && !Array.isArray(value);
    }

    function locale() {
        return lang === "vi" ? "vi" : "en";
    }

    function ui(vi, en) {
        const value = pick({ vi, en });
        return typeof value === "string" ? value : (locale() === "vi" ? vi : en);
    }

    function localize(value, fallback = "—") {
        if (typeof value === "string") return value;
        if (typeof value === "number") return Number.isFinite(value) ? String(value) : fallback;
        if (typeof value === "boolean" || typeof value === "bigint") return String(value);

        if (isRecord(value)
            && (typeof value.vi === "string" || typeof value.en === "string")) {
            const selected = pick(value);
            if (typeof selected === "string") return selected;

            const language = locale();
            if (typeof value[language] === "string") return value[language];
            if (typeof value.en === "string") return value.en;
            if (typeof value.vi === "string") return value.vi;
        }

        return fallback;
    }

    function displayValue(value, fallback = "—") {
        if (value === null || value === undefined) return fallback;
        if (typeof value === "string") return value;
        if (typeof value === "number") return Number.isFinite(value) ? String(value) : fallback;
        if (typeof value === "boolean" || typeof value === "bigint") return String(value);
        if (Array.isArray(value)) {
            const values = value
                .slice(0, LIMITS.arrayValue)
                .map((entry) => displayValue(entry, "—"));
            if (value.length > LIMITS.arrayValue) values.push("…");
            return `[${values.join(", ")}]`;
        }
        if (isRecord(value)
            && (typeof value.vi === "string" || typeof value.en === "string")) {
            return localize(value, fallback);
        }
        if (isRecord(value) && hasOwn(value, "value")) {
            return displayValue(value.value, fallback);
        }
        return fallback;
    }

    function escape(value) {
        return escapeHtml(value === null || value === undefined ? "" : String(value));
    }

    function boundedArray(value, limit) {
        return Array.isArray(value) ? value.slice(0, limit) : [];
    }

    function safeState(value) {
        return typeof value === "string" && HARD_STATES.has(value) ? value : "default";
    }

    function stateClass(value) {
        return `hp-state-${safeState(value)}`;
    }

    function clipped(value, maxLength) {
        const text = displayValue(value, "");
        return text.length > maxLength ? `${text.slice(0, Math.max(1, maxLength - 1))}…` : text;
    }

    function numberAttribute(value) {
        return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
    }

    function emptyMessage() {
        return `<p class="hp-empty">${escape(ui("Chưa có dữ liệu ở bước này.", "No data at this step."))}</p>`;
    }

    function renderUnavailable() {
        return `
            <article class="hard-problem-viz" role="region" aria-label="${escape(ui("Trực quan bài toán khó", "Hard problem visualization"))}">
                <section class="hp-card hp-unavailable" role="status">
                    <strong>${escape(ui("Không thể hiển thị trực quan", "Visualization unavailable"))}</strong>
                    <span>${escape(ui("Dữ liệu của bước này không hợp lệ hoặc chưa sẵn sàng.", "This step's data is invalid or not ready."))}</span>
                </section>
            </article>`;
    }

    function phaseIndex(view, phases) {
        return Number.isInteger(view.phaseIndex)
            && view.phaseIndex >= 0
            && view.phaseIndex < phases.length
            ? view.phaseIndex
            : -1;
    }

    function renderPhaseTracker(view) {
        const phases = boundedArray(view.phases, LIMITS.phases);
        if (!phases.length) return "";

        const current = phaseIndex(view, phases);
        const items = phases.map((phase, index) => {
            const progressClass = index === current
                ? "is-active hp-state-active"
                : (current >= 0 && index < current
                    ? "is-complete hp-state-success"
                    : "is-upcoming hp-state-muted");
            const currentAttribute = index === current ? " aria-current=\"step\"" : "";
            return `
                <li class="hp-phase ${progressClass}"${currentAttribute}>
                    <span class="hp-phase-index">${escape(index + 1)}</span>
                    <span class="hp-phase-label">${escape(localize(phase, ui("Giai đoạn", "Phase")))}</span>
                </li>`;
        }).join("");

        return `
            <nav class="hp-phase-tracker" aria-label="${escape(ui("Tiến trình thuật toán", "Algorithm progress"))}">
                <ol>${items}</ol>
            </nav>`;
    }

    function renderHeader(view) {
        const phases = boundedArray(view.phases, LIMITS.phases);
        const current = phaseIndex(view, phases);
        const currentPhase = current >= 0
            ? localize(phases[current], ui("Giai đoạn hiện tại", "Current phase"))
            : localize(view.phase, ui("Trạng thái thuật toán", "Algorithm state"));
        const problemId = displayValue(view.problemId, "?");
        const phaseCount = current >= 0
            ? `${current + 1}/${phases.length}`
            : ui("Đang xử lý", "In progress");

        return `
            <header class="hp-header">
                <div>
                    <p class="hp-eyebrow">${escape(ui("Bài toán khó", "Hard problem"))} #${escape(problemId)}</p>
                    <h2>${escape(currentPhase)}</h2>
                </div>
                <span class="hp-phase-count">${escape(phaseCount)}</span>
            </header>`;
    }

    function renderActionBanner(view) {
        const action = localize(view.action, ui("Không có mô tả hành động.", "No action description."));
        const formula = localize(view.formula, "—");

        return `
            <section class="hp-banner" aria-label="${escape(ui("Hành động và công thức", "Action and formula"))}">
                <div class="hp-banner-block hp-action-block">
                    <span class="hp-label">${escape(ui("Hành động", "Action"))}</span>
                    <strong>${escape(action)}</strong>
                </div>
                <div class="hp-banner-block hp-formula-block">
                    <span class="hp-label">${escape(ui("Công thức / Bất biến", "Formula / Invariant"))}</span>
                    <code>${escape(formula)}</code>
                </div>
            </section>`;
    }

    function renderMetrics(metricsValue) {
        const metrics = boundedArray(metricsValue, LIMITS.metrics).filter(isRecord);
        if (!metrics.length) return "";

        const cards = metrics.map((metric) => `
            <div class="hp-metric ${stateClass(metric.state)}">
                <span class="hp-metric-label">${escape(localize(metric.label, ui("Chỉ số", "Metric")))}</span>
                <strong>${escape(displayValue(metric.value))}</strong>
            </div>`).join("");

        return `<section class="hp-metrics" aria-label="${escape(ui("Các chỉ số", "Metrics"))}">${cards}</section>`;
    }

    function nodeKey(value) {
        if (typeof value === "number" && Number.isFinite(value)) return `n:${value}`;
        if (typeof value === "string" && value.length > 0 && value.length <= 128) return `s:${value}`;
        return null;
    }

    function normalizeGraph(graph) {
        const nodes = [];
        const nodeByKey = new Map();

        boundedArray(graph.nodes, LIMITS.nodes).forEach((rawNode) => {
            if (!isRecord(rawNode)) return;
            const key = nodeKey(rawNode.id);
            if (key === null || nodeByKey.has(key)) return;

            const node = {
                key,
                id: rawNode.id,
                label: localize(rawNode.label, displayValue(rawNode.id, "?")),
                sub: localize(rawNode.sub, ""),
                state: safeState(rawNode.state)
            };
            nodes.push(node);
            nodeByKey.set(key, node);
        });

        const edges = boundedArray(graph.edges, LIMITS.edges)
            .filter(isRecord)
            .map((rawEdge) => ({
                sourceKey: nodeKey(rawEdge.u),
                targetKey: nodeKey(rawEdge.v),
                label: localize(rawEdge.label, ""),
                directed: rawEdge.directed === true,
                state: safeState(rawEdge.state)
            }))
            .filter((edge) => edge.sourceKey !== null
                && edge.targetKey !== null
                && edge.sourceKey !== edge.targetKey
                && nodeByKey.has(edge.sourceKey)
                && nodeByKey.has(edge.targetKey));

        return {
            layout: graph.layout === "tree" ? "tree" : "circle",
            nodes,
            edges,
            levels: Array.isArray(graph.levels) ? graph.levels : []
        };
    }

    function circlePositions(nodes) {
        const count = nodes.length;
        const radius = Math.max(190, Math.min(720, (count * 76) / (2 * Math.PI)));
        const width = Math.max(720, Math.min(1600, radius * 2 + 180));
        const height = Math.max(440, Math.min(980, radius * 2 + 160));
        const centerX = width / 2;
        const centerY = height / 2;
        const effectiveRadius = Math.min(radius, (width - 140) / 2, (height - 130) / 2);
        const positions = new Map();

        nodes.forEach((node, index) => {
            const angle = count === 1 ? 0 : ((Math.PI * 2 * index) / count) - (Math.PI / 2);
            positions.set(node.key, count === 1
                ? { x: centerX, y: centerY }
                : {
                    x: centerX + Math.cos(angle) * effectiveRadius,
                    y: centerY + Math.sin(angle) * effectiveRadius
                });
        });

        return { width, height, positions, effectiveLayout: "circle" };
    }

    function treePositions(graph) {
        const known = new Set(graph.nodes.map((node) => node.key));
        const assigned = new Set();
        const levels = [];

        boundedArray(graph.levels, LIMITS.nodes).forEach((rawLevel) => {
            if (!Array.isArray(rawLevel)) return;
            const level = [];
            boundedArray(rawLevel, LIMITS.nodes).forEach((id) => {
                const key = nodeKey(id);
                if (key !== null && known.has(key) && !assigned.has(key)) {
                    level.push(key);
                    assigned.add(key);
                }
            });
            if (level.length) levels.push(level);
        });

        if (!levels.length) return circlePositions(graph.nodes);

        const remaining = graph.nodes
            .map((node) => node.key)
            .filter((key) => !assigned.has(key));
        if (remaining.length) levels.push(remaining);

        const widestLevel = Math.max(1, ...levels.map((level) => level.length));
        const width = Math.max(720, Math.min(2200, widestLevel * 150 + 140));
        const height = Math.max(360, levels.length * 150 + 80);
        const positions = new Map();

        levels.forEach((level, depth) => {
            const spacing = width / (level.length + 1);
            level.forEach((key, index) => {
                positions.set(key, {
                    x: spacing * (index + 1),
                    y: 65 + depth * 150
                });
            });
        });

        return { width, height, positions, effectiveLayout: "tree" };
    }

    function trimmedLine(source, target) {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const length = Math.hypot(dx, dy);
        if (!Number.isFinite(length) || length < 1) return null;

        const ux = dx / length;
        const uy = dy / length;
        return {
            x1: source.x + ux * NODE_RADIUS,
            y1: source.y + uy * NODE_RADIUS,
            x2: target.x - ux * (NODE_RADIUS + 2),
            y2: target.y - uy * (NODE_RADIUS + 2),
            ux,
            uy
        };
    }

    function renderArrow(line, state) {
        const length = 13;
        const halfWidth = 6;
        const baseX = line.x2 - line.ux * length;
        const baseY = line.y2 - line.uy * length;
        const perpendicularX = -line.uy * halfWidth;
        const perpendicularY = line.ux * halfWidth;
        const points = [
            `${numberAttribute(line.x2)},${numberAttribute(line.y2)}`,
            `${numberAttribute(baseX + perpendicularX)},${numberAttribute(baseY + perpendicularY)}`,
            `${numberAttribute(baseX - perpendicularX)},${numberAttribute(baseY - perpendicularY)}`
        ].join(" ");

        return `<polygon class="hp-graph-arrow ${stateClass(state)}" points="${points}"></polygon>`;
    }

    function renderGraph(graphValue) {
        if (!isRecord(graphValue)) return "";
        const graph = normalizeGraph(graphValue);
        const title = graph.layout === "tree" ? ui("Cây trạng thái", "State tree") : ui("Đồ thị trạng thái", "State graph");

        if (!graph.nodes.length) {
            return `
                <section class="hp-card hp-graph-card">
                    <h3>${escape(title)}</h3>
                    ${emptyMessage()}
                </section>`;
        }

        const geometry = graph.layout === "tree" ? treePositions(graph) : circlePositions(graph.nodes);
        const edgeMarkup = graph.edges.map((edge) => {
            const source = geometry.positions.get(edge.sourceKey);
            const target = geometry.positions.get(edge.targetKey);
            if (!source || !target) return "";
            const line = trimmedLine(source, target);
            if (!line) return "";

            const state = stateClass(edge.state);
            const labelX = (line.x1 + line.x2) / 2 - line.uy * 11;
            const labelY = (line.y1 + line.y2) / 2 + line.ux * 11;
            const label = edge.label
                ? `<text class="hp-edge-label ${state}" x="${numberAttribute(labelX)}" y="${numberAttribute(labelY)}">${escape(clipped(edge.label, 24))}</text>`
                : "";
            const arrow = edge.directed ? renderArrow(line, edge.state) : "";

            return `
                <g class="hp-graph-edge-group">
                    <line class="hp-graph-edge ${state}" x1="${numberAttribute(line.x1)}" y1="${numberAttribute(line.y1)}" x2="${numberAttribute(line.x2)}" y2="${numberAttribute(line.y2)}"></line>
                    ${arrow}
                    ${label}
                </g>`;
        }).join("");

        const nodeMarkup = graph.nodes.map((node) => {
            const point = geometry.positions.get(node.key);
            if (!point) return "";
            const accessibleLabel = node.sub ? `${node.label}: ${node.sub}` : node.label;
            return `
                <g class="hp-graph-node ${stateClass(node.state)}" transform="translate(${numberAttribute(point.x)} ${numberAttribute(point.y)})" aria-label="${escape(accessibleLabel)}">
                    <title>${escape(accessibleLabel)}</title>
                    <circle r="${NODE_RADIUS}"></circle>
                    <text class="hp-node-label" text-anchor="middle" y="${node.sub ? -3 : 4}">${escape(clipped(node.label, 18))}</text>
                    ${node.sub ? `<text class="hp-node-sub" text-anchor="middle" y="14">${escape(clipped(node.sub, 22))}</text>` : ""}
                </g>`;
        }).join("");

        const graphDescription = `${title}. ${ui("Số đỉnh", "Nodes")}: ${graph.nodes.length}. ${ui("Số cạnh", "Edges")}: ${graph.edges.length}.`;
        return `
            <section class="hp-card hp-graph-card">
                <div class="hp-card-heading">
                    <h3>${escape(title)}</h3>
                    <span>${escape(graph.nodes.length)} ${escape(ui("đỉnh", "nodes"))}</span>
                </div>
                <div class="hp-graph-scroll" role="region" aria-label="${escape(title)}" tabindex="0">
                    <svg class="hp-graph hp-layout-${geometry.effectiveLayout}" viewBox="0 0 ${numberAttribute(geometry.width)} ${numberAttribute(geometry.height)}" role="img" aria-label="${escape(graphDescription)}">
                        ${edgeMarkup}
                        ${nodeMarkup}
                    </svg>
                </div>
            </section>`;
    }

    function normalizedCell(rawCell) {
        if (isRecord(rawCell) && hasOwn(rawCell, "value")) {
            return {
                value: displayValue(rawCell.value),
                state: safeState(rawCell.state)
            };
        }
        return { value: displayValue(rawCell), state: "default" };
    }

    function renderTable(tableValue) {
        if (!isRecord(tableValue)) return "";
        const title = localize(tableValue.title, ui("Bảng trạng thái", "State table"));
        const columns = boundedArray(tableValue.columns, LIMITS.columns)
            .map((column, index) => localize(column, `${ui("Cột", "Column")} ${index + 1}`));
        const rows = boundedArray(tableValue.rows, LIMITS.rows).filter(isRecord);

        if (!rows.length) {
            return `
                <section class="hp-card hp-table-card">
                    <h3>${escape(title)}</h3>
                    ${emptyMessage()}
                </section>`;
        }

        const widestRow = rows.reduce((maximum, row) => {
            const length = Array.isArray(row.cells) ? Math.min(row.cells.length, LIMITS.columns) : 0;
            return Math.max(maximum, length);
        }, 0);
        const columnCount = Math.max(columns.length, widestRow);
        const headings = Array.from({ length: columnCount }, (_, index) => {
            const label = columns[index] || `${ui("Cột", "Column")} ${index + 1}`;
            return `<th scope="col">${escape(label)}</th>`;
        }).join("");

        const body = rows.map((row, rowIndex) => {
            const rowLabel = localize(row.label, `${ui("Hàng", "Row")} ${rowIndex + 1}`);
            const cells = boundedArray(row.cells, LIMITS.columns);
            const cellMarkup = Array.from({ length: columnCount }, (_, columnIndex) => {
                const cell = normalizedCell(cells[columnIndex]);
                return `<td class="${stateClass(cell.state)}"><span>${escape(cell.value)}</span></td>`;
            }).join("");

            return `
                <tr class="${stateClass(row.state)}">
                    <th scope="row">${escape(rowLabel)}</th>
                    ${cellMarkup}
                </tr>`;
        }).join("");

        return `
            <section class="hp-card hp-table-card">
                <div class="hp-card-heading">
                    <h3>${escape(title)}</h3>
                    <span>${escape(rows.length)} ${escape(ui("hàng", "rows"))}</span>
                </div>
                <div class="hp-table-scroll" role="region" aria-label="${escape(title)}" tabindex="0">
                    <table>
                        <thead><tr><th scope="col">${escape(ui("Trạng thái", "State"))}</th>${headings}</tr></thead>
                        <tbody>${body}</tbody>
                    </table>
                </div>
            </section>`;
    }

    function renderQueue(queueValue) {
        const items = boundedArray(queueValue, LIMITS.queue).filter(isRecord);
        const body = items.length ? `
            <ol class="hp-item-list hp-queue-list">
                ${items.map((item, index) => `
                    <li class="${stateClass(item.state)}">
                        <span class="hp-item-index">${escape(index + 1)}</span>
                        <span class="hp-item-copy">
                            <strong>${escape(localize(item.label, ui("Mục", "Item")))}</strong>
                            ${item.sub === null || item.sub === undefined || localize(item.sub, "") === "" ? "" : `<small>${escape(localize(item.sub, ""))}</small>`}
                        </span>
                    </li>`).join("")}
            </ol>` : emptyMessage();

        return `
            <section class="hp-card hp-queue-card">
                <div class="hp-card-heading">
                    <h3>${escape(ui("Hàng đợi / Biên", "Queue / Frontier"))}</h3>
                    <span>${escape(items.length)}</span>
                </div>
                ${body}
            </section>`;
    }

    function renderGroups(groupsValue) {
        const groups = boundedArray(groupsValue, LIMITS.groups).filter(isRecord);
        if (!groups.length) {
            return `
                <section class="hp-card hp-groups-card">
                    <h3>${escape(ui("Nhóm trạng thái", "State groups"))}</h3>
                    ${emptyMessage()}
                </section>`;
        }

        const markup = groups.map((group, groupIndex) => {
            const title = localize(group.title, `${ui("Nhóm", "Group")} ${groupIndex + 1}`);
            const items = boundedArray(group.items, LIMITS.groupItems).filter(isRecord);
            const itemMarkup = items.length
                ? `<ul class="hp-group-items">${items.map((item) => `
                    <li class="${stateClass(item.state)}">
                        <span>${escape(localize(item.label, ui("Mục", "Item")))}</span>
                        <strong>${escape(displayValue(item.value))}</strong>
                    </li>`).join("")}</ul>`
                : emptyMessage();

            return `
                <section class="hp-group">
                    <h4>${escape(title)}</h4>
                    ${itemMarkup}
                </section>`;
        }).join("");

        return `
            <section class="hp-card hp-groups-card">
                <h3>${escape(ui("Nhóm trạng thái", "State groups"))}</h3>
                <div class="hp-groups-grid">${markup}</div>
            </section>`;
    }

    function renderSequence(sequenceValue) {
        const items = boundedArray(sequenceValue, LIMITS.sequence).filter(isRecord);
        const markup = items.length
            ? `<ol class="hp-sequence-list">${items.map((item, index) => `
                <li class="${stateClass(item.state)}">
                    <span class="hp-sequence-index">${escape(index + 1)}</span>
                    <span>${escape(localize(item.label, ui("Bước", "Step")))}</span>
                    <strong>${escape(displayValue(item.value))}</strong>
                </li>`).join("")}</ol>`
            : emptyMessage();

        return `
            <section class="hp-card hp-sequence-card">
                <h3>${escape(ui("Chuỗi / Đường đi", "Sequence / Path"))}</h3>
                <div class="hp-sequence-scroll" tabindex="0">${markup}</div>
            </section>`;
    }

    function renderLegend(legendValue) {
        const items = boundedArray(legendValue, LIMITS.legend).filter(isRecord);
        if (!items.length) return "";

        return `
            <section class="hp-legend" aria-label="${escape(ui("Chú giải", "Legend"))}">
                <strong>${escape(ui("Chú giải", "Legend"))}</strong>
                <ul>${items.map((item) => `
                    <li class="${stateClass(item.state)}">
                        <span class="hp-legend-swatch" aria-hidden="true"></span>
                        <span>${escape(localize(item.label, safeState(item.state)))}</span>
                    </li>`).join("")}</ul>
            </section>`;
    }

    function renderAnswer(view) {
        if (view.answer === null || view.answer === undefined) return "";
        return `
            <section class="hp-answer hp-state-answer" aria-live="polite">
                <span>${escape(ui("Đáp án", "Answer"))}</span>
                <strong>${escape(displayValue(view.answer))}</strong>
            </section>`;
    }

    function renderTruncation(view) {
        if (view.traceTruncated !== true) return "";
        return `
            <aside class="hp-truncation hp-state-warning" role="note" aria-live="polite">
                <strong>${escape(ui("Dấu vết đã được rút gọn", "Trace truncated"))}</strong>
                <span>${escape(ui("Một số bước trung gian đã được lược bỏ để giữ trực quan phản hồi nhanh.", "Some intermediate steps were omitted to keep the visualization responsive."))}</span>
            </aside>`;
    }

    function renderHardProblemView(step) {
        const treeView = $("treeView");
        if (!treeView) return;

        const view = isRecord(step) && isRecord(step.hardProblemView)
            ? step.hardProblemView
            : null;
        if (!view) {
            treeView.innerHTML = renderUnavailable();
            return;
        }

        const optionalCards = [];
        if (hasOwn(view, "graph")) optionalCards.push(renderGraph(view.graph));
        if (hasOwn(view, "table")) optionalCards.push(renderTable(view.table));
        if (hasOwn(view, "queue")) optionalCards.push(renderQueue(view.queue));
        if (hasOwn(view, "groups")) optionalCards.push(renderGroups(view.groups));
        if (hasOwn(view, "sequence")) optionalCards.push(renderSequence(view.sequence));

        treeView.innerHTML = `
            <article class="hard-problem-viz" role="region" aria-label="${escape(ui("Trực quan bài toán khó", "Hard problem visualization"))}">
                ${renderHeader(view)}
                ${renderPhaseTracker(view)}
                ${renderActionBanner(view)}
                ${renderMetrics(view.metrics)}
                <div class="hp-content-grid">${optionalCards.filter(Boolean).join("")}</div>
                ${renderLegend(view.legend)}
                <div class="hp-result-stack">
                    ${step.final ? renderAnswer(view) : ""}
                    ${renderTruncation(view)}
                </div>
            </article>`;
    }

    global.renderHardProblemView = renderHardProblemView;
}(typeof window !== "undefined" ? window : globalThis));
