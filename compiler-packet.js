(() => {
  const data = window.GLOBAL_ISSUES_DATA;
  if (!data) return;

  const lanes = new Map(data.lanes.map((lane) => [lane.id, lane]));
  let packet = null;

  const qs = (selector, root = document) => root.querySelector(selector);
  const laneFor = (id) => lanes.get(id) || { id, name: "Unassigned", shortName: "Unassigned", color: "#5c6967" };
  const laneName = (id) => laneFor(id).name;
  const rank = (priority) => ({ Critical: 0, High: 1, Medium: 2, Low: 3 })[priority] ?? 4;
  const scopeLabel = (scope) =>
    scope === "priority" ? "Critical and high priority" : scope === "action" ? "Open action items" : "All packet evidence";

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

  function statusPill(text) {
    const first = String(text || "").split(/\s+/)[0] || "";
    return pill(text || "Status TBD", `status-pill ${first}`.trim());
  }

  function priorityPill(text) {
    return pill(text || "Priority TBD", `priority ${text || ""}`.trim());
  }

  function missingSourceFields(record) {
    const note = record.sourceNote || "";
    const combined = `${note} ${record.sourceUrl || ""} ${record.status || ""}`;
    const hasItem = !/file unit and item title not yet identified/i.test(note) &&
      /(Entry|Published text|Message|Address|Remarks|Letter|Statement|table|scope note|entry for)/i.test(note);
    return [
      ["repository", Boolean(record.repository && /Source:/i.test(note))],
      ["collection/series", /(Library|Museum|Department of State|Public Papers|White House Office|Presidential Daily Diary|Daily Backup|State|NSC|OES|EPA|CEQ|USAID|HHS)/i.test(note)],
      ["file unit/item", hasItem],
      ["identifier", /NAID\s+\d+|PPP-\d{4}|doc[-\w]*pg|catalog\.archives\.gov\/id\/\d+/i.test(combined)],
      ["date", Boolean(record.date) || /\b(19[89]\d|199[0-2])\b|\d{1,2}\/\d{1,2}\/\d{4}/.test(note)],
      ["release/status", /(Published text|public|declassified|status|No Memcon|not yet identified|records remain to be located|catalog scope note)/i.test(combined)],
      ["object URL", /^https?:\/\//.test(record.sourceUrl || "")]
    ].filter(([, pass]) => !pass).map(([label]) => label);
  }

  function actionFor(record) {
    if (record.status === "Public anchor") {
      return "Pair public text with speech drafts, clearance memoranda, briefing papers, or options records.";
    }
    if (record.status === "Boundary review") return "Resolve placement against regional or functional volumes before promotion.";
    if (record.status === "Needs document request" || /daily diary|contact marker/i.test(record.type)) {
      return "Request matching telcons, memcons, briefing papers, schedule backup, and State/NSC follow-up files.";
    }
    if (record.status === "Source lead") {
      return "Identify file unit and item titles, request declassified documents, and replace provisional source wording.";
    }
    return "Review after source-note control, boundary assignment, and declassification status are confirmed.";
  }

  function isOpen(record) {
    return record.status !== "Ready for editorial review" || missingSourceFields(record).length > 0;
  }

  function readPacket() {
    const laneId = qs("#packet-lane")?.value || "";
    const scope = qs("#packet-scope")?.value || "all";
    const selectedLanes = laneId ? [laneFor(laneId)] : data.lanes;
    const laneIds = new Set(selectedLanes.map((lane) => lane.id));
    const inScope = (record) =>
      laneIds.has(record.laneId) &&
      (scope === "priority" ? ["Critical", "High"].includes(record.priority) : scope === "action" ? isOpen(record) : true);
    return {
      laneId,
      scope,
      lanes: selectedLanes,
      records: data.records.filter(inScope).sort((a, b) => a.date.localeCompare(b.date) || laneName(a.laneId).localeCompare(laneName(b.laneId))),
      gaps: data.gaps.filter((gap) => laneIds.has(gap.laneId)).sort((a, b) => rank(a.priority) - rank(b.priority)),
      pools: data.sourcePools.filter((pool) => laneIds.has(pool.laneId)).sort((a, b) => rank(a.priority) - rank(b.priority)),
      people: data.persons.filter((person) => person.lanes.some((id) => laneIds.has(id))).sort((a, b) => a.name.localeCompare(b.name)),
      references: data.references.filter((ref) => laneIds.has(ref.laneId)).sort((a, b) => a.date.localeCompare(b.date)),
      attention: (data.publicAttention || []).filter((row) => laneIds.has(row.laneId)).sort((a, b) => laneName(a.laneId).localeCompare(laneName(b.laneId)))
    };
  }

  function metric(value, label, caption) {
    return make("div", { className: "metric" }, [
      make("strong", { text: value }),
      make("span", { text: label }),
      make("p", { text: caption })
    ]);
  }

  function list(rows, empty, renderer) {
    return rows.length
      ? make("div", { className: "packet-list" }, rows.map(renderer))
      : make("p", { className: "packet-alert", text: empty });
  }

  function item(children, laneId) {
    return make("div", { className: "packet-item", style: `--lane-color: ${laneFor(laneId).color}` }, children);
  }

  function panel(kicker, title, children, className = "") {
    return make("article", { className: `packet-panel ${className}`.trim() }, [
      make("p", { className: "kicker", text: kicker }),
      make("h3", { text: title }),
      children
    ]);
  }

  function render() {
    const root = qs("#packet-root");
    if (!root) return;
    packet = readPacket();
    qs("#packet-summary").textContent = `Packet for ${packet.laneId ? laneName(packet.laneId) : "all chapters"}: ${packet.records.length} chronology items, ${packet.gaps.length} gaps, ${packet.pools.length} source pools.`;
    root.replaceChildren(
      make("div", { className: "packet-metrics" }, [
        metric(String(packet.records.length), "chronology items", scopeLabel(packet.scope)),
        metric(String(packet.records.filter(isOpen).length), "open record actions", "Requests, source-note blockers, and boundary items"),
        metric(String(packet.pools.filter((pool) => ["Critical", "High"].includes(pool.priority)).length), "priority source pools", "Critical and high-priority harvest targets"),
        metric(String(packet.gaps.filter((gap) => gap.priority === "Critical").length), "critical gaps", "Must resolve before document numbering")
      ]),
      make("div", { className: "packet-grid" }, [
        overviewPanel(),
        attentionPanel(),
        standardPanel(),
        chronologyPanel(),
        sourceWorkPanel(),
        gapsPanel(),
        poolsPanel(),
        peoplePanel(),
        referencesPanel()
      ])
    );
    qs("#packet-markdown").value = markdown();
  }

  function overviewPanel() {
    const title = packet.laneId ? laneName(packet.laneId) : "All working chapters";
    const boundary = packet.laneId
      ? packet.lanes[0].boundary
      : "Use chapter boundaries below to prevent duplicate selection with regional and functional volumes.";
    return panel("Packet Scope", title, make("div", {}, [
      make("p", { text: `${scopeLabel(packet.scope)} for ${data.volume.shortTitle}.` }),
      make("p", {}, [make("strong", { text: "Boundary rule: " }), boundary]),
      make("div", { className: "tag-list" }, packet.lanes.map((lane) => pill(lane.shortName)))
    ]), "wide");
  }

  function attentionPanel() {
    return panel("Presidential Attention", "Bush public-line signal", list(packet.attention, "No public-attention rows match this packet.", (row) =>
      item([
        make("p", { className: "meta-line", text: `${laneFor(row.laneId).shortName} - ${row.directness}` }),
        make("h4", { text: row.evidenceTitle }),
        make("div", { className: "tag-list" }, [statusPill(row.attention), pill(`${row.strongHits} strong hits`)]),
        make("p", { text: row.note }),
        make("div", { className: "small-actions" }, [
          make("a", { className: "button ghost", href: row.evidenceUrl, rel: "noreferrer" }, "Evidence"),
          make("a", { className: "button ghost", href: row.naraScoutUrl, rel: "noreferrer" }, "NARA Scout")
        ])
      ], row.laneId)
    ));
  }

  function standardPanel() {
    return panel("FRUS Source Notes", "Minimum promotion standard", make("ul", { className: "compact-list packet-standard" }, [
      make("li", { text: "Repository and collection or record group" }),
      make("li", { text: "Series, file unit, folder, or item title" }),
      make("li", { text: "Date, document identifier, release status, and object URL" }),
      make("li", { text: "Public anchors paired with internal drafts, clearance files, briefing papers, or decision records" })
    ]));
  }

  function chronologyPanel() {
    return panel("Chronology", "Documents and source leads in packet order", list(packet.records, "No chronology items match this packet scope.", (record) =>
      item([
        make("p", { className: "meta-line", text: `${formatDate(record.date)} - ${laneName(record.laneId)}` }),
        make("h4", { text: record.title }),
        make("div", { className: "tag-list" }, [priorityPill(record.priority), statusPill(record.status), pill(record.type)]),
        make("p", {}, [make("strong", { text: "Compiler use: " }), record.compilerUse]),
        make("p", {}, [make("strong", { text: "Next action: " }), actionFor(record)]),
        make("p", { className: "source-note", text: record.sourceNote }),
        make("div", { className: "small-actions" }, [
          make("button", { type: "button", onClick: () => copyText(record.sourceNote, "Source note copied") }, "Copy Note"),
          make("a", { className: "button ghost", href: record.sourceUrl, rel: "noreferrer" }, "Open Source")
        ])
      ], record.laneId)
    ), "full");
  }

  function sourceWorkPanel() {
    const rows = packet.records.filter(isOpen);
    return panel("Source-Note Work", "Open requests before promotion", list(rows, "No source-note or promotion blockers detected in this packet scope.", (record) => {
      const missing = missingSourceFields(record);
      return item([
        make("p", { className: "meta-line", text: `${formatDate(record.date)} - ${record.status}` }),
        make("h4", { text: record.title }),
        make("p", {}, [make("strong", { text: "Missing source-note elements: " }), missing.length ? missing.join("; ") : "minimum elements detected"]),
        make("p", {}, [make("strong", { text: "Action: " }), actionFor(record)]),
        make("p", {}, [make("strong", { text: "Verification: " }), record.verification.join("; ")])
      ], record.laneId);
    }), "wide");
  }

  function gapsPanel() {
    return panel("Gaps", "Chapter risks", list(packet.gaps, "No gaps match this packet.", (gap) =>
      item([
        make("p", { className: "meta-line", text: laneName(gap.laneId) }),
        make("h4", { text: gap.problem }),
        make("div", { className: "tag-list" }, [priorityPill(gap.priority), statusPill(gap.status)]),
        make("p", {}, [make("strong", { text: "Action: " }), gap.action])
      ], gap.laneId)
    ));
  }

  function poolsPanel() {
    return panel("Source Pools", "Next archival harvest", list(packet.pools, "No source pools match this packet.", (pool) =>
      item([
        make("p", { className: "meta-line", text: laneName(pool.laneId) }),
        make("h4", { text: pool.name }),
        make("div", { className: "tag-list" }, [priorityPill(pool.priority), ...pool.terms.slice(0, 3).map((term) => pill(term))]),
        make("p", {}, [make("strong", { text: "Next action: " }), pool.nextAction]),
        make("a", { className: "button ghost", href: pool.url, rel: "noreferrer" }, "Open")
      ], pool.laneId)
    ));
  }

  function peoplePanel() {
    return panel("People", "Names to control", list(packet.people, "No people match this packet.", (person) =>
      item([
        make("h4", { text: person.name }),
        make("p", { text: person.role }),
        make("p", {}, [make("strong", { text: "Compiler check: " }), person.compilerCheck])
      ])
    ));
  }

  function referencesPanel() {
    return panel("References", "Public and official anchors", list(packet.references, "No references match this packet.", (ref) =>
      item([
        make("p", { className: "meta-line", text: `${formatDate(ref.date)} - ${ref.kind}` }),
        make("h4", { text: ref.title }),
        make("p", { text: ref.compilerUse }),
        make("a", { className: "button ghost", href: ref.url, rel: "noreferrer" }, "Open")
      ], ref.laneId)
    ));
  }

  function markdown() {
    const p = packet || readPacket();
    const title = p.laneId ? laneName(p.laneId) : "All Working Chapters";
    const lines = [
      `# ${data.volume.shortTitle} Compiler Packet: ${title}`,
      "",
      `Generated: ${new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}`,
      `Scope: ${scopeLabel(p.scope)}`,
      `Official volume page: ${data.volume.officialUrl}`,
      "",
      "## Source-Note Promotion Standard",
      "",
      "- Repository and collection or record group.",
      "- Series, file unit, folder, or item title.",
      "- Date, document identifier, release status, and object URL.",
      "- Public anchors paired with internal drafts, clearance files, briefing papers, or decision records.",
      ""
    ];
    appendAttention(lines, p);
    appendChronology(lines, p);
    appendRequests(lines, p);
    appendGaps(lines, p);
    appendPools(lines, p);
    appendPeople(lines, p);
    appendReferences(lines, p);
    return lines.join("\n");
  }

  function appendAttention(lines, p) {
    lines.push("## Presidential Attention", "");
    p.attention.forEach((row) => {
      lines.push(`- ${laneName(row.laneId)}: ${row.attention}; ${row.directness}.`);
      lines.push(`  - Evidence: ${row.evidenceDate}, ${row.evidenceTitle}`);
      lines.push(`  - URL: ${row.evidenceUrl}`);
      lines.push(`  - NARA Scout: ${row.naraScoutUrl}`);
      lines.push(`  - Note: ${row.note}`);
    });
    if (!p.attention.length) lines.push("- No public-attention rows match this packet.");
    lines.push("");
  }

  function appendChronology(lines, p) {
    lines.push("## Chronology and Document Leads", "");
    p.records.forEach((record) => {
      lines.push(`### ${record.date} - ${record.title}`, "");
      lines.push(`- Chapter: ${laneName(record.laneId)}`);
      lines.push(`- Priority / status: ${record.priority}; ${record.status}`);
      lines.push(`- Type: ${record.type}`);
      lines.push(`- People: ${record.people.join("; ")}`);
      lines.push(`- Repository: ${record.repository}`);
      lines.push(`- Source URL: ${record.sourceUrl}`);
      lines.push(`- Source note: ${record.sourceNote}`);
      lines.push(`- Compiler use: ${record.compilerUse}`);
      lines.push(`- Boundary note: ${record.boundaryNotes}`);
      lines.push(`- Next action: ${actionFor(record)}`);
      lines.push(`- Verification: ${record.verification.join("; ")}`, "");
    });
    if (!p.records.length) lines.push("- No chronology items match this packet scope.", "");
  }

  function appendRequests(lines, p) {
    const rows = p.records.filter(isOpen);
    lines.push("## Open Source-Note and Promotion Requests", "");
    rows.forEach((record) => {
      const missing = missingSourceFields(record);
      lines.push(`- ${record.date} - ${record.title}`);
      lines.push(`  - Missing source-note elements: ${missing.length ? missing.join("; ") : "minimum elements detected"}`);
      lines.push(`  - Request: ${actionFor(record)}`);
      lines.push(`  - Current source note: ${record.sourceNote}`);
    });
    if (!rows.length) lines.push("- No source-note or promotion blockers detected in this packet scope.");
    lines.push("");
  }

  function appendGaps(lines, p) {
    lines.push("## Open Compiler Gaps", "");
    p.gaps.forEach((gap) => {
      lines.push(`- ${gap.priority} - ${laneName(gap.laneId)} - ${gap.problem}`);
      lines.push(`  - Evidence: ${gap.evidence}`);
      lines.push(`  - Action: ${gap.action}`);
      lines.push(`  - Risk: ${gap.risk}`);
    });
    if (!p.gaps.length) lines.push("- No gaps match this packet.");
    lines.push("");
  }

  function appendPools(lines, p) {
    lines.push("## Source Pools", "");
    p.pools.forEach((pool) => {
      lines.push(`- ${pool.priority} - ${pool.name}`);
      lines.push(`  - Chapter: ${laneName(pool.laneId)}`);
      lines.push(`  - Repository: ${pool.repository}`);
      lines.push(`  - Coverage: ${pool.coverage}`);
      lines.push(`  - Next action: ${pool.nextAction}`);
      lines.push(`  - Terms: ${pool.terms.join("; ")}`);
      lines.push(`  - URL: ${pool.url}`);
    });
    if (!p.pools.length) lines.push("- No source pools match this packet.");
    lines.push("");
  }

  function appendPeople(lines, p) {
    lines.push("## People to Control", "");
    p.people.forEach((person) => {
      lines.push(`- ${person.name} - ${person.role}`);
      lines.push(`  - Terms: ${person.terms.join("; ")}`);
      lines.push(`  - Compiler check: ${person.compilerCheck}`);
    });
    if (!p.people.length) lines.push("- No people match this packet.");
    lines.push("");
  }

  function appendReferences(lines, p) {
    lines.push("## Public and Official Anchors", "");
    p.references.forEach((ref) => {
      lines.push(`- ${ref.date} - ${ref.title}`);
      lines.push(`  - Kind: ${ref.kind}`);
      lines.push(`  - Chapter: ${laneName(ref.laneId)}`);
      lines.push(`  - URL: ${ref.url}`);
      lines.push(`  - Compiler use: ${ref.compilerUse}`);
    });
    if (!p.references.length) lines.push("- No references match this packet.");
    lines.push("");
  }

  async function copyText(text, message) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(message);
      return;
    } catch (error) {
      const textarea = qs("#packet-markdown") || make("textarea");
      textarea.value = text;
      if (!textarea.isConnected) {
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.append(textarea);
      }
      textarea.focus();
      textarea.select();
      const copied = document.execCommand("copy");
      if (!qs("#packet-markdown")) textarea.remove();
      showToast(copied ? message : "Packet text selected");
    }
  }

  function showToast(message) {
    const toast = qs("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    window.setTimeout(() => toast.classList.remove("visible"), 2200);
  }

  function downloadText(filename, content) {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = make("a", { href: url, download: filename });
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function filename() {
    const scope = packet?.laneId ? laneFor(packet.laneId).shortName : "all-chapters";
    return `frus-v29-compiler-packet-${scope.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
  }

  function init() {
    const select = qs("#packet-lane");
    if (!select) return;
    select.replaceChildren(
      make("option", { value: "", text: "All chapters" }),
      ...data.lanes.map((lane) => make("option", { value: lane.id, text: lane.name }))
    );
    select.addEventListener("change", render);
    qs("#packet-scope")?.addEventListener("change", render);
    qs("#packet-copy")?.addEventListener("click", () => copyText(markdown(), "Compiler packet copied"));
    qs("#packet-export")?.addEventListener("click", () => downloadText(filename(), markdown()));
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
