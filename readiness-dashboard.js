(() => {
  const data = window.GLOBAL_ISSUES_DATA;
  if (!data) return;

  const years = ["1989", "1990", "1991", "1992"];
  const laneById = new Map((data.lanes || []).map((lane) => [lane.id, lane]));
  let rows = [];
  let visibleRows = [];

  const gateOrder = [
    "Coverage harvest first",
    "Source-control buildout",
    "Boundary decision",
    "Public-anchor backfill",
    "Selection sampling ready"
  ];

  const qs = (selector, root = document) => root.querySelector(selector);
  const laneFor = (id) => laneById.get(id) || { id, name: "Unassigned", shortName: "Unassigned", color: "#5c6967" };
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

  function textIndex(value) {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return value.map(textIndex).join(" ");
    if (typeof value === "object") return Object.values(value).map(textIndex).join(" ");
    return String(value);
  }

  function matches(row, query) {
    return !query || textIndex(row).toLowerCase().includes(query.trim().toLowerCase());
  }

  function yearOf(record) {
    return String(record.date || "").slice(0, 4);
  }

  function hasSourceGap(record) {
    return /file unit and item title not yet identified|catalog\.archives\.gov\/search/i.test(
      `${record.sourceNote || ""} ${record.sourceUrl || ""}`
    );
  }

  function hasDailyControl(record) {
    return /Daily Diary|Daily Backup|Presidential Daily Diary and Daily Backup/i.test(
      `${record.sourceNote || ""} ${record.sourcePool || ""} ${record.type || ""}`
    );
  }

  function cellStatus(records) {
    if (!records.length) return "missing";
    if (records.length === 1) return "thin";
    if (records.every((record) => record.status === "Public anchor")) return "public-only";
    if (records.some(hasSourceGap) || records.every((record) => record.status === "Source lead")) return "source-gap";
    if (records.some((record) => record.status === "Boundary review")) return "boundary";
    return "seeded";
  }

  function scoreClamp(value) {
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  function buildRows() {
    return (data.lanes || []).map((lane) => {
      const records = (data.records || []).filter((record) => record.laneId === lane.id);
      const cells = years.map((year) => {
        const yearRecords = records.filter((record) => yearOf(record) === year);
        return { year, status: cellStatus(yearRecords), records: yearRecords };
      });
      const gaps = (data.gaps || []).filter((gap) => gap.laneId === lane.id);
      const pools = (data.sourcePools || []).filter((pool) => pool.laneId === lane.id);
      const attention = (data.publicAttention || []).find((row) => row.laneId === lane.id);

      const representedYears = cells.filter((cell) => cell.records.length).length;
      const missingYears = cells.filter((cell) => cell.status === "missing").map((cell) => cell.year);
      const thinYears = cells.filter((cell) => cell.status === "thin").map((cell) => cell.year);
      const sourceGapYears = cells.filter((cell) => cell.status === "source-gap").map((cell) => cell.year);
      const publicOnlyYears = cells.filter((cell) => cell.status === "public-only").map((cell) => cell.year);
      const boundaryYears = cells.filter((cell) => cell.status === "boundary").map((cell) => cell.year);

      const criticalHigh = records.filter((record) => ["Critical", "High"].includes(record.priority)).length;
      const publicAnchors = records.filter((record) => record.status === "Public anchor").length;
      const sourceGaps = records.filter(hasSourceGap).length;
      const boundaryRows = records.filter((record) => record.status === "Boundary review").length;
      const dailyControls = records.filter(hasDailyControl).length;
      const sourceLeadRows = records.filter((record) => record.status === "Source lead").length;

      const components = {
        coverage: scoreClamp((representedYears / years.length) * 32 - missingYears.length * 6 - thinYears.length * 2),
        sourceControl: scoreClamp(24 - sourceGaps * 4 - sourceLeadRows * 2 + Math.min(8, criticalHigh * 2)),
        declassification: scoreClamp(16 - sourceGaps * 2 + Math.min(6, dailyControls * 2)),
        boundary: scoreClamp(14 - boundaryRows * 4 - gaps.filter((gap) => /boundary|overlap|regional|duplicate/i.test(`${gap.problem} ${gap.action}`)).length * 2),
        publicSignal: scoreClamp(attention ? Math.min(14, 5 + Math.round((attention.strongHits || 0) / 12)) : 0),
        sourcePools: scoreClamp(Math.min(10, pools.filter((pool) => ["Critical", "High"].includes(pool.priority)).length * 3 + pools.length))
      };
      const score = scoreClamp(Object.values(components).reduce((sum, value) => sum + value, 0));
      const gate = gateFor({ missingYears, thinYears, sourceGapYears, publicOnlyYears, boundaryYears, boundaryRows, sourceGaps, sourceLeadRows });
      const blockers = blockersFor({ missingYears, thinYears, sourceGapYears, publicOnlyYears, boundaryYears, gaps, sourceGaps, sourceLeadRows });
      const nextAction = nextActionFor(gate, { lane, missingYears, thinYears, sourceGapYears, publicOnlyYears, boundaryYears });

      return {
        laneId: lane.id,
        chapter: lane.name,
        chapterShort: lane.shortName || lane.name,
        color: lane.color,
        score,
        gate,
        components,
        records,
        gaps,
        pools,
        attention,
        representedYears,
        missingYears,
        thinYears,
        sourceGapYears,
        publicOnlyYears,
        boundaryYears,
        criticalHigh,
        publicAnchors,
        sourceGaps,
        boundaryRows,
        dailyControls,
        blockers,
        nextAction,
        sourceTargets: lane.sourceTargets || [],
        boundary: lane.boundary
      };
    }).sort(
      (a, b) =>
        gateOrder.indexOf(a.gate) - gateOrder.indexOf(b.gate) ||
        a.score - b.score ||
        priorityRank((a.gaps[0] || {}).priority) - priorityRank((b.gaps[0] || {}).priority) ||
        a.chapter.localeCompare(b.chapter)
    );
  }

  function gateFor(parts) {
    if (parts.missingYears.length || parts.thinYears.length > 1) return "Coverage harvest first";
    if (parts.sourceGapYears.length || parts.sourceGaps || parts.sourceLeadRows > 1) return "Source-control buildout";
    if (parts.boundaryYears.length || parts.boundaryRows) return "Boundary decision";
    if (parts.publicOnlyYears.length) return "Public-anchor backfill";
    return "Selection sampling ready";
  }

  function blockersFor(parts) {
    const blockers = [];
    if (parts.missingYears.length) blockers.push(`missing years: ${parts.missingYears.join(", ")}`);
    if (parts.thinYears.length) blockers.push(`thin years: ${parts.thinYears.join(", ")}`);
    if (parts.sourceGapYears.length) blockers.push(`source-control gap years: ${parts.sourceGapYears.join(", ")}`);
    if (parts.publicOnlyYears.length) blockers.push(`public-only years: ${parts.publicOnlyYears.join(", ")}`);
    if (parts.boundaryYears.length) blockers.push(`boundary-sensitive years: ${parts.boundaryYears.join(", ")}`);
    const criticalGaps = parts.gaps.filter((gap) => gap.priority === "Critical").length;
    if (criticalGaps) blockers.push(`${criticalGaps} critical compiler gap${criticalGaps === 1 ? "" : "s"}`);
    return blockers;
  }

  function nextActionFor(gate, parts) {
    if (gate === "Coverage harvest first") {
      const yearsText = [...new Set([...parts.missingYears, ...parts.thinYears])].join(", ");
      return `Run Scout/source-pool searches for ${yearsText || "thin years"} in ${parts.lane.shortName}; add or reject candidate leads before treating the chapter as representative.`;
    }
    if (gate === "Source-control buildout") {
      return `Convert search-level or source-lead rows into item-level file control, identifiers, and release-status language.`;
    }
    if (gate === "Boundary decision") {
      return `Coordinate boundary-sensitive rows against adjacent FRUS volumes before assigning final document numbers.`;
    }
    if (gate === "Public-anchor backfill") {
      return `Locate internal draft, clearance, briefing, schedule, and follow-up records behind the public anchor.`;
    }
    return "Begin close-read sampling for representative documents, source-note drafting, and declassification review.";
  }

  function filters() {
    return {
      query: qs("#readiness-search")?.value || "",
      lane: qs("#readiness-lane")?.value || "",
      gate: qs("#readiness-gate")?.value || ""
    };
  }

  function fillSelect(select, values, allLabel, formatter = (value) => value) {
    if (!select) return;
    const current = select.value;
    select.replaceChildren(make("option", { value: "", text: allLabel }));
    values.forEach((value) => select.append(make("option", { value, text: formatter(value) })));
    if (values.includes(current)) select.value = current;
  }

  function render() {
    const root = qs("#readiness-root");
    if (!root) return;
    const current = filters();
    visibleRows = rows.filter(
      (row) =>
        matches(row, current.query) &&
        (!current.lane || row.laneId === current.lane) &&
        (!current.gate || row.gate === current.gate)
    );

    const summary = qs("#readiness-summary");
    if (summary) {
      const chapter = current.lane ? ` in ${laneName(current.lane)}` : "";
      summary.textContent = `Showing ${visibleRows.length} of ${rows.length} chapter readiness rows${chapter}.`;
    }

    const harvest = visibleRows.filter((row) => row.gate === "Coverage harvest first").length;
    const sourceControl = visibleRows.filter((row) => row.gate === "Source-control buildout").length;
    const boundary = visibleRows.filter((row) => row.gate === "Boundary decision").length;
    const sampleReady = visibleRows.filter((row) => row.gate === "Selection sampling ready").length;
    const average = visibleRows.length ? Math.round(visibleRows.reduce((sum, row) => sum + row.score, 0) / visibleRows.length) : 0;

    root.replaceChildren(
      make("div", { className: "readiness-metrics" }, [
        metric(String(average), "average score", "Visible chapter-readiness average"),
        metric(String(harvest), "coverage harvest", "Chapters needing year coverage first"),
        metric(String(sourceControl), "source control", "Chapters needing item-level source-note buildout"),
        metric(String(boundary), "boundary", "Chapters gated by placement decisions"),
        metric(String(sampleReady), "sampling ready", "Chapters closest to close-read")
      ]),
      make("div", { className: "readiness-grid" }, visibleRows.length ? visibleRows.map(renderCard) : [
        make("p", { className: "empty", text: "No readiness rows match the current filters." })
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

  function statusClass(value) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function renderCard(row) {
    return make("article", { className: "readiness-card", style: `--lane-color: ${row.color}` }, [
      make("div", { className: "readiness-main" }, [
        make("div", { className: "readiness-heading" }, [
          make("div", {}, [
            make("p", { className: "meta-line", text: row.chapterShort }),
            make("h3", { text: row.chapter })
          ]),
          make("div", { className: "readiness-score" }, [
            make("strong", { text: String(row.score) }),
            make("span", { text: "score" })
          ])
        ]),
        make("div", { className: "tag-list" }, [
          make("span", { className: `readiness-gate ${statusClass(row.gate)}`, text: row.gate }),
          make("span", { className: "count-pill", text: `${row.records.length} records` }),
          make("span", { className: "count-pill", text: `${row.representedYears}/4 years` })
        ]),
        make("div", { className: "readiness-bars" }, Object.entries(row.components).map(([label, value]) => scoreBar(label, value))),
        make("p", { className: "readiness-action" }, [make("strong", { text: "Next chapter action: " }), row.nextAction])
      ]),
      make("aside", { className: "readiness-side" }, [
        make("p", { className: "card-meta", text: "Blockers / Evidence" }),
        make("ul", { className: "compact-list" }, row.blockers.length ? row.blockers.map((blocker) => make("li", { text: blocker })) : [
          make("li", { text: "No major gate detected in current seed data." })
        ]),
        make("p", { className: "card-meta", text: "Counts" }),
        make("ul", { className: "compact-list" }, [
          make("li", { text: `${row.criticalHigh} critical/high records` }),
          make("li", { text: `${row.publicAnchors} public anchors; ${row.dailyControls} diary/backup controls` }),
          make("li", { text: `${row.sourceGaps} source-control gaps; ${row.boundaryRows} boundary rows` }),
          make("li", { text: `${row.pools.length} source pools; ${row.gaps.length} open gaps` })
        ]),
        make("div", { className: "small-actions" }, [
          make("button", { type: "button", onClick: () => copyText(readinessBrief(row), "Readiness brief copied") }, "Copy Brief"),
          make("a", { className: "button ghost", href: "#packet" }, "Packet")
        ])
      ])
    ]);
  }

  function scoreBar(label, value) {
    const text = label.replace(/([A-Z])/g, " $1").toLowerCase();
    return make("div", { className: "readiness-bar" }, [
      make("span", { text }),
      make("div", { className: "readiness-bar-track" }, [
        make("i", { style: `width: ${Math.max(0, Math.min(100, value))}%` })
      ]),
      make("strong", { text: String(value) })
    ]);
  }

  function readinessBrief(row) {
    return [
      "FRUS Volume XXIX chapter readiness brief",
      `Chapter: ${row.chapter}`,
      `Readiness score: ${row.score}`,
      `Primary gate: ${row.gate}`,
      `Next chapter action: ${row.nextAction}`,
      `Represented years: ${row.representedYears}/4`,
      `Records: ${row.records.length}; critical/high: ${row.criticalHigh}; public anchors: ${row.publicAnchors}; diary/backup controls: ${row.dailyControls}`,
      `Source-control gaps: ${row.sourceGaps}; boundary rows: ${row.boundaryRows}; source pools: ${row.pools.length}; open gaps: ${row.gaps.length}`,
      `Blockers: ${row.blockers.length ? row.blockers.join("; ") : "none detected in current seed data"}`,
      `Score components: ${Object.entries(row.components).map(([key, value]) => `${key} ${value}`).join("; ")}`,
      `Boundary rule: ${row.boundary}`,
      `Source targets: ${row.sourceTargets.length ? row.sourceTargets.join("; ") : "Use source pools and Scout queue."}`
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

  function downloadCsv(filename, records, columns) {
    const header = columns.map((column) => csvEscape(column.label)).join(",");
    const body = records.map((record) => columns.map((column) => csvEscape(column.value(record))).join(",")).join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = make("a", { href: url, download: filename });
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function exportRows() {
    downloadCsv("frus-v29-chapter-readiness-dashboard.csv", visibleRows, [
      { label: "chapter", value: (row) => row.chapter },
      { label: "score", value: (row) => row.score },
      { label: "gate", value: (row) => row.gate },
      { label: "next_action", value: (row) => row.nextAction },
      { label: "records", value: (row) => row.records.length },
      { label: "represented_years", value: (row) => row.representedYears },
      { label: "critical_high_records", value: (row) => row.criticalHigh },
      { label: "public_anchors", value: (row) => row.publicAnchors },
      { label: "diary_backup_controls", value: (row) => row.dailyControls },
      { label: "source_control_gaps", value: (row) => row.sourceGaps },
      { label: "boundary_rows", value: (row) => row.boundaryRows },
      { label: "source_pools", value: (row) => row.pools.length },
      { label: "open_gaps", value: (row) => row.gaps.length },
      { label: "blockers", value: (row) => row.blockers },
      { label: "score_components", value: (row) => Object.entries(row.components).map(([key, value]) => `${key}: ${value}`) }
    ]);
  }

  function init() {
    rows = buildRows();
    fillSelect(qs("#readiness-lane"), (data.lanes || []).map((lane) => lane.id), "All chapters", laneName);
    fillSelect(qs("#readiness-gate"), gateOrder.filter((gate) => rows.some((row) => row.gate === gate)), "All gates");
    ["#readiness-search", "#readiness-lane", "#readiness-gate"].forEach((selector) => {
      qs(selector)?.addEventListener("input", render);
      qs(selector)?.addEventListener("change", render);
    });
    qs("#readiness-reset")?.addEventListener("click", () => {
      ["#readiness-search", "#readiness-lane", "#readiness-gate"].forEach((selector) => {
        const input = qs(selector);
        if (input) input.value = "";
      });
      render();
    });
    qs("#readiness-export")?.addEventListener("click", exportRows);
    qs("#readiness-copy")?.addEventListener("click", () =>
      copyText(visibleRows.map(readinessBrief).join("\n\n---\n\n"), "Visible readiness briefs copied")
    );
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
