const data = window.GLOBAL_ISSUES_DATA;
const lanesById = new Map(data.lanes.map((lane) => [lane.id, lane]));
const storageKeys = {
  reviewed: "frus-v29-reviewed-items",
  scratchpad: "frus-v29-scratchpad"
};

const state = {
  visibleChronology: [],
  visibleRecords: [],
  visiblePersons: [],
  visiblePools: [],
  visibleGaps: [],
  visibleReferences: []
};

let toastTimer = null;

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function make(tag, attrs = {}, children = []) {
  const element = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null) continue;
    if (key === "className") element.className = value;
    else if (key === "text") element.textContent = value;
    else if (key === "htmlFor") element.htmlFor = value;
    else if (key === "dataset") {
      for (const [dataKey, dataValue] of Object.entries(value)) {
        element.dataset[dataKey] = dataValue;
      }
    } else if (key.startsWith("on") && typeof value === "function") {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === "value") {
      element.value = value;
    } else if (key === "disabled") {
      element.disabled = Boolean(value);
    } else {
      element.setAttribute(key, value);
    }
  }

  for (const child of Array.isArray(children) ? children : [children]) {
    if (child === undefined || child === null) continue;
    element.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }

  return element;
}

function laneFor(id) {
  return lanesById.get(id) || { id, name: "Unassigned", shortName: "Unassigned", color: "#5c6967" };
}

function laneName(id) {
  return laneFor(id).name;
}

function formatDate(value) {
  if (!value) return "Undated";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  });
}

function priorityRank(priority) {
  return { Critical: 0, High: 1, Medium: 2, Low: 3 }[priority] ?? 4;
}

function textIndex(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(textIndex).join(" ");
  if (typeof value === "object") return Object.values(value).map(textIndex).join(" ");
  return String(value);
}

function matchesQuery(item, query) {
  if (!query) return true;
  return textIndex(item).toLowerCase().includes(query.trim().toLowerCase());
}

function uniqueValues(items, key) {
  return [...new Set(items.map((item) => item[key]).filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b))
  );
}

function populateSelect(select, options, allLabel, formatter = (value) => value) {
  if (!select) return;
  const current = select.value;
  select.replaceChildren(make("option", { value: "", text: allLabel }));
  for (const option of options) {
    select.append(make("option", { value: option, text: formatter(option) }));
  }
  if (options.includes(current)) select.value = current;
}

function pill(text, className = "") {
  return make("span", { className: `tag ${className}`.trim(), text });
}

function priorityPill(priority) {
  return make("span", { className: `priority ${priority || ""}`.trim(), text: priority || "Priority TBD" });
}

function statusPill(status) {
  const statusClass = String(status || "").split(/\s+/)[0] || "";
  return make("span", { className: `status-pill ${statusClass}`.trim(), text: status || "Status TBD" });
}

