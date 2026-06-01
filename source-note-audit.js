(() => {
  const data = window.GLOBAL_ISSUES_DATA;
  if (!data) return;

  const lanesById = new Map(data.lanes.map((lane) => [lane.id, lane]));
  let auditRows = [];

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
    return lanesById.get(id) || { id, name: "Unassigned", shortName: "Unassigned", color: "#5c6967" };
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

  function buildAuditRows() {
    return data.records
      .map((record) => {
        const lane = laneFor(record.laneId);
        const checks = sourceNoteChecks(record);
        const missing = checks.filter((check) => !check.pass);
        return {
          ...record,
          chapter: lane.name,
          chapterShort: lane.shortName,
          checks,
          missing,
          score: checks.length - missing.length,
          readiness: readinessLabel(record, missing)
        };
      })
      .sort(
        (a, b) =>
          b.missing.length - a.missing.length ||
          priorityRank(a.priority) - priorityRank(b.priority) ||
          a.date.localeCompare(b.date)
      );
  }

  function sourceNoteChecks(record) {
    const note = record.sourceNote || "";
    const combined = `${note} ${record.sourceUrl || ""} ${record.status || ""}`;
    const hasFileUnit = !/file unit and item title not yet identified/i.test(note) &&
      /(Entry|Published text|Message|Address|Remarks|Letter|Statement|table|scope note|entry for)/i.test(note);
    return [
      {
        label: "repository",
        pass: Boolean(record.repository && /Source:/i.test(note)),
        detail: record.repository || "Repository missing"
      },
      {
        label: "collection/series",
        pass: /(Library|Museum|Department of State|Public Papers|White House Office|Presidential Daily Diary|Daily Backup|State|NSC|OES|EPA|CEQ|USAID|HHS)/i.test(note),
        detail: "Repository collection, series, or office named"
      },
      {
        label: "file unit/item",
        pass: hasFileUnit,
        detail: "File unit or item title identified"
      },
      {
        label: "identifier",
        pass: /NAID\s+\d+|PPP-\d{4}|doc[-\w]*pg|catalog\.archives\.gov\/id\/\d+/i.test(combined),
        detail: "NAID, GovInfo document id, or catalog object URL present"
      },
      {
        label: "date",
        pass: Boolean(record.date) || /\b(19[89]\d|199[0-2])\b|\d{1,2}\/\d{1,2}\/\d{4}/.test(note),
        detail: record.date || "Date missing"
      },
      {
        label: "release/status",
        pass: /(Published text|public|declassified|status|No Memcon|not yet identified|records remain to be located|catalog scope note)/i.test(combined),
        detail: "Public/declassification/provisional status is stated"
      },
      {
        label: "object URL",
        pass: /^https?:\/\//.test(record.sourceUrl || ""),
        detail: record.sourceUrl || "Object URL missing"
      }
    ];
  }

  function readinessLabel(record, missing) {
    if (record.status === "Public anchor") return "Needs internal-document pair";
    if (record.status === "Boundary review") return "Needs boundary decision";
    if (record.status === "Needs document request") return "Needs substantive record request";
    if (record.status === "Source lead") return "Needs item-level source control";
    if (missing.some((check) => check.label === "file unit/item" || check.label === "identifier")) {
      return "Needs item-level source control";
    }
    if (!missing.length) return "Ready for editorial review";
    return "Needs source-note cleanup";
  }

  function renderAudit() {
    const root = qs("#source-note-root");
    if (!root) return;
    auditRows = buildAuditRows();

    const substantive = auditRows.filter((row) => row.readiness === "Needs substantive record request").length;
    const itemWork = auditRows.filter((row) => row.readiness === "Needs item-level source control").length;
    const internalPairs = auditRows.filter((row) => row.readiness === "Needs internal-document pair").length;
    const boundary = auditRows.filter((row) => row.readiness === "Needs boundary decision").length;

    root.replaceChildren(
      make("div", { className: "source-note-metrics" }, [
        metric(String(substantive), "substantive requests", "Diary or contact leads needing matching records"),
        metric(String(itemWork), "item-control gaps", "Missing file-unit, item-title, or identifier control"),
        metric(String(internalPairs), "public anchors", "Need drafts, clearance, or briefing records"),
        metric(String(boundary), "boundary decisions", "Need placement before promotion")
      ]),
      make("div", { className: "source-note-list" }, auditRows.map(renderAuditCard))
    );
  }

  function metric(value, label, caption) {
    return make("div", { className: "metric" }, [
      make("strong", { text: value }),
      make("span", { text: label }),
      make("p", { text: caption })
    ]);
  }

  function renderAuditCard(row) {
    const lane = laneFor(row.laneId);
    return make("article", { className: "source-note-card", style: `--lane-color: ${lane.color}` }, [
      make("div", { className: "source-note-main" }, [
        make("p", { className: "meta-line", text: `${formatDate(row.date)} - ${row.chapterShort}` }),
        make("h3", { text: row.title }),
        make("div", { className: "tag-list" }, [priorityPill(row.priority), statusPill(row.status), pill(row.readiness)]),
        make("div", { className: "source-note-checks" }, row.checks.map(renderCheck)),
        make("p", { className: "source-note", text: row.sourceNote })
      ]),
      make("aside", { className: "source-note-side" }, [
        make("p", { className: "card-meta", text: "Missing / Next Source-Note Work" }),
        make(
          "ul",
          { className: "compact-list" },
          row.missing.length
            ? row.missing.map((check) => make("li", { text: `${check.label}: ${check.detail}` }))
            : [make("li", { text: "Minimum source-note control elements detected." })]
        ),
        make("div", { className: "small-actions" }, [
          make("button", { type: "button", onClick: () => copyText(sourceNoteRequestText(row), "Source-note request copied") }, "Copy Request"),
          make("a", { className: "button ghost", href: row.sourceUrl, rel: "noreferrer" }, "Open Source")
        ])
      ])
    ]);
  }

  function renderCheck(check) {
    return make("span", { className: `source-note-check ${check.pass ? "pass" : "fail"}`, text: `${check.pass ? "OK" : "Missing"}: ${check.label}` });
  }

  function sourceNoteRequestText(row) {
    const missing = row.missing.length ? row.missing.map((check) => check.label).join("; ") : "none";
    return [
      "FRUS Volume XXIX source-note completion request",
      `Date: ${row.date}`,
      `Chapter: ${row.chapter}`,
      `Title: ${row.title}`,
      `Readiness: ${row.readiness}`,
      `Missing elements: ${missing}`,
      `Repository: ${row.repository}`,
      `Current source note: ${row.sourceNote}`,
      `Object URL: ${row.sourceUrl}`,
      `Verification steps: ${row.verification.join("; ")}`
    ].join("\n");
  }

  async function copyText(text, message = "Copied") {
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

  function exportAudit() {
    downloadCsv("frus-v29-source-note-readiness.csv", auditRows, [
      { label: "date", value: (row) => row.date },
      { label: "title", value: (row) => row.title },
      { label: "chapter", value: (row) => row.chapter },
      { label: "priority", value: (row) => row.priority },
      { label: "status", value: (row) => row.status },
      { label: "readiness", value: (row) => row.readiness },
      { label: "score", value: (row) => `${row.score}/${row.checks.length}` },
      { label: "missing", value: (row) => row.missing.map((check) => check.label) },
      { label: "source_note", value: (row) => row.sourceNote },
      { label: "source_url", value: (row) => row.sourceUrl }
    ]);
  }

  function copyOpenRequests() {
    const rows = auditRows.filter((row) => row.missing.length || row.readiness !== "Ready for editorial review");
    copyText(rows.map(sourceNoteRequestText).join("\n\n---\n\n"), "Open source-note requests copied");
  }

  function initAudit() {
    renderAudit();
    qs("#source-note-export")?.addEventListener("click", exportAudit);
    qs("#source-note-copy-open")?.addEventListener("click", copyOpenRequests);
  }

  document.addEventListener("DOMContentLoaded", initAudit);
})();
