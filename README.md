# FRUS 1989-1992 Volume XXIX Global Issues Assistant

Static GitHub Pages compiler workspace for:

https://history.state.gov/historicaldocuments/frus1989-92v29

The Office of the Historian page identifies the volume as *Foreign Relations of
the United States, 1989-1992, Volume XXIX, Global Issues*. The status page lists
it as `Planned`, so this repository is built as a starter workbench rather than a
published-volume mirror.

## What is included

- volume status and source links
- chronology-first pass through declassified/public records and source-control leads
- document-promotion queue for turning dated leads into FRUS-ready document requests
- source-note readiness audit for repository, series, item, identifier, status, and URL control
- chapter-level compiler packet builder with Markdown export and copy workflow
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
- NARA Scout query pack for archival follow-up
- Presidential Daily Diary and Daily Backup source leads for pertinent meetings and calls
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

This repository is private. GitHub rejected Pages publication for the current
plan with `Your current plan does not support GitHub Pages for this repository`.
The Pages workflow is kept manual-only so it can be run after the repository is
made public or private Pages is enabled.

## Research reports

- `reports/bush-public-statements-topic-audit.md` summarizes whether the working
  chapter topics received presidential public attention in the Bush Public
  Papers.
- `reports/nara-scout-topic-pass.md` records the NARA Scout query pass and the
  API-key limit encountered on May 23, 2026.

## Source caveat

The data here is a compiler-facing seed set. It deliberately separates official
FRUS status anchors from inferred source leads. Final inclusion, chapter
placement, source-note wording, and declassification handling remain editorial
decisions for the FRUS compiler.
