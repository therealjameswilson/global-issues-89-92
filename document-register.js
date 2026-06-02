(() => {
  const data = window.GLOBAL_ISSUES_DATA;
  if (!data) return;

  const lanes = new Map(data.lanes.map((lane) => [lane.id, lane]));
  const laneOrder = new Map(data.lanes.map((lane, index) => [lane.id, index]));
  let visibleRows = [];

  const qs = (selector, root = document) => root.querySelector(selector);
  const laneFor = (id) => lanes.get(id) || { id, name: "Unassigned", number: "Chapter ?", shortName: "Unassigned", color: "#5c6967" };
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

  function registerDisposition(record) {
    if (record.status === "Boundary review") return "Boundary hold";
    if (record.status === "Public anchor") return "Public anchor backfill";
    if (record.status === "Needs document request" || /daily diary|contact marker/i.test(record.type || "")) {
      return "Request before numbering";
    }
    if (!hasItemControl(record) || !hasIdentifier(record)) return "Source-control buildout";
    if (record.priority === "Critical" || record.priority === "High") return "Provisional candidate";
    return "Reserve support lead";
  }

  function documentRole(record, chapterIndex) {
    const combined = `${record.type || ""} ${record.title || ""}`;
    if (/Public reference/i.test(record.type || "")) return "Public-line anchor";
    if (/Summit/i.test(combined)) return "Summit anchor";
    if (/telephone call|call lead|telcon/i.test(combined)) return "Presidential call lead";
    if (/meeting/i.test(combined)) return "Presidential meeting lead";
    if (/Contact marker/i.test(record.type || "")) return "Contact-control lead";
    if (/Boundary/i.test(record.type || "") || record.status === "Boundary review") return "Boundary test";
    if (chapterIndex === 0) return "Opening chapter frame";
    if (record.priority === "Critical") return "Core chapter anchor";
    return "Policy file target";
  }

  function sourceNoteState(record) {
    if (record.status === "Public anchor") return "Public source controlled; internal source pair missing";
    if (hasItemControl(record) && hasIdentifier(record)) return "Item/date/identifier control present";
    if (hasDailyDiary(record)) return "Diary or backup control present; substantive record missing";
    return "Provisional source lead; item-level control missing";
  }

  function numberingAction(record) {
    if (record.status === "Boundary review") return "Hold out of final numbering until placement is resolved against adjacent FRUS volumes.";
    if (record.status === "Public anchor") return "Use as a chronological public-line marker, but number only the internal draft, clearance, briefing, or follow-up document if selected.";
    if (record.status === "Needs document request" || /daily diary|contact marker/i.test(record.type || "")) {
      return "Do not number yet; first request the matching memcon, telcon, briefing paper, schedule backup, or follow-up record.";
    }
    if (!hasItemControl(record) || !hasIdentifier(record)) return "Keep as a slot target until a file unit, item title, stable identifier, and release status are controlled.";
    return "Eligible for close-read as a provisional candidate once classification/release status and routing are confirmed.";
  }

  function buildRows() {
    const grouped = new Map();
    data.records.forEach((record) => {
      if (!grouped.has(record.laneId)) grouped.set(record.laneId, []);
      grouped.get(record.laneId).push(record);
    });

    const rows = [];
    data.lanes.forEach((lane) => {
      const records = (grouped.get(lane.id) || []).sort(
        (a, b) => a.date.localeCompare(b.date) || priorityRank(a.priority) - priorityRank(b.priority)
      );
      records.forEach((record, index) => {
        const slotNumber = String(index + 1).padStart(2, "0");
        const disposition = registerDisposition(record);
        rows.push({
          ...record,
          chapter: lane.name,
          chapterNumber: lane.number,
          chapterShort: lane.shortName,
          chapterBoundary: lane.boundary,
          slotIndex: index + 1,
          slotLabel: `${lane.number} / Slot ${slotNumber}`,
          disposition,
          role: documentRole(record, index),
          sourceNoteState: sourceNoteState(record),
          numberingAction: numberingAction(record)
        });
      });
    });

    return rows.sort(
      (a, b) =>
        (laneOrder.get(a.laneId) ?? 99) - (laneOrder.get(b.laneId) ?? 99) ||
        a.slotIndex - b.slotIndex
    );
  }

  function filters() {
    return {
      query: qs("#register-search")?.value || "",
      lane: qs("#register-lane")?.value || "",
      disposition: qs("#register-disposition")?.value || "",
      role: qs("#register-role")?.value || ""
    };
  }

  function render() {
    const root = qs("#register-root");
    if (!root) return;
    const rows = buildRows();
    const current = filters();
    visibleRows = rows.filter(
      (row) =>
        matches(row, current.query) &&
        (!current.lane || row.laneId === current.lane) &&
        (!current.disposition || row.disposition === current.disposition) &&
        (!current.role || row.role === current.role)
    );

    const summary = qs("#register-summary");
    if (summary) {
      const chapter = current.lane ? ` in ${laneName(current.lane)}` : "";
      summary.textContent = `Showing ${visibleRows.length} of ${rows.length} provisional register slots${chapter}.`;
    }

    const chapters = new Set(visibleRows.map((row) => row.laneId)).size;
    const requestFirst = visibleRows.filter((row) => row.disposition === "Request before numbering").length;
    const sourceBuildout = visibleRows.filter((row) => row.disposition === "Source-control buildout").length;
    const holds = visibleRows.filter((row) => row.disposition === "Boundary hold").length;

    root.replaceChildren(
      make("div", { className: "register-metrics" }, [
        metric(String(visibleRows.length), "provisional slots", "Chronology leads sequenced by chapter"),
        metric(String(chapters), "chapters visible", "Working chapters represented"),
        metric(String(requestFirst + sourceBuildout), "pre-numbering work", "Requests or item-control buildout still needed"),
        metric(String(holds), "boundary holds", "Slots excluded from final numbering until placement is settled")
      ]),
      ...renderChapters(visibleRows)
    );
  }

  function metric(value, label, caption) {
    return make("div", { className: "metric" }, [
      make("strong", { text: value }),
      make("span", { text: label }),
      make("p", { text: caption })
    ]);
  }

  function renderChapters(rows) {
    if (!rows.length) return [make("p", { className: "empty", text: "No provisional register slots match the current filters." })];
    const groups = new Map();
    rows.forEach((row) => {
      if (!groups.has(row.laneId)) groups.set(row.laneId, []);
      groups.get(row.laneId).push(row);
    });
    return [...groups.entries()].map(([laneId, chapterRows]) => renderChapter(laneFor(laneId), chapterRows));
  }

  function renderChapter(lane, rows) {
    return make("article", { className: "register-chapter" }, [
      make("div", { className: "register-chapter-heading" }, [
        make("div", {}, [
          make("p", { className: "kicker", text: "Working Chapter" }),
          make("h3", { text: `${lane.number}: ${lane.name}` }),
          make("p", { text: lane.boundary })
        ]),
        make("span", { className: "count-pill", text: `${rows.length} slots` })
      ]),
      make("div", { className: "register-list" }, rows.map(renderCard))
    ]);
  }

  function renderCard(row) {
    const lane = laneFor(row.laneId);
    return make("div", { className: "register-card", style: `--lane-color: ${lane.color}` }, [
      make("div", { className: "register-main" }, [
        make("p", { className: "meta-line", text: `${row.slotLabel} - ${formatDate(row.date)}` }),
        make("h4", { text: row.title }),
        make("div", { className: "tag-list" }, [
          priorityPill(row.priority),
          statusPill(row.status),
          pill(row.disposition),
          pill(row.role)
        ]),
        make("p", { className: "register-rationale" }, [make("strong", { text: "Register rationale: " }), row.compilerUse]),
        make("p", { className: "register-action" }, [make("strong", { text: "Numbering action: " }), row.numberingAction])
      ]),
      make("aside", { className: "register-side" }, [
        make("div", { className: "register-slot" }, [
          make("p", { className: "card-meta", text: "Provisional Slot" }),
          make("strong", { text: row.slotLabel }),
          make("p", { text: row.sourceNoteState })
        ]),
        make("p", { className: "card-meta", text: "Current Source Note" }),
        make("p", { className: "register-source-note", text: row.sourceNote }),
        make("p", { className: "card-meta", text: "Verification" }),
        make("ul", { className: "compact-list" }, row.verification.map((item) => make("li", { text: item }))),
        make("div", { className: "small-actions" }, [
          make("button", { type: "button", onClick: () => copyText(slotText(row), "Register slot copied") }, "Copy Slot"),
          make("a", { className: "button ghost", href: row.sourceUrl, rel: "noreferrer" }, "Open Source")
        ])
      ])
    ]);
  }

  function slotText(row) {
    return [
      `${row.slotLabel}: ${row.title}`,
      `Date: ${row.date}`,
      `Chapter: ${row.chapter}`,
      `Disposition: ${row.disposition}`,
      `Role: ${row.role}`,
      `Priority/status: ${row.priority} / ${row.status}`,
      `Register rationale: ${row.compilerUse}`,
      `Numbering action: ${row.numberingAction}`,
      `Source-note state: ${row.sourceNoteState}`,
      `Current source note: ${row.sourceNote}`,
      `Boundary note: ${row.boundaryNotes}`,
      `Verification: ${row.verification.join("; ")}`
    ].join("\n");
  }

  function registerMarkdown(rows = visibleRows) {
    const lines = [
      "# FRUS Volume XXIX Provisional Document Register",
      "",
      "Slot labels are working aids, not final FRUS document numbers. Boundary holds, public-anchor backfills, diary/contact controls, and source-control buildout items should be resolved before final numbering.",
      ""
    ];
    const groups = new Map();
    rows.forEach((row) => {
      if (!groups.has(row.laneId)) groups.set(row.laneId, []);
      groups.get(row.laneId).push(row);
    });
    [...groups.entries()].forEach(([laneId, chapterRows]) => {
      const lane = laneFor(laneId);
      lines.push(`## ${lane.number}: ${lane.name}`, "");
      lines.push(`Boundary: ${lane.boundary}`, "");
      chapterRows.forEach((row) => {
        lines.push(`### ${row.slotLabel} - ${formatDate(row.date)}`);
        lines.push(`- Title: ${row.title}`);
        lines.push(`- Disposition: ${row.disposition}`);
        lines.push(`- Role: ${row.role}`);
        lines.push(`- Priority/status: ${row.priority} / ${row.status}`);
        lines.push(`- Register rationale: ${row.compilerUse}`);
        lines.push(`- Numbering action: ${row.numberingAction}`);
        lines.push(`- Source-note state: ${row.sourceNoteState}`);
        lines.push(`- Current source note: ${row.sourceNote}`);
        lines.push(`- Verification: ${row.verification.join("; ")}`, "");
      });
    });
    if (!rows.length) lines.push("No register slots match the current filters.");
    return lines.join("\n");
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
    downloadCsv("frus-v29-provisional-document-register.csv", visibleRows, [
      { label: "slot", value: (row) => row.slotLabel },
      { label: "date", value: (row) => row.date },
      { label: "title", value: (row) => row.title },
      { label: "chapter", value: (row) => row.chapter },
      { label: "disposition", value: (row) => row.disposition },
      { label: "role", value: (row) => row.role },
      { label: "priority", value: (row) => row.priority },
      { label: "status", value: (row) => row.status },
      { label: "numbering_action", value: (row) => row.numberingAction },
      { label: "source_note_state", value: (row) => row.sourceNoteState },
      { label: "source_note", value: (row) => row.sourceNote },
      { label: "source_url", value: (row) => row.sourceUrl },
      { label: "boundary_note", value: (row) => row.boundaryNotes },
      { label: "verification", value: (row) => row.verification }
    ]);
  }

  function initControls() {
    const rows = buildRows();
    fillSelect(qs("#register-lane"), data.lanes.map((lane) => lane.id), "All chapters", laneName);
    fillSelect(qs("#register-disposition"), unique(rows.map((row) => row.disposition)), "All dispositions");
    fillSelect(qs("#register-role"), unique(rows.map((row) => row.role)), "All roles");
    ["#register-search", "#register-lane", "#register-disposition", "#register-role"].forEach((selector) => {
      const node = qs(selector);
      if (!node) return;
      node.addEventListener(node.tagName === "INPUT" ? "input" : "change", render);
    });
    qs("#register-reset")?.addEventListener("click", () => {
      ["#register-search", "#register-lane", "#register-disposition", "#register-role"].forEach((selector) => {
        const node = qs(selector);
        if (node) node.value = "";
      });
      render();
    });
    qs("#register-export")?.addEventListener("click", exportRows);
    qs("#register-copy")?.addEventListener("click", () =>
      copyText(registerMarkdown(), "Visible provisional register copied")
    );
  }

  function init() {
    initControls();
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
