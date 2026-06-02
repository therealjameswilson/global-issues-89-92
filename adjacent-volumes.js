(() => {
  const data = window.GLOBAL_ISSUES_DATA;
  if (!data) return;

  const lanesById = new Map((data.lanes || []).map((lane) => [lane.id, lane]));
  let rows = [];
  let visibleRows = [];

  const gateOrder = [
    "Pre-numbering coordination",
    "Parallel research watch",
    "Split status check",
    "Monitor planned boundary"
  ];

  const qs = (selector, root = document) => root.querySelector(selector);
  const laneFor = (id) => lanesById.get(id) || { id, name: "Unassigned", shortName: "Unassigned", color: "#5c6967" };

  function make(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value === undefined || value === null) continue;
      if (key === "className") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "value") node.value = value;
      else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2).toLowerCase(), value);
      else node.setAttribute(key, value);
    }
    for (const child of Array.isArray(children) ? children : [children]) {
      if (child === undefined || child === null) continue;
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return node;
  }

  function textIndex(value) {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return value.map(textIndex).join(" ");
    if (typeof value === "object") return Object.values(value).map(textIndex).join(" ");
    return String(value);
  }

  function matches(row, query) {
    return !query || textIndex(row).toLowerCase().includes(query.trim().toLowerCase());
  }

  function unique(values) {
    return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
  }

  function fillSelect(select, values, allLabel, formatter = (value) => value) {
    if (!select) return;
    const current = select.value;
    select.replaceChildren(make("option", { value: "", text: allLabel }));
    values.forEach((value) => select.append(make("option", { value, text: formatter(value) })));
    if (values.includes(current)) select.value = current;
  }

  function statusClass(value) {
    return String(value || "status")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function gateFor(row) {
    if (/Mixed/i.test(row.status)) return "Split status check";
    if (/Being Cleared/i.test(row.status)) return "Pre-numbering coordination";
    if (/Being Researched/i.test(row.status)) return "Parallel research watch";
    return "Monitor planned boundary";
  }

  function urgencyFor(row) {
    if (/Being Cleared/i.test(row.status) || /Somalia|Persian Gulf|Yugoslavia/i.test(row.volume)) return "High";
    if (/Being Researched|Mixed/i.test(row.status)) return "Medium";
    return "Low";
  }

  function gateRank(gate) {
    const index = gateOrder.indexOf(gate);
    return index === -1 ? gateOrder.length : index;
  }

  function laneNames(row) {
    return (row.laneIds || []).map((id) => laneFor(id).name);
  }

  function laneShortNames(row) {
    return (row.laneIds || []).map((id) => laneFor(id).shortName || laneFor(id).name);
  }

  function buildRows() {
    return (data.adjacentVolumes || [])
      .map((row) => {
        const gate = gateFor(row);
        const urgency = urgencyFor(row);
        return {
          ...row,
          gate,
          urgency,
          gateRank: gateRank(gate),
          chapterNames: laneNames(row),
          chapterShortNames: laneShortNames(row)
        };
      })
      .sort(
        (a, b) =>
          a.gateRank - b.gateRank ||
          (a.urgency === "High" ? 0 : a.urgency === "Medium" ? 1 : 2) -
            (b.urgency === "High" ? 0 : b.urgency === "Medium" ? 1 : 2) ||
          a.shortTitle.localeCompare(b.shortTitle)
      );
  }

  function filters() {
    return {
      query: qs("#adjacent-search")?.value || "",
      lane: qs("#adjacent-lane")?.value || "",
      status: qs("#adjacent-status")?.value || "",
      gate: qs("#adjacent-gate")?.value || ""
    };
  }

  function render() {
    const root = qs("#adjacent-root");
    if (!root) return;
    const current = filters();
    visibleRows = rows.filter(
      (row) =>
        matches(row, current.query) &&
        (!current.lane || (row.laneIds || []).includes(current.lane)) &&
        (!current.status || row.status === current.status) &&
        (!current.gate || row.gate === current.gate)
    );

    const summary = qs("#adjacent-summary");
    if (summary) {
      const chapter = current.lane ? ` for ${laneFor(current.lane).name}` : "";
      summary.textContent = `Showing ${visibleRows.length} of ${rows.length} adjacent-volume coordination rows${chapter}.`;
    }

    const clearing = visibleRows.filter((row) => /Being Cleared/i.test(row.status)).length;
    const researched = visibleRows.filter((row) => /Being Researched/i.test(row.status)).length;
    const planned = visibleRows.filter((row) => /Planned/i.test(row.status)).length;
    const high = visibleRows.filter((row) => row.urgency === "High").length;

    root.replaceChildren(
      make("div", { className: "adjacent-metrics" }, [
        metric(String(clearing), "being cleared", "Pre-numbering coordination pressure"),
        metric(String(researched), "being researched", "Parallel source-pool comparison"),
        metric(String(planned), "planned", "Monitor for future boundary changes"),
        metric(String(high), "high urgency", "Rows most likely to affect document placement")
      ]),
      ...renderGroups(visibleRows)
    );
  }

  function metric(value, label, caption) {
    return make("div", { className: "metric" }, [
      make("strong", { text: value }),
      make("span", { text: label }),
      make("p", { text: caption })
    ]);
  }

  function renderGroups(items) {
    if (!items.length) return [make("p", { className: "empty", text: "No adjacent-volume rows match the current filters." })];
    const groups = new Map();
    items.forEach((row) => {
      if (!groups.has(row.gate)) groups.set(row.gate, []);
      groups.get(row.gate).push(row);
    });
    return [...groups.entries()].map(([gate, groupRows]) =>
      make("article", { className: "adjacent-group" }, [
        make("div", { className: "adjacent-group-heading" }, [
          make("div", {}, [
            make("p", { className: "kicker", text: "Coordination Gate" }),
            make("h3", { text: gate })
          ]),
          make("p", { text: `${groupRows.length} adjacent volume${groupRows.length === 1 ? "" : "s"}` })
        ]),
        make("div", { className: "adjacent-grid" }, groupRows.map(renderCard))
      ])
    );
  }

  function renderCard(row) {
    const color = laneFor((row.laneIds || [])[0]).color;
    return make("article", { className: "adjacent-card", style: `--lane-color: ${color}` }, [
      make("div", { className: "adjacent-card-main" }, [
        make("p", { className: "meta-line", text: row.volume }),
        make("h3", { text: row.shortTitle }),
        make("div", { className: "tag-list" }, [
          make("span", { className: `adjacent-status ${statusClass(row.status)}`, text: row.status }),
          make("span", { className: `adjacent-urgency ${statusClass(row.urgency)}`, text: `${row.urgency} urgency` }),
          make("span", { className: "count-pill", text: `${row.chapterShortNames.length} chapters` })
        ]),
        make("p", { className: "adjacent-risk" }, [make("strong", { text: "Boundary risk: " }), row.risk]),
        make("p", { className: "adjacent-action" }, [make("strong", { text: "Compiler action: " }), row.compilerAction])
      ]),
      make("aside", { className: "adjacent-side" }, [
        make("p", { className: "card-meta", text: "Volume XXIX Chapters" }),
        make("div", { className: "tag-list" }, row.chapterShortNames.map((chapter) => make("span", { className: "tag", text: chapter }))),
        make("p", { className: "card-meta", text: "Overlap Topics" }),
        make("ul", { className: "compact-list" }, row.overlapTopics.map((topic) => make("li", { text: topic }))),
        make("div", { className: "small-actions" }, [
          make("button", { type: "button", onClick: () => copyText(coordinationMemo(row), "Coordination memo copied") }, "Copy Memo"),
          make("a", { className: "button ghost", href: row.url, rel: "noreferrer" }, "Open Status"),
          make("a", { className: "button ghost", href: "#boundaries" }, "Matrix")
        ])
      ])
    ]);
  }

  function coordinationMemo(row) {
    return [
      "FRUS Volume XXIX adjacent-volume coordination memo",
      `Adjacent volume: ${row.volume}`,
      `Status checked: ${data.volume.statusChecked}`,
      `Status: ${row.status}`,
      `Coordination gate: ${row.gate}`,
      `Urgency: ${row.urgency}`,
      `Volume XXIX chapters affected: ${row.chapterNames.join("; ")}`,
      `Overlap topics: ${row.overlapTopics.join("; ")}`,
      `Boundary risk: ${row.risk}`,
      `Compiler action: ${row.compilerAction}`,
      `Status/source URL: ${row.url}`
    ].join("\n");
  }

  function exportCsv() {
    downloadCsv("frus-v29-adjacent-volume-coordination.csv", visibleRows, [
      { label: "Adjacent volume", value: (row) => row.volume },
      { label: "Status", value: (row) => row.status },
      { label: "Coordination gate", value: (row) => row.gate },
      { label: "Urgency", value: (row) => row.urgency },
      { label: "Volume XXIX chapters", value: (row) => row.chapterNames.join("; ") },
      { label: "Overlap topics", value: (row) => row.overlapTopics.join("; ") },
      { label: "Boundary risk", value: (row) => row.risk },
      { label: "Compiler action", value: (row) => row.compilerAction },
      { label: "URL", value: (row) => row.url }
    ]);
  }

  function copyVisible() {
    const text = visibleRows.map(coordinationMemo).join("\n\n---\n\n");
    copyText(text || "No adjacent-volume rows are visible.", "Coordination memos copied");
  }

  function reset() {
    ["#adjacent-search", "#adjacent-lane", "#adjacent-status", "#adjacent-gate"].forEach((selector) => {
      const node = qs(selector);
      if (node) node.value = "";
    });
    render();
  }

  function init() {
    if (!qs("#adjacent-root")) return;
    rows = buildRows();
    fillSelect(qs("#adjacent-lane"), (data.lanes || []).map((lane) => lane.id), "All chapters", (id) => laneFor(id).name);
    fillSelect(qs("#adjacent-status"), unique(rows.map((row) => row.status)), "All statuses");
    fillSelect(qs("#adjacent-gate"), gateOrder.filter((gate) => rows.some((row) => row.gate === gate)), "All gates");

    ["#adjacent-search", "#adjacent-lane", "#adjacent-status", "#adjacent-gate"].forEach((selector) => {
      qs(selector)?.addEventListener("input", render);
      qs(selector)?.addEventListener("change", render);
    });
    qs("#adjacent-reset")?.addEventListener("click", reset);
    qs("#adjacent-export")?.addEventListener("click", exportCsv);
    qs("#adjacent-copy")?.addEventListener("click", copyVisible);
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
