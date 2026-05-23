# FRUS 1989-1992 Volume XXIX Global Issues Assistant

Static GitHub Pages compiler workspace for:

https://history.state.gov/historicaldocuments/frus1989-92v29

The Office of the Historian page identifies the volume as *Foreign Relations of
the United States, 1989-1992, Volume XXIX, Global Issues*. The status page lists
it as `Planned`, so this repository is built as a starter workbench rather than a
published-volume mirror.

## What is included

- volume status and source links
- working chapter planning for global issues topics
- Volume XLI-inspired chapters for United Nations, Global Climate Change and
  the Rio Summit, Human Rights, Law of the Sea, African Famine and relief,
  AIDS Policy, International Population Policy, Ozone, and Whaling/Biodiversity
- candidate record/source-lead browser
- persons list starter
- source-pool queue
- compiler gap tracker
- public-reference and precedent layer
- review queue with local browser state
- CSV exports for visible records, gaps, source pools, persons, references, and review items
- local ingest scratchpad for query packs and archival notes

## Local use

Open `index.html` directly, or serve the folder:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Source caveat

The data here is a compiler-facing seed set. It deliberately separates official
FRUS status anchors from inferred source leads. Final inclusion, chapter
placement, source-note wording, and declassification handling remain editorial
decisions for the FRUS compiler.
