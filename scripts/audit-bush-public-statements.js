#!/usr/bin/env node

const childProcess = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const REPORT_DIR = path.join(ROOT, "reports");
const CACHE_DIR = process.env.PPP_CACHE_DIR || "/tmp/frus-v29-public-papers";

const PACKAGES = [
  { id: "PPP-1989-book1", year: 1989, label: "1989 Book I", dateRange: "January 20 to June 30, 1989" },
  { id: "PPP-1989-book2", year: 1989, label: "1989 Book II", dateRange: "July 1 to December 31, 1989" },
  { id: "PPP-1990-book1", year: 1990, label: "1990 Book I", dateRange: "January 1 to June 30, 1990" },
  { id: "PPP-1990-book2", year: 1990, label: "1990 Book II", dateRange: "July 1 to December 31, 1990" },
  { id: "PPP-1991-book1", year: 1991, label: "1991 Book I", dateRange: "January 1 to June 30, 1991" },
  { id: "PPP-1991-book2", year: 1991, label: "1991 Book II", dateRange: "July 1 to December 31, 1991" },
  { id: "PPP-1992-book1", year: 1992, label: "1992 Book I", dateRange: "January 1 to July 31, 1992" },
  { id: "PPP-1992-book2", year: 1992, label: "1992 Book II", dateRange: "August 1, 1992 to January 19, 1993" }
];