function showToast(message) {
  const toast = qs("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2200);
}

async function copyText(text, message = "Copied") {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const textarea = make("textarea", { value: text });
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  showToast(message);
}

function csvEscape(value) {
  const normalized = Array.isArray(value) ? value.join("; ") : value ?? "";
  return `"${String(normalized).replaceAll('"', '""')}"`;
}

function downloadCsv(filename, rows, columns) {
  const header = columns.map((column) => csvEscape(column.label)).join(",");
  const body = rows
    .map((row) => columns.map((column) => csvEscape(column.value(row))).join(","))
    .join("\n");
  downloadText(filename, `${header}\n${body}`);
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = make("a", { href: url, download: filename });
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function reviewedItems() {
  try {
    return new Set(JSON.parse(localStorage.getItem(storageKeys.reviewed) || "[]"));
  } catch (error) {
    return new Set();
  }
}

function saveReviewed(set) {
  localStorage.setItem(storageKeys.reviewed, JSON.stringify([...set]));
}

function toggleReviewed(id) {
  const reviewed = reviewedItems();
  if (reviewed.has(id)) reviewed.delete(id);
  else reviewed.add(id);
  saveReviewed(reviewed);
  renderReview();
}

function setLaneFilter(targetId, laneId) {
  const select = qs(targetId);
  if (!select) return;
  select.value = laneId;
  select.dispatchEvent(new Event("change"));
}

function scrollToId(id) {
  qs(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function initVolumeScope() {
  const root = qs("#volume-scope");
  if (!root) return;
  const fields = [
    ["FRUS Volume", "1989-1992, XXIX"],
    ["Official Status", data.volume.status],
    ["Mode", data.volume.compilerMode],
    ["Checked", data.volume.statusChecked]
  ];
  root.replaceChildren(
    ...fields.map(([label, value]) =>
      make("div", {}, [make("dt", { text: label }), make("dd", { text: value })])
    )
  );
}

function initStats() {
  const ids = {
    "#stat-lanes": data.lanes.length,
    "#stat-records": data.records.length,
    "#stat-sources": data.sourcePools.length,
    "#stat-gaps": data.gaps.length,
    "#stat-persons": data.persons.length,
    "#stat-references": data.references.length
  };
  for (const [selector, value] of Object.entries(ids)) {
    const node = qs(selector);
    if (node) node.textContent = String(value);
  }
}

function renderWorkbench() {
  const root = qs("#workbench-root");
  if (!root) return;

  const criticalGaps = data.gaps.filter((gap) => gap.priority === "Critical").length;
  const highPriorityRecords = data.records.filter((record) =>
    ["Critical", "High"].includes(record.priority)
  ).length;
  const sourceActions = data.sourcePools.filter((pool) =>
    ["Critical", "High"].includes(pool.priority)
  ).length;

  const metrics = make("div", { className: "metric-row" }, [
    metric("Planned", "Official status", "HistoryAtState production stage"),
    metric(String(highPriorityRecords), "priority records", "Critical and high-priority seed leads"),
    metric(String(sourceActions), "source actions", "Critical and high-priority source pools"),
    metric(String(criticalGaps), "critical gaps", "Must resolve before stable document numbering")
  ]);

  const queueList = data.gaps
    .slice()
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority))
    .slice(0, 5)
    .map((gap) =>
      make("li", {}, [
        make("strong", { text: `${gap.priority}: ${gap.problem}` }),
        make("span", { text: ` ${laneFor(gap.laneId).shortName}` })
      ])
    );

  const topSources = data.sourcePools
    .slice()
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority))
    .slice(0, 5)
    .map((pool) =>
      make("li", {}, [
        make("strong", { text: pool.name }),
        make("span", { text: ` - ${pool.nextAction}` })
      ])
    );

  const quickButtons = data.lanes.map((lane) =>
    make(
      "button",
      {
        type: "button",
        onClick: () => {
          setLaneFilter("#chronology-lane", lane.id);
          scrollToId("#chronology");
        }
      },
      lane.shortName
    )
  );

  const checklist = data.reviewChecklist.map((item) => make("li", { text: item }));

  root.replaceChildren(
    metrics,
    make("div", { className: "workbench-grid" }, [
      make("article", { className: "panel panel-wide" }, [
        make("p", { className: "kicker", text: "Volume Status" }),
        make("h3", { text: "Planned-volume control" }),
        make("p", {
          text:
            "The assistant treats Volume XXIX as a planned workbench. It keeps official status, source leads, public anchors, and inferred chapter structure visibly separate."
        }),
        make("dl", { className: "metric-list" }, [
          make("div", {}, [make("dt", { text: "Official title" }), make("dd", { text: "Global Issues" })]),
          make("div", {}, [make("dt", { text: "Status" }), make("dd", { text: data.volume.status })]),
          make("div", {}, [make("dt", { text: "Primary risk" }), make("dd", { text: "Scope boundaries" })]),
          make("div", {}, [make("dt", { text: "Next action" }), make("dd", { text: "Harvest source pools" })])
        ])
      ]),
      make("article", { className: "panel" }, [
        make("p", { className: "kicker", text: "Critical Queue" }),
        make("h3", { text: "Open compiler gaps" }),
        make("ul", { className: "compact-list" }, queueList)
      ]),
      make("article", { className: "panel" }, [
        make("p", { className: "kicker", text: "Source Queue" }),
        make("h3", { text: "Next harvest targets" }),
        make("ul", { className: "compact-list" }, topSources)
      ]),
      make("article", { className: "panel" }, [
        make("p", { className: "kicker", text: "Quick Filters" }),
        make("h3", { text: "Open chapter records" }),
        make("div", { className: "quick-filter-grid" }, quickButtons)
      ]),
      make("article", { className: "panel panel-wide" }, [
        make("p", { className: "kicker", text: "Selection Standard" }),
        make("h3", { text: "Promote leads only after source-note control" }),
        make("ul", { className: "check-list" }, checklist)
      ])
    ])
  );
}

function metric(value, label, caption) {
  return make("div", { className: "metric" }, [
    make("strong", { text: value }),
    make("span", { text: label }),
    make("p", { text: caption })
  ]);
}

