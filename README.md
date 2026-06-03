# FRUS 1989-1992 Volume XXIX Global Issues Evidence Workbench

Static GitHub Pages compiler workspace for:

https://history.state.gov/historicaldocuments/frus1989-92v29

The Office of the Historian page identifies the volume as *Foreign Relations of
the United States, 1989-1992, Volume XXIX, Global Issues*. The status page lists
it as `Planned`, so this repository is built as a source-first workbench rather
than a published-volume mirror.

## What is included

- volume status and source links
- chronology-first pass through declassified/public records and source-control leads
- declassified-document chronology as the first working section on the page
- chapter-year coverage matrix for spotting thin, missing, public-only, and source-control-gap years
- ranked compiler action plan merging coverage, gaps, source pools, public anchors, and record blockers
- chapter readiness dashboard with scoring, primary gates, blocker summaries, and copyable briefs
- document-promotion queue for turning dated leads into FRUS-ready document requests
- source-note readiness audit with FRUS-style draft targets, field checks, and CSV/exportable requests
- release/declassification ledger separating public texts, no-document markers, diary controls, scope-note leads, and provisional searches
- FRUS document-selection docket with ranked blockers, source-note field targets, CSV export, and copyable requests
- provisional chapter-by-chapter document register with slot labels, numbering actions, CSV export, and copyable Markdown
- boundary matrix for routing leads between Volume XXIX and adjacent regional, domestic, or functional volumes
- adjacent-volume coordination board keyed to current HistoryAtState status, overlap topics, and copyable compiler memos
- chapter-level compiler packet builder with Markdown export and copy workflow
- repository-grouped archival pull list with NAID extraction and copyable request text
- Presidential Daily Diary and Daily Backup meeting/call control index with copyable follow-up requests
- working chapter planning for global issues topics
- Volume XLI-inspired chapters for United Nations, Global Climate Change and
  the Rio Summit, Human Rights, Law of the Sea, African Famine and relief,
  AIDS Policy, International Population Policy, Ozone, and Whaling/Biodiversity
- candidate record/source-lead browser
- persons list starter
- source-pool queue
- compiler gap tracker
- public-reference and precedent layer
- Bush Public Papers presidential-attention audit for the working chapters
- NARA Scout query queue and query pack for archival follow-up
- review queue with local browser state
- CSV exports for visible records, gaps, source pools, persons, references, and review items
- local ingest scratchpad for query packs and archival notes

## Local use

Open `index.html` directly, or serve the folder:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Publication note

The live compiler workspace is published at:

https://therealjameswilson.github.io/global-issues-89-92/

The `main` branch is also pushed to `gh-pages` when the static page is updated.

## Research reports

- `reports/bush-public-statements-topic-audit.md` summarizes whether the working
  chapter topics received presidential public attention in the Bush Public
  Papers.
- `reports/nara-scout-topic-pass.md` records the NARA Scout query pass and the
  API-key limit encountered on May 23, 2026.

## Source caveat

The data here is a compiler-facing seed set. It deliberately separates official
FRUS status anchors, public evidence, provisional source leads, and unresolved
gaps. Final inclusion, chapter placement, source-note wording, and
declassification handling remain editorial decisions for the FRUS compiler.