const TOPICS = [
  {
    id: "un-governance",
    chapter: "United Nations",
    terms: [
      "United Nations",
      "U.N.",
      "UNGA",
      "General Assembly",
      "Security Council",
      "peacekeeping",
      "Secretary-General",
      "Perez de Cuellar",
      "Boutros-Ghali",
      "Agenda for Peace"
    ]
  },
  {
    id: "environment-science",
    chapter: "Global Climate Change and the Rio Summit",
    terms: [
      "global warming",
      "climate change",
      "climate convention",
      "greenhouse",
      "Rio Summit",
      "Rio de Janeiro",
      "Earth Summit",
      "UNCED",
      "United Nations Conference on Environment and Development",
      "Framework Convention"
    ]
  },
  {
    id: "rights-democracy",
    chapter: "Human Rights",
    terms: [
      "human rights",
      "democracy",
      "democratic reform",
      "free elections",
      "political freedom",
      "civil society",
      "religious freedom"
    ]
  },
  {
    id: "commons-law",
    chapter: "Law of the Sea, Oceans, and Antarctica",
    terms: ["Law of the Sea", "Antarctica", "Antarctic", "ocean", "oceans", "maritime", "polar"]
  },
  {
    id: "refugees-relief",
    chapter: "African Famine, Refugees, and Humanitarian Relief",
    terms: [
      "African famine",
      "famine",
      "refugee",
      "refugees",
      "humanitarian",
      "relief",
      "food aid",
      "drought",
      "Provide Relief",
      "Somalia",
      "Ethiopia",
      "Sudan"
    ]
  },
  {
    id: "health-population",
    chapter: "AIDS Policy and International Health",
    terms: ["AIDS", "HIV", "Magic Johnson", "World Health Organization", "global health"]
  },
  {
    id: "population-policy",
    chapter: "International Population Policy",
    terms: ["population policy", "population", "family planning", "UNFPA", "Mexico City policy"]
  },
  {
    id: "ozone-layer",
    chapter: "Protection of the Ozone Layer",
    terms: ["ozone", "Montreal Protocol", "chlorofluorocarbon", "chlorofluorocarbons", "CFC", "CFCs"]
  },
  {
    id: "whaling-biodiversity",
    chapter: "International Whaling, Biodiversity, and Wildlife Protection",
    terms: [
      "whaling",
      "whale",
      "whales",
      "International Whaling Commission",
      "biodiversity",
      "wildlife",
      "endangered species",
      "conservation"
    ]
  }
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function run(command, args, options = {}) {
  const result = childProcess.spawnSync(command, args, {
    encoding: "utf8",
    stdio: options.stdio || "pipe",
    maxBuffer: options.maxBuffer || 1024 * 1024 * 50
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed: ${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

function downloadPackage(pkg) {
  ensureDir(CACHE_DIR);
  const zipPath = path.join(CACHE_DIR, `${pkg.id}.zip`);
  const extractPath = path.join(CACHE_DIR, pkg.id);
  if (!fs.existsSync(zipPath) || fs.statSync(zipPath).size < 100000) {
    const url = `https://www.govinfo.gov/content/pkg/${pkg.id}/zip/${pkg.id}.zip`;
    console.error(`Downloading ${pkg.id} from GovInfo...`);
    run("curl", ["-L", "--fail", "--retry", "3", "-o", zipPath, url], { stdio: "inherit" });
  }
  const marker = path.join(extractPath, ".extracted");
  if (!fs.existsSync(marker)) {
    ensureDir(extractPath);
    console.error(`Extracting ${pkg.id}...`);
    run("unzip", ["-q", "-o", zipPath, "-d", extractPath], { stdio: "inherit" });
    fs.writeFileSync(marker, new Date().toISOString());
  }
  return extractPath;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function stripHtml(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\r/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
  ).trim();
}

function compileTerm(term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  const prefix = /^[A-Za-z0-9]/.test(term) ? "\\b" : "";
  const suffix = /[A-Za-z0-9]$/.test(term) ? "\\b" : "";
  return new RegExp(`${prefix}${escaped}${suffix}`, "gi");
}

function extractDoc(pkg, file) {
  const html = fs.readFileSync(file, "utf8");
  if (!/\/html\/.*-doc-/.test(file)) return null;
  const granule = path.basename(file, ".htm");
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch
    ? decodeEntities(titleMatch[1]).replace(/^Public Papers.*? - /, "").trim()
    : granule;
  const text = stripHtml(html);
  const date = (text.match(/\[([A-Z][a-z]+ \d{1,2}, \d{4})\]/) || [])[1] || "";
  const pages = (text.match(/\[Pages? ([^\]]+)\]/) || [])[1] || "";
  const url = `https://www.govinfo.gov/app/details/${pkg.id}/${granule}`;
  return {
    id: granule,
    packageId: pkg.id,
    packageLabel: pkg.label,
    year: pkg.year,
    date,
    pages,
    title,
    url,
    text
  };
}

function pdfTextDoc(pkg, pdfPath) {
  const textPath = path.join(path.dirname(pdfPath), `${pkg.id}.txt`);
  if (!fs.existsSync(textPath) || fs.statSync(textPath).mtimeMs < fs.statSync(pdfPath).mtimeMs) {
    console.error(`Extracting text from ${pkg.id} PDF...`);
    run("pdftotext", ["-layout", pdfPath, textPath], { maxBuffer: 1024 * 1024 * 200 });
  }
  return {
    id: pkg.id,
    packageId: pkg.id,
    packageLabel: pkg.label,
    year: pkg.year,
    date: pkg.dateRange,
    pages: "volume-level OCR",
    title: `Public Papers of the Presidents: George H. W. Bush (${pkg.label})`,
    url: `https://www.govinfo.gov/app/details/${pkg.id}`,
    volumeLevelOnly: true,
    text: fs.readFileSync(textPath, "utf8")
  };
}

function docsForPackage(pkg, extractPath) {
  const packageRoot = path.join(extractPath, pkg.id);
  const htmlDir = path.join(packageRoot, "html");
  if (fs.existsSync(htmlDir)) {
    return walk(htmlDir)
      .filter((file) => /-doc-.*\.htm$/.test(file))
      .map((file) => extractDoc(pkg, file))
      .filter(Boolean);
  }

  const pdfPath = path.join(packageRoot, "pdf", `${pkg.id}.pdf`);
  if (fs.existsSync(pdfPath)) return [pdfTextDoc(pkg, pdfPath)];

  throw new Error(`No HTML granules or package PDF found for ${pkg.id}`);
}

function scoreDoc(doc, topic) {
  const haystack = `${doc.title}\n${doc.text}`;
  const titleHaystack = doc.title;
  const matchedTerms = [];
  let count = 0;
  let titleCount = 0;
  for (const term of topic.terms) {
    const re = compileTerm(term);
    const matches = haystack.match(re) || [];
    const titleMatches = titleHaystack.match(compileTerm(term)) || [];
    if (matches.length) matchedTerms.push(term);
    count += matches.length;
    titleCount += titleMatches.length;
  }
  if (!count) return null;
  const score = count + titleCount * 6 + (matchedTerms.length - 1) * 2;
  const context = bestContext(doc.text, matchedTerms);
  return {
    id: doc.id,
    title: doc.title,
    date: doc.date,
    year: doc.year,
    pages: doc.pages,
    packageId: doc.packageId,
    packageLabel: doc.packageLabel,
    url: doc.url,
    volumeLevelOnly: doc.volumeLevelOnly || false,
    matchedTerms,
    termCount: count,
    titleTermCount: titleCount,
    score,
    context
  };
}

function bestContext(text, terms) {
  const normalized = text.replace(/\s+/g, " ");
  const lower = normalized.toLowerCase();
  let best = -1;
  for (const term of terms) {
    const idx = lower.indexOf(term.toLowerCase());
    if (idx !== -1 && (best === -1 || idx < best)) best = idx;
  }
  if (best === -1) return "";
  const start = Math.max(0, best - 170);
  const end = Math.min(normalized.length, best + 260);
  return normalized.slice(start, end).trim();
}

function attentionLevel(hitCount, strongCount) {
  if (strongCount >= 8 || hitCount >= 25) return "High";
  if (strongCount >= 3 || hitCount >= 8) return "Moderate";
  if (hitCount > 0) return "Trace";
  return "None";
}

function packageSource(pkg) {
  return {
    id: pkg.id,
    label: pkg.label,
    dateRange: pkg.dateRange,
    detailsUrl: `https://www.govinfo.gov/app/details/${pkg.id}`,
    zipUrl: `https://www.govinfo.gov/content/pkg/${pkg.id}/zip/${pkg.id}.zip`
  };
}

function buildMarkdown(result) {
  const lines = [];
  lines.push("# Bush Public Statements Topic Audit for FRUS 1989-1992 Volume XXIX");
  lines.push("");
  lines.push(`Generated: ${result.generatedAt}`);
  lines.push("");
  lines.push("## Scope");
  lines.push("");
  lines.push(
    "This pass searches the official GovInfo Public Papers packages for President George H. W. Bush, January 20, 1989-January 19, 1993."
  );
  lines.push(
    "When GovInfo exposes a package only as a full-volume PDF in this collection, the script searches text extracted from that PDF and marks the result as volume-level OCR."
  );
  lines.push(
    "A hit means the topic appeared in a presidential public document; it does not by itself prove that an internal policy decision document belongs in the FRUS volume."
  );
  lines.push("");
  lines.push("## Topic Summary");
  lines.push("");
  lines.push("| Chapter | Attention | Hit documents | Strong hits | Top evidence |");
  lines.push("| --- | ---: | ---: | ---: | --- |");
  for (const topic of result.topics) {
    const top = topic.topHits[0];
    const evidence = top ? `[${escapeMd(top.title)}](${top.url}) (${top.date || top.packageLabel})` : "";
    lines.push(
      `| ${escapeMd(topic.chapter)} | ${topic.attentionLevel} | ${topic.hitDocuments} | ${topic.strongHits} | ${evidence} |`
    );
  }
  lines.push("");
  lines.push("## Chapter Notes");
  for (const topic of result.topics) {
    lines.push("");
    lines.push(`### ${topic.chapter}`);
    lines.push("");
    lines.push(
      `Assessment: **${topic.attentionLevel} presidential attention** (${topic.hitDocuments} public documents; ${topic.strongHits} strong hits).`
    );
    if (!topic.topHits.length) {
      lines.push("");
      lines.push("No public-statement hits found in this pass.");
      continue;
    }
    lines.push("");
    for (const hit of topic.topHits.slice(0, 8)) {
      const scope = hit.volumeLevelOnly ? " (volume-level OCR)" : "";
      lines.push(
        `- ${hit.date || hit.packageLabel}: [${escapeMd(hit.title)}](${hit.url})${scope} - terms: ${hit.matchedTerms
          .slice(0, 6)
          .join(", ")}.`
      );
    }
  }
  lines.push("");
  lines.push("## Sources");
  lines.push("");
  for (const source of result.sources) {
    lines.push(`- ${source.label}, ${source.dateRange}: ${source.detailsUrl}`);
  }
  return `${lines.join("\n")}\n`;
}

function escapeMd(text) {
  return String(text).replace(/\|/g, "\\|").replace(/\[/g, "\\[").replace(/\]/g, "\\]");
}

function main() {
  ensureDir(REPORT_DIR);
  const docs = [];
  for (const pkg of PACKAGES) {
    const extractPath = downloadPackage(pkg);
    docs.push(...docsForPackage(pkg, extractPath));
  }

  const topicResults = TOPICS.map((topic) => {
    const hits = docs
      .map((doc) => scoreDoc(doc, topic))
      .filter(Boolean)
      .sort((a, b) => b.score - a.score || String(a.date).localeCompare(String(b.date)));
    const strongHits = hits.filter((hit) => hit.titleTermCount > 0 || hit.termCount >= 4).length;
    const byYear = {};
    for (const hit of hits) byYear[hit.year] = (byYear[hit.year] || 0) + 1;
    return {
      id: topic.id,
      chapter: topic.chapter,
      terms: topic.terms,
      hitDocuments: hits.length,
      strongHits,
      attentionLevel: attentionLevel(hits.length, strongHits),
      byYear,
      topHits: hits.slice(0, 20)
    };
  });

  const result = {
    generatedAt: new Date().toISOString(),
    method: {
      corpus: "GovInfo Public Papers of the Presidents, George H. W. Bush, 1989 Book I through 1992 Book II",
      packageCount: PACKAGES.length,
      documentCount: docs.length,
      cacheDir: CACHE_DIR,
      digest: crypto.createHash("sha256").update(docs.map((doc) => doc.id).join("\n")).digest("hex")
    },
    sources: PACKAGES.map(packageSource),
    topics: topicResults
  };

  fs.writeFileSync(
    path.join(REPORT_DIR, "bush-public-statements-topic-audit.json"),
    `${JSON.stringify(result, null, 2)}\n`
  );
  fs.writeFileSync(path.join(REPORT_DIR, "bush-public-statements-topic-audit.md"), buildMarkdown(result));
  console.error(`Audited ${docs.length} public documents across ${PACKAGES.length} packages.`);
}

main();