function renderLanes() {
  const root = qs("#lane-grid");
  if (!root) return;
  const cards = data.lanes.map((lane) => {
    const records = data.records.filter((record) => record.laneId === lane.id).length;
    const gaps = data.gaps.filter((gap) => gap.laneId === lane.id).length;
    const pools = data.sourcePools.filter((pool) => pool.laneId === lane.id).length;
    return make("article", { className: "lane-card", style: `border-top-color: ${lane.color}` }, [
      make("p", { className: "lane-number", text: lane.number }),
      make("h3", { text: lane.name }),
      make("p", { text: lane.description }),
      make("p", {}, [make("strong", { text: "Boundary: " }), lane.boundary]),
      make("div", { className: "tag-list" }, lane.searchTerms.map((term) => pill(term))),
      make("div", { className: "lane-footer" }, [
        make("span", { className: "count-pill", text: `${records} records / ${pools} pools / ${gaps} gaps` }),
        make(
          "button",
          {
            type: "button",
            onClick: () => {
              setLaneFilter("#chronology-lane", lane.id);
              scrollToId("#chronology");
            }
          },
          "View"
        )
      ])
    ]);
  });
  root.replaceChildren(...cards);
}

function renderAttention() {
  const root = qs("#attention-root");
  if (!root) return;
  const rows = data.publicAttention || [];
  if (!rows.length) {
    root.replaceChildren(make("p", { className: "empty", text: "No public-attention audit data is loaded." }));
    return;
  }

  root.replaceChildren(
    ...rows.map((row) => {
      const lane = laneFor(row.laneId);
      return make("article", { className: "attention-card", style: `border-top-color: ${lane.color}` }, [
        make("p", { className: "meta-line", text: `${lane.number} - ${row.directness}` }),
        make("h3", { text: lane.name }),
        make("div", { className: "tag-list" }, [
          statusPill(row.attention),
          pill(`${row.hitDocuments} hits`),
          pill(`${row.strongHits} strong`)
        ]),
        make("p", { className: "attention-note", text: row.note }),
        make("p", {}, [
          make("strong", { text: "Best public evidence: " }),
          `${formatDate(row.evidenceDate)} - ${row.evidenceTitle}`
        ]),
        make("div", { className: "small-actions" }, [
          make("a", { className: "button ghost", href: row.evidenceUrl, rel: "noreferrer" }, "Evidence"),
          make("a", { className: "button ghost", href: row.reportUrl, rel: "noreferrer" }, "Report"),
          make("a", { className: "button ghost", href: row.naraScoutUrl, rel: "noreferrer" }, "NARA Scout")
        ])
      ]);
    })
  );
}

function currentChronologyFilters() {
  return {
    query: qs("#chronology-search")?.value || "",
    lane: qs("#chronology-lane")?.value || "",
    status: qs("#chronology-status")?.value || ""
  };
}

function renderChronology() {
  const filters = currentChronologyFilters();
  const rows = data.records
    .filter(
      (record) =>
        matchesQuery(record, filters.query) &&
        (!filters.lane || record.laneId === filters.lane) &&
        (!filters.status || record.status === filters.status)
    )
    .sort((a, b) => a.date.localeCompare(b.date) || laneName(a.laneId).localeCompare(laneName(b.laneId)));

  state.visibleChronology = rows;

  const summary = qs("#chronology-summary");
  if (summary) {
    const chapterText = filters.lane ? ` in ${laneName(filters.lane)}` : "";
    summary.textContent = `Showing ${rows.length} of ${data.records.length} chronology items${chapterText}.`;
  }

  const root = qs("#chronology-root");
  if (!root) return;
  if (!rows.length) {
    root.replaceChildren(make("p", { className: "empty", text: "No chronology items match the current filters." }));
    return;
  }

  root.replaceChildren(...rows.map(renderChronologyItem));
}

function renderChronologyItem(record) {
  const lane = laneFor(record.laneId);
  return make("article", { className: "chronology-item", style: `--lane-color: ${lane.color}` }, [
    make("div", { className: "chronology-date" }, [
      make("strong", { text: formatDate(record.date) }),
      make("span", { text: lane.shortName })
    ]),
    make("div", { className: "chronology-body" }, [
      make("p", { className: "meta-line", text: `${record.type} - ${record.repository}` }),
      make("h3", { text: record.title }),
      make("div", { className: "tag-list" }, [
        priorityPill(record.priority),
        statusPill(record.status),
        pill(lane.name),
        ...record.tags.slice(0, 5).map((tag) => pill(tag))
      ]),
      make("p", {}, [make("strong", { text: "Compiler use: " }), record.compilerUse]),
      make("p", {}, [make("strong", { text: "People: " }), record.people.join("; ")]),
      make("p", { className: "source-note", text: record.sourceNote }),
      make("div", { className: "small-actions" }, [
        make("button", { type: "button", onClick: () => copyText(record.sourceNote, "Source note copied") }, "Copy Note"),
        make("a", { className: "button ghost", href: record.sourceUrl, rel: "noreferrer" }, "Open Source"),
        make(
          "button",
          {
            type: "button",
            onClick: () => {
              setLaneFilter("#record-lane", record.laneId);
              scrollToId("#records");
            }
          },
          "Records"
        )
      ])
    ])
  ]);
}

