(() => {
  const data = window.GLOBAL_ISSUES_DATA;
  if (!data) return;

  const lanes = new Map(data.lanes.map((lane) => [lane.id, lane]));
  const scoutBase = "https://therealjameswilson.github.io/nara-scout/";
  const excludedPools = new Set(["pool-precedents"]);
  let allRows = [];
  let visibleRows = [];

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

  function unique(values) {
    return [...new Set(values.filter(Boolean))];
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

  function quoteTerm(term) {
    const value = String(term || "").trim();
    if (!value) return "";
    if (/^".+"$/.test(value)) return value;
    return /\s/.test(value) ? `"${value}"` : value;
  }

  function queryFromTerms(terms) {
    return unique(terms.map(quoteTerm)).join(" OR ");
  }

  function scoutUrl(query) {
    return `${scoutBase}#q=${encodeURIComponent(query)}&from=1989&to=1993&scope=bush41&perColl=25&perPage=50`;
  }

  function queryFromScoutUrl(url, fallbackTerms = []) {
    try {
      const hash = new URL(url).hash.replace(/^#/, "");
      const parsed = new URLSearchParams(hash).get("q");
      return parsed || queryFromTerms(fallbackTerms);
    } catch (error) {
      return queryFromTerms(fallbackTerms);
    }
  }

  function priorityForAttention(row, lane) {
    const hasCriticalGap = data.gaps.some((gap) => gap.laneId === lane.id && gap.priority === "Critical");
    if (hasCriticalGap) return "Critical";
    if (/high/i.test(row.attention || "") || (row.strongHits || 0) >= 20) return "High";
    return "Medium";
  }

  function poolsForLane(laneId) {
    return data.sourcePools.filter((pool) => pool.laneId === laneId && !excludedPools.has(pool.id));
  }

  function gapsForLane(laneId) {
    return data.gaps.filter((gap) => gap.laneId === laneId);
  }

  function recordsForLane(laneId) {
    return data.records.filter((record) => record.laneId === laneId);
  }

  function buildRows() {
    const chapterRows = data.publicAttention.map((attention) => {
      const lane = laneFor(attention.laneId);
      const pools = poolsForLane(lane.id);
      const gaps = gapsForLane(lane.id);
      const records = recordsForLane(lane.id);
      const query = queryFromScoutUrl(attention.naraScoutUrl, lane.searchTerms || []);
      return {
        id: `topic-${lane.id}`,
        kind: "Chapter topic query",
        laneId: lane.id,
        chapter: lane.name,
        chapterShort: lane.shortName,
        color: lane.color,
        title: `${lane.name}: topic pass`,
        priority: priorityForAttention(attention, lane),
        query,
        scoutUrl: attention.naraScoutUrl || scoutUrl(query),
        attention: attention.attention,
        directness: attention.directness,
        anchor: attention.evidenceTitle,
        sourcePools: pools.map((pool) => pool.name),
        recordsRepresented: records.length,
        gapCount: gaps.length,
        apiNote: "If Scout returns an API limit error, enter a personal NARA Catalog API key in Scout settings and rerun.",
        nextAction:
          "Run the chapter query, export promising Bush Library file units, and compare hits against the presidential public-attention anchor.",
        handoff:
          "Feed exported file units into the source-note audit, release ledger, and selection docket; mark country-specific or operational hits for boundary review.",
        boundary: lane.boundary
      };
    });

    const poolRows = data.sourcePools
      .filter((pool) => !excludedPools.has(pool.id))
      .map((pool) => {
        const lane = laneFor(pool.laneId);
        const records = recordsForLane(pool.laneId);
        const gaps = gapsForLane(pool.laneId);
        const query = queryFromTerms(pool.terms || lane.searchTerms || []);
        return {
          id: `pool-${pool.id}`,
          kind: "Source-pool query",
          laneId: lane.id,
          chapter: lane.name,
          chapterShort: lane.shortName,
          color: lane.color,
          title: pool.name,
          priority: pool.priority || "Medium",
          query,
          scoutUrl: scoutUrl(query),
          attention: "",
          directness: "",
          anchor: pool.coverage,
          sourcePools: [pool.name],
          recordsRepresented: records.length,
          gapCount: gaps.length,
          apiNote: "Use Scout exports to replace search-level source wording with file-unit and item-level control.",
          nextAction: pool.nextAction,
          handoff:
            "Capture title, NAID/object URL, repository, collection/series, date span, and any access or release notes for source-note drafting.",
          boundary: lane.boundary
        };
      });

    return [...chapterRows, ...poolRows].sort(
      (a, b) =>
        priorityRank(a.priority) - priorityRank(b.priority) ||
        a.laneId.localeCompare(b.laneId) ||
        a.kind.localeCompare(b.kind) ||
        a.title.localeCompare(b.title)
    );
  }

  function filters() {
    return {
      query: qs("#scout-search")?.value || "",
      lane: qs("#scout-lane")?.value || "",
      kind: qs("#scout-kind")?.value || "",
      priority: qs("#scout-priority")?.value || ""
    };
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

  function pill(text, className = "tag") {
    return make("span", { className, text });
  }

  function render() {
    const root = qs("#scout-root");
    if (!root) return;
    const current = filters();
    visibleRows = allRows.filter(
      (row) =>
        matches(row, current.query) &&
        (!current.lane || row.laneId === current.lane) &&
        (!current.kind || row.kind === current.kind) &&
        (!current.priority || row.priority === current.priority)
    );

    const summary = qs("#scout-summary");
    if (summary) {
      const chapter = current.lane ? ` in ${laneName(current.lane)}` : "";
      summary.textContent = `Showing ${visibleRows.length} of ${allRows.length} NARA Scout queries${chapter}.`;
    }

    const topicCount = visibleRows.filter((row) => row.kind === "Chapter topic query").length;
    const poolCount = visibleRows.filter((row) => row.kind === "Source-pool query").length;
    const urgent = visibleRows.filter((row) => ["Critical", "High"].includes(row.priority)).length;
    const chapters = new Set(visibleRows.map((row) => row.laneId)).size;

    root.replaceChildren(
      make("div", { className: "scout-metrics" }, [
        metric(String(topicCount), "topic queries", "Chapter searches from the public-attention pass"),
        metric(String(poolCount), "source-pool queries", "Repository and file-family searches"),
        metric(String(urgent), "critical/high", "Run these first for source-note control"),
        metric(String(chapters), "chapters visible", "Working chapters represented")
      ]),
      make("div", { className: "scout-grid" }, visibleRows.length ? visibleRows.map(renderCard) : [
        make("p", { className: "empty", text: "No Scout queries match the current filters." })
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

  function renderCard(row) {
    return make("article", { className: "scout-card", style: `--lane-color: ${row.color}` }, [
      make("div", { className: "scout-main" }, [
        make("p", { className: "meta-line", text: `${row.kind} - ${row.chapterShort}` }),
        make("h3", { text: row.title }),
        make("div", { className: "tag-list" }, [priorityPill(row.priority), pill("1989-1993"), pill("Bush 41")]),
        make("p", { className: "scout-query" }, [make("strong", { text: "Query: " }), row.query]),
        make("p", {}, [make("strong", { text: "Next action: " }), row.nextAction]),
        make("p", {}, [make("strong", { text: "Compiler handoff: " }), row.handoff]),
        make("p", { className: "scout-boundary" }, [make("strong", { text: "Boundary guardrail: " }), row.boundary])
      ]),
      make("aside", { className: "scout-side" }, [
        make("p", { className: "card-meta", text: "Run Details" }),
        make("ul", { className: "compact-list" }, [
          make("li", { text: "Scope: Bush 41" }),
          make("li", { text: "Date range: 1989-1993" }),
          make("li", { text: `Records in chapter seed set: ${row.recordsRepresented}` }),
          make("li", { text: `Open chapter gaps: ${row.gapCount}` }),
          make("li", { text: row.apiNote })
        ]),
        make("p", { className: "card-meta", text: "Source Pool / Anchor" }),
        make("p", { text: row.anchor }),
        make("div", { className: "small-actions" }, [
          make("button", { type: "button", onClick: () => copyText(queryMemo(row), "Scout query copied") }, "Copy Query"),
          make("a", { className: "button ghost", href: row.scoutUrl, rel: "noreferrer" }, "Open Scout")
        ])
      ])
    ]);
  }

  function queryMemo(row) {
    return [
      "FRUS Volume XXIX NARA Scout query handoff",
      `Chapter: ${row.chapter}`,
      `Kind: ${row.kind}`,
      `Priority: ${row.priority}`,
      `Query: ${row.query}`,
      "Scope: Bush 41",
      "Date range: 1989-1993",
      `Scout URL: ${row.scoutUrl}`,
      `Source pool / public anchor: ${row.anchor}`,
      `Next action: ${row.nextAction}`,
      `Compiler handoff: ${row.handoff}`,
      `Boundary guardrail: ${row.boundary}`,
      "Capture from Scout export: title; NAID/object URL; repository; collection or series; date span; access/release note; why the hit is global rather than regional."
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

  function exportRows() {
    downloadCsv("frus-v29-nara-scout-query-queue.csv", visibleRows, [
      { label: "chapter", value: (row) => row.chapter },
      { label: "kind", value: (row) => row.kind },
      { label: "priority", value: (row) => row.priority },
      { label: "title", value: (row) => row.title },
      { label: "query", value: (row) => row.query },
      { label: "scout_url", value: (row) => row.scoutUrl },
      { label: "source_pool_or_anchor", value: (row) => row.anchor },
      { label: "next_action", value: (row) => row.nextAction },
      { label: "compiler_handoff", value: (row) => row.handoff },
      { label: "boundary_guardrail", value: (row) => row.boundary }
    ]);
  }

  function bind() {
    fillSelect(qs("#scout-lane"), data.lanes.map((lane) => lane.id), "All chapters", laneName);
    fillSelect(qs("#scout-kind"), unique(allRows.map((row) => row.kind)).sort(), "All query types");
    fillSelect(qs("#scout-priority"), unique(allRows.map((row) => row.priority)).sort((a, b) => priorityRank(a) - priorityRank(b)), "All priorities");
    ["#scout-search", "#scout-lane", "#scout-kind", "#scout-priority"].forEach((selector) => {
      qs(selector)?.addEventListener("input", render);
      qs(selector)?.addEventListener("change", render);
    });
    qs("#scout-reset")?.addEventListener("click", () => {
      ["#scout-search", "#scout-lane", "#scout-kind", "#scout-priority"].forEach((selector) => {
        const input = qs(selector);
        if (input) input.value = "";
      });
      render();
    });
    qs("#scout-export")?.addEventListener("click", exportRows);
    qs("#scout-copy")?.addEventListener("click", () =>
      copyText(visibleRows.map(queryMemo).join("\n\n---\n\n"), "Visible Scout queries copied")
    );
  }

  function init() {
    allRows = buildRows();
    bind();
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
