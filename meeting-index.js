(() => {
  const data = window.GLOBAL_ISSUES_DATA;
  if (!data) return;

  const lanes = new Map(data.lanes.map((lane) => [lane.id, lane]));
  let visibleAnchors = [];

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

  function formatDate(value) {
    if (!value) return "Undated";
    const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) {
      const [, year, month, day] = iso.map(Number);
      return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC"
      });
    }
    return value;
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

  function catalogUrl(naid) {
    return `https://catalog.archives.gov/id/${naid}`;
  }

  function parseAnchors(record) {
    const note = record.sourceNote || "";
    const rows = [];
    const seen = new Set();

    const add = (material, dateLabel, naid, noteFlag = "") => {
      const key = `${material}:${naid}`;
      if (seen.has(key)) return;
      seen.add(key);
      rows.push({
        ...record,
        material,
        anchorDate: dateLabel || record.date,
        naid,
        noteFlag,
        anchorKind: anchorKind(record, material),
        followup: followupFor(record, material),
        catalogUrl: catalogUrl(naid),
        chapter: laneName(record.laneId),
        chapterShort: laneFor(record.laneId).shortName
      });
    };

    for (const match of note.matchAll(/\[(Presidential Daily Diary|Presidential Daily Backup)\]\s+([^,\.;]+?)(?:\s+\[([^\]]+)\])?,\s+NAID\s+(\d+)/gi)) {
      add(match[1], match[2].trim(), match[4], match[3] || "");
    }

    for (const match of note.matchAll(/(?:President's|Presidential) Daily Diary Entry,\s+([^,]+?,\s+\d{4}),\s+NAID\s+(\d+)/gi)) {
      add("Presidential Daily Diary", match[1].trim(), match[2], "catalog item");
    }

    if (/Presidential Daily Diary and Daily Backup Materials/i.test(record.sourcePool || "")) {
      const match = (record.sourceUrl || "").match(/catalog\.archives\.gov\/id\/(\d+)/i);
      if (match) add("Presidential Daily Diary", record.date, match[1], "catalog item");
    }

    return rows;
  }

  function anchorKind(record, material) {
    const combined = `${record.type || ""} ${record.title || ""} ${record.sourceNote || ""}`;
    if (/telephone call|telcon|call lead|telephone calls/i.test(combined)) return "Call lead";
    if (/meeting|meeting lead/i.test(combined)) return "Meeting lead";
    if (/contact marker/i.test(combined)) return "Contact marker";
    if (/public reference|public anchor|speech|address|remarks|statement/i.test(combined)) return "Public-event backup";
    if (/summit/i.test(combined)) return "Summit schedule";
    if (/Backup/i.test(material)) return "Daily Backup anchor";
    return "Daily Diary anchor";
  }

  function followupFor(record, material) {
    const combined = `${record.type || ""} ${record.title || ""} ${record.sourceNote || ""}`;
    if (/telephone call|telcon|call lead|telephone calls/i.test(combined)) {
      return "Locate the separate telcon, memcon if any, phone log, briefing paper, talking points, and follow-up memoranda.";
    }
    if (/meeting|meeting lead/i.test(combined)) {
      return "Locate meeting memcon, briefing paper, agenda, talking points, participant list, schedule backup, and follow-up memoranda.";
    }
    if (/public reference|public anchor|speech|address|remarks|statement/i.test(combined)) {
      return "Use the diary or backup anchor to request speech drafts, clearance memoranda, briefing books, schedule backup, and agency comments.";
    }
    if (/summit/i.test(combined)) {
      return "Request summit schedule backup, briefing book, decision memoranda, communique clearance, and follow-up records.";
    }
    if (/Backup/i.test(material)) {
      return "Review backup contents for briefing memoranda, agendas, talking points, telephone memoranda, and supporting schedule material.";
    }
    return "Use the diary anchor for date and participant control, then request separate substantive memoranda and briefing files.";
  }

  function buildAnchors() {
    return data.records
      .flatMap(parseAnchors)
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          rank(a.priority) - rank(b.priority) ||
          a.anchorKind.localeCompare(b.anchorKind) ||
          a.naid.localeCompare(b.naid)
      );
  }

  function filters() {
    return {
      query: qs("#meeting-search")?.value || "",
      lane: qs("#meeting-lane")?.value || "",
      kind: qs("#meeting-kind")?.value || "",
      material: qs("#meeting-material")?.value || ""
    };
  }

  function render() {
    const root = qs("#meeting-index-root");
    if (!root) return;
    const current = filters();
    const rows = buildAnchors();
    visibleAnchors = rows.filter(
      (row) =>
        matches(row, current.query) &&
        (!current.lane || row.laneId === current.lane) &&
        (!current.kind || row.anchorKind === current.kind) &&
        (!current.material || row.material === current.material)
    );

    const summary = qs("#meeting-summary");
    if (summary) {
      const chapter = current.lane ? ` in ${laneName(current.lane)}` : "";
      summary.textContent = `Showing ${visibleAnchors.length} of ${rows.length} meeting and call anchors${chapter}.`;
    }

    const diaryCount = visibleAnchors.filter((row) => row.material === "Presidential Daily Diary").length;
    const backupCount = visibleAnchors.filter((row) => row.material === "Presidential Daily Backup").length;
    const parentRecords = new Set(visibleAnchors.map((row) => row.id)).size;
    const directLeads = visibleAnchors.filter((row) => /Call lead|Meeting lead|Contact marker/i.test(row.anchorKind)).length;

    root.replaceChildren(
      make("div", { className: "meeting-metrics" }, [
        metric(String(visibleAnchors.length), "diary/backup anchors", "Extracted NAIDs tied to chronology leads"),
        metric(String(parentRecords), "parent records", "Chronology items with meeting or schedule controls"),
        metric(String(diaryCount), "daily diary", "Timing and participant anchors"),
        metric(String(backupCount || directLeads), backupCount ? "daily backup" : "direct leads", "Backup files or direct meeting/call leads")
      ]),
      ...renderGroups(visibleAnchors)
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
    if (!rows.length) return [make("p", { className: "empty", text: "No meeting or call anchors match the current filters." })];
    const groups = new Map();
    rows.forEach((row) => {
      if (!groups.has(row.date)) groups.set(row.date, []);
      groups.get(row.date).push(row);
    });
    return [...groups.entries()].map(([date, groupRows]) =>
      make("article", { className: "meeting-date-group" }, [
        make("div", { className: "meeting-date-heading" }, [
          make("div", {}, [
            make("p", { className: "kicker", text: "Control Date" }),
            make("h3", { text: formatDate(date) })
          ]),
          make("p", { text: `${groupRows.length} anchors / ${new Set(groupRows.map((row) => row.naid)).size} NAIDs` })
        ]),
        make("div", { className: "meeting-anchor-list" }, groupRows.map(renderAnchor))
      ])
    );
  }

  function renderAnchor(row) {
    const lane = laneFor(row.laneId);
    return make("div", { className: "meeting-anchor", style: `--lane-color: ${lane.color}` }, [
      make("div", { className: "meeting-main" }, [
        make("p", { className: "meta-line", text: `${row.anchorDate} - ${row.chapter}` }),
        make("h3", { text: row.title }),
        make("div", { className: "tag-list" }, [
          priorityPill(row.priority),
          statusPill(row.status),
          pill(row.anchorKind),
          pill(row.material)
        ]),
        make("p", {}, [make("strong", { text: "Compiler use: " }), row.compilerUse]),
        make("p", { className: "meeting-followup" }, [make("strong", { text: "Follow-up request: " }), row.followup])
      ]),
      make("aside", { className: "meeting-side" }, [
        make("p", { className: "card-meta", text: "Catalog Control" }),
        make("code", { text: `NAID ${row.naid}` }),
        row.noteFlag ? make("p", { text: `Note: ${row.noteFlag}` }) : null,
        make("p", { className: "card-meta", text: "Verification" }),
        make("ul", { className: "compact-list" }, row.verification.map((item) => make("li", { text: item }))),
        make("div", { className: "small-actions" }, [
          make("button", { type: "button", onClick: () => copyText(requestText(row), "Meeting/call request copied") }, "Copy Request"),
          make("a", { className: "button ghost", href: row.catalogUrl, rel: "noreferrer" }, "Open NAID")
        ])
      ])
    ]);
  }

  function requestText(row) {
    return [
      "FRUS Volume XXIX meeting/call control request",
      `Date: ${row.date}`,
      `Anchor date: ${row.anchorDate}`,
      `Chapter: ${row.chapter}`,
      `Parent chronology lead: ${row.title}`,
      `Anchor type: ${row.anchorKind}`,
      `Material: ${row.material}`,
      `Known NAID: NAID ${row.naid}`,
      `Catalog URL: ${row.catalogUrl}`,
      `Requested follow-up: ${row.followup}`,
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
    downloadCsv("frus-v29-meeting-call-control-index.csv", visibleAnchors, [
      { label: "date", value: (row) => row.date },
      { label: "anchor_date", value: (row) => row.anchorDate },
      { label: "title", value: (row) => row.title },
      { label: "chapter", value: (row) => row.chapter },
      { label: "anchor_type", value: (row) => row.anchorKind },
      { label: "material", value: (row) => row.material },
      { label: "naid", value: (row) => `NAID ${row.naid}` },
      { label: "catalog_url", value: (row) => row.catalogUrl },
      { label: "followup", value: (row) => row.followup },
      { label: "source_note", value: (row) => row.sourceNote },
      { label: "verification", value: (row) => row.verification }
    ]);
  }

  function initControls() {
    const rows = buildAnchors();
    fillSelect(qs("#meeting-lane"), data.lanes.map((lane) => lane.id), "All chapters", laneName);
    fillSelect(qs("#meeting-kind"), unique(rows.map((row) => row.anchorKind)), "All anchors");
    fillSelect(qs("#meeting-material"), unique(rows.map((row) => row.material)), "All materials");
    ["#meeting-search", "#meeting-lane", "#meeting-kind", "#meeting-material"].forEach((selector) => {
      const node = qs(selector);
      if (!node) return;
      node.addEventListener(node.tagName === "INPUT" ? "input" : "change", render);
    });
    qs("#meeting-reset")?.addEventListener("click", () => {
      ["#meeting-search", "#meeting-lane", "#meeting-kind", "#meeting-material"].forEach((selector) => {
        const node = qs(selector);
        if (node) node.value = "";
      });
      render();
    });
    qs("#meeting-export")?.addEventListener("click", exportRows);
    qs("#meeting-copy")?.addEventListener("click", () =>
      copyText(visibleAnchors.map(requestText).join("\n\n---\n\n"), "Visible meeting/call requests copied")
    );
  }

  function init() {
    initControls();
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
