(() => {
  const data = window.GLOBAL_ISSUES_DATA;
  if (!data) return;

  const years = ["1989", "1990", "1991", "1992"];
  const laneById = new Map((data.lanes || []).map((lane) => [lane.id, lane]));
  let items = [];
  let visibleItems = [];

  const stageOrder = [
    "Stabilize coverage",
    "Resolve scope",
    "Run archival harvest",
    "Request substantive record",
    "Promote source control",
    "Backtrace public line",
    "Resolve boundary",
    "Draft source note"
  ];

  const qs = (selector, root = document) => root.querySelector(selector);
  const laneFor = (id) => laneById.get(id) || { id, name: "Unassigned", shortName: "Unassigned", color: "#5c6967" };
  const laneName = (id) => laneFor(id).name;
  const priorityRank = (priority) => ({ Critical: 0, High: 1, Medium: 2, Low: 3 })[priority] ?? 4;
  const stageRank = (stage) => {
    const index = stageOrder.indexOf(stage);
    return index === -1 ? stageOrder.length : index;
  };

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

  function hasItemGap(record) {
    return /file unit and item title not yet identified|catalog\.archives\.gov\/search/i.test(
      `${record.sourceNote || ""} ${record.sourceUrl || ""}`
    );
  }

  function hasDailyControl(record) {
    return /Daily Diary|Daily Backup|Presidential Daily Diary and Daily Backup/i.test(
      `${record.sourceNote || ""} ${record.sourcePool || ""} ${record.type || ""}`
    );
  }

  function itemScore(item) {
    const priorityScore = { Critical: 300, High: 220, Medium: 140, Low: 80 }[item.priority] ?? 100;
    const stageScore = Math.max(0, 80 - stageRank(item.stage) * 8);
    const evidenceScore = item.evidenceWeight || 0;
    return priorityScore + stageScore + evidenceScore;
  }

  function baseItem({ id, laneId, source, stage, priority, title, action, why, handoff, evidence, href, evidenceWeight = 0 }) {
    const lane = laneFor(laneId);
    const item = {
      id,
      laneId,
      chapter: lane.name,
      chapterShort: lane.shortName || lane.name,
      color: lane.color,
      source,
      stage,
      priority,
      title,
      action,
      why,
      handoff,
      evidence,
      href,
      evidenceWeight
    };
    item.score = itemScore(item);
    return item;
  }

  function coverageStatusFor(laneId, year) {
    const records = (data.records || []).filter((record) => record.laneId === laneId && yearOf(record) === year);
    if (!records.length) return { year, status: "missing", records };
    if (records.length === 1) return { year, status: "thin", records };
    if (records.every((record) => record.status === "Public anchor")) return { year, status: "public-only", records };
    if (records.some(hasItemGap) || records.every((record) => record.status === "Source lead")) {
      return { year, status: "source-gap", records };
    }
    if (records.some((record) => record.status === "Boundary review")) return { year, status: "boundary", records };
    return { year, status: "seeded", records };
  }

  function coverageItems() {
    return (data.lanes || []).flatMap((lane) => {
      const cells = years.map((year) => coverageStatusFor(lane.id, year));
      const missing = cells.filter((cell) => cell.status === "missing").map((cell) => cell.year);
      const thin = cells.filter((cell) => cell.status === "thin").map((cell) => cell.year);
      const sourceGap = cells.filter((cell) => cell.status === "source-gap").map((cell) => cell.year);
      const publicOnly = cells.filter((cell) => cell.status === "public-only").map((cell) => cell.year);
      const boundary = cells.filter((cell) => cell.status === "boundary").map((cell) => cell.year);
      const actions = [];
      if (missing.length) {
        actions.push(
          baseItem({
            id: `coverage-missing-${lane.id}`,
            laneId: lane.id,
            source: "Coverage matrix",
            stage: "Stabilize coverage",
            priority: missing.length > 1 ? "Critical" : "High",
            title: `${lane.name}: missing chronology years`,
            action: `Run targeted Scout and source-pool searches for ${missing.join(", ")} before treating the chapter as representative.`,
            why: "Missing years can create false confidence in chapter shape, document balance, and final numbering.",
            handoff: "Use the Scout queue and source pools to capture file-unit leads, then add candidate rows or mark the gap as a deliberate no-hit.",
            evidence: `Missing years: ${missing.join(", ")}. Search targets: ${(lane.searchTerms || []).join("; ")}`,
            href: "#scout-queue",
            evidenceWeight: missing.length * 18
          })
        );
      }
      if (thin.length) {
        actions.push(
          baseItem({
            id: `coverage-thin-${lane.id}`,
            laneId: lane.id,
            source: "Coverage matrix",
            stage: "Stabilize coverage",
            priority: "High",
            title: `${lane.name}: thin chronology years`,
            action: `Strengthen ${thin.join(", ")} with internal policy records, not only public or schedule controls.`,
            why: "Thin years need enough evidence to show continuity, turns, and representative selection choices.",
            handoff: "Check public anchors against source-pool searches and add internal memoranda, briefing papers, or decision records.",
            evidence: `Thin years: ${thin.join(", ")}.`,
            href: "#coverage",
            evidenceWeight: thin.length * 8
          })
        );
      }
      if (sourceGap.length || publicOnly.length || boundary.length) {
        const problemParts = [];
        if (sourceGap.length) problemParts.push(`source-control gaps in ${sourceGap.join(", ")}`);
        if (publicOnly.length) problemParts.push(`public-only years in ${publicOnly.join(", ")}`);
        if (boundary.length) problemParts.push(`boundary-sensitive years in ${boundary.join(", ")}`);
        actions.push(
          baseItem({
            id: `coverage-quality-${lane.id}`,
            laneId: lane.id,
            source: "Coverage matrix",
            stage: sourceGap.length ? "Promote source control" : publicOnly.length ? "Backtrace public line" : "Resolve boundary",
            priority: sourceGap.length ? "High" : "Medium",
            title: `${lane.name}: coverage quality issues`,
            action: `Clear ${problemParts.join("; ")} before final document numbering.`,
            why: "Represented years still need stronger document quality or volume-placement control.",
            handoff: "Move each affected year into the source-note audit, release ledger, boundary matrix, or public-anchor backfill queue.",
            evidence: problemParts.join("; "),
            href: "#coverage",
            evidenceWeight: 12
          })
        );
      }
      return actions;
    });
  }

  function gapItems() {
    return (data.gaps || []).map((gap) =>
      baseItem({
        id: `gap-${gap.id}`,
        laneId: gap.laneId,
        source: "Compiler gap",
        stage: /boundary|overlap|regional|duplicate/i.test(`${gap.problem} ${gap.action}`) ? "Resolve boundary" : "Resolve scope",
        priority: gap.priority,
        title: gap.problem,
        action: gap.action,
        why: gap.risk,
        handoff: "Resolve this before final chapter order, document numbering, or adjacent-volume coordination.",
        evidence: gap.evidence,
        href: "#gaps",
        evidenceWeight: gap.priority === "Critical" ? 28 : 10
      })
    );
  }

  function sourcePoolItems() {
    return (data.sourcePools || [])
      .filter((pool) => ["Critical", "High"].includes(pool.priority))
      .map((pool) =>
        baseItem({
          id: `pool-${pool.id}`,
          laneId: pool.laneId,
          source: "Source pool",
          stage: "Run archival harvest",
          priority: pool.priority,
          title: pool.name,
          action: pool.nextAction,
          why: pool.coverage,
          handoff: "Export promising file units, item titles, NAIDs, dates, access notes, and release status into the pull list and source-note audit.",
          evidence: `Terms: ${(pool.terms || []).join("; ")}. Repository: ${pool.repository}`,
          href: pool.url,
          evidenceWeight: pool.priority === "Critical" ? 22 : 8
        })
      );
  }

  function recordStage(record) {
    if (record.status === "Boundary review") return "Resolve boundary";
    if (record.status === "Public anchor") return "Backtrace public line";
    if (record.status === "Needs document request" || /daily diary|contact marker/i.test(record.type || "")) {
      return "Request substantive record";
    }
    if (hasItemGap(record) || record.status === "Source lead") return "Promote source control";
    return "Draft source note";
  }

  function recordAction(record) {
    if (record.status === "Boundary review") {
      return "Resolve volume placement against adjacent regional, domestic, or functional volumes before promotion.";
    }
    if (record.status === "Public anchor") {
      return "Locate speech drafts, clearance memoranda, briefing papers, schedule backup, and State/NSC follow-up records.";
    }
    if (record.status === "Needs document request" || /daily diary|contact marker/i.test(record.type || "")) {
      return "Request matching telcon, memcon, briefing paper, schedule backup, agenda, talking points, and follow-up files.";
    }
    if (hasItemGap(record) || record.status === "Source lead") {
      return "Replace search-level source wording with file unit, item title, stable identifier, release status, and routing context.";
    }
    return "Close-read for source-note style, routing, declassification status, and selection value.";
  }

  function recordItems() {
    return (data.records || [])
      .map((record) =>
        baseItem({
          id: `record-${record.id}`,
          laneId: record.laneId,
          source: "Chronology record",
          stage: recordStage(record),
          priority: record.priority,
          title: record.title,
          action: recordAction(record),
          why: record.compilerUse,
          handoff: `Verification steps: ${(record.verification || []).join("; ")}`,
          evidence: record.sourceNote,
          href: record.sourceUrl,
          evidenceWeight: (hasDailyControl(record) ? 10 : 0) + (record.priority === "Critical" ? 22 : 0)
        })
      );
  }

  function attentionItems() {
    return (data.publicAttention || []).map((row) =>
      baseItem({
        id: `attention-${row.laneId}`,
        laneId: row.laneId,
        source: "Public attention",
        stage: "Backtrace public line",
        priority: /high/i.test(row.attention || "") ? "High" : "Medium",
        title: row.evidenceTitle,
        action: "Backtrace the public statement to speech drafts, clearance memoranda, briefing books, agency comments, and post-statement follow-up records.",
        why: row.note,
        handoff: "Use GovInfo only as the public-line anchor; select internal documents if they illuminate decision-making.",
        evidence: `${row.directness}; ${row.strongHits} strong hits in the public-statement audit.`,
        href: row.evidenceUrl,
        evidenceWeight: Math.min(20, Math.round((row.strongHits || 0) / 8))
      })
    );
  }

  function buildItems() {
    return [
      ...coverageItems(),
      ...gapItems(),
      ...sourcePoolItems(),
      ...recordItems(),
      ...attentionItems()
    ].sort((a, b) => b.score - a.score || priorityRank(a.priority) - priorityRank(b.priority) || stageRank(a.stage) - stageRank(b.stage) || a.title.localeCompare(b.title));
  }

  function filters() {
    return {
      query: qs("#action-plan-search")?.value || "",
      lane: qs("#action-plan-lane")?.value || "",
      stage: qs("#action-plan-stage")?.value || "",
      priority: qs("#action-plan-priority")?.value || ""
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
    const root = qs("#action-plan-root");
    if (!root) return;
    const current = filters();
    visibleItems = items.filter(
      (item) =>
        matches(item, current.query) &&
        (!current.lane || item.laneId === current.lane) &&
        (!current.stage || item.stage === current.stage) &&
        (!current.priority || item.priority === current.priority)
    );

    const summary = qs("#action-plan-summary");
    if (summary) {
      const chapter = current.lane ? ` in ${laneName(current.lane)}` : "";
      summary.textContent = `Showing ${visibleItems.length} of ${items.length} ranked compiler actions${chapter}.`;
    }

    const topTen = visibleItems.slice(0, 10);
    const critical = visibleItems.filter((item) => item.priority === "Critical").length;
    const harvest = visibleItems.filter((item) => item.stage === "Run archival harvest").length;
    const boundary = visibleItems.filter((item) => item.stage === "Resolve boundary").length;
    const sourceControl = visibleItems.filter((item) => item.stage === "Promote source control").length;

    root.replaceChildren(
      make("div", { className: "action-plan-metrics" }, [
        metric(String(topTen.length), "do first", "Highest-ranked visible actions"),
        metric(String(critical), "critical", "Critical priority actions visible"),
        metric(String(harvest), "harvest", "Source-pool and Scout-driven pulls"),
        metric(String(sourceControl), "source control", "Rows needing item-level control"),
        metric(String(boundary), "boundary", "Rows needing placement decisions")
      ]),
      make("section", { className: "action-plan-top" }, [
        make("div", { className: "action-plan-heading" }, [
          make("div", {}, [
            make("p", { className: "kicker", text: "Do First" }),
            make("h3", { text: "Top Ranked Actions" })
          ]),
          make("span", { className: "count-pill", text: `${topTen.length} shown` })
        ]),
        make("div", { className: "action-plan-list" }, topTen.length ? topTen.map((item, index) => renderItem(item, index + 1)) : [
          make("p", { className: "empty", text: "No action-plan rows match the current filters." })
        ])
      ]),
      make("section", { className: "action-plan-stage-groups" }, renderStageGroups(visibleItems.slice(10)))
    );
  }

  function metric(value, label, caption) {
    return make("div", { className: "metric" }, [
      make("strong", { text: value }),
      make("span", { text: label }),
      make("p", { text: caption })
    ]);
  }

  function priorityPill(priority) {
    return make("span", { className: `priority ${priority || ""}`.trim(), text: priority || "Priority TBD" });
  }

  function pill(text, className = "tag") {
    return make("span", { className, text });
  }

  function renderStageGroups(rest) {
    const groups = stageOrder
      .map((stage) => rest.filter((item) => item.stage === stage))
      .filter((group) => group.length);
    if (!groups.length) return [make("p", { className: "empty", text: "No additional action groups beyond the top-ranked list." })];
    return groups.map((group) =>
      make("article", { className: "action-plan-group" }, [
        make("div", { className: "action-plan-heading" }, [
          make("div", {}, [
            make("p", { className: "kicker", text: "Stage" }),
            make("h3", { text: group[0].stage })
          ]),
          make("span", { className: "count-pill", text: `${group.length} actions` })
        ]),
        make("div", { className: "action-plan-list compact" }, group.map((item) => renderItem(item)))
      ])
    );
  }

  function renderItem(item, rank) {
    return make("article", { className: "action-plan-card", style: `--lane-color: ${item.color}` }, [
      make("div", { className: "action-plan-card-main" }, [
        make("p", { className: "meta-line", text: `${rank ? `#${rank} - ` : ""}${item.chapterShort} - ${item.source}` }),
        make("h4", { text: item.title }),
        make("div", { className: "tag-list" }, [priorityPill(item.priority), pill(item.stage), pill(`score ${item.score}`)]),
        make("p", { className: "action-plan-action" }, [make("strong", { text: "Action: " }), item.action]),
        make("p", { className: "action-plan-why" }, [make("strong", { text: "Why: " }), item.why])
      ]),
      make("aside", { className: "action-plan-card-side" }, [
        make("p", { className: "card-meta", text: "Handoff" }),
        make("p", { text: item.handoff }),
        make("p", { className: "card-meta", text: "Evidence" }),
        make("p", { text: item.evidence }),
        make("div", { className: "small-actions" }, [
          make("button", { type: "button", onClick: () => copyText(actionMemo(item), "Action memo copied") }, "Copy Memo"),
          item.href ? make("a", { className: "button ghost", href: item.href, rel: "noreferrer" }, item.href.startsWith("#") ? "Open Section" : "Open Source") : null
        ])
      ])
    ]);
  }

  function actionMemo(item) {
    return [
      "FRUS Volume XXIX compiler action memo",
      `Chapter: ${item.chapter}`,
      `Stage: ${item.stage}`,
      `Priority: ${item.priority}`,
      `Source: ${item.source}`,
      `Title: ${item.title}`,
      `Action: ${item.action}`,
      `Why: ${item.why}`,
      `Handoff: ${item.handoff}`,
      `Evidence: ${item.evidence}`,
      item.href ? `Link: ${item.href}` : ""
    ].filter(Boolean).join("\n");
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

  function exportItems() {
    downloadCsv("frus-v29-compiler-action-plan.csv", visibleItems, [
      { label: "score", value: (item) => item.score },
      { label: "priority", value: (item) => item.priority },
      { label: "stage", value: (item) => item.stage },
      { label: "chapter", value: (item) => item.chapter },
      { label: "source", value: (item) => item.source },
      { label: "title", value: (item) => item.title },
      { label: "action", value: (item) => item.action },
      { label: "why", value: (item) => item.why },
      { label: "handoff", value: (item) => item.handoff },
      { label: "evidence", value: (item) => item.evidence },
      { label: "link", value: (item) => item.href }
    ]);
  }

  function init() {
    items = buildItems();
    fillSelect(qs("#action-plan-lane"), (data.lanes || []).map((lane) => lane.id), "All chapters", laneName);
    fillSelect(qs("#action-plan-stage"), stageOrder.filter((stage) => items.some((item) => item.stage === stage)), "All stages");
    fillSelect(
      qs("#action-plan-priority"),
      [...new Set(items.map((item) => item.priority))].sort((a, b) => priorityRank(a) - priorityRank(b)),
      "All priorities"
    );
    ["#action-plan-search", "#action-plan-lane", "#action-plan-stage", "#action-plan-priority"].forEach((selector) => {
      qs(selector)?.addEventListener("input", render);
      qs(selector)?.addEventListener("change", render);
    });
    qs("#action-plan-reset")?.addEventListener("click", () => {
      ["#action-plan-search", "#action-plan-lane", "#action-plan-stage", "#action-plan-priority"].forEach((selector) => {
        const node = qs(selector);
        if (node) node.value = "";
      });
      render();
    });
    qs("#action-plan-export")?.addEventListener("click", exportItems);
    qs("#action-plan-copy")?.addEventListener("click", () =>
      copyText(visibleItems.slice(0, 20).map(actionMemo).join("\n\n---\n\n"), "Top visible action plan copied")
    );
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