function setupFilters() {
  populateSelect(
    qs("#chronology-lane"),
    data.lanes.map((lane) => lane.id),
    "All chapters",
    laneName
  );
  populateSelect(qs("#chronology-status"), uniqueValues(data.records, "status"), "All statuses");

  populateSelect(
    qs("#record-lane"),
    data.lanes.map((lane) => lane.id),
    "All chapters",
    laneName
  );
  populateSelect(qs("#record-type"), uniqueValues(data.records, "type"), "All types");
  populateSelect(qs("#record-priority"), uniqueValues(data.records, "priority"), "All priorities");
  populateSelect(qs("#record-status"), uniqueValues(data.records, "status"), "All statuses");

  populateSelect(
    qs("#person-lane"),
    data.lanes.map((lane) => lane.id),
    "All chapters",
    laneName
  );

  populateSelect(
    qs("#pool-lane"),
    data.lanes.map((lane) => lane.id),
    "All chapters",
    laneName
  );
  populateSelect(qs("#pool-priority"), uniqueValues(data.sourcePools, "priority"), "All priorities");

  populateSelect(
    qs("#gap-lane"),
    data.lanes.map((lane) => lane.id),
    "All chapters",
    laneName
  );
  populateSelect(qs("#gap-priority"), uniqueValues(data.gaps, "priority"), "All priorities");
  populateSelect(qs("#gap-status"), uniqueValues(data.gaps, "status"), "All statuses");

  populateSelect(
    qs("#reference-lane"),
    data.lanes.map((lane) => lane.id),
    "All chapters",
    laneName
  );
  populateSelect(qs("#reference-kind"), uniqueValues(data.references, "kind"), "All kinds");

  bindFilterGroup(["#chronology-search", "#chronology-lane", "#chronology-status"], renderChronology);
  bindFilterGroup(["#record-search", "#record-lane", "#record-type", "#record-priority", "#record-status", "#record-sort"], renderRecords);
  bindFilterGroup(["#person-search", "#person-lane"], renderPersons);
  bindFilterGroup(["#pool-search", "#pool-lane", "#pool-priority"], renderPools);
  bindFilterGroup(["#gap-search", "#gap-lane", "#gap-priority", "#gap-status"], renderGaps);
  bindFilterGroup(["#reference-search", "#reference-lane", "#reference-kind"], renderReferences);

  qs("#chronology-reset")?.addEventListener("click", () => resetControls(["#chronology-search", "#chronology-lane", "#chronology-status"], renderChronology));
  qs("#record-reset")?.addEventListener("click", () => resetControls(["#record-search", "#record-lane", "#record-type", "#record-priority", "#record-status", "#record-sort"], renderRecords, { "#record-sort": "date" }));
  qs("#person-reset")?.addEventListener("click", () => resetControls(["#person-search", "#person-lane"], renderPersons));
  qs("#pool-reset")?.addEventListener("click", () => resetControls(["#pool-search", "#pool-lane", "#pool-priority"], renderPools));
  qs("#gap-reset")?.addEventListener("click", () => resetControls(["#gap-search", "#gap-lane", "#gap-priority", "#gap-status"], renderGaps));
  qs("#reference-reset")?.addEventListener("click", () => resetControls(["#reference-search", "#reference-lane", "#reference-kind"], renderReferences));

  qs("#chronology-export")?.addEventListener("click", exportChronology);
  qs("#record-export")?.addEventListener("click", exportRecords);
  qs("#person-export")?.addEventListener("click", exportPersons);
  qs("#pool-export")?.addEventListener("click", exportPools);
  qs("#gap-export")?.addEventListener("click", exportGaps);
  qs("#reference-export")?.addEventListener("click", exportReferences);
}

function bindFilterGroup(selectors, render) {
  for (const selector of selectors) {
    const control = qs(selector);
    if (!control) continue;
    const eventName = control.tagName === "INPUT" ? "input" : "change";
    control.addEventListener(eventName, render);
  }
}

function resetControls(selectors, render, defaults = {}) {
  for (const selector of selectors) {
    const control = qs(selector);
    if (!control) continue;
    control.value = defaults[selector] ?? "";
  }
  render();
}

function currentRecordFilters() {
  return {
    query: qs("#record-search")?.value || "",
    lane: qs("#record-lane")?.value || "",
    type: qs("#record-type")?.value || "",
    priority: qs("#record-priority")?.value || "",
    status: qs("#record-status")?.value || "",
    sort: qs("#record-sort")?.value || "date"
  };
}

