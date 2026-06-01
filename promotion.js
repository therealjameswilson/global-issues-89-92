(() => {
  const data = window.GLOBAL_ISSUES_DATA;
  if (!data) return;

  const lanesById = new Map(data.lanes.map((lane) => [lane.id, lane]));
  let visiblePromotion = [];

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

  function promotionRoute(record) {
    if (record.status === "Public anchor") {
      return {
        bucket: "Backfill public anchor",
        rank: 2,
        action: "Locate speech drafts, clearance memoranda, briefing papers, diary or backup file units, and State/NSC follow-up records.",
        reason: "Published text gives the public line, but FRUS selection still needs internal decision and clearance records."
      };
    }
    if (record.status === "Boundary review") {
      return {
        bucket: "Resolve boundary assignment",
        rank: 3,
        action: "Read against adjacent regional or functional volumes and keep only cross-regional doctrine or global-policy decisions.",
        reason: "The record may belong in another FRUS volume unless the global-issues dimension is primary."
      };
    }
    if (record.status === "Needs document request" || /daily diary|contact marker/i.test(record.type)) {
      return {
        bucket: "Request substantive record",
        rank: 0,
        action: "Use the diary, backup, or contact marker to request matching telcons, memcons, briefing papers, schedule backup, and State/NSC follow-up files.",
        reason: "The lead proves date and participants, but not the substantive record needed for a FRUS document."
      };
    }
    return {
      bucket: "Promote source lead",
      rank: 1,
      action: "Identify file unit and item titles, request declassified documents, and replace provisional source wording with item-level source-note control.",
      reason: "The topic is in scope, but the lead is not yet an item-level document candidate."
    };
  }

  function buildPromotionRows() {
    return data.records
      .map((record) => {
        const lane = laneFor(record.laneId);
        const route = promotionRoute(record);
        return {
          ...record,
          chapter: lane.name,
          chapterShort: lane.shortName,
          promotionBucket: route.bucket,
          promotionRank: route.rank,
          promotionAction: route.action,
          promotionReason: route.reason
        };
      })
      .sort(
        (a, b) =>
          a.promotionRank - b.promotionRank ||
          priorityRank(a.priority) - priorityRank(b.priority) ||
          a.date.localeCompare(b.date)
      );
  }

  function renderPromotion() {
    const root = qs("#promotion-root");
    if (!root) return;
    visiblePromotion = buildPromotionRows();

    const urgentRequests = visiblePromotion.filter((row) => row.priority === "Critical" || row.promotionRank === 0).length;
    const sourceLeads = visiblePromotion.filter((row) => row.promotionBucket === "Promote source lead").length;
    const boundaryReviews = visiblePromotion.filter((row) => row.promotionBucket === "Resolve boundary assignment").length;
    const publicBackfills = visiblePromotion.filter((row) => row.promotionBucket === "Backfill public anchor").length;
    const buckets = [
      "Request substantive record",
      "Promote source lead",
      "Backfill public anchor",
      "Resolve boundary assignment"
    ];

    root.replaceChildren(
      make("div", { className: "promotion-metrics" }, [
        metric(String(urgentRequests), "urgent requests", "Critical records and diary/contact-marker leads"),
        metric(String(sourceLeads), "source leads", "Need file-unit or item-level harvest"),
        metric(String(publicBackfills), "public backfills", "Need internal drafts and clearance records"),
        metric(String(boundaryReviews), "boundary reviews", "Need placement decisions before selection")
      ]),
      ...buckets
        .map((bucket) => visiblePromotion.filter((row) => row.promotionBucket === bucket))
        .filter((group) => group.length)
        .map(renderPromotionGroup)
    );
  }

  function metric(value, label, caption) {
    return make("div", { className: "metric" }, [
      make("strong", { text: value }),
      make("span", { text: label }),
      make("p", { text: caption })
    ]);
  }

  function renderPromotionGroup(rows) {
    return make("article", { className: "promotion-group" }, [
      make("div", { className: "promotion-group-heading" }, [
        make("div", {}, [
          make("p", { className: "kicker", text: "Queue" }),
          make("h3", { text: rows[0].promotionBucket })
        ]),
        make("span", { className: "count-pill", text: `${rows.length} items` })
      ]),
      make("div", { className: "promotion-list" }, rows.map(renderPromotionItem))
    ]);
  }

  function renderPromotionItem(row) {
    const lane = laneFor(row.laneId);
    return make("div", { className: "promotion-item", style: `--lane-color: ${lane.color}` }, [
      make("div", { className: "promotion-item-main" }, [
        make("p", { className: "meta-line", text: `${formatDate(row.date)} - ${row.chapterShort}` }),
        make("h4", { text: row.title }),
        make("div", { className: "tag-list" }, [priorityPill(row.priority), statusPill(row.status), pill(row.type)]),
        make("p", {}, [make("strong", { text: "Next action: " }), row.promotionAction]),
        make("p", {}, [make("strong", { text: "Why: " }), row.promotionReason])
      ]),
      make("div", { className: "promotion-item-side" }, [
        make("p", { className: "card-meta", text: "Verification" }),
        make("ul", { className: "compact-list" }, row.verification.map((item) => make("li", { text: item }))),
        make("div", { className: "small-actions" }, [
          make("button", { type: "button", onClick: () => copyText(promotionRequestText(row), "Promotion request copied") }, "Copy Request"),
          make("a", { className: "button ghost", href: row.sourceUrl, rel: "noreferrer" }, "Open Source")
        ])
      ])
    ]);
  }

  function promotionRequestText(row) {
    return [
      "FRUS Volume XXIX document-promotion request",
      `Date: ${row.date}`,
      `Chapter: ${row.chapter}`,
      `Title: ${row.title}`,
      `Status/type: ${row.status} / ${row.type}`,
      `Repository: ${row.repository}`,
      `Next action: ${row.promotionAction}`,
      `Compiler use: ${row.compilerUse}`,
      `Source note: ${row.sourceNote}`,
      `Verification: ${row.verification.join("; ")}`
    ].join("\n");
  }

  function exportPromotion() {
    downloadCsv("frus-v29-document-promotion-queue.csv", visiblePromotion, [
      { label: "date", value: (row) => row.date },
      { label: "title", value: (row) => row.title },
      { label: "chapter", value: (row) => row.chapter },
      { label: "bucket", value: (row) => row.promotionBucket },
      { label: "priority", value: (row) => row.priority },
      { label: "status", value: (row) => row.status },
      { label: "type", value: (row) => row.type },
      { label: "repository", value: (row) => row.repository },
      { label: "next_action", value: (row) => row.promotionAction },
      { label: "reason", value: (row) => row.promotionReason },
      { label: "source_url", value: (row) => row.sourceUrl },
      { label: "source_note", value: (row) => row.sourceNote },
      { label: "verification", value: (row) => row.verification }
    ]);
  }

  function copyCriticalPromotionRequests() {
    const rows = visiblePromotion.filter((row) => row.priority === "Critical" || row.promotionRank === 0);
    copyText(rows.map(promotionRequestText).join("\n\n---\n\n"), "Critical promotion requests copied");
  }

  function initPromotion() {
    renderPromotion();
    qs("#promotion-export")?.addEventListener("click", exportPromotion);
    qs("#promotion-copy-critical")?.addEventListener("click", copyCriticalPromotionRequests);
  }

  document.addEventListener("DOMContentLoaded", initPromotion);
})();
