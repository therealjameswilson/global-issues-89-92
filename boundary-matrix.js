(() => {
  const data = window.GLOBAL_ISSUES_DATA;
  if (!data) return;

  const lanes = new Map(data.lanes.map((lane) => [lane.id, lane]));
  const laneOrder = new Map(data.lanes.map((lane, index) => [lane.id, index]));
  let visibleRows = [];

  const decisionOrder = [
    "Retain in Volume XXIX",
    "Request global-policy record first",
    "Coordinate with regional volume",
    "Coordinate with functional volume",
    "Domestic-policy exclusion risk",
    "Boundary hold"
  ];

  const qs = (selector, root = document) => root.querySelector(selector);
  const laneFor = (id) => lanes.get(id) || { id, name: "Unassigned", number: "Chapter ?", shortName: "Unassigned", color: "#5c6967", boundary: "Boundary rule not assigned." };
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

  function textFor(record) {
    return `${record.title || ""} ${record.type || ""} ${record.tags?.join(" ") || ""} ${record.sourceNote || ""} ${record.compilerUse || ""} ${record.boundaryNotes || ""}`;
  }

  function overlapTargets(record) {
    const text = textFor(record);
    const targets = [];
    if (/Somalia|Balkans|Yugoslavia|peacekeeping|humanitarian intervention/i.test(text)) {
      targets.push("Somalia / Yugoslavia crisis volumes");
    }
    if (/Persian Gulf|Iraq|Gulf War|Kurdish|Provide Comfort/i.test(text)) {
      targets.push("Persian Gulf / Iraq volumes");
    }
    if (/Europe|CSCE|Charter of Paris|Eastern Europe|European Security/i.test(text)) {
      targets.push("Europe / CSCE volumes");
    }
    if (/Cuba|Haiti|asylum|migration/i.test(text)) {
      targets.push("Caribbean / migration crisis volumes");
    }
    if (/Paris Economic Summit|G7|financing|trade|economic/i.test(text)) {
      targets.push("Foreign Economic Policy volume");
    }
    if (/Arms-control|arms control|outer space|aviation|treaty/i.test(text)) {
      targets.push("Arms control / legal functional volumes");
    }
    if (/domestic|Clean Air Act|Arctic National Wildlife Refuge|Interior|family planning|health implementation/i.test(text)) {
      targets.push("Domestic policy exclusion review");
    }
    if (/Rio|UNCED|biodiversity|forests|Framework Convention|climate/i.test(text)) {
      targets.push("Environment/Rio internal chapter boundary");
    }
    if (/ozone|Montreal Protocol|CFC|whaling|wildlife|conservation/i.test(text)) {
      targets.push("Environment subchapter boundary");
    }
    if (!targets.length) targets.push("Volume XXIX internal scope review");
    return unique(targets);
  }

  function decisionFor(record, targets) {
    const text = textFor(record);
    if (record.status === "Boundary review") return "Boundary hold";
    if (/domestic|Clean Air Act|Arctic National Wildlife Refuge|Interior/i.test(text)) return "Domestic-policy exclusion risk";
    if (/Foreign Economic Policy|G7|financing|trade|economic/i.test(targets.join(" "))) return "Coordinate with functional volume";
    if (/Arms control|legal functional/i.test(targets.join(" "))) return "Coordinate with functional volume";
    if (/Somalia|Yugoslavia|Persian Gulf|Iraq|Europe|CSCE|Caribbean/i.test(targets.join(" "))) {
      return /doctrine|global|cross-regional|collective security|UN reform|humanitarian doctrine/i.test(text)
        ? "Coordinate with regional volume"
        : "Boundary hold";
    }
    if (record.status === "Needs document request" || /daily diary|contact marker/i.test(record.type || "")) {
      return "Request global-policy record first";
    }
    return "Retain in Volume XXIX";
  }

  function ruleFor(record, decision, targets) {
    if (decision === "Retain in Volume XXIX") {
      return "Retain if the document states global doctrine, multilateral policy, or cross-regional U.S. posture rather than a single-country operation.";
    }
    if (decision === "Request global-policy record first") {
      return "Use the lead only as control evidence until the matching substantive record shows a global-policy issue fit for Volume XXIX.";
    }
    if (decision === "Coordinate with regional volume") {
      return `Coordinate with ${targets.filter((target) => /volume/i.test(target)).join("; ") || "adjacent regional volume"} and retain only doctrine, cross-regional policy, or multilateral architecture.`;
    }
    if (decision === "Coordinate with functional volume") {
      return `Coordinate with ${targets.join("; ")} and retain only the global-issues dimension if it is stronger than the economic, legal, or arms-control assignment.`;
    }
    if (decision === "Domestic-policy exclusion risk") {
      return "Exclude domestic implementation unless it directly shaped U.S. international posture, treaty policy, or multilateral negotiations.";
    }
    return "Hold until the compiler can identify whether the record is global doctrine, regional operation, domestic implementation, or another functional volume's core evidence.";
  }

  function coordinationAction(record, decision, targets) {
    if (decision === "Retain in Volume XXIX") {
      return "Proceed with source-note control and document selection, while recording any internal chapter boundary notes.";
    }
    if (decision === "Request global-policy record first") {
      return "Request memcon, telcon, briefing paper, decision memorandum, or follow-up record before deciding volume placement.";
    }
    if (decision === "Coordinate with regional volume") {
      return "Send title, date, participants, source note, and boundary rationale to the relevant regional compiler before numbering.";
    }
    if (decision === "Coordinate with functional volume") {
      return "Compare document purpose against the functional volume and retain only if the global-issues aspect is primary.";
    }
    if (decision === "Domestic-policy exclusion risk") {
      return "Look for treaty, multilateral, or international-negotiating context; otherwise keep as excluded support evidence.";
    }
    return "Keep in the boundary queue and do not promote to final selection until placement evidence is stronger.";
  }

  function buildRows() {
    return data.records
      .map((record) => {
        const lane = laneFor(record.laneId);
        const targets = overlapTargets(record);
        const decision = decisionFor(record, targets);
        return {
          ...record,
          chapter: lane.name,
          chapterShort: lane.shortName,
          chapterNumber: lane.number,
          chapterBoundary: lane.boundary,
          overlapTargets: targets,
          primaryOverlap: targets[0],
          boundaryDecision: decision,
          boundaryRule: ruleFor(record, decision, targets),
          coordinationAction: coordinationAction(record, decision, targets),
          decisionRank: decisionOrder.indexOf(decision)
        };
      })
      .sort(
        (a, b) =>
          a.decisionRank - b.decisionRank ||
          (laneOrder.get(a.laneId) ?? 99) - (laneOrder.get(b.laneId) ?? 99) ||
          priorityRank(a.priority) - priorityRank(b.priority) ||
          a.date.localeCompare(b.date)
      );
  }

  function filters() {
    return {
      query: qs("#boundary-search")?.value || "",
      lane: qs("#boundary-lane")?.value || "",
      decision: qs("#boundary-decision")?.value || "",
      overlap: qs("#boundary-overlap")?.value || ""
    };
  }

  function render() {
    const root = qs("#boundary-root");
    if (!root) return;
    const rows = buildRows();
    const current = filters();
    visibleRows = rows.filter(
      (row) =>
        matches(row, current.query) &&
        (!current.lane || row.laneId === current.lane) &&
        (!current.decision || row.boundaryDecision === current.decision) &&
        (!current.overlap || row.overlapTargets.includes(current.overlap))
    );

    const summary = qs("#boundary-summary");
    if (summary) {
      const chapter = current.lane ? ` in ${laneName(current.lane)}` : "";
      summary.textContent = `Showing ${visibleRows.length} of ${rows.length} boundary rows${chapter}.`;
    }

    const retain = visibleRows.filter((row) => row.boundaryDecision === "Retain in Volume XXIX").length;
    const coordinate = visibleRows.filter((row) => /Coordinate/.test(row.boundaryDecision)).length;
    const holds = visibleRows.filter((row) => row.boundaryDecision === "Boundary hold").length;
    const requestFirst = visibleRows.filter((row) => row.boundaryDecision === "Request global-policy record first").length;

    root.replaceChildren(
      make("div", { className: "boundary-metrics" }, [
        metric(String(retain), "retain candidates", "Likely Volume XXIX after source control"),
        metric(String(coordinate), "coordination rows", "Need regional or functional compiler check"),
        metric(String(holds), "boundary holds", "Do not number until placement is settled"),
        metric(String(requestFirst), "request first", "Need substantive global-policy record")
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
    if (!rows.length) return [make("p", { className: "empty", text: "No boundary rows match the current filters." })];
    return decisionOrder
      .map((decision) => rows.filter((row) => row.boundaryDecision === decision))
      .filter((group) => group.length)
      .map(renderGroup);
  }

  function renderGroup(rows) {
    return make("article", { className: "boundary-group" }, [
      make("div", { className: "boundary-group-heading" }, [
        make("div", {}, [
          make("p", { className: "kicker", text: "Boundary Decision" }),
          make("h3", { text: rows[0].boundaryDecision }),
          make("p", { text: groupCaption(rows[0].boundaryDecision) })
        ]),
        make("span", { className: "count-pill", text: `${rows.length} rows` })
      ]),
      make("div", { className: "boundary-list" }, rows.map(renderCard))
    ]);
  }

  function groupCaption(decision) {
    if (decision === "Retain in Volume XXIX") return "Rows that currently look like global-issues evidence, subject to source-note and declassification control.";
    if (decision === "Request global-policy record first") return "Rows where the current lead does not yet prove the substantive global-policy document.";
    if (decision === "Coordinate with regional volume") return "Rows that could duplicate regional crisis or country volumes unless the doctrine element is primary.";
    if (decision === "Coordinate with functional volume") return "Rows that may belong with economic, legal, treaty, or other functional volumes.";
    if (decision === "Domestic-policy exclusion risk") return "Rows where domestic implementation may dominate the source unless international context is found.";
    return "Rows held until the compiler resolves volume placement.";
  }

  function renderCard(row) {
    const lane = laneFor(row.laneId);
    return make("div", { className: "boundary-card", style: `--lane-color: ${lane.color}` }, [
      make("div", { className: "boundary-main" }, [
        make("p", { className: "meta-line", text: `${formatDate(row.date)} - ${row.chapterShort}` }),
        make("h4", { text: row.title }),
        make("div", { className: "tag-list" }, [
          priorityPill(row.priority),
          statusPill(row.status),
          pill(row.boundaryDecision),
          pill(row.primaryOverlap)
        ]),
        make("p", { className: "boundary-rule" }, [make("strong", { text: "Placement rule: " }), row.boundaryRule]),
        make("p", { className: "boundary-coordinate" }, [make("strong", { text: "Coordination action: " }), row.coordinationAction]),
        make("p", { className: "boundary-note" }, [make("strong", { text: "Record boundary note: " }), row.boundaryNotes])
      ]),
      make("aside", { className: "boundary-side" }, [
        make("div", { className: "boundary-decision-box" }, [
          make("p", { className: "card-meta", text: "Adjacent Volume / Boundary Target" }),
          make("strong", { text: row.primaryOverlap }),
          make("p", { text: row.overlapTargets.join("; ") })
        ]),
        make("p", { className: "card-meta", text: "Chapter Boundary Rule" }),
        make("p", { className: "boundary-note", text: row.chapterBoundary }),
        make("p", { className: "card-meta", text: "Verification" }),
        make("ul", { className: "compact-list" }, row.verification.map((item) => make("li", { text: item }))),
        make("div", { className: "small-actions" }, [
          make("button", { type: "button", onClick: () => copyText(boundaryMemo(row), "Boundary memo copied") }, "Copy Memo"),
          make("a", { className: "button ghost", href: row.sourceUrl, rel: "noreferrer" }, "Open Source")
        ])
      ])
    ]);
  }

  function boundaryMemo(row) {
    return [
      "FRUS Volume XXIX boundary coordination memo",
      `Date: ${row.date}`,
      `Chapter: ${row.chapter}`,
      `Title: ${row.title}`,
      `Boundary decision: ${row.boundaryDecision}`,
      `Adjacent target(s): ${row.overlapTargets.join("; ")}`,
      `Placement rule: ${row.boundaryRule}`,
      `Coordination action: ${row.coordinationAction}`,
      `Record boundary note: ${row.boundaryNotes}`,
      `Chapter boundary rule: ${row.chapterBoundary}`,
      `Current source note: ${row.sourceNote}`,
      `Verification: ${row.verification.join("; ")}`
    ].join("\n");
  }

  function matrixMarkdown(rows = visibleRows) {
    const lines = [
      "# FRUS Volume XXIX Boundary Matrix",
      "",
      "Use this matrix to prevent duplicate selection with regional, domestic, and functional volumes. Boundary holds should not receive final document numbers until the placement rule is satisfied.",
      ""
    ];
    decisionOrder.forEach((decision) => {
      const group = rows.filter((row) => row.boundaryDecision === decision);
      if (!group.length) return;
      lines.push(`## ${decision}`, "");
      group.forEach((row) => {
        lines.push(`### ${formatDate(row.date)} - ${row.title}`);
        lines.push(`- Chapter: ${row.chapter}`);
        lines.push(`- Adjacent target(s): ${row.overlapTargets.join("; ")}`);
        lines.push(`- Placement rule: ${row.boundaryRule}`);
        lines.push(`- Coordination action: ${row.coordinationAction}`);
        lines.push(`- Record boundary note: ${row.boundaryNotes}`);
        lines.push(`- Verification: ${row.verification.join("; ")}`, "");
      });
    });
    if (!rows.length) lines.push("No boundary rows match the current filters.");
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
    downloadCsv("frus-v29-boundary-matrix.csv", visibleRows, [
      { label: "date", value: (row) => row.date },
      { label: "title", value: (row) => row.title },
      { label: "chapter", value: (row) => row.chapter },
      { label: "boundary_decision", value: (row) => row.boundaryDecision },
      { label: "adjacent_targets", value: (row) => row.overlapTargets },
      { label: "placement_rule", value: (row) => row.boundaryRule },
      { label: "coordination_action", value: (row) => row.coordinationAction },
      { label: "record_boundary_note", value: (row) => row.boundaryNotes },
      { label: "chapter_boundary_rule", value: (row) => row.chapterBoundary },
      { label: "source_note", value: (row) => row.sourceNote },
      { label: "source_url", value: (row) => row.sourceUrl },
      { label: "verification", value: (row) => row.verification }
    ]);
  }

  function initControls() {
    const rows = buildRows();
    fillSelect(qs("#boundary-lane"), data.lanes.map((lane) => lane.id), "All chapters", laneName);
    fillSelect(qs("#boundary-decision"), decisionOrder.filter((decision) => rows.some((row) => row.boundaryDecision === decision)), "All decisions");
    fillSelect(qs("#boundary-overlap"), unique(rows.flatMap((row) => row.overlapTargets)), "All overlaps");
    ["#boundary-search", "#boundary-lane", "#boundary-decision", "#boundary-overlap"].forEach((selector) => {
      const node = qs(selector);
      if (!node) return;
      node.addEventListener(node.tagName === "INPUT" ? "input" : "change", render);
    });
    qs("#boundary-reset")?.addEventListener("click", () => {
      ["#boundary-search", "#boundary-lane", "#boundary-decision", "#boundary-overlap"].forEach((selector) => {
        const node = qs(selector);
        if (node) node.value = "";
      });
      render();
    });
    qs("#boundary-export")?.addEventListener("click", exportRows);
    qs("#boundary-copy")?.addEventListener("click", () => copyText(matrixMarkdown(), "Visible boundary matrix copied"));
  }

  function init() {
    initControls();
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