function renderRecords() {
  const filters = currentRecordFilters();
  let rows = data.records.filter(
    (record) =>
      matchesQuery(record, filters.query) &&
      (!filters.lane || record.laneId === filters.lane) &&
      (!filters.type || record.type === filters.type) &&
      (!filters.priority || record.priority === filters.priority) &&
      (!filters.status || record.status === filters.status)
  );

  rows = sortRecords(rows, filters.sort);
  state.visibleRecords = rows;

  const summary = qs("#record-summary");
  if (summary) {
    const chapterText = filters.lane ? ` in ${laneName(filters.lane)}` : "";
    summary.textContent = `Showing ${rows.length} of ${data.records.length} records${chapterText}.`;
  }

  const root = qs("#record-root");
  if (!root) return;
  if (!rows.length) {
    root.replaceChildren(make("p", { className: "empty", text: "No records match the current filters." }));
    return;
  }

  root.replaceChildren(...rows.map(renderRecordCard));
}

function sortRecords(rows, sortKey) {
  const copy = rows.slice();
  if (sortKey === "priority") {
    return copy.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.date.localeCompare(b.date));
  }
  if (sortKey === "lane") {
    return copy.sort((a, b) => laneName(a.laneId).localeCompare(laneName(b.laneId)) || a.date.localeCompare(b.date));
  }
  if (sortKey === "type") {
    return copy.sort((a, b) => a.type.localeCompare(b.type) || a.date.localeCompare(b.date));
  }
  return copy.sort((a, b) => a.date.localeCompare(b.date));
}

function renderRecordCard(record) {
  const lane = laneFor(record.laneId);
  return make("article", { className: "record-card" }, [
    make("div", { className: "record-main" }, [
      make("p", { className: "meta-line", text: `${formatDate(record.date)} - ${lane.name}` }),
      make("h3", { text: record.title }),
      make("div", { className: "tag-list" }, [
        priorityPill(record.priority),
        statusPill(record.status),
        pill(record.type),
        ...record.tags.slice(0, 6).map((tag) => pill(tag))
      ]),
      make("p", {}, [make("strong", { text: "Compiler use: " }), record.compilerUse]),
      make("p", {}, [make("strong", { text: "Boundary: " }), record.boundaryNotes]),
      make("p", { className: "source-note", text: record.sourceNote })
    ]),
    make("aside", { className: "record-side" }, [
      make("div", {}, [
        make("p", { className: "card-meta", text: "People" }),
        make("p", { text: record.people.join("; ") })
      ]),
      make("div", {}, [
        make("p", { className: "card-meta", text: "Repository" }),
        make("p", { text: record.repository })
      ]),
      make("div", {}, [
        make("p", { className: "card-meta", text: "Verification" }),
        make("ul", { className: "compact-list" }, record.verification.map((item) => make("li", { text: item })))
      ]),
      make("div", { className: "small-actions" }, [
        make("button", { type: "button", onClick: () => copyText(record.sourceNote, "Source note copied") }, "Copy Note"),
        make("a", { className: "button ghost", href: record.sourceUrl, rel: "noreferrer" }, "Open Source")
      ])
    ])
  ]);
}

function renderPersons() {
  const query = qs("#person-search")?.value || "";
  const lane = qs("#person-lane")?.value || "";
  const rows = data.persons
    .filter((person) => matchesQuery(person, query) && (!lane || person.lanes.includes(lane)))
    .sort((a, b) => a.name.localeCompare(b.name));
  state.visiblePersons = rows;

  const summary = qs("#person-summary");
  if (summary) summary.textContent = `Showing ${rows.length} of ${data.persons.length} people.`;

  const root = qs("#person-root");
  if (!root) return;
  if (!rows.length) {
    root.replaceChildren(make("p", { className: "empty", text: "No people match the current filters." }));
    return;
  }

  root.replaceChildren(
    ...rows.map((person) =>
      make("article", { className: "person-card" }, [
        make("h3", { text: person.name }),
        make("p", { text: person.role }),
        make("div", { className: "tag-list" }, person.lanes.map((laneId) => pill(laneFor(laneId).shortName))),
        make("p", {}, [make("strong", { text: "Terms: " }), person.terms.join("; ")]),
        make("p", {}, [make("strong", { text: "Compiler check: " }), person.compilerCheck])
      ])
    )
  );
}

function renderPools() {
  const query = qs("#pool-search")?.value || "";
  const lane = qs("#pool-lane")?.value || "";
  const priority = qs("#pool-priority")?.value || "";
  const rows = data.sourcePools
    .filter(
      (pool) =>
        matchesQuery(pool, query) &&
        (!lane || pool.laneId === lane) &&
        (!priority || pool.priority === priority)
    )
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.name.localeCompare(b.name));
  state.visiblePools = rows;

  const summary = qs("#pool-summary");
  if (summary) summary.textContent = `Showing ${rows.length} of ${data.sourcePools.length} source pools.`;

  const root = qs("#pool-root");
  if (!root) return;
  if (!rows.length) {
    root.replaceChildren(make("p", { className: "empty", text: "No source pools match the current filters." }));
    return;
  }

  root.replaceChildren(...rows.map(renderPoolCard));
}

