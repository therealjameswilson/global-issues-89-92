(() => {
  const data = window.GLOBAL_ISSUES_DATA;
  if (!data) return;

  const years = ["1989", "1990", "1991", "1992"];
  const laneById = new Map((data.lanes || []).map((lane) => [lane.id, lane]));
  let rows = [];
  let visibleRows = [];

  const qs = (selector, root = document) => root.querySelector(selector);
  const laneFor = (id) => laneById.get(id) || { id, name: "Unassigned", shortName: "Unassigned", color: "#5c6967" };
  const laneName = (id) => laneFor(id).name;

  const coverageOrder = [
    "Missing year",
    "Thin year",
    "Public-only year",
    "Source-control gap",
    "Boundary-sensitive",
    "Seeded year"
  ];

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

  function priorityRank(priority) {
    return { Critical: 0, High: 1, Medium: 2, Low: 3 }[priority] ?? 4;
  }

  function yearOf(record) {
    return String(record.date || "").slice(0, 4);
  }

  function hasDailyControl(record) {
    return /Daily Diary|Daily Backup|Presidential Daily Diary and Daily Backup/i.test(
      `${record.sourceNote || ""} ${record.sourcePool || ""} ${record.type || ""}`
    );
  }

  function hasSourceControlGap(record) {
    const text = `${record.sourceNote || ""} ${record.sourceUrl || ""}`;
    return /file unit and item title not yet identified|catalog\.archives\.gov\/search/i.test(text);
  }

  function cellStatus(cell) {
    if (!cell.count) return "Missing year";
    if (cell.count === 1) return "Thin year";
    if (cell.publicAnchors === cell.count) return "Public-only year";
    if (cell.sourceControlGaps || cell.sourceLeads === cell.count) return "Source-control gap";
    if (cell.boundaryHolds) return "Boundary-sensitive";
    return "Seeded year";
  }

  function actionFor(cell, row) {
    if (cell.status === "Missing year") {
      return `Run a ${cell.year} NARA Scout sweep for ${row.chapterShort}; harvest file-unit leads before deciding whether the gap is real.`;
    }
    if (cell.status === "Thin year") {
      return `Add at least one additional internal record or source-control lead for ${cell.year}, then compare against public statements and source pools.`;
    }
    if (cell.status === "Public-only year") {
      return `Backfill internal drafts, clearance memoranda, briefing papers, and follow-up records behind the ${cell.year} public anchor.`;
    }
    if (cell.status === "Source-control gap") {
      return `Replace ${cell.year} search-level wording with repository, collection, file unit, item title, identifier, and release status.`;
    }
    if (cell.status === "Boundary-sensitive") {
      return `Resolve ${cell.year} boundary placement against adjacent regional, domestic, or functional volumes before numbering.`;
    }
    return `Use ${cell.year} as a seeded year for close-read, comparison, and representative document selection.`;
  }

  function buildCell(lane, year) {
    const records = (data.records || []).filter((record) => record.laneId === lane.id && yearOf(record) === year);
    const cell = {
      laneId: lane.id,
      year,
      records,
      titles: records.map((record) => record.title),
      count: records.length,
      criticalHigh: records.filter((record) => ["Critical", "High"].includes(record.priority)).length,
      publicAnchors: records.filter((record) => record.status === "Public anchor").length,
      sourceLeads: records.filter((record) => record.status === "Source lead").length,
      boundaryHolds: records.filter((record) => record.status === "Boundary review").length,
      requestLeads: records.filter((record) => record.status === "Needs document request").length,
      diaryControls: records.filter(hasDailyControl).length,
      sourceControlGaps: records.filter(hasSourceControlGap).length
    };
    cell.status = cellStatus(cell);
    return cell;
  }

  function buildRows() {
    return (data.lanes || []).map((lane) => {
      const cells = years.map((year) => buildCell(lane, year));
      const gaps = (data.gaps || [])
        .filter((gap) => gap.laneId === lane.id)
        .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
      const row = {
        laneId: lane.id,
        chapter: lane.name,
        chapterShort: lane.shortName || lane.name,
        color: lane.color,
        cells,
        gaps,
        sourceTargets: lane.sourceTargets || [],
        searchTerms: lane.searchTerms || [],
        totalRecords: cells.reduce((sum, cell) => sum + cell.count, 0),
        representedYears: cells.filter((cell) => cell.count).map((cell) => cell.year),
        missingYears: cells.filter((cell) => cell.status === "Missing year").map((cell) => cell.year),
        thinYears: cells.filter((cell) => cell.status === "Thin year").map((cell) => cell.year),
        publicOnlyYears: cells.filter((cell) => cell.status === "Public-only year").map((cell) => cell.year),
        sourceGapYears: cells.filter((cell) => cell.status === "Source-control gap").map((cell) => cell.year),
        boundaryYears: cells.filter((cell) => cell.status === "Boundary-sensitive").map((cell) => cell.year),
        criticalHigh: cells.reduce((sum, cell) => sum + cell.criticalHigh, 0),
        sourceControlGaps: cells.reduce((sum, cell) => sum + cell.sourceControlGaps, 0),
        publicAnchors: cells.reduce((sum, cell) => sum + cell.publicAnchors, 0),
        diaryControls: cells.reduce((sum, cell) => sum + cell.diaryControls, 0)
      };
      row.primaryStatus = rowStatus(row);
      row.nextAction = rowAction(row);
      row.cells.forEach((cell) => {
        cell.action = actionFor(cell, row);
      });
      return row;
    });
  }

  function rowStatus(row) {
    if (row.missingYears.length) return "Missing year";
    if (row.thinYears.length) return "Thin year";
    if (row.publicOnlyYears.length) return "Public-only year";
    if (row.sourceGapYears.length) return "Source-control gap";
    if (row.boundaryYears.length) return "Boundary-sensitive";
    return "Seeded year";
  }

  function rowAction(row) {
    if (row.missingYears.length) {
      return `Run targeted Scout and source-pool searches for ${row.missingYears.join(", ")} before treating the chapter chronology as representative.${secondaryAction(row)}`;
    }
    if (row.thinYears.length) {
      return `Strengthen ${row.thinYears.join(", ")} with internal policy records, not only public or schedule controls.${secondaryAction(row)}`;
    }
    if (row.publicOnlyYears.length) {
      return `Backfill public-only years (${row.publicOnlyYears.join(", ")}) with speech drafts, clearance records, briefing papers, and follow-up files.${secondaryAction(row, ["public"])}`;
    }
    if (row.sourceGapYears.length) {
      return `Convert source-control gaps in ${row.sourceGapYears.join(", ")} into item-level source notes before selection.${secondaryAction(row, ["source"])}`;
    }
    if (row.boundaryYears.length) {
      return `Resolve boundary-sensitive years (${row.boundaryYears.join(", ")}) before assigning final document numbers.`;
    }
    return "Coverage is seeded across 1989-1992; move to close-read, declassification checks, and representative selection.";
  }

  function secondaryAction(row, omit = []) {
    const actions = [];
    if (!omit.includes("source") && row.sourceGapYears.length) {
      actions.push(`convert source-control gaps in ${row.sourceGapYears.join(", ")}`);
    }
    if (!omit.includes("public") && row.publicOnlyYears.length) {
      actions.push(`backfill public-only years ${row.publicOnlyYears.join(", ")}`);
    }
    if (!omit.includes("boundary") && row.boundaryYears.length) {
      actions.push(`resolve boundary-sensitive years ${row.boundaryYears.join(", ")}`);
    }
    return actions.length ? ` Also ${actions.join("; ")}.` : "";
  }

  function filters() {
    return {
      query: qs("#coverage-search")?.value || "",
      lane: qs("#coverage-lane")?.value || "",
      status: qs("#coverage-status")?.value || ""
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
    const root = qs("#coverage-root");
    if (!root) return;
    const current = filters();
    visibleRows = rows.filter(
      (row) =>
        matches(row, current.query) &&
        (!current.lane || row.laneId === current.lane) &&
        (!current.status || row.primaryStatus === current.status || row.cells.some((cell) => cell.status === current.status))
    );

    const summary = qs("#coverage-summary");
    if (summary) {
      const chapter = current.lane ? ` in ${laneName(current.lane)}` : "";
      summary.textContent = `Showing ${visibleRows.length} of ${rows.length} chapter coverage rows${chapter}.`;
    }

    const cells = visibleRows.flatMap((row) => row.cells);
    const missing = cells.filter((cell) => cell.status === "Missing year").length;
    const thin = cells.filter((cell) => cell.status === "Thin year").length;
    const sourceGaps = cells.filter((cell) => cell.status === "Source-control gap").length;
    const completeRows = visibleRows.filter((row) => !row.missingYears.length).length;

    root.replaceChildren(
      make("div", { className: "coverage-metrics" }, [
        metric(String(visibleRows.length), "chapters visible", "Working chapters in this coverage view"),
        metric(String(missing), "missing cells", "Chapter-year cells without seed records"),
        metric(String(thin), "thin cells", "Chapter-year cells with only one seed record"),
        metric(String(sourceGaps), "source gaps", "Cells needing item-level source control"),
        metric(String(completeRows), "four-year seeds", "Chapters with at least one seed in every year")
      ]),
      make("div", { className: "coverage-list" }, visibleRows.length ? visibleRows.map(renderRow) : [
        make("p", { className: "empty", text: "No coverage rows match the current filters." })
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

  function statusClass(status) {
    return status.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function renderRow(row) {
    return make("article", { className: "coverage-row", style: `--lane-color: ${row.color}` }, [
      make("div", { className: "coverage-row-main" }, [
        make("div", { className: "coverage-row-heading" }, [
          make("div", {}, [
            make("p", { className: "meta-line", text: row.chapterShort }),
            make("h3", { text: row.chapter })
          ]),
          make("span", { className: `coverage-status ${statusClass(row.primaryStatus)}`, text: row.primaryStatus })
        ]),
        make("div", { className: "coverage-year-grid" }, row.cells.map((cell) => renderCell(cell))),
        make("p", { className: "coverage-action" }, [make("strong", { text: "Next coverage action: " }), row.nextAction])
      ]),
      make("aside", { className: "coverage-row-side" }, [
        make("p", { className: "card-meta", text: "Coverage Readout" }),
        make("ul", { className: "compact-list" }, [
          make("li", { text: `${row.totalRecords} seed records across ${row.representedYears.length} represented years` }),
          make("li", { text: `${row.criticalHigh} critical/high records` }),
          make("li", { text: `${row.publicAnchors} public anchors; ${row.diaryControls} diary/backup controls` }),
          make("li", { text: `${row.gaps.length} open compiler gaps` })
        ]),
        make("p", { className: "card-meta", text: "Search Targets" }),
        make("p", { text: row.sourceTargets.length ? row.sourceTargets.join("; ") : "Use chapter source pools and Scout query queue." }),
        make("div", { className: "small-actions" }, [
          make("button", { type: "button", onClick: () => copyText(coverageMemo(row), "Coverage memo copied") }, "Copy Memo")
        ])
      ])
    ]);
  }

  function renderCell(cell) {
    return make("div", { className: `coverage-cell ${statusClass(cell.status)}` }, [
      make("div", { className: "coverage-cell-top" }, [
        make("strong", { text: cell.year }),
        make("span", { text: `${cell.count} records` })
      ]),
      make("p", { className: "coverage-cell-status", text: cell.status }),
      make("p", {
        className: "coverage-cell-detail",
        text: cell.count
          ? `${cell.criticalHigh} critical/high; ${cell.sourceControlGaps} source gaps; ${cell.boundaryHolds} boundary holds`
          : "No seed record yet"
      })
    ]);
  }

  function coverageMemo(row) {
    const lines = [
      "FRUS Volume XXIX chapter-year coverage memo",
      `Chapter: ${row.chapter}`,
      `Primary coverage issue: ${row.primaryStatus}`,
      `Total seed records: ${row.totalRecords}`,
      `Represented years: ${row.representedYears.length ? row.representedYears.join(", ") : "none"}`,
      `Missing years: ${row.missingYears.length ? row.missingYears.join(", ") : "none"}`,
      `Thin years: ${row.thinYears.length ? row.thinYears.join(", ") : "none"}`,
      `Public-only years: ${row.publicOnlyYears.length ? row.publicOnlyYears.join(", ") : "none"}`,
      `Source-control gap years: ${row.sourceGapYears.length ? row.sourceGapYears.join(", ") : "none"}`,
      `Boundary-sensitive years: ${row.boundaryYears.length ? row.boundaryYears.join(", ") : "none"}`,
      `Next coverage action: ${row.nextAction}`,
      "",
      "Year cells:"
    ];
    row.cells.forEach((cell) => {
      lines.push(`- ${cell.year}: ${cell.status}; ${cell.count} records; action: ${cell.action}`);
      if (cell.titles.length) lines.push(`  - Records: ${cell.titles.join("; ")}`);
    });
    if (row.gaps.length) {
      lines.push("", "Open compiler gaps:");
      row.gaps.forEach((gap) => lines.push(`- ${gap.priority}: ${gap.problem}`));
    }
    lines.push("", "Search targets:", row.sourceTargets.length ? row.sourceTargets.join("; ") : "Use chapter source pools and Scout query queue.");
    return lines.join("\n");
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
    const cellRows = visibleRows.flatMap((row) =>
      row.cells.map((cell) => ({
        ...cell,
        chapter: row.chapter,
        chapterShort: row.chapterShort,
        primaryStatus: row.primaryStatus,
        rowNextAction: row.nextAction,
        gapCount: row.gaps.length
      }))
    );
    downloadCsv("frus-v29-chapter-year-coverage-matrix.csv", cellRows, [
      { label: "chapter", value: (cell) => cell.chapter },
      { label: "year", value: (cell) => cell.year },
      { label: "cell_status", value: (cell) => cell.status },
      { label: "chapter_primary_status", value: (cell) => cell.primaryStatus },
      { label: "record_count", value: (cell) => cell.count },
      { label: "critical_high_count", value: (cell) => cell.criticalHigh },
      { label: "public_anchor_count", value: (cell) => cell.publicAnchors },
      { label: "source_lead_count", value: (cell) => cell.sourceLeads },
      { label: "source_control_gap_count", value: (cell) => cell.sourceControlGaps },
      { label: "boundary_hold_count", value: (cell) => cell.boundaryHolds },
      { label: "diary_backup_count", value: (cell) => cell.diaryControls },
      { label: "record_titles", value: (cell) => cell.titles },
      { label: "cell_next_action", value: (cell) => cell.action },
      { label: "chapter_next_action", value: (cell) => cell.rowNextAction },
      { label: "open_gap_count", value: (cell) => cell.gapCount }
    ]);
  }

  function init() {
    rows = buildRows();
    fillSelect(qs("#coverage-lane"), (data.lanes || []).map((lane) => lane.id), "All chapters", laneName);
    fillSelect(qs("#coverage-status"), coverageOrder, "All coverage states");
    ["#coverage-search", "#coverage-lane", "#coverage-status"].forEach((selector) => {
      qs(selector)?.addEventListener("input", render);
      qs(selector)?.addEventListener("change", render);
    });
    qs("#coverage-reset")?.addEventListener("click", () => {
      ["#coverage-search", "#coverage-lane", "#coverage-status"].forEach((selector) => {
        const input = qs(selector);
        if (input) input.value = "";
      });
      render();
    });
    qs("#coverage-export")?.addEventListener("click", exportRows);
    qs("#coverage-copy")?.addEventListener("click", () =>
      copyText(visibleRows.map(coverageMemo).join("\n\n---\n\n"), "Visible coverage memos copied")
    );
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
