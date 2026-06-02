(() => {
  const data = window.GLOBAL_ISSUES_DATA;
  if (!data) return;

  const lanes = new Map(data.lanes.map((lane) => [lane.id, lane]));
  let visibleRows = [];

  const postureOrder = [
    "Published public text",
    "No-document contact marker",
    "Diary or backup control only",
    "Catalog scope-note lead",
    "Provisional source search",
    "Release status needs confirmation",
    "Item control present"
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

  function hasReleaseSignal(record) {
    return /(Published text|public|declassified|No Memcon|catalog scope note|scope note|not yet identified|records remain to be located|status)/i.test(
      `${record.sourceNote || ""} ${record.status || ""}`
    );
  }

  function postureFor(record) {
    const note = record.sourceNote || "";
    if (record.status === "Public anchor" || /Published text|Public Papers|GovInfo/i.test(note)) return "Published public text";
    if (/No Memcon|No memorandum of conversation is listed/i.test(note) || /Contact marker/i.test(record.type || "")) {
      return "No-document contact marker";
    }
    if (/catalog scope note/i.test(note)) return "Catalog scope-note lead";
    if (hasDailyDiary(record)) return "Diary or backup control only";
    if (/file unit and item title not yet identified|catalog\.archives\.gov\/search/i.test(`${note} ${record.sourceUrl || ""}`)) {
      return "Provisional source search";
    }
    if (!hasReleaseSignal(record)) return "Release status needs confirmation";
    return "Item control present";
  }

  function actionFor(record, posture) {
    if (posture === "Published public text") {
      return "Keep the published text as a public anchor; locate internal drafts, clearance memoranda, briefing papers, and follow-up records before selecting a FRUS document.";
    }
    if (posture === "No-document contact marker") {
      return "Record the no-document marker separately and request related briefing, schedule, telcon, memcon, or follow-up files before treating it as a candidate.";
    }
    if (posture === "Diary or backup control only") {
      return "Use diary/backup material for timing and participant control, then request the separate substantive record and its classification or release status.";
    }
    if (posture === "Catalog scope-note lead") {
      return "Treat the catalog description as a lead; request the underlying record, attachments if any, and classification/release markings.";
    }
    if (posture === "Provisional source search") {
      return "Replace search-level source wording with repository, collection, file unit, item title, identifier, date, and release status.";
    }
    if (posture === "Release status needs confirmation") {
      return "Confirm classification marking, declassification authority, public-release basis, and any sanitization before final source-note drafting.";
    }
    return "Close-read for drafting/routing details and confirm release status remains compatible with final FRUS source-note language.";
  }

  function gapFor(record, posture) {
    if (posture === "Published public text") return "Internal policy record not yet paired with the public statement.";
    if (posture === "No-document contact marker") return "No substantive conversation record is controlled.";
    if (posture === "Diary or backup control only") return "Diary/backup confirms schedule context but not substantive content.";
    if (posture === "Catalog scope-note lead") return "Catalog scope note is not the underlying FRUS document.";
    if (posture === "Provisional source search") return "File unit, item title, identifier, or release status is not yet controlled.";
    if (posture === "Release status needs confirmation") return "Classification/declassification/public-release status is not explicit enough.";
    return "Minimum control exists; still confirm classification, drafting/routing, and declassification details during close-read.";
  }

  function releaseFields(record, posture) {
    const fields = [];
    if (!hasIdentifier(record)) fields.push("stable identifier");
    if (!hasItemControl(record)) fields.push("file unit or item title");
    if (!hasReleaseSignal(record)) fields.push("release/classification status");
    if (posture === "Published public text") fields.push("internal document pair");
    if (posture === "No-document contact marker") fields.push("substantive follow-up record");
    if (/Daily Diary|Backup|scope-note/i.test(posture)) fields.push("underlying substantive file");
    return fields.length ? unique(fields) : ["classification and routing confirmation"];
  }

  function buildRows() {
    return data.records
      .map((record) => {
        const lane = laneFor(record.laneId);
        const posture = postureFor(record);
        const fields = releaseFields(record, posture);
        return {
          ...record,
          chapter: lane.name,
          chapterShort: lane.shortName,
          releasePosture: posture,
          releaseAction: actionFor(record, posture),
          releaseGap: gapFor(record, posture),
          requiredFields: fields,
          primaryAction: fields[0],
          postureRank: postureOrder.indexOf(posture)
        };
      })
      .sort(
        (a, b) =>
          a.postureRank - b.postureRank ||
          priorityRank(a.priority) - priorityRank(b.priority) ||
          a.date.localeCompare(b.date)
      );
  }

  function filters() {
    return {
      query: qs("#release-search")?.value || "",
      lane: qs("#release-lane")?.value || "",
      posture: qs("#release-posture")?.value || "",
      action: qs("#release-action")?.value || ""
    };
  }

  function render() {
    const root = qs("#release-root");
    if (!root) return;
    const rows = buildRows();
    const current = filters();
    visibleRows = rows.filter(
      (row) =>
        matches(row, current.query) &&
        (!current.lane || row.laneId === current.lane) &&
        (!current.posture || row.releasePosture === current.posture) &&
        (!current.action || row.requiredFields.includes(current.action))
    );

    const summary = qs("#release-summary");
    if (summary) {
      const chapter = current.lane ? ` in ${laneName(current.lane)}` : "";
      summary.textContent = `Showing ${visibleRows.length} of ${rows.length} release-control rows${chapter}.`;
    }

    const publicRows = visibleRows.filter((row) => row.releasePosture === "Published public text").length;
    const controlOnly = visibleRows.filter((row) => /Diary|scope-note|No-document/i.test(row.releasePosture)).length;
    const provisional = visibleRows.filter((row) => row.releasePosture === "Provisional source search").length;
    const releaseGaps = visibleRows.filter((row) => row.requiredFields.includes("release/classification status")).length;

    root.replaceChildren(
      make("div", { className: "release-metrics" }, [
        metric(String(publicRows), "public anchors", "Need internal document pairs"),
        metric(String(controlOnly), "control-only leads", "Diary, scope-note, or no-document controls"),
        metric(String(provisional), "source searches", "Need item-level source control"),
        metric(String(releaseGaps), "release gaps", "Need classification or release confirmation")
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
    if (!rows.length) return [make("p", { className: "empty", text: "No release-control rows match the current filters." })];
    return postureOrder
      .map((posture) => rows.filter((row) => row.releasePosture === posture))
      .filter((group) => group.length)
      .map(renderGroup);
  }

  function renderGroup(rows) {
    return make("article", { className: "release-group" }, [
      make("div", { className: "release-group-heading" }, [
        make("div", {}, [
          make("p", { className: "kicker", text: "Release Posture" }),
          make("h3", { text: rows[0].releasePosture }),
          make("p", { text: groupCaption(rows[0].releasePosture) })
        ]),
        make("span", { className: "count-pill", text: `${rows.length} rows` })
      ]),
      make("div", { className: "release-list" }, rows.map(renderCard))
    ]);
  }

  function groupCaption(posture) {
    if (posture === "Published public text") return "Public record is controlled, but the internal policy paper, draft, clearance, or follow-up file remains to be found.";
    if (posture === "No-document contact marker") return "The lead is useful control evidence, not a substantive conversation record.";
    if (posture === "Diary or backup control only") return "Schedule material controls date and participants but not the policy substance.";
    if (posture === "Catalog scope-note lead") return "Catalog description identifies a lead; the underlying record still needs item-level review.";
    if (posture === "Provisional source search") return "Search-level source notes need item, identifier, and release-status control.";
    if (posture === "Release status needs confirmation") return "Classification, declassification, or public-release basis remains unclear.";
    return "Item-level control is present enough for close-read, while final source-note details still need confirmation.";
  }

  function renderCard(row) {
    const lane = laneFor(row.laneId);
    return make("div", { className: "release-card", style: `--lane-color: ${lane.color}` }, [
      make("div", { className: "release-main" }, [
        make("p", { className: "meta-line", text: `${formatDate(row.date)} - ${row.chapterShort}` }),
        make("h4", { text: row.title }),
        make("div", { className: "tag-list" }, [
          priorityPill(row.priority),
          statusPill(row.status),
          pill(row.releasePosture),
          pill(row.primaryAction)
        ]),
        make("p", { className: "release-gap" }, [make("strong", { text: "Release gap: " }), row.releaseGap]),
        make("p", { className: "release-action-text" }, [make("strong", { text: "Next release action: " }), row.releaseAction])
      ]),
      make("aside", { className: "release-side" }, [
        make("div", { className: "release-box" }, [
          make("p", { className: "card-meta", text: "Required Control Fields" }),
          make("strong", { text: row.requiredFields.join("; ") }),
          make("p", { text: `Current posture: ${row.releasePosture}` })
        ]),
        make("p", { className: "card-meta", text: "Current Source Note" }),
        make("p", { className: "release-note", text: row.sourceNote }),
        make("p", { className: "card-meta", text: "Verification" }),
        make("ul", { className: "compact-list" }, row.verification.map((item) => make("li", { text: item }))),
        make("div", { className: "small-actions" }, [
          make("button", { type: "button", onClick: () => copyText(releaseMemo(row), "Release memo copied") }, "Copy Memo"),
          make("a", { className: "button ghost", href: row.sourceUrl, rel: "noreferrer" }, "Open Source")
        ])
      ])
    ]);
  }

  function releaseMemo(row) {
    return [
      "FRUS Volume XXIX release/declassification control memo",
      `Date: ${row.date}`,
      `Chapter: ${row.chapter}`,
      `Title: ${row.title}`,
      `Release posture: ${row.releasePosture}`,
      `Required control fields: ${row.requiredFields.join("; ")}`,
      `Release gap: ${row.releaseGap}`,
      `Next release action: ${row.releaseAction}`,
      `Current source note: ${row.sourceNote}`,
      `Source URL: ${row.sourceUrl}`,
      `Verification: ${row.verification.join("; ")}`,
      `Boundary note: ${row.boundaryNotes}`
    ].join("\n");
  }

  function ledgerMarkdown(rows = visibleRows) {
    const lines = [
      "# FRUS Volume XXIX Release and Declassification Ledger",
      "",
      "Use this ledger to separate public anchors, no-document contact markers, diary/scope-note controls, provisional source searches, and records that still need classification or release-status confirmation.",
      ""
    ];
    postureOrder.forEach((posture) => {
      const group = rows.filter((row) => row.releasePosture === posture);
      if (!group.length) return;
      lines.push(`## ${posture}`, "");
      group.forEach((row) => {
        lines.push(`### ${formatDate(row.date)} - ${row.title}`);
        lines.push(`- Chapter: ${row.chapter}`);
        lines.push(`- Required control fields: ${row.requiredFields.join("; ")}`);
        lines.push(`- Release gap: ${row.releaseGap}`);
        lines.push(`- Next release action: ${row.releaseAction}`);
        lines.push(`- Current source note: ${row.sourceNote}`);
        lines.push(`- Verification: ${row.verification.join("; ")}`, "");
      });
    });
    if (!rows.length) lines.push("No release-control rows match the current filters.");
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
    downloadCsv("frus-v29-release-declassification-ledger.csv", visibleRows, [
      { label: "date", value: (row) => row.date },
      { label: "title", value: (row) => row.title },
      { label: "chapter", value: (row) => row.chapter },
      { label: "release_posture", value: (row) => row.releasePosture },
      { label: "required_control_fields", value: (row) => row.requiredFields },
      { label: "release_gap", value: (row) => row.releaseGap },
      { label: "next_release_action", value: (row) => row.releaseAction },
      { label: "priority", value: (row) => row.priority },
      { label: "status", value: (row) => row.status },
      { label: "source_note", value: (row) => row.sourceNote },
      { label: "source_url", value: (row) => row.sourceUrl },
      { label: "boundary_note", value: (row) => row.boundaryNotes },
      { label: "verification", value: (row) => row.verification }
    ]);
  }

  function initControls() {
    const rows = buildRows();
    fillSelect(qs("#release-lane"), data.lanes.map((lane) => lane.id), "All chapters", laneName);
    fillSelect(qs("#release-posture"), postureOrder.filter((posture) => rows.some((row) => row.releasePosture === posture)), "All postures");
    fillSelect(qs("#release-action"), unique(rows.flatMap((row) => row.requiredFields)), "All actions");
    ["#release-search", "#release-lane", "#release-posture", "#release-action"].forEach((selector) => {
      const node = qs(selector);
      if (!node) return;
      node.addEventListener(node.tagName === "INPUT" ? "input" : "change", render);
    });
    qs("#release-reset")?.addEventListener("click", () => {
      ["#release-search", "#release-lane", "#release-posture", "#release-action"].forEach((selector) => {
        const node = qs(selector);
        if (node) node.value = "";
      });
      render();
    });
    qs("#release-export")?.addEventListener("click", exportRows);
    qs("#release-copy")?.addEventListener("click", () => copyText(ledgerMarkdown(), "Visible release ledger copied"));
  }

  function init() {
    initControls();
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