function renderPoolCard(pool) {
  return make("article", { className: "source-card" }, [
    make("p", { className: "meta-line", text: laneName(pool.laneId) }),
    make("h3", { text: pool.name }),
    make("div", { className: "tag-list" }, [priorityPill(pool.priority), ...pool.terms.slice(0, 5).map((term) => pill(term))]),
    make("p", {}, [make("strong", { text: "Repository: " }), pool.repository]),
    make("p", {}, [make("strong", { text: "Coverage: " }), pool.coverage]),
    make("p", {}, [make("strong", { text: "Next action: " }), pool.nextAction]),
    make("div", { className: "small-actions" }, [
      make("button", { type: "button", onClick: () => copyText(pool.terms.join(" OR "), "Search terms copied") }, "Copy Terms"),
      make("a", { className: "button ghost", href: pool.url, rel: "noreferrer" }, "Open")
    ])
  ]);
}

function renderGaps() {
  const query = qs("#gap-search")?.value || "";
  const lane = qs("#gap-lane")?.value || "";
  const priority = qs("#gap-priority")?.value || "";
  const status = qs("#gap-status")?.value || "";
  const rows = data.gaps
    .filter(
      (gap) =>
        matchesQuery(gap, query) &&
        (!lane || gap.laneId === lane) &&
        (!priority || gap.priority === priority) &&
        (!status || gap.status === status)
    )
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.problem.localeCompare(b.problem));
  state.visibleGaps = rows;

  const summary = qs("#gap-summary");
  if (summary) summary.textContent = `Showing ${rows.length} of ${data.gaps.length} compiler gaps.`;

  const root = qs("#gap-root");
  if (!root) return;
  if (!rows.length) {
    root.replaceChildren(make("p", { className: "empty", text: "No compiler gaps match the current filters." }));
    return;
  }

  root.replaceChildren(
    ...rows.map((gap) =>
      make("article", { className: "gap-card" }, [
        make("p", { className: "meta-line", text: laneName(gap.laneId) }),
        make("h3", { text: gap.problem }),
        make("div", { className: "tag-list" }, [priorityPill(gap.priority), statusPill(gap.status)]),
        make("p", {}, [make("strong", { text: "Evidence: " }), gap.evidence]),
        make("p", {}, [make("strong", { text: "Action: " }), gap.action]),
        make("p", {}, [make("strong", { text: "Risk: " }), gap.risk]),
        make("div", { className: "small-actions" }, [
          make("button", { type: "button", onClick: () => copyText(gap.action, "Gap action copied") }, "Copy Action"),
          make(
            "button",
            {
              type: "button",
              onClick: () => {
                setLaneFilter("#pool-lane", gap.laneId);
                scrollToId("#source-pools");
              }
            },
            "Open Pools"
          )
        ])
      ])
    )
  );
}

