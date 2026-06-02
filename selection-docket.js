(() => {
  const data = window.GLOBAL_ISSUES_DATA;
  if (!data) return;

  const lanes = new Map(data.lanes.map((lane) => [lane.id, lane]));
  let visibleRows = [];

  const tierOrder = [
    "Substantive record request",
    "Item-level control needed",
    "Internal pair needed",
    "Core candidate lead",
    "Boundary hold",
    "Reserve lead"
  ];

  const qs = (selector, root = document) => root.querySelector(selector);
  const laneFor = (id) => lanes.get(id) || { id, name: "Unassigned", shortName: "Unassigned", color: "#5c6967" };
  const laneName = (id) => laneFor(id).name;
  const priorityRank = (priority) => ({ Critical: 0, High: 1, Medium: 2, Low: 3 })[priority] ?? 4;

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

  function formatDate(value) {
    if (!value) return "Undated";
    const [year, month, day] = String(value).split("-").map(Number);
    if (!year || !month || !day) return value;
    return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC"
    });
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

  function priorityPill(priority) {
    return make("span", { className: `priority ${priority || ""}`.trim(), text: priority || "Priority TBD" });
  }

  function statusPill(status) {
    const first = String(status || "").split(/\s+/)[0] || "";
    return make("span", { className: `status-pill ${first}`.trim(), text: status || "Status TBD" });
  }

  function pill(text, className = "tag") {
    return make("span", { className, text });
  }

  function hasDailyDiary(record) {
    return /Daily Diary|Daily Backup|Presidential Daily Diary and Daily Backup/i.test(
      `${record.sourceNote || ""} ${record.sourcePool || ""} ${record.type || ""}`
    );
  }

  function hasIdentifier(record) {
    return /NAID\s+\d+|PPP-\d{4}|doc[-\w]*pg|catalog\.archives\.gov\/id\/\d+/i.test(
      `${record.sourceNote || ""} ${record.sourceUrl || ""}`
    );
  }

  function hasItemControl(record) {
    const note = record.sourceNote || "";
    if (/file unit and item title not yet identified/i.test(note)) return false;
    if (/catalog\.archives\.gov\/search/i.test(record.sourceUrl || "")) return false;
    return /(Entry|Published text|Message|Address|Remarks|Letter|Statement|table|scope note|entry for)/i.test(note);
  }

  function blockers(record) {
    const items = [];
    if (record.status === "Boundary review") items.push("Boundary assignment is unresolved against adjacent FRUS volumes.");
    if (record.status === "Public anchor") items.push("Published text needs an internal document pair: drafts, clearance, briefing, or follow-up records.");
    if (record.status === "Needs document request" || /daily diary|contact marker/i.test(record.type || "")) {
      items.push("Lead proves timing or contact but not the substantive FRUS document; request matching telcon, memcon, briefing paper, or follow-up file.");
    }
    if (!hasItemControl(record)) items.push("File unit or item title is not yet strong enough for final FRUS source-note control.");
    if (!hasIdentifier(record)) items.push("Stable NAID, GovInfo id, or catalog object URL is missing.");
    if (!/classification|No classification marking|Published text|public|declassified|No Memcon|catalog scope note/i.test(record.sourceNote || "")) {
      items.push("Classification, public-release, or declassification note still needs confirmation.");
    }
    return items;
  }

  function tierFor(record) {
    if (record.status === "Boundary review") return "Boundary hold";
    if (record.status === "Needs document request" || /daily diary|contact marker/i.test(record.type || "")) {
      return "Substantive record request";
    }
    if (record.status === "Public anchor") return "Internal pair needed";
    if (!hasItemControl(record) || !hasIdentifier(record)) return "Item-level control needed";
    if (record.priority === "Critical" || record.priority === "High") return "Core candidate lead";
    return "Reserve lead";
  }

  function scoreFor(record) {
    let score = { Critical: 95, High: 82, Medium: 62, Low: 45 }[record.priority] ?? 50;
    if (record.status === "Needs document request") score += 8;
    if (record.status === "Source lead") score += 4;
    if (record.status === "Public anchor") score -= 4;
    if (record.status === "Boundary review") score -= 18;
    if (!hasItemControl(record)) score -= 10;
    if (!hasIdentifier(record)) score -= 8;
    if (hasDailyDiary(record)) score += 3;
    return Math.max(20, Math.min(100, score));
  }

  function sourceNoteTarget(record) {
    if (record.status === "Public anchor") {
      return "Use the public text as a public-line anchor; promote only after locating the internal draft, clearance memorandum, briefing paper, or follow-up record that can carry the FRUS document source note.";
    }
    if (hasDailyDiary(record)) {
      return "Use the Daily Diary or Backup item for date and participant control. For selection, request the separate telcon, memcon, briefing paper, schedule backup, or follow-up record; do not let the diary item stand in for the substantive document.";
    }
    if (record.status === "Boundary review") {
      return "Hold selection until the compiler confirms the document is global-policy doctrine rather than a regional, domestic, or operational file for another volume.";
    }
    if (!hasItemControl(record) || !hasIdentifier(record)) {
      return "Promote the lead only after the request returns a file unit or item title, stable identifier, classification or release marking, date, and routing context.";
    }
    return "Close-read for selection after confirming the document's classification, declassification/release status, routing, and relationship to adjacent chapters.";
  }

  function sourceNoteTemplate(record) {
    const repository = record.repository || "[repository]";
    const collection = record.sourcePool || "[collection or series]";
    const identifier = hasIdentifier(record) ? "known identifier/NAID from current lead" : "[NAID, GovInfo id, or catalog object URL]";
    return [
      `Source: ${repository}, ${collection}, [box or container], [folder/file unit], [item title], ${formatDate(record.date)}.`,
      `[Classification marking or public/declassification status]. [Drafted/sent through/participants/routing if present].`,
      `Identifier control: ${identifier}.`
    ].join("\n");
  }

  function actionFor(record) {
    if (record.status === "Boundary review") return "Resolve volume placement first, then request only the records that establish cross-regional or global policy.";
    if (record.status === "Public anchor") return "Request speech drafts, clearance memoranda, briefing papers, diary/backup files, and State/NSC follow-up records.";
    if (record.status === "Needs document request" || /daily diary|contact marker/i.test(record.type || "")) {
      return "Request matching memcon/telcon, briefing materials, schedule backup, and post-contact follow-up records.";
    }
    if (!hasItemControl(record) || !hasIdentifier(record)) return "Request item-level file control before assigning document number or drafting final source note.";
    return "Close-read for document selection and source-note cleanup.";
  }

  function buildRows() {
    return data.records
      .map((record) => {
        const lane = laneFor(record.laneId);
        const tier = tierFor(record);
        const rowBlockers = blockers(record);
        return {
          ...record,
          chapter: lane.name,
          chapterShort: lane.shortName,
          tier,
          tierRank: tierOrder.indexOf(tier),
          selectionScore: scoreFor(record),
          blockers: rowBlockers,
          blockerText: rowBlockers.length ? rowBlockers.join(" ") : "No blocking issue detected in current seed data.",
          sourceNoteTarget: sourceNoteTarget(record),
          sourceNoteTemplate: sourceNoteTemplate(record),
          nextSelectionAction: actionFor(record)
        };
      })
      .sort(
        (a, b) =>
          a.tierRank - b.tierRank ||
          b.selectionScore - a.selectionScore ||
          priorityRank(a.priority) - priorityRank(b.priority) ||
          a.date.localeCompare(b.date)
      );
  }

  function filters() {
    return {
      query: qs("#selection-search")?.value || "",
      lane: qs("#selection-lane")?.value || "",
      tier: qs("#selection-tier")?.value || "",
      priority: qs("#selection-priority")?.value || ""
    };
  }

  function render() {
    const root = qs("#selection-root");
    if (!root) return;
    const rows = buildRows();
    const current = filters();
    visibleRows = rows.filter(
      (row) =>
        matches(row, current.query) &&
        (!current.lane || row.laneId === current.lane) &&
        (!current.tier || row.tier === current.tier) &&
        (!current.priority || row.priority === current.priority)
    );

    const summary = qs("#selection-summary");
    if (summary) {
      const chapter = current.lane ? ` in ${laneName(current.lane)}` : "";
      summary.textContent = `Showing ${visibleRows.length} of ${rows.length} selection docket items${chapter}.`;
    }

    const substantive = visibleRows.filter((row) => row.tier === "Substantive record request").length;
    const itemControl = visibleRows.filter((row) => row.tier === "Item-level control needed").length;
    const publicPairs = visibleRows.filter((row) => row.tier === "Internal pair needed").length;
    const boundary = visibleRows.filter((row) => row.tier === "Boundary hold").length;

    root.replaceChildren(
      make("div", { className: "selection-metrics" }, [
        metric(String(substantive), "substantive requests", "Diary/contact leads that need FRUS documents"),
        metric(String(itemControl), "item-control blockers", "Need file-unit, item, or identifier control"),
        metric(String(publicPairs), "public pairs", "Public lines needing internal records"),
        metric(String(boundary), "boundary holds", "Need placement decisions")
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
    if (!rows.length) return [make("p", { className: "empty", text: "No selection docket items match the current filters." })];
    return tierOrder
      .map((tier) => rows.filter((row) => row.tier === tier))
      .filter((group) => group.length)
      .map(renderGroup);
  }

  function renderGroup(rows) {
    return make("article", { className: "selection-group" }, [
      make("div", { className: "selection-group-heading" }, [
        make("div", {}, [
          make("p", { className: "kicker", text: "Selection Tier" }),
          make("h3", { text: rows[0].tier })
        ]),
        make("span", { className: "count-pill", text: `${rows.length} items` })
      ]),
      make("div", { className: "selection-list" }, rows.map(renderCard))
    ]);
  }

  function renderCard(row) {
    const lane = laneFor(row.laneId);
    return make("div", { className: "selection-card", style: `--lane-color: ${lane.color}` }, [
      make("div", { className: "selection-main" }, [
        make("p", { className: "meta-line", text: `${formatDate(row.date)} - ${row.chapterShort}` }),
        make("h4", { text: row.title }),
        make("div", { className: "tag-list" }, [priorityPill(row.priority), statusPill(row.status), pill(row.type), pill(row.tier)]),
        make("p", {}, [make("strong", { text: "Selection action: " }), row.nextSelectionAction]),
        make("p", { className: "selection-blocker" }, [make("strong", { text: "Blocking issue: " }), row.blockerText]),
        make("p", { className: "selection-target" }, [make("strong", { text: "Source-note target: " }), row.sourceNoteTarget])
      ]),
      make("aside", { className: "selection-side" }, [
        make("div", { className: "selection-score" }, [
          make("div", {}, [
            make("p", { className: "card-meta", text: "Selection Weight" }),
            make("strong", { text: String(row.selectionScore) })
          ]),
          make("span", { className: "count-pill", text: row.chapterShort })
        ]),
        make("p", { className: "card-meta", text: "FRUS-Style Source-Note Fields" }),
        make("pre", { className: "selection-template" }, row.sourceNoteTemplate),
        make("p", { className: "card-meta", text: "Verification" }),
        make("ul", { className: "compact-list" }, row.verification.map((item) => make("li", { text: item }))),
        make("div", { className: "small-actions" }, [
          make("button", { type: "button", onClick: () => copyText(selectionRequest(row), "Selection request copied") }, "Copy Request"),
          make("a", { className: "button ghost", href: row.sourceUrl, rel: "noreferrer" }, "Open Source")
        ])
      ])
    ]);
  }

  function selectionRequest(row) {
    return [
      "FRUS Volume XXIX document selection request",
      `Date: ${row.date}`,
      `Chapter: ${row.chapter}`,
      `Title: ${row.title}`,
      `Selection tier: ${row.tier}`,
      `Selection weight: ${row.selectionScore}`,
      `Priority: ${row.priority}`,
      `Current status: ${row.status}`,
      `Selection action: ${row.nextSelectionAction}`,
      `Blocking issue: ${row.blockerText}`,
      `Source-note target: ${row.sourceNoteTarget}`,
      "FRUS-style source-note fields:",
      row.sourceNoteTemplate,
      `Current source note: ${row.sourceNote}`,
      `Source URL: ${row.sourceUrl}`,
      `Verification: ${row.verification.join("; ")}`,
      `Boundary note: ${row.boundaryNotes}`
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
    downloadCsv("frus-v29-selection-docket.csv", visibleRows, [
      { label: "date", value: (row) => row.date },
      { label: "title", value: (row) => row.title },
      { label: "chapter", value: (row) => row.chapter },
      { label: "tier", value: (row) => row.tier },
      { label: "selection_weight", value: (row) => row.selectionScore },
      { label: "priority", value: (row) => row.priority },
      { label: "status", value: (row) => row.status },
      { label: "selection_action", value: (row) => row.nextSelectionAction },
      { label: "blocking_issue", value: (row) => row.blockerText },
      { label: "source_note_target", value: (row) => row.sourceNoteTarget },
      { label: "source_note_template", value: (row) => row.sourceNoteTemplate },
      { label: "current_source_note", value: (row) => row.sourceNote },
      { label: "source_url", value: (row) => row.sourceUrl }
    ]);
  }

  function initControls() {
    const rows = buildRows();
    fillSelect(qs("#selection-lane"), data.lanes.map((lane) => lane.id), "All chapters", laneName);
    fillSelect(qs("#selection-tier"), tierOrder.filter((tier) => rows.some((row) => row.tier === tier)), "All tiers");
    fillSelect(qs("#selection-priority"), unique(rows.map((row) => row.priority)), "All priorities");
    ["#selection-search", "#selection-lane", "#selection-tier", "#selection-priority"].forEach((selector) => {
      const node = qs(selector);
      if (!node) return;
      node.addEventListener(node.tagName === "INPUT" ? "input" : "change", render);
    });
    qs("#selection-reset")?.addEventListener("click", () => {
      ["#selection-search", "#selection-lane", "#selection-tier", "#selection-priority"].forEach((selector) => {
        const node = qs(selector);
        if (node) node.value = "";
      });
      render();
    });
    qs("#selection-export")?.addEventListener("click", exportRows);
    qs("#selection-copy")?.addEventListener("click", () =>
      copyText(visibleRows.map(selectionRequest).join("\n\n---\n\n"), "Visible selection requests copied")
    );
  }

  function init() {
    initControls();
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
