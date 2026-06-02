(() => {
  const data = window.GLOBAL_ISSUES_DATA;
  if (!data) return;

  const laneById = new Map((data.lanes || []).map((lane) => [lane.id, lane]));
  const scoutBase = "https://therealjameswilson.github.io/nara-scout/";
  const excludedPools = new Set(["pool-precedents"]);
  const current = {
    query: "",
    lane: "",
    kind: "",
    priority: ""
  };
  let visibleRows = [];

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function make(tag, attrs = {}, children = []) {
    const element = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value === undefined || value === null) continue;
      if (key === "className") element.className = value;
      else if (key === "text") element.textContent = value;
      else if (key.startsWith("on") && typeof value === "function") element.addEventListener(key.slice(2).toLowerCase(), value);
      else element.setAttribute(key, value);
    }
    for (const child of Array.isArray(children) ? children : [children]) {
      if (child === undefined || child === null) continue;
      element.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return element;
  }

  function laneFor(id) {
    return laneById.get(id) || { id, name: "Unassigned", shortName: "Unassigned", color: "#5c6967" };
  }

  function priorityRank(priority) {
    return { Critical: 0, High: 1, Medium: 2, Low: 3 }[priority] ?? 4;
  }

  function queryText(terms = []) {
    return [...new Set(terms.filter(Boolean).map((term) => String(term).trim()).filter(Boolean))]
      .map((term) => (/\s/.test(term) ? `"${term}"` : term))
      .join(" OR ");
  }

  function scoutUrl(query) {
    return `${scoutBase}#q=${encodeURIComponent(query)}&from=1989&to=1993&scope=bush41&perColl=25&perPage=50`;
  }

  function textIndex(value) {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return value.map(textIndex).join(" ");
    if (typeof value === "object") return Object.values(value).map(textIndex).join(" ");
    return String(value);
  }

  function copyText(text, message) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast(message)).catch(() => fallbackCopy(text, message));
    } else {
      fallbackCopy(text, message);
    }
  }

  function fallbackCopy(text, message) {
    const textarea = make("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    showToast(message);
  }

  function showToast(message) {
    const toast = qs("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    window.setTimeout(() => toast.classList.remove("visible"), 1800);
  }

  function csvEscape(value) {
    const normalized = Array.isArray(value) ? value.join("; ") : value ?? "";
    return `"${String(normalized).replaceAll('"', '""')}"`;
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

  function buildRows() {
    const rows = [];
    for (const lane of data.lanes || []) {
      const query = queryText([...(lane.searchTerms || []), "Bush", "1989", "1992"]);
      rows.push({
        id: `lane-${lane.id}`,
        laneId: lane.id,
        kind: "Chapter terms",
        priority: "High",
        title: `${lane.shortName || lane.name} chapter query`,
        query,
        url: scoutUrl(query),
        action: `Run the chapter search first, then route file units against: ${(lane.sourceTargets || []).join("; ")}.`,
        note: lane.boundary || lane.description || "",
        capture: "result count; top NAIDs; file units; item dates; source path; disposition"
      });
    }

    for (const item of data.publicAttention || []) {
      const lane = laneFor(item.laneId);
      const query = queryText([item.evidenceTitle, ...(lane.searchTerms || []).slice(0, 4)]);
      rows.push({
        id: `attention-${item.laneId}`,
        laneId: item.laneId,
        kind: "Public anchor",
        priority: /high/i.test(item.attention || "") ? "Critical" : "High",
        title: `${lane.shortName || lane.name} public-attention backtrace`,
        query,
        url: item.naraScoutUrl || scoutUrl(query),
        action: "Backtrace the public statement to drafts, clearance memoranda, briefing books, and policy files.",
        note: item.note || item.evidenceTitle || "",
        capture: "public anchor; matching internal record; classification; source note; boundary decision"
      });
    }

    for (const pool of (data.sourcePools || []).filter((row) => !excludedPools.has(row.id))) {
      const query = queryText([...(pool.terms || []), pool.name, "Bush"]);
      rows.push({
        id: `pool-${pool.id}`,
        laneId: pool.laneId,
        kind: "Source pool",
        priority: pool.priority || "Medium",
        title: pool.name,
        query,
        url: scoutUrl(query),
        action: pool.nextAction || "Run source-pool search and capture requestable identifiers.",
        note: pool.coverage || pool.repository || "",
        capture: "repository; file unit; item title; date span; restriction status; next request"
      });
    }

    for (const record of (data.records || []).filter((row) => ["Critical", "High"].includes(row.priority))) {
      const query = queryText([record.title, ...(record.people || []), ...(record.tags || [])].filter(Boolean).slice(0, 6));
      rows.push({
        id: `record-${record.id}`,
        laneId: record.laneId,
        kind: "Record follow-up",
        priority: record.priority || "High",
        title: record.title,
        query,
        url: scoutUrl(query),
        action: "Use this lead to locate surrounding memoranda, attachments, no-document markers, and source-note controls.",
        note: record.compilerUse || record.sourceNote || "",
        capture: "related file units; adjacent records; attachments; date control; final source note"
      });
    }

    return rows.sort(
      (a, b) =>
        priorityRank(a.priority) - priorityRank(b.priority) ||
        a.kind.localeCompare(b.kind) ||
        laneFor(a.laneId).name.localeCompare(laneFor(b.laneId).name) ||
        a.title.localeCompare(b.title)
    );
  }

  const allRows = buildRows();

  function filteredRows() {
    return allRows.filter((row) => {
      if (current.query && !textIndex(row).toLowerCase().includes(current.query.toLowerCase())) return false;
      if (current.lane && row.laneId !== current.lane) return false;
      if (current.kind && row.kind !== current.kind) return false;
      if (current.priority && row.priority !== current.priority) return false;
      return true;
    });
  }

  function metric(value, label, detail) {
    return make("article", { className: "metric-card" }, [
      make("strong", { text: value }),
      make("span", { text: label }),
      make("p", { text: detail })
    ]);
  }

  function renderCard(row) {
    const lane = laneFor(row.laneId);
    return make("article", { className: "scout-card", style: `--lane-color: ${lane.color}` }, [
      make("div", { className: "scout-card-main" }, [
        make("div", { className: "tag-list" }, [
          make("span", { className: "priority", text: row.priority }),
          make("span", { className: "tag", text: row.kind }),
          make("span", { className: "tag", text: lane.shortName || lane.name })
        ]),
        make("h4", { text: row.title }),
        make("code", { className: "scout-query", text: row.query }),
        make("p", { className: "scout-action", text: row.action })
      ]),
      make("aside", { className: "scout-card-side" }, [
        make("p", { className: "scout-note", text: row.note }),
        make("p", { className: "scout-note", text: `Capture: ${row.capture}` }),
        make("div", { className: "scout-actions" }, [
          make("button", { type: "button", onClick: () => copyText(row.query, "Scout query copied") }, "Copy Query"),
          make("button", { type: "button", onClick: () => copyText(scoutMemo(row), "Scout packet copied") }, "Copy Packet"),
          make("a", { className: "button ghost", href: row.url, rel: "noreferrer" }, "Open Scout")
        ])
      ])
    ]);
  }

  function scoutMemo(row) {
    const lane = laneFor(row.laneId);
    return [
      "FRUS Volume XXIX NARA Scout query packet",
      `Chapter: ${lane.name}`,
      `Kind: ${row.kind}`,
      `Priority: ${row.priority}`,
      `Title: ${row.title}`,
      `Query: ${row.query}`,
      `Scout URL: ${row.url}`,
      `Next action: ${row.action}`,
      `Capture fields: ${row.capture}`,
      `Note: ${row.note}`
    ].join("\n");
  }

  function render() {
    const root = qs("#scout-root");
    if (!root) return;
    visibleRows = filteredRows();
    const summary = qs("#scout-summary");
    if (summary) summary.textContent = `Showing ${visibleRows.length} of ${allRows.length} Scout query packets.`;

    const critical = visibleRows.filter((row) => row.priority === "Critical").length;
    const poolRows = visibleRows.filter((row) => row.kind === "Source pool").length;
    const publicRows = visibleRows.filter((row) => row.kind === "Public anchor").length;
    const recordRows = visibleRows.filter((row) => row.kind === "Record follow-up").length;
    const metrics = make("div", { className: "scout-metrics" }, [
      metric(String(critical), "critical", "Public-anchor and source-pool searches to run first"),
      metric(String(poolRows), "source pools", "Repository and collection lanes to harvest"),
      metric(String(publicRows), "public anchors", "Published statements needing internal backtrace"),
      metric(String(recordRows), "record follow-ups", "High-priority rows needing adjacent context")
    ]);

    const kindOrder = ["Public anchor", "Source pool", "Chapter terms", "Record follow-up"];
    const groups = kindOrder
      .map((kind) => visibleRows.filter((row) => row.kind === kind))
      .filter((rows) => rows.length);

    const groupNodes = groups.map((rows) =>
      make("section", { className: "scout-group" }, [
        make("div", { className: "scout-group-heading" }, [
          make("div", {}, [
            make("h3", { text: rows[0].kind }),
            make("p", { text: groupNote(rows[0].kind) })
          ]),
          make("span", { className: "count-pill", text: `${rows.length} packets` })
        ]),
        make("div", { className: "scout-list" }, rows.map(renderCard))
      ])
    );

    root.replaceChildren(metrics, ...groupNodes);
    if (!visibleRows.length) root.append(make("p", { className: "empty", text: "No Scout packets match the current filters." }));
  }

  function groupNote(kind) {
    if (kind === "Public anchor") return "Start from published presidential attention and locate internal drafting, clearance, and briefing trails.";
    if (kind === "Source pool") return "Turn repository/source-pool intent into requestable file units and item-level source notes.";
    if (kind === "Chapter terms") return "Broad chapter sweeps for finding new source families or confirming no-hit lanes.";
    return "Follow up high-priority records with adjacent packet, attachment, and no-document-marker searches.";
  }

  function fillSelect(selector, values, label) {
    const select = qs(selector);
    if (!select) return;
    select.replaceChildren(make("option", { value: "", text: label }));
    for (const value of values) select.append(make("option", { value, text: value }));
  }

  function exportRows() {
    const columns = [
      ["priority", (row) => row.priority],
      ["kind", (row) => row.kind],
      ["chapter", (row) => laneFor(row.laneId).name],
      ["title", (row) => row.title],
      ["query", (row) => row.query],
      ["scout_url", (row) => row.url],
      ["next_action", (row) => row.action],
      ["capture_fields", (row) => row.capture],
      ["note", (row) => row.note]
    ];
    const header = columns.map(([label]) => csvEscape(label)).join(",");
    const body = visibleRows.map((row) => columns.map(([, value]) => csvEscape(value(row))).join(",")).join("\n");
    downloadText("frus-v29-nara-scout-query-queue.csv", `${header}\n${body}\n`);
  }

  function copyVisible() {
    copyText(visibleRows.map(scoutMemo).join("\n\n---\n\n"), "Visible Scout packets copied");
  }

  function init() {
    fillSelect("#scout-lane", (data.lanes || []).map((lane) => lane.id), "All chapters");
    const laneSelect = qs("#scout-lane");
    if (laneSelect) {
      for (const option of laneSelect.options) {
        if (option.value) option.textContent = laneFor(option.value).shortName || laneFor(option.value).name;
      }
    }
    fillSelect("#scout-kind", [...new Set(allRows.map((row) => row.kind))].sort(), "All kinds");
    fillSelect("#scout-priority", [...new Set(allRows.map((row) => row.priority))].sort((a, b) => priorityRank(a) - priorityRank(b)), "All priorities");

    qs("#scout-search")?.addEventListener("input", (event) => {
      current.query = event.target.value.trim();
      render();
    });
    qs("#scout-lane")?.addEventListener("change", (event) => {
      current.lane = event.target.value;
      render();
    });
    qs("#scout-kind")?.addEventListener("change", (event) => {
      current.kind = event.target.value;
      render();
    });
    qs("#scout-priority")?.addEventListener("change", (event) => {
      current.priority = event.target.value;
      render();
    });
    qs("#scout-reset")?.addEventListener("click", () => {
      current.query = "";
      current.lane = "";
      current.kind = "";
      current.priority = "";
      for (const selector of ["#scout-search", "#scout-lane", "#scout-kind", "#scout-priority"]) {
        const node = qs(selector);
        if (node) node.value = "";
      }
      render();
    });
    qs("#scout-export")?.addEventListener("click", exportRows);
    qs("#scout-copy")?.addEventListener("click", copyVisible);
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