function renderReferences() {
  const query = qs("#reference-search")?.value || "";
  const lane = qs("#reference-lane")?.value || "";
  const kind = qs("#reference-kind")?.value || "";
  const rows = data.references
    .filter(
      (reference) =>
        matchesQuery(reference, query) &&
        (!lane || reference.laneId === lane) &&
        (!kind || reference.kind === kind)
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  state.visibleReferences = rows;

  const summary = qs("#reference-summary");
  if (summary) summary.textContent = `Showing ${rows.length} of ${data.references.length} public/source anchors.`;

  const root = qs("#reference-root");
  if (!root) return;
  if (!rows.length) {
    root.replaceChildren(make("p", { className: "empty", text: "No references match the current filters." }));
    return;
  }

  root.replaceChildren(
    ...rows.map((reference) =>
      make("article", { className: "reference-card" }, [
        make("p", { className: "meta-line", text: `${formatDate(reference.date)} - ${laneFor(reference.laneId).shortName}` }),
        make("h3", { text: reference.title }),
        make("div", { className: "tag-list" }, [pill(reference.kind)]),
        make("p", { text: reference.compilerUse }),
        make("div", { className: "small-actions" }, [
          make("button", { type: "button", onClick: () => copyText(reference.url, "Reference URL copied") }, "Copy URL"),
          make("a", { className: "button ghost", href: reference.url, rel: "noreferrer" }, "Open")
        ])
      ])
    )
  );

  renderPrecedents();
}

function renderPrecedents() {
  const root = qs("#precedent-root");
  if (!root) return;
  root.replaceChildren(
    ...data.precedents.map((precedent) =>
      make("article", { className: "precedent-card" }, [
        make("h3", { text: precedent.volume }),
        make("div", { className: "tag-list" }, [statusPill(precedent.status)]),
        make("p", { text: precedent.use }),
        make("a", { className: "button ghost", href: precedent.url, rel: "noreferrer" }, "Open")
      ])
    )
  );
}

function buildReviewItems() {
  const gapItems = data.gaps.map((gap) => ({
    id: `gap:${gap.id}`,
    kind: "Gap",
    laneId: gap.laneId,
    priority: gap.priority,
    title: gap.problem,
    detail: gap.action
  }));
  const recordItems = data.records
    .filter((record) => ["Critical", "High"].includes(record.priority))
    .map((record) => ({
      id: `record:${record.id}`,
      kind: "Record",
      laneId: record.laneId,
      priority: record.priority,
      title: record.title,
      detail: record.compilerUse
    }));
  const poolItems = data.sourcePools
    .filter((pool) => ["Critical", "High"].includes(pool.priority))
    .map((pool) => ({
      id: `pool:${pool.id}`,
      kind: "Source pool",
      laneId: pool.laneId,
      priority: pool.priority,
      title: pool.name,
      detail: pool.nextAction
    }));

  return [...gapItems, ...recordItems, ...poolItems].sort(
    (a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.kind.localeCompare(b.kind)
  );
}

function renderReview() {
  const root = qs("#review-root");
  if (!root) return;
  const items = buildReviewItems();
  const reviewed = reviewedItems();
  const done = items.filter((item) => reviewed.has(item.id)).length;
  const open = items.length - done;

  const metrics = make("div", { className: "review-metrics" }, [
    metric(String(items.length), "review items", "Gaps, priority records, and priority source pools"),
    metric(String(open), "open", "Not marked done in this browser"),
    metric(String(done), "done", "Stored in local browser state")
  ]);

  const controls = make("div", { className: "button-row" }, [
    make("button", { type: "button", onClick: exportReview }, "Export Review CSV"),
    make(
      "button",
      {
        type: "button",
        onClick: () => {
          localStorage.removeItem(storageKeys.reviewed);
          renderReview();
          showToast("Review state cleared");
        }
      },
      "Clear Review State"
    )
  ]);

  const list = make(
    "div",
    { className: "review-list" },
    items.map((item) => {
      const isDone = reviewed.has(item.id);
      return make("article", { className: `review-item ${isDone ? "done" : ""}`.trim() }, [
        make("div", {}, [
          make("p", { className: "meta-line", text: `${item.kind} - ${laneFor(item.laneId).shortName}` }),
          make("h3", { text: item.title }),
          make("div", { className: "tag-list" }, [priorityPill(item.priority), isDone ? statusPill("Done") : statusPill("Open")]),
          make("p", { text: item.detail })
        ]),
        make("button", { type: "button", onClick: () => toggleReviewed(item.id) }, isDone ? "Reopen" : "Mark Done")
      ]);
    })
  );

  root.replaceChildren(metrics, controls, list);
}

function initScratchpad() {
  const textarea = qs("#scratchpad");
  if (!textarea) return;
  textarea.value = localStorage.getItem(storageKeys.scratchpad) || "";

  qs("#scratchpad-save")?.addEventListener("click", () => {
    localStorage.setItem(storageKeys.scratchpad, textarea.value);
    showToast("Scratchpad saved locally");
  });

  qs("#scratchpad-export")?.addEventListener("click", () => {
    downloadText("frus-v29-scratchpad.txt", textarea.value);
  });

  qs("#scratchpad-clear")?.addEventListener("click", () => {
    textarea.value = "";
    localStorage.removeItem(storageKeys.scratchpad);
    showToast("Scratchpad cleared");
  });

  textarea.addEventListener("input", () => {
    localStorage.setItem(storageKeys.scratchpad, textarea.value);
  });
}

function renderQueryPack() {
  const root = qs("#query-pack-root");
  if (!root) return;
  const rows = data.lanes.map((lane) => {
    const query = lane.searchTerms.map((term) => `"${term}"`).join(" OR ");
    const catalogUrl = `https://catalog.archives.gov/search?q=${encodeURIComponent(query + " Bush 1989 1992")}`;
    return make("div", { className: "query-row" }, [
      make("strong", { text: lane.name }),
      make("code", { text: query }),
      make("div", { className: "small-actions" }, [
        make("button", { type: "button", onClick: () => copyText(query, "Query copied") }, "Copy"),
        make("a", { className: "button ghost", href: catalogUrl, rel: "noreferrer" }, "Catalog")
      ])
    ]);
  });
  root.replaceChildren(...rows);
}

function renderSourceLinks() {
  const root = qs("#source-link-root");
  if (!root) return;
  root.replaceChildren(
    ...data.sourceLinks.map((link) =>
      make("article", { className: "source-link-card" }, [
        make("h3", { text: link.label }),
        make("p", { text: link.note }),
        make("a", { className: "button ghost", href: link.url, rel: "noreferrer" }, "Open Source")
      ])
    )
  );
}

function exportRecords() {
  downloadCsv("frus-v29-records.csv", state.visibleRecords, [
    { label: "id", value: (row) => row.id },
    { label: "date", value: (row) => row.date },
    { label: "title", value: (row) => row.title },
    { label: "chapter", value: (row) => laneName(row.laneId) },
    { label: "type", value: (row) => row.type },
    { label: "priority", value: (row) => row.priority },
    { label: "status", value: (row) => row.status },
    { label: "people", value: (row) => row.people },
    { label: "source_url", value: (row) => row.sourceUrl },
    { label: "source_note", value: (row) => row.sourceNote },
    { label: "compiler_use", value: (row) => row.compilerUse },
    { label: "boundary_notes", value: (row) => row.boundaryNotes }
  ]);
}

function exportChronology() {
  downloadCsv("frus-v29-declassified-document-chronology.csv", state.visibleChronology, [
    { label: "date", value: (row) => row.date },
    { label: "title", value: (row) => row.title },
    { label: "chapter", value: (row) => laneName(row.laneId) },
    { label: "type", value: (row) => row.type },
    { label: "status", value: (row) => row.status },
    { label: "priority", value: (row) => row.priority },
    { label: "people", value: (row) => row.people },
    { label: "repository", value: (row) => row.repository },
    { label: "source_url", value: (row) => row.sourceUrl },
    { label: "source_note", value: (row) => row.sourceNote },
    { label: "compiler_use", value: (row) => row.compilerUse }
  ]);
}

function exportPersons() {
  downloadCsv("frus-v29-persons.csv", state.visiblePersons, [
    { label: "name", value: (row) => row.name },
    { label: "role", value: (row) => row.role },
    { label: "chapters", value: (row) => row.lanes.map(laneName) },
    { label: "terms", value: (row) => row.terms },
    { label: "compiler_check", value: (row) => row.compilerCheck }
  ]);
}

function exportPools() {
  downloadCsv("frus-v29-source-pools.csv", state.visiblePools, [
    { label: "id", value: (row) => row.id },
    { label: "name", value: (row) => row.name },
    { label: "chapter", value: (row) => laneName(row.laneId) },
    { label: "repository", value: (row) => row.repository },
    { label: "priority", value: (row) => row.priority },
    { label: "coverage", value: (row) => row.coverage },
    { label: "next_action", value: (row) => row.nextAction },
    { label: "terms", value: (row) => row.terms },
    { label: "url", value: (row) => row.url }
  ]);
}

function exportGaps() {
  downloadCsv("frus-v29-compiler-gaps.csv", state.visibleGaps, [
    { label: "id", value: (row) => row.id },
    { label: "chapter", value: (row) => laneName(row.laneId) },
    { label: "priority", value: (row) => row.priority },
    { label: "status", value: (row) => row.status },
    { label: "problem", value: (row) => row.problem },
    { label: "evidence", value: (row) => row.evidence },
    { label: "action", value: (row) => row.action },
    { label: "risk", value: (row) => row.risk },
    { label: "source_pools", value: (row) => row.sourcePools }
  ]);
}

function exportReferences() {
  downloadCsv("frus-v29-public-references.csv", state.visibleReferences, [
    { label: "id", value: (row) => row.id },
    { label: "date", value: (row) => row.date },
    { label: "title", value: (row) => row.title },
    { label: "kind", value: (row) => row.kind },
    { label: "chapter", value: (row) => laneName(row.laneId) },
    { label: "url", value: (row) => row.url },
    { label: "compiler_use", value: (row) => row.compilerUse }
  ]);
}

function exportReview() {
  const reviewed = reviewedItems();
  downloadCsv("frus-v29-review-queue.csv", buildReviewItems(), [
    { label: "id", value: (row) => row.id },
    { label: "kind", value: (row) => row.kind },
    { label: "chapter", value: (row) => laneName(row.laneId) },
    { label: "priority", value: (row) => row.priority },
    { label: "state", value: (row) => (reviewed.has(row.id) ? "done" : "open") },
    { label: "title", value: (row) => row.title },
    { label: "detail", value: (row) => row.detail }
  ]);
}

function init() {
  initVolumeScope();
  initStats();
  renderWorkbench();
  renderLanes();
  renderAttention();
  setupFilters();
  renderChronology();
  renderRecords();
  renderPersons();
  renderPools();
  renderGaps();
  renderReferences();
  renderReview();
  initScratchpad();
  renderQueryPack();
  renderSourceLinks();
}

document.addEventListener("DOMContentLoaded", init);
