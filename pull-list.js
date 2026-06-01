(() => {
  const data = window.GLOBAL_ISSUES_DATA;
  if (!data) return;

  const lanes = new Map(data.lanes.map((lane) => [lane.id, lane]));
  let visibleRows = [];

  const qs = (selector, root = document) => root.querySelector(selector);
  const laneFor = (id) => lanes.get(id) || { id, name: "Unassigned", shortName: "Unassigned", color: "#5c6967" };
  const laneName = (id) => laneFor(id).name;
  const rank = (priority) => ({ Critical: 0, High: 1, Medium: 2, Low: 3 })[priority] ?? 4;

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

  function pill(text, className = "tag") {
    return make("span", { className, text });
  }

  function priorityPill(priority) {
    return pill(priority || "Priority TBD", `priority ${priority || ""}`.trim());
  }

  function statusPill(status) {
    const first = String(status || "").split(/\s+/)[0] || "";
    return pill(status || "Status TBD", `status-pill ${first}`.trim());
  }

  function extractNaids(record) {
    const text = `${record.sourceNote || ""} ${record.sourceUrl || ""}`;
    const naids = new Set();
    for (const match of text.matchAll(/NAID\s+(\d+)/gi)) naids.add(match[1]);
    for (const match of text.matchAll(/catalog\.archives\.gov\/id\/(\d+)/gi)) naids.add(match[1]);
    return [...naids].sort((a, b) => Number(a) - Number(b));
  }

  function requestKind(record) {
    if (record.status === "Public anchor") return "Backfill internal record";
    if (record.status === "Boundary review") return "Resolve boundary before pull";
    if (record.status === "Needs document request" || /contact marker|daily diary/i.test(record.type)) return "Request substantive record";
    if (record.status === "Source lead") return "Identify item-level record";
    return "Review for selection";
  }

  function requestAction(record) {
    if (record.status === "Public anchor") {
      return "Pull speech drafts, clearance memoranda, briefing papers, options records, and agency comments behind the published text.";
    }
    if (record.status === "Boundary review") {
      return "Hold for placement review, then pull only files that establish global doctrine or cross-regional policy.";
    }
    if (record.status === "Needs document request" || /contact marker|daily diary/i.test(record.type)) {
      return "Use known diary, backup, or contact markers to request matching telcons, memcons, briefing papers, schedule backup, and follow-up memoranda.";
    }
    if (record.status === "Source lead") {
      return "Request file-unit lists and item-level documents, then replace provisional source wording with complete FRUS source-note control.";
    }
    return "Confirm source-note control, release status, and chapter placement before selection.";
  }

  function buildRows() {
    return data.records
      .map((record) => ({
        ...record,
        chapter: laneName(record.laneId),
        chapterShort: laneFor(record.laneId).shortName,
        naids: extractNaids(record),
        requestKind: requestKind(record),
        requestAction: requestAction(record),
        group: record.sourcePool || record.repository || "Unassigned source pool"
      }))
      .sort(
        (a, b) =>
          a.group.localeCompare(b.group) ||
          rank(a.priority) - rank(b.priority) ||
          a.date.localeCompare(b.date)
      );
  }

  function currentFilters() {
    return {
      query: qs("#pull-search")?.value || "",
      lane: qs("#pull-lane")?.value || "",
      kind: qs("#pull-kind")?.value || "",
      pool: qs("#pull-pool")?.value || ""
    };
  }

  function render() {
    const root = qs("#pull-list-root");
    if (!root) return;
    const filters = currentFilters();
    visibleRows = buildRows().filter(
      (row) =>
        matches(row, filters.query) &&
        (!filters.lane || row.laneId === filters.lane) &&
        (!filters.kind || row.requestKind === filters.kind) &&
        (!filters.pool || row.sourcePool === filters.pool)
    );

    const summary = qs("#pull-summary");
    if (summary) {
      const chapter = filters.lane ? ` in ${laneName(filters.lane)}` : "";
      summary.textContent = `Showing ${visibleRows.length} of ${data.records.length} archival pull requests${chapter}.`;
    }

    const withNaids = visibleRows.filter((row) => row.naids.length).length;
    const naidCount = new Set(visibleRows.flatMap((row) => row.naids)).size;
    const dailyAnchors = visibleRows.filter((row) => /Daily Diary|Daily Backup/i.test(row.sourceNote)).length;
    const publicBackfills = visibleRows.filter((row) => row.requestKind === "Backfill internal record").length;

    root.replaceChildren(
      make("div", { className: "pull-metrics" }, [
        metric(String(visibleRows.length), "pull requests", "Records and source leads in view"),
        metric(String(naidCount), "unique NAIDs", `${withNaids} rows include catalog identifiers`),
        metric(String(dailyAnchors), "diary/backup anchors", "Scheduling controls to pair with substantive files"),
        metric(String(publicBackfills), "public backfills", "Published texts needing internal records")
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

  function renderGroups(rows) {
    if (!rows.length) return [make("p", { className: "empty", text: "No archival pull requests match the current filters." })];
    const groups = new Map();
    rows.forEach((row) => {
      if (!groups.has(row.group)) groups.set(row.group, []);
      groups.get(row.group).push(row);
    });
    return [...groups.entries()].map(([group, groupRows]) =>
      make("article", { className: "pull-group" }, [
        make("div", { className: "pull-group-heading" }, [
          make("div", {}, [
            make("p", { className: "kicker", text: "Source Pool" }),
            make("h3", { text: group })
          ]),
          make("p", { text: `${groupRows.length} requests / ${new Set(groupRows.flatMap((row) => row.naids)).size} NAIDs` })
        ]),
        make("div", { className: "pull-list" }, groupRows.map(renderPullItem))
      ])
    );
  }

  function renderPullItem(row) {
    const lane = laneFor(row.laneId);
    return make("div", { className: "pull-item", style: `--lane-color: ${lane.color}` }, [
      make("div", { className: "pull-main" }, [
        make("p", { className: "meta-line", text: `${formatDate(row.date)} - ${row.chapter}` }),
        make("h3", { text: row.title }),
        make("div", { className: "tag-list" }, [priorityPill(row.priority), statusPill(row.status), pill(row.requestKind)]),
        make("p", {}, [make("strong", { text: "Request: " }), row.requestAction]),
        make("p", {}, [make("strong", { text: "Repository: " }), row.repository]),
        make("p", { className: "source-note", text: row.sourceNote })
      ]),
      make("aside", { className: "pull-side" }, [
        make("p", { className: "card-meta", text: "Known NAIDs / Identifiers" }),
        row.naids.length
          ? make("div", { className: "naid-list" }, row.naids.map((naid) => make("code", { text: `NAID ${naid}` })))
          : make("p", { text: "No NAID captured yet." }),
        make("p", { className: "card-meta", text: "Verification steps" }),
        make("ul", { className: "compact-list" }, row.verification.map((item) => make("li", { text: item }))),
        make("div", { className: "small-actions" }, [
          make("button", { type: "button", onClick: () => copyText(requestText(row), "Pull request copied") }, "Copy Request"),
          make("a", { className: "button ghost", href: row.sourceUrl, rel: "noreferrer" }, "Open Source")
        ])
      ])
    ]);
  }

  function requestText(row) {
    return [
      "FRUS Volume XXIX archival pull request",
      `Date: ${row.date}`,
      `Chapter: ${row.chapter}`,
      `Title: ${row.title}`,
      `Request type: ${row.requestKind}`,
      `Repository: ${row.repository}`,
      `Source pool: ${row.sourcePool}`,
      `Known NAIDs: ${row.naids.length ? row.naids.map((naid) => `NAID ${naid}`).join("; ") : "none captured"}`,
      `Source URL: ${row.sourceUrl}`,
      `Requested files: ${row.requestAction}`,
      `Current source note: ${row.sourceNote}`,
      `Boundary note: ${row.boundaryNotes}`,
      `Verification: ${row.verification.join("; ")}`
    ].join("\n");
  }

  async function copyText(text, message) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const textarea = make("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.append(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    showToast(message);
  }

  function showToast(message) {
    const toast = qs("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    window.setTimeout(() => toast.classList.remove("visible"), 2200);
  }

  function csvEscape(value) {
    const normalized = Array.isArray(value) ? value.join("; ") : value ?? "";
    return `"${String(normalized).replaceAll('"', '""')}"`;
  }

  function downloadCsv(filename, rows, columns) {
    const header = columns.map((column) => csvEscape(column.label)).join(",");
    const body = rows.map((row) => columns.map((column) => csvEscape(column.value(row))).join(",")).join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = make("a", { href: url, download: filename });
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function exportRows() {
    downloadCsv("frus-v29-archival-pull-list.csv", visibleRows, [
      { label: "date", value: (row) => row.date },
      { label: "title", value: (row) => row.title },
      { label: "chapter", value: (row) => row.chapter },
      { label: "priority", value: (row) => row.priority },
      { label: "status", value: (row) => row.status },
      { label: "request_type", value: (row) => row.requestKind },
      { label: "repository", value: (row) => row.repository },
      { label: "source_pool", value: (row) => row.sourcePool },
      { label: "naids", value: (row) => row.naids.map((naid) => `NAID ${naid}`) },
      { label: "request_action", value: (row) => row.requestAction },
      { label: "source_url", value: (row) => row.sourceUrl },
      { label: "source_note", value: (row) => row.sourceNote },
      { label: "verification", value: (row) => row.verification }
    ]);
  }

  function initControls() {
    fillSelect(qs("#pull-lane"), data.lanes.map((lane) => lane.id), "All chapters", laneName);
    fillSelect(qs("#pull-kind"), unique(buildRows().map((row) => row.requestKind)), "All request types");
    fillSelect(qs("#pull-pool"), unique(data.records.map((record) => record.sourcePool)), "All source pools");
    ["#pull-search", "#pull-lane", "#pull-kind", "#pull-pool"].forEach((selector) => {
      const node = qs(selector);
      if (!node) return;
      node.addEventListener(node.tagName === "INPUT" ? "input" : "change", render);
    });
    qs("#pull-reset")?.addEventListener("click", () => {
      ["#pull-search", "#pull-lane", "#pull-kind", "#pull-pool"].forEach((selector) => {
        const node = qs(selector);
        if (node) node.value = "";
      });
      render();
    });
    qs("#pull-export")?.addEventListener("click", exportRows);
    qs("#pull-copy")?.addEventListener("click", () =>
      copyText(visibleRows.map(requestText).join("\n\n---\n\n"), "Visible pull requests copied")
    );
  }

  function init() {
    initControls();
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
