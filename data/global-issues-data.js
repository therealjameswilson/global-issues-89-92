window.GLOBAL_ISSUES_DATA = {
  volume: {
    id: "frus1989-92v29",
    title: "Foreign Relations of the United States, 1989-1992, Volume XXIX, Global Issues",
    shortTitle: "FRUS 1989-1992, Volume XXIX",
    officialUrl: "https://history.state.gov/historicaldocuments/frus1989-92v29",
    status: "Planned",
    statusUrl: "https://history.state.gov/historicaldocuments/status-of-the-series",
    statusChecked: "May 23, 2026",
    compilerMode: "Starter research workbench",
    caution:
      "Official HistoryAtState pages provide the volume title and status. Chapter structure and source leads on this page are compiler-facing research scaffolding."
  },
  lanes: [
    {
      id: "un-governance",
      number: "Chapter 1",
      name: "United Nations",
      shortName: "United Nations",
      color: "#2f6f73",
      description:
        "UN reform, Security Council practice, peacekeeping doctrine, sanctions administration, and the post-Cold War multilateral order.",
      boundary:
        "Keep case-specific peacekeeping records with Somalia, Yugoslavia, Iraq, or regional volumes unless the document is principally about global UN doctrine.",
      sourceTargets: [
        "State IO files",
        "NSC multilateral affairs files",
        "UNGA public addresses",
        "Presidential meetings with UN officials"
      ],
      searchTerms: ["United Nations", "UNGA", "Security Council", "peacekeeping", "collective security", "sanctions"]
    },
    {
      id: "environment-science",
      number: "Chapter 2",
      name: "Global Climate Change and the Rio Summit",
      shortName: "Climate/Rio",
      color: "#c18a2b",
      description:
        "Global warming, climate convention negotiations, forests, biodiversity diplomacy, and the road to the 1992 Rio Earth Summit.",
      boundary:
        "Keep ozone implementation, whaling, and technical oceans records in their own chapters unless they directly shaped climate or Rio decisions.",
      sourceTargets: [
        "Council on Environmental Quality files",
        "State OES files",
        "NSC environment files",
        "G7 and UNCED summit files"
      ],
      searchTerms: ["global warming", "climate", "UNCED", "Rio", "framework convention", "biodiversity", "forests"]
    },
    {
      id: "rights-democracy",
      number: "Chapter 3",
      name: "Human Rights",
      shortName: "Human Rights",
      color: "#4d7c3f",
      description:
        "Human rights policy, democratization, election observation, sanctions linked to governance, and cross-regional rights diplomacy.",
      boundary:
        "Country-specific democracy transitions belong in geographic volumes when the policy discussion is local rather than global.",
      sourceTargets: [
        "State HA/DRL predecessor files",
        "NSC democracy support files",
        "NED and election-observer policy files",
        "Public diplomacy records"
      ],
      searchTerms: ["human rights", "democracy", "election observers", "rule of law", "political reform", "civil society"]
    },
    {
      id: "commons-law",
      number: "Chapter 4",
      name: "Law of the Sea, Oceans, and Antarctica",
      shortName: "Law of Sea",
      color: "#5f6f3a",
      description:
        "Law of the Sea, Antarctica, oceans, polar affairs, outer space, aviation, treaties, and other commons questions.",
      boundary:
        "Arms-control legal questions belong with arms-control volumes unless the document is about general international legal architecture.",
      sourceTargets: [
        "State Legal Adviser files",
        "OES oceans and polar affairs files",
        "NSC legal and treaty files",
        "ICAO and space-policy records"
      ],
      searchTerms: ["Law of the Sea", "Antarctica", "oceans", "outer space", "ICAO", "international law", "treaty"]
    },
    {
      id: "refugees-relief",
      number: "Chapter 5",
      name: "African Famine, Refugees, and Humanitarian Relief",
      shortName: "Famine/Relief",
      color: "#7c5b9b",
      description:
        "African famine, emergency relief, refugee policy, migration diplomacy, asylum pressure, and humanitarian operations that cross regional assignments.",
      boundary:
        "Separate broad famine, refugee, and humanitarian doctrine from crisis-specific records in Persian Gulf, Somalia, Haiti, Cuba, and Balkans files.",
      sourceTargets: [
        "State refugee bureau files",
        "NSC humanitarian files",
        "USAID disaster assistance files",
        "UNHCR and ICRC meeting files"
      ],
      searchTerms: ["African famine", "refugees", "migration", "humanitarian", "UNHCR", "relief", "asylum"]
    },
    {
      id: "health-population",
      number: "Chapter 6",
      name: "AIDS Policy and International Health",
      shortName: "AIDS/Health",
      color: "#d54f38",
      description:
        "AIDS/HIV diplomacy, WHO engagement, health assistance, and global health questions treated as foreign policy.",
      boundary:
        "Keep domestic health implementation files out unless they explain U.S. international posture or multilateral negotiations.",
      sourceTargets: [
        "State global health files",
        "HHS international files",
        "USAID health files",
        "WHO files"
      ],
      searchTerms: ["AIDS", "HIV", "health", "WHO", "global health", "health assistance"]
    },
    {
      id: "population-policy",
      number: "Chapter 7",
      name: "International Population Policy",
      shortName: "Population",
      color: "#8b6f2f",
      description:
        "Population diplomacy, family planning, UNFPA, development assistance, and multilateral population-policy disputes.",
      boundary:
        "Domestic social-policy material is out of scope unless it shaped international assistance or multilateral negotiations.",
      sourceTargets: [
        "USAID population files",
        "State global programs files",
        "HHS international files",
        "UNFPA and population conference files"
      ],
      searchTerms: ["population", "family planning", "UNFPA", "development assistance", "Mexico City policy"]
    },
    {
      id: "ozone-layer",
      number: "Chapter 8",
      name: "Protection of the Ozone Layer",
      shortName: "Ozone",
      color: "#668b3f",
      description:
        "Montreal Protocol implementation, ozone depletion, atmospheric science, chlorofluorocarbons, and related international environmental diplomacy.",
      boundary:
        "Climate-change decisions belong in the Rio chapter unless the document is principally about ozone or Montreal Protocol implementation.",
      sourceTargets: [
        "State OES atmospheric files",
        "EPA international files",
        "CEQ files",
        "NSC environment files"
      ],
      searchTerms: ["ozone", "Montreal Protocol", "chlorofluorocarbons", "CFC", "atmospheric", "stratospheric ozone"]
    },
    {
      id: "whaling-biodiversity",
      number: "Chapter 9",
      name: "International Whaling, Biodiversity, and Wildlife Protection",
      shortName: "Wildlife",
      color: "#9b5b43",
      description:
        "International whaling regulation, wildlife protection, biodiversity negotiations, and conservation diplomacy adjacent to the Rio process.",
      boundary:
        "Rio biodiversity convention files stay with the climate/Rio chapter when they are part of summit decision-making; technical conservation disputes remain here.",
      sourceTargets: [
        "State OES conservation files",
        "NOAA and Interior international files",
        "International Whaling Commission files",
        "Biodiversity convention files"
      ],
      searchTerms: ["whaling", "International Whaling Commission", "biodiversity", "wildlife", "conservation", "endangered species"]
    }
  ],
  publicAttention: [
    {
      laneId: "un-governance",
      attention: "Yes - high",
      hitDocuments: 331,
      strongHits: 148,
      directness: "Direct presidential attention",
      evidenceDate: "1992-09-21",
      evidenceTitle: "Address to the United Nations General Assembly in New York City",
      evidenceUrl: "https://www.govinfo.gov/app/details/PPP-1992-book2/PPP-1992-book2-doc-pg1598",
      reportUrl: "reports/bush-public-statements-topic-audit.md",
      naraScoutUrl:
        "https://therealjameswilson.github.io/nara-scout/#q=%22United%20Nations%22%20OR%20%22Security%20Council%22%20OR%20peacekeeping%20OR%20UNGA&from=1989&to=1993&scope=bush41&perColl=25&perPage=50",
      note:
        "UN, Security Council, peacekeeping, and Secretary-General topics recur in Bush public statements and are suitable public-line anchors for internal IO and NSC files."
    },
    {
      laneId: "environment-science",
      attention: "Yes - high",
      hitDocuments: 38,
      strongHits: 20,
      directness: "Direct presidential attention",
      evidenceDate: "1992-10-13",
      evidenceTitle: "Statement on Signing the Instrument of Ratification for the United Nations Framework Convention on Climate Change",
      evidenceUrl: "https://www.govinfo.gov/app/details/PPP-1992-book2/PPP-1992-book2-doc-pg1818",
      reportUrl: "reports/bush-public-statements-topic-audit.md",
      naraScoutUrl:
        "https://therealjameswilson.github.io/nara-scout/#q=%22climate%20change%22%20OR%20%22global%20warming%22%20OR%20UNCED%20OR%20%22Rio%20de%20Janeiro%22%20OR%20%22Framework%20Convention%22&from=1989&to=1993&scope=bush41&perColl=25&perPage=50",
      note:
        "The Rio Summit and climate convention received explicit presidential statements, messages, and summit remarks; this chapter has a clear public decision trail."
    },
    {
      laneId: "rights-democracy",
      attention: "Yes - high",
      hitDocuments: 310,
      strongHits: 67,
      directness: "Direct but cross-regional",
      evidenceDate: "1992-01-22",
      evidenceTitle: "Remarks to the Citizens Democracy Corps Conference",
      evidenceUrl: "https://www.govinfo.gov/app/details/PPP-1992-book1/PPP-1992-book1-doc-pg129",
      reportUrl: "reports/bush-public-statements-topic-audit.md",
      naraScoutUrl:
        "https://therealjameswilson.github.io/nara-scout/#q=%22human%20rights%22%20OR%20democracy%20OR%20%22free%20elections%22%20OR%20%22civil%20society%22&from=1989&to=1993&scope=bush41&perColl=25&perPage=50",
      note:
        "Human rights and democracy were prominent presidential themes; compiler work should separate global doctrine from country-specific transitions."
    },
    {
      laneId: "commons-law",
      attention: "Yes - narrower",
      hitDocuments: 75,
      strongHits: 9,
      directness: "Direct but narrower than the raw count",
      evidenceDate: "1992-02-14",
      evidenceTitle: "Message to the Senate Transmitting the Antarctic Treaty Protocol on Environmental Protection",
      evidenceUrl: "https://www.govinfo.gov/app/details/PPP-1992-book1/PPP-1992-book1-doc-pg244-2",
      reportUrl: "reports/bush-public-statements-topic-audit.md",
      naraScoutUrl:
        "https://therealjameswilson.github.io/nara-scout/#q=%22Law%20of%20the%20Sea%22%20OR%20Antarctica%20OR%20Antarctic%20OR%20oceans%20OR%20maritime&from=1989&to=1993&scope=bush41&perColl=25&perPage=50",
      note:
        "Antarctic Treaty and oceans material received presidential attention. Broad ocean and maritime hits need statement-level review before promotion."
    },
    {
      laneId: "refugees-relief",
      attention: "Yes - high",
      hitDocuments: 302,
      strongHits: 111,
      directness: "Direct, with broad humanitarian overlap",
      evidenceDate: "1992-12-04",
      evidenceTitle: "Address to the Nation on the Situation in Somalia",
      evidenceUrl: "https://www.govinfo.gov/app/details/PPP-1992-book2/PPP-1992-book2-doc-pg2174-3",
      reportUrl: "reports/bush-public-statements-topic-audit.md",
      naraScoutUrl:
        "https://therealjameswilson.github.io/nara-scout/#q=Somalia%20OR%20%22African%20famine%22%20OR%20refugees%20OR%20humanitarian%20OR%20%22food%20aid%22%20OR%20drought&from=1989&to=1993&scope=bush41&perColl=25&perPage=50",
      note:
        "Bush gave direct attention to Somalia, famine, refugees, and humanitarian relief. The public corpus also catches many non-African relief contexts, so regional boundary review is essential."
    },
    {
      laneId: "health-population",
      attention: "Yes - high for AIDS",
      hitDocuments: 56,
      strongHits: 14,
      directness: "Direct for AIDS; narrower for international health",
      evidenceDate: "1992-10-11",
      evidenceTitle: "Presidential Debate in St. Louis",
      evidenceUrl: "https://www.govinfo.gov/app/details/PPP-1992-book2/PPP-1992-book2-doc-pg1786-3",
      reportUrl: "reports/bush-public-statements-topic-audit.md",
      naraScoutUrl:
        "https://therealjameswilson.github.io/nara-scout/#q=AIDS%20OR%20HIV%20OR%20%22World%20Health%20Organization%22%20OR%20%22global%20health%22&from=1989&to=1993&scope=bush41&perColl=25&perPage=50",
      note:
        "AIDS received presidential attention, especially in 1991-1992. International-health evidence is thinner in public statements and needs HHS, USAID, WHO, and State files."
    },
    {
      laneId: "population-policy",
      attention: "Yes - narrower",
      hitDocuments: 74,
      strongHits: 10,
      directness: "Direct but narrower than the raw count",
      evidenceDate: "1992-09-25",
      evidenceTitle: "Message to the Senate Returning Without Approval the Family Planning Amendments Act of 1992",
      evidenceUrl: "https://www.govinfo.gov/app/details/PPP-1992-book2/PPP-1992-book2-doc-pg1655",
      reportUrl: "reports/bush-public-statements-topic-audit.md",
      naraScoutUrl:
        "https://therealjameswilson.github.io/nara-scout/#q=%22population%20policy%22%20OR%20population%20OR%20%22family%20planning%22%20OR%20UNFPA%20OR%20%22Mexico%20City%20policy%22&from=1989&to=1993&scope=bush41&perColl=25&perPage=50",
      note:
        "Family planning and population policy appear in presidential materials, but generic population hits need filtering for international policy relevance."
    },
    {
      laneId: "ozone-layer",
      attention: "Yes - high",
      hitDocuments: 59,
      strongHits: 16,
      directness: "Direct presidential attention",
      evidenceDate: "1991-05-14",
      evidenceTitle: "Message to the Senate Transmitting an Amendment to the Montreal Protocol on Substances that Deplete the Ozone Layer",
      evidenceUrl: "https://www.govinfo.gov/app/details/PPP-1991-book1/PPP-1991-book1-doc-pg509-2",
      reportUrl: "reports/bush-public-statements-topic-audit.md",
      naraScoutUrl:
        "https://therealjameswilson.github.io/nara-scout/#q=ozone%20OR%20%22Montreal%20Protocol%22%20OR%20chlorofluorocarbon%20OR%20CFC&from=1989&to=1993&scope=bush41&perColl=25&perPage=50",
      note:
        "Ozone and Montreal Protocol implementation have clear presidential messages and statements, making this one of the cleaner public-line chapters."
    },
    {
      laneId: "whaling-biodiversity",
      attention: "Yes - high",
      hitDocuments: 111,
      strongHits: 35,
      directness: "Direct, with domestic conservation overlap",
      evidenceDate: "1992-12-23",
      evidenceTitle: "Letter to Congressional Leaders Reporting on Whaling Activities of Norway",
      evidenceUrl: "https://www.govinfo.gov/app/details/PPP-1992-book2/PPP-1992-book2-doc-pg2213-2",
      reportUrl: "reports/bush-public-statements-topic-audit.md",
      naraScoutUrl:
        "https://therealjameswilson.github.io/nara-scout/#q=whaling%20OR%20whales%20OR%20biodiversity%20OR%20wildlife%20OR%20%22endangered%20species%22%20OR%20conservation&from=1989&to=1993&scope=bush41&perColl=25&perPage=50",
      note:
        "Whaling, biodiversity, wildlife, and endangered-species issues reached the presidential public record, but conservation hits require domestic/international sorting."
    }
  ],
  records: [
    {
      id: "rec-1989-un-perez-de-cuellar",
      date: "1989-01-24",
      title: "No-memcon contact marker: President-elect transition call/meeting trail with Secretary-General Javier Perez de Cuellar",
      type: "Contact marker",
      laneId: "un-governance",
      priority: "High",
      status: "Needs document request",
      people: ["George H. W. Bush", "Javier Perez de Cuellar", "Brent Scowcroft"],
      organizations: ["United Nations", "NSC"],
      repository: "George H.W. Bush Presidential Library / NARA Catalog",
      sourcePool: "Presidential Memcon and Telcon Files",
      sourceUrl: "https://www.bush41library.gov/digital-research-room/about-textual-collections/memcons-and-telcons",
      sourceNote:
        "Source lead: George H.W. Bush Presidential Library and Museum, Memcons and Telcons table, January 24, 1989 row for Perez de Cuellar, Javier, country UN, status No Memcon, NAID 428079887. Verify whether briefing, schedule, or follow-up files exist outside the memcon/telcon series.",
      compilerUse:
        "Early UN relationship marker and control item for deciding whether the volume needs a UN leadership opening document.",
      boundaryNotes:
        "Because the table records no memcon, this should feed a request queue rather than the candidate document register until related files are located.",
      tags: ["UN", "transition", "contact marker", "document gap"],
      verification: ["Check NAID 428079887", "Search schedule files", "Search Scowcroft daily files"]
    },
    {
      id: "rec-1989-unga-new-world-order",
      date: "1989-09-25",
      title: "Bush address to the United Nations General Assembly",
      type: "Public reference",
      laneId: "un-governance",
      priority: "High",
      status: "Public anchor",
      people: ["George H. W. Bush", "James A. Baker III"],
      organizations: ["United Nations"],
      repository: "Public Papers of the Presidents / GovInfo",
      sourcePool: "Public Papers and speech drafts",
      sourceUrl: "https://www.govinfo.gov/app/collection/ppp",
      sourceNote:
        "Public-line anchor: Public Papers of the Presidents, George H.W. Bush, 1989 volumes on GovInfo. Use the official text to frame UN, rule-of-law, environment, narcotics, and refugees themes, then locate speech drafts and policy clearance records.",
      compilerUse:
        "Sets the administration's first UN global-issues baseline and helps identify speech-drafting files to request.",
      boundaryNotes:
        "Do not treat the public speech as a substitute for internal policy records; use it to find drafts, clearance memos, and IO files.",
      tags: ["UNGA", "public line", "multilateral", "speech"],
      verification: ["Locate speech drafts", "Compare with State IO briefing", "Check NSC speech clearance"]
    },
    {
      id: "rec-1989-paris-summit-environment",
      date: "1989-07-16",
      title: "Paris Economic Summit global environment commitments",
      type: "Summit source lead",
      laneId: "environment-science",
      priority: "High",
      status: "Source lead",
      people: ["George H. W. Bush", "Nicholas Brady", "James A. Baker III", "William Reilly"],
      organizations: ["G7", "Council on Environmental Quality", "State OES"],
      repository: "Bush Library summit files / State OES files",
      sourcePool: "Economic summit and environment files",
      sourceUrl: "https://catalog.archives.gov/search?q=Paris%20Economic%20Summit%20environment%20Bush",
      sourceNote:
        "Source lead: Search Bush Library summit files, State OES records, and public summit communique files for Paris Economic Summit environmental commitments, July 1989.",
      compilerUse:
        "Possible starting point for the administration's global environment posture before UNCED negotiations.",
      boundaryNotes:
        "Coordinate with Foreign Economic Policy if the document is principally about G7 economic management.",
      tags: ["G7", "environment", "climate", "summit"],
      verification: ["Find summit briefing book", "Find OES follow-up memo", "Check CEQ files"]
    },
    {
      id: "rec-1990-clean-air-ozone",
      date: "1990-04-01",
      title: "Ozone and atmospheric policy follow-up after Montreal Protocol implementation",
      type: "Policy source lead",
      laneId: "ozone-layer",
      priority: "Medium",
      status: "Source lead",
      people: ["William Reilly", "Robert Kimmitt", "Brent Scowcroft"],
      organizations: ["EPA", "State OES", "NSC"],
      repository: "EPA, State OES, and NSC environment files",
      sourcePool: "Atmospheric and ozone files",
      sourceUrl: "https://catalog.archives.gov/search?q=ozone%20Montreal%20Protocol%20Bush%201990",
      sourceNote:
        "Source lead: Search NARA and Bush Library holdings for 1990 ozone, Montreal Protocol, Clean Air Act international, and atmospheric-policy files.",
      compilerUse:
        "Builds continuity between late Reagan environmental diplomacy and Bush-era climate negotiations.",
      boundaryNotes:
        "Exclude domestic Clean Air Act implementation unless it drove U.S. negotiating posture.",
      tags: ["ozone", "Montreal Protocol", "environment", "EPA"],
      verification: ["Search OES file units", "Search CEQ files", "Check public signing statements"]
    },
    {
      id: "rec-1990-african-famine-relief",
      date: "1990-08-01",
      title: "African famine, food aid, and emergency relief policy file search",
      type: "Policy source lead",
      laneId: "refugees-relief",
      priority: "High",
      status: "Source lead",
      people: ["James A. Baker III", "Andrew Natsios", "Brent Scowcroft"],
      organizations: ["USAID", "State", "NSC", "United Nations"],
      repository: "USAID disaster assistance / State Africa and refugee files / NSC humanitarian files",
      sourcePool: "African famine and humanitarian assistance files",
      sourceUrl: "https://catalog.archives.gov/search?q=African%20famine%20food%20aid%20Bush%201990",
      sourceNote:
        "Source lead: Search African famine, food aid, disaster assistance, Horn of Africa, Sudan, Ethiopia, Somalia relief, USAID, State, and NSC humanitarian files for 1989-1992 policy decisions.",
      compilerUse:
        "Adapts the Volume XLI African Famine chapter precedent to the Bush-era humanitarian relief and famine-policy file search.",
      boundaryNotes:
        "Operational Somalia relief should be checked against the Somalia volume; retain broad famine, food aid, and humanitarian doctrine here.",
      tags: ["African famine", "food aid", "USAID", "humanitarian"],
      verification: ["Search USAID disaster assistance files", "Check State Africa records", "Separate Somalia operational files"]
    },
    {
      id: "rec-1990-refugee-policy-review",
      date: "1990-07-01",
      title: "Refugee admissions and humanitarian policy review",
      type: "Policy source lead",
      laneId: "refugees-relief",
      priority: "High",
      status: "Source lead",
      people: ["James A. Baker III", "Brent Scowcroft", "Robert Kimmitt"],
      organizations: ["State Refugee Bureau", "NSC", "UNHCR"],
      repository: "State refugee files / NSC humanitarian files",
      sourcePool: "Refugee and humanitarian assistance files",
      sourceUrl: "https://catalog.archives.gov/search?q=refugee%20policy%20Bush%201990%20UNHCR",
      sourceNote:
        "Source lead: Search State refugee bureau, NSC humanitarian, and UNHCR meeting files for 1990 refugee admissions and emergency-relief policy memoranda.",
      compilerUse:
        "Helps define whether Volume XXIX should treat refugee policy thematically or only through regional crisis files.",
      boundaryNotes:
        "Cross-check Cuba, Haiti, Persian Gulf, and Somalia volumes before assigning crisis-driven files here.",
      tags: ["refugees", "UNHCR", "humanitarian", "migration"],
      verification: ["Find annual refugee admissions memo", "Check UNHCR meeting logs", "Separate crisis files"]
    },
    {
      id: "rec-1990-csce-democracy",
      date: "1990-11-21",
      title: "Charter of Paris and democratic norms after the Cold War",
      type: "Boundary source lead",
      laneId: "rights-democracy",
      priority: "Medium",
      status: "Boundary review",
      people: ["George H. W. Bush", "James A. Baker III", "Brent Scowcroft"],
      organizations: ["CSCE", "State", "NSC"],
      repository: "State EUR / NSC democracy files",
      sourcePool: "Democracy and election-observer files",
      sourceUrl: "https://catalog.archives.gov/search?q=Charter%20of%20Paris%20democracy%20Bush",
      sourceNote:
        "Boundary lead: Search Charter of Paris, CSCE, democracy, and election-observer files for documents that frame global democracy policy rather than European security only.",
      compilerUse:
        "Tests whether democratic norms deserve a global-issues chapter document or belong exclusively in Europe/Eastern Europe volumes.",
      boundaryNotes:
        "Likely overlaps European Security and Eastern Europe volumes; keep only cross-regional conceptual documents.",
      tags: ["democracy", "CSCE", "human rights", "boundary"],
      verification: ["Check Europe volume assignment", "Search democracy-support files", "Read for cross-regional scope"]
    },
    {
      id: "rec-1991-kurdish-refugees",
      date: "1991-04-16",
      title: "Kurdish refugee emergency and humanitarian relief doctrine after the Gulf War",
      type: "Boundary source lead",
      laneId: "refugees-relief",
      priority: "High",
      status: "Boundary review",
      people: ["George H. W. Bush", "Brent Scowcroft", "James A. Baker III"],
      organizations: ["NSC", "State", "UNHCR", "Department of Defense"],
      repository: "NSC Persian Gulf / humanitarian files",
      sourcePool: "Refugee and humanitarian assistance files",
      sourceUrl: "https://catalog.archives.gov/search?q=Kurdish%20refugees%20Operation%20Provide%20Comfort%20Bush",
      sourceNote:
        "Boundary lead: Search Kurdish refugee, Operation Provide Comfort, UNHCR, and humanitarian-relief files to distinguish Persian Gulf crisis documents from general humanitarian doctrine.",
      compilerUse:
        "Important test case for the volume's refugee/humanitarian boundaries.",
      boundaryNotes:
        "Most operational documents probably belong in Persian Gulf or Iraq files; keep global doctrine and UN/UNHCR policy records for this chapter.",
      tags: ["Kurdish refugees", "humanitarian", "UNHCR", "Gulf War"],
      verification: ["Compare with Gulf volumes", "Identify doctrine memos", "Separate operational orders"]
    },
    {
      id: "rec-1991-global-environment-initiative",
      date: "1991-06-01",
      title: "Global climate and UNCED preparation memoranda",
      type: "Policy source lead",
      laneId: "environment-science",
      priority: "High",
      status: "Source lead",
      people: ["George H. W. Bush", "William Reilly", "James A. Baker III", "Brent Scowcroft"],
      organizations: ["State OES", "EPA", "CEQ", "NSC"],
      repository: "State OES / CEQ / NSC environment files",
      sourcePool: "UNCED and climate convention files",
      sourceUrl: "https://catalog.archives.gov/search?q=UNCED%20climate%20Bush%201991",
      sourceNote:
        "Source lead: Search UNCED, climate convention, biodiversity, forests, and global warming files for 1991 policy memoranda and interagency decision papers.",
      compilerUse:
        "Core chapter for the Rio Earth Summit preparation chronology.",
      boundaryNotes:
        "Coordinate with economic files if the decision is about financing or trade effects.",
      tags: ["UNCED", "climate", "biodiversity", "Rio"],
      verification: ["Find interagency options memo", "Find speech clearance", "Check CEQ/OES file titles"]
    },
    {
      id: "rec-1991-unga-collective-security",
      date: "1991-09-23",
      title: "UN General Assembly address on collective security and post-Gulf War order",
      type: "Public reference",
      laneId: "un-governance",
      priority: "High",
      status: "Public anchor",
      people: ["George H. W. Bush"],
      organizations: ["United Nations", "NSC", "State IO"],
      repository: "Public Papers of the Presidents / speech drafts",
      sourcePool: "Public Papers and speech drafts",
      sourceUrl: "https://www.govinfo.gov/app/collection/ppp",
      sourceNote:
        "Public-line anchor: Public Papers of the Presidents, George H.W. Bush, 1991 volumes on GovInfo. Use the official speech to drive searches for UN reform, collective security, and Security Council policy files.",
      compilerUse:
        "Public frame for post-Cold War UN governance and peacekeeping doctrine.",
      boundaryNotes:
        "Extract only global UN doctrine; country-specific claims should be routed to regional volumes.",
      tags: ["UNGA", "collective security", "public line", "peacekeeping"],
      verification: ["Find speech drafts", "Search State IO briefing papers", "Check NSC UN files"]
    },
    {
      id: "rec-1991-aids-health",
      date: "1991-12-01",
      title: "International AIDS and global health policy file search",
      type: "Policy source lead",
      laneId: "health-population",
      priority: "Medium",
      status: "Source lead",
      people: ["Louis Sullivan", "James A. Baker III", "Brent Scowcroft"],
      organizations: ["HHS", "State", "WHO", "USAID"],
      repository: "HHS international / State health / USAID files",
      sourcePool: "Global health and population files",
      sourceUrl: "https://catalog.archives.gov/search?q=AIDS%20international%20health%20Bush%201991",
      sourceNote:
        "Source lead: Search AIDS, HIV, WHO, international health, USAID health, and HHS international files for documents that treat global health as foreign policy.",
      compilerUse:
        "Tests whether health diplomacy should be represented in Volume XXIX or only as assistance programming.",
      boundaryNotes:
        "Domestic health documents should be excluded unless they set international policy.",
      tags: ["AIDS", "HIV", "WHO", "health"],
      verification: ["Search HHS international records", "Search State health files", "Check public remarks"]
    },
    {
      id: "rec-1992-rio-earth-summit",
      date: "1992-06-03",
      title: "Rio Earth Summit, climate convention, biodiversity, and forest principles",
      type: "Summit source lead",
      laneId: "environment-science",
      priority: "Critical",
      status: "Source lead",
      people: ["George H. W. Bush", "William Reilly", "James A. Baker III", "Brent Scowcroft"],
      organizations: ["UNCED", "State OES", "EPA", "CEQ", "NSC"],
      repository: "Bush Library summit files / State OES / CEQ",
      sourcePool: "UNCED and climate convention files",
      sourceUrl: "https://catalog.archives.gov/search?q=Rio%20Earth%20Summit%20Bush%201992",
      sourceNote:
        "Core source lead: Search Rio Earth Summit, UNCED, Framework Convention on Climate Change, biodiversity, forests, and President Bush June 1992 files across Bush Library, State OES, CEQ, and EPA holdings.",
      compilerUse:
        "Likely anchor document set for the Global Climate Change and the Rio Summit chapter.",
      boundaryNotes:
        "Keep financing disputes with Foreign Economic Policy unless the decision is chiefly environmental diplomacy.",
      tags: ["Rio", "UNCED", "climate", "biodiversity", "forests"],
      verification: ["Locate briefing book", "Locate decision memoranda", "Find signing and speech files"]
    },
    {
      id: "rec-1992-un-peacekeeping",
      date: "1992-09-21",
      title: "UN peacekeeping and humanitarian intervention policy before late-1992 crises",
      type: "Policy source lead",
      laneId: "un-governance",
      priority: "High",
      status: "Boundary review",
      people: ["George H. W. Bush", "Brent Scowcroft", "Lawrence Eagleburger", "Edward Perkins"],
      organizations: ["United Nations", "State IO", "NSC", "Department of Defense"],
      repository: "State IO / NSC peacekeeping files",
      sourcePool: "UN peacekeeping files",
      sourceUrl: "https://catalog.archives.gov/search?q=UN%20peacekeeping%20Bush%201992%20Somalia%20Yugoslavia",
      sourceNote:
        "Boundary lead: Search UN peacekeeping, Agenda for Peace, Somalia, Yugoslavia, humanitarian intervention, and collective security files for global doctrine memoranda.",
      compilerUse:
        "Tests global UN peacekeeping doctrine against Somalia and Yugoslavia volume boundaries.",
      boundaryNotes:
        "Operational Somalia and Balkans records should remain with those volumes unless they establish global policy.",
      tags: ["peacekeeping", "UN", "Somalia", "Yugoslavia", "boundary"],
      verification: ["Find global doctrine memos", "Check Somalia/Yugoslavia assignments", "Search State IO files"]
    },
    {
      id: "rec-1992-population",
      date: "1992-10-01",
      title: "Population, family planning, and development assistance policy file search",
      type: "Policy source lead",
      laneId: "population-policy",
      priority: "Medium",
      status: "Source lead",
      people: ["James A. Baker III", "Andrew Natsios", "Louis Sullivan"],
      organizations: ["USAID", "State", "HHS", "UNFPA"],
      repository: "USAID / State / HHS files",
      sourcePool: "Global health and population files",
      sourceUrl: "https://catalog.archives.gov/search?q=population%20family%20planning%20Bush%201992%20USAID",
      sourceNote:
        "Source lead: Search population, family planning, UNFPA, USAID health, and development-assistance files for international policy decisions from 1989-1992.",
      compilerUse:
        "Identifies whether population policy was a global-issues topic for this administration.",
      boundaryNotes:
        "Domestic social-policy material is out of scope unless it shaped international assistance or multilateral negotiations.",
      tags: ["population", "USAID", "UNFPA", "development"],
      verification: ["Search USAID file units", "Check UNFPA references", "Find policy decision memos"]
    },
    {
      id: "rec-1992-whaling-biodiversity",
      date: "1992-10-15",
      title: "International whaling, biodiversity, and wildlife protection file search",
      type: "Source lead",
      laneId: "whaling-biodiversity",
      priority: "Medium",
      status: "Source lead",
      people: ["William Reilly", "James A. Baker III", "State OES"],
      organizations: ["State OES", "NOAA", "Department of the Interior", "International Whaling Commission"],
      repository: "State OES conservation / NOAA / Interior international files",
      sourcePool: "Whaling, biodiversity, and wildlife protection files",
      sourceUrl: "https://catalog.archives.gov/search?q=whaling%20biodiversity%20Bush%201992",
      sourceNote:
        "Source lead: Search whaling, International Whaling Commission, biodiversity, wildlife protection, conservation, NOAA, Interior, and State OES file units for 1989-1992 policy decisions.",
      compilerUse:
        "Carries forward the Volume XLI whaling-regulation precedent while testing whether Bush-era biodiversity files belong here or with the Rio chapter.",
      boundaryNotes:
        "Rio biodiversity convention decision memoranda should remain with the Global Climate Change and Rio Summit chapter when tied to summit negotiations.",
      tags: ["whaling", "biodiversity", "wildlife", "conservation"],
      verification: ["Search IWC references", "Check State OES conservation files", "Separate Rio summit decisions"]
    },
    {
      id: "rec-1992-antarctica-oceans",
      date: "1992-11-01",
      title: "Antarctica, oceans, and law-of-the-sea source review",
      type: "Source lead",
      laneId: "commons-law",
      priority: "Medium",
      status: "Source lead",
      people: ["James A. Baker III", "State Legal Adviser", "State OES"],
      organizations: ["State", "NSC", "NOAA", "OES"],
      repository: "State Legal Adviser / OES oceans and polar files",
      sourcePool: "Transnational commons files",
      sourceUrl: "https://catalog.archives.gov/search?q=Antarctica%20oceans%20Law%20of%20the%20Sea%20Bush",
      sourceNote:
        "Source lead: Search Antarctica, oceans, Law of the Sea, polar affairs, NOAA, and OES file units for 1989-1992 international-law decisions.",
      compilerUse:
        "Populates the commons and international-law chapter if the volume extends beyond UN, environment, and humanitarian issues.",
      boundaryNotes:
        "Separate fisheries or bilateral maritime disputes that belong in regional volumes.",
      tags: ["Antarctica", "oceans", "Law of the Sea", "international law"],
      verification: ["Search State L files", "Search OES polar files", "Check treaty files"]
    }
  ],
  sourcePools: [
    {
      id: "pool-memcon-telcon",
      laneId: "un-governance",
      name: "Presidential Memcon and Telcon Files",
      repository: "George H.W. Bush Presidential Library / NARA Catalog",
      priority: "High",
      coverage: "Declassified conversations and contact markers with UN officials, summit partners, and leaders discussing global issues.",
      nextAction:
        "Search table and NARA series for UN, climate, Rio, ozone, famine, human rights, health, population, and whaling terms; export NAIDs with no-document markers separately.",
      terms: ["UN", "Perez de Cuellar", "environment", "refugees", "human rights", "climate"],
      url: "https://www.bush41library.gov/digital-research-room/about-textual-collections/memcons-and-telcons"
    },
    {
      id: "pool-state-io",
      laneId: "un-governance",
      name: "State IO and UN Mission Files",
      repository: "Department of State / NARA",
      priority: "Critical",
      coverage: "UNGA, Security Council, peacekeeping, sanctions, UN reform, and collective-security policy.",
      nextAction:
        "Build a file-unit request list around IO, USUN, UNGA, Security Council, peacekeeping, sanctions, and Agenda for Peace terms.",
      terms: ["IO", "USUN", "UNGA", "Security Council", "peacekeeping", "Agenda for Peace"],
      url: "https://catalog.archives.gov/search?q=State%20IO%20UNGA%20peacekeeping%20Bush"
    },
    {
      id: "pool-state-oes",
      laneId: "environment-science",
      name: "State OES, CEQ, EPA, and UNCED Files",
      repository: "State OES / CEQ / EPA / Bush Library",
      priority: "Critical",
      coverage: "Global warming, climate convention, forests, biodiversity diplomacy, and Rio Earth Summit negotiations.",
      nextAction:
        "Harvest UNCED, climate convention, biodiversity, forests, and G7 environment file titles; flag documents with decision recommendations.",
      terms: ["OES", "CEQ", "EPA", "UNCED", "Rio", "climate", "biodiversity"],
      url: "https://catalog.archives.gov/search?q=UNCED%20climate%20Bush%20OES%20CEQ"
    },
    {
      id: "pool-ozone-layer",
      laneId: "ozone-layer",
      name: "Ozone Layer and Montreal Protocol Files",
      repository: "State OES / EPA / CEQ / NSC",
      priority: "High",
      coverage: "Ozone depletion, Montreal Protocol implementation, CFC controls, atmospheric science, and international environmental negotiations.",
      nextAction:
        "Harvest ozone, Montreal Protocol, CFC, atmospheric, and EPA international file titles; separate them from climate convention records.",
      terms: ["ozone", "Montreal Protocol", "CFC", "chlorofluorocarbons", "atmospheric", "EPA"],
      url: "https://catalog.archives.gov/search?q=ozone%20Montreal%20Protocol%20Bush%201989%201992"
    },
    {
      id: "pool-refugee",
      laneId: "refugees-relief",
      name: "African Famine, Refugee, and Humanitarian Assistance Files",
      repository: "State refugee bureau / USAID / NSC",
      priority: "High",
      coverage: "African famine, food aid, refugee admissions, humanitarian relief doctrine, UNHCR contacts, and crisis-boundary records.",
      nextAction:
        "Separate general refugee policy from crisis records in Persian Gulf, Somalia, Haiti, Cuba, and Balkan chapters.",
      terms: ["African famine", "food aid", "refugee", "UNHCR", "humanitarian", "asylum", "migration"],
      url: "https://catalog.archives.gov/search?q=African%20famine%20refugee%20UNHCR%20Bush%201989%201992"
    },
    {
      id: "pool-rights-democracy",
      laneId: "rights-democracy",
      name: "Human Rights, Democracy, and Election Support Files",
      repository: "State HA/DRL predecessor offices / NSC / NED",
      priority: "High",
      coverage: "Human-rights reporting, democracy support, election observation, sanctions, and civil-society support.",
      nextAction:
        "Search for cross-regional policy memoranda and separate them from country-specific human-rights files.",
      terms: ["human rights", "democracy", "elections", "civil society", "NED", "sanctions"],
      url: "https://catalog.archives.gov/search?q=human%20rights%20democracy%20Bush%201989%201992"
    },
    {
      id: "pool-health-population",
      laneId: "health-population",
      name: "Global Health and Population Files",
      repository: "HHS / USAID / State / WHO-facing files",
      priority: "Medium",
      coverage: "International AIDS/HIV, WHO engagement, global health, and health assistance.",
      nextAction:
        "Identify whether files contain foreign-policy decision memoranda or only program administration.",
      terms: ["AIDS", "HIV", "WHO", "global health", "health assistance"],
      url: "https://catalog.archives.gov/search?q=AIDS%20WHO%20global%20health%20Bush%201989%201992"
    },
    {
      id: "pool-population-policy",
      laneId: "population-policy",
      name: "International Population Policy Files",
      repository: "USAID / State / HHS / UNFPA-facing files",
      priority: "Medium",
      coverage: "Population policy, family planning, UNFPA, development assistance, and multilateral population-policy disputes.",
      nextAction:
        "Separate population-policy decisions from health-program administration and domestic social-policy material.",
      terms: ["population", "family planning", "UNFPA", "Mexico City policy", "development assistance"],
      url: "https://catalog.archives.gov/search?q=population%20family%20planning%20UNFPA%20Bush%201989%201992"
    },
    {
      id: "pool-commons-law",
      laneId: "commons-law",
      name: "International Law, Oceans, Polar, and Space Files",
      repository: "State Legal Adviser / OES / NSC",
      priority: "Medium",
      coverage: "Antarctica, oceans, Law of the Sea, civil aviation, outer space, treaties, and sanctions law.",
      nextAction:
        "Search terms first, then decide whether the volume needs a standalone commons chapter or only support references.",
      terms: ["Antarctica", "oceans", "Law of the Sea", "outer space", "ICAO", "international law"],
      url: "https://catalog.archives.gov/search?q=Antarctica%20Law%20of%20the%20Sea%20Bush"
    },
    {
      id: "pool-whaling-biodiversity",
      laneId: "whaling-biodiversity",
      name: "Whaling, Biodiversity, and Wildlife Protection Files",
      repository: "State OES / NOAA / Interior",
      priority: "Medium",
      coverage: "International whaling regulation, biodiversity negotiations, wildlife protection, conservation diplomacy, and related Rio boundary files.",
      nextAction:
        "Search IWC, whaling, biodiversity, wildlife, conservation, and endangered species terms; separate technical conservation records from Rio summit decisions.",
      terms: ["whaling", "International Whaling Commission", "biodiversity", "wildlife", "conservation"],
      url: "https://catalog.archives.gov/search?q=whaling%20biodiversity%20wildlife%20Bush%201989%201992"
    },
    {
      id: "pool-public-papers",
      laneId: "un-governance",
      name: "Public Papers and Speech Drafts",
      repository: "GovInfo Public Papers / Bush Library speech files",
      priority: "High",
      coverage: "Official public line for UNGA, Rio, humanitarian, rights, and health topics.",
      nextAction:
        "Use official published speeches to find internal drafts, clearance comments, and briefing memoranda.",
      terms: ["UNGA", "Rio", "environment", "human rights", "refugees", "peacekeeping"],
      url: "https://www.govinfo.gov/app/collection/ppp"
    },
    {
      id: "pool-precedents",
      laneId: "un-governance",
      name: "Adjacent FRUS Precedent Volumes",
      repository: "Office of the Historian",
      priority: "High",
      coverage: "Prior and later Global Issues volumes used for source-note, chapter, and boundary models, especially Volume XLI, Global Issues II.",
      nextAction:
        "Compare Volume XLI chapters for AIDS Policy, Human Rights, Law of the Sea, African Famine, International Population Policy, Whaling, and Ozone before freezing chapters.",
      terms: ["FRUS Global Issues", "AIDS Policy", "Law of the Sea", "African Famine", "Ozone Layer"],
      url: "https://history.state.gov/historicaldocuments/frus1981-88v41"
    }
  ],
  gaps: [
    {
      id: "gap-chapter-structure",
      laneId: "un-governance",
      priority: "Critical",
      status: "Open",
      problem: "Volume XXIX has an official title and planned status, but no published chapter structure.",
      evidence:
        "HistoryAtState volume page lists Global Issues; status page lists the volume under Planned. Volume XLI provides a published Global Issues II precedent with chapters on AIDS Policy, Human Rights, Law of the Sea, African Famine, International Population Policy, International Regulation of Whaling Practices, and Protection of the Ozone Layer.",
      action:
        "Use Volume XLI, predecessor and successor global-issues volumes, and first archival hits to validate chapter order before numbering documents.",
      sourcePools: ["pool-precedents", "pool-state-io"],
      risk: "Premature chapter choices could misroute regional or functional records."
    },
    {
      id: "gap-un-vs-crisis",
      laneId: "un-governance",
      priority: "High",
      status: "Open",
      problem: "UN peacekeeping files overlap heavily with Somalia, Yugoslavia, Persian Gulf, and Iraq volumes.",
      evidence:
        "1991-1992 policy vocabulary combines global collective-security doctrine with case-specific crises.",
      action:
        "Tag every UN peacekeeping hit as doctrine, case operation, or mixed; keep mixed records in a boundary queue until regional compilers resolve placement.",
      sourcePools: ["pool-state-io", "pool-memcon-telcon"],
      risk: "Duplicate selection or missed global doctrine."
    },
    {
      id: "gap-rio-core",
      laneId: "environment-science",
      priority: "Critical",
      status: "Open",
      problem: "Rio Earth Summit and climate-convention files need a complete decision chronology.",
      evidence:
        "UNCED is a likely anchor for a 1989-1992 Global Issues volume, but source pools are spread across State OES, CEQ, EPA, NSC, and summit files.",
      action:
        "Create a Rio chronology from briefing books, interagency options, speech drafts, and treaty/signing files before selecting representative documents.",
      sourcePools: ["pool-state-oes", "pool-public-papers"],
      risk: "A public-speech-only account would miss internal U.S. negotiating choices."
    },
    {
      id: "gap-ozone-continuity",
      laneId: "ozone-layer",
      priority: "High",
      status: "Open",
      problem: "Ozone-layer files need to be separated from climate-change and Rio records.",
      evidence:
        "Volume XLI uses Protection of the Ozone Layer as a separate chapter; Bush-era files may mix Montreal Protocol implementation with climate diplomacy.",
      action:
        "Tag OES, EPA, CEQ, and NSC environment hits as ozone, climate/Rio, whaling/biodiversity, or mixed before selection.",
      sourcePools: ["pool-ozone-layer", "pool-state-oes"],
      risk: "Ozone diplomacy could be buried inside a broad environment chapter."
    },
    {
      id: "gap-human-rights-country-boundaries",
      laneId: "rights-democracy",
      priority: "High",
      status: "Open",
      problem: "Human-rights and democracy files may be mostly country-specific.",
      evidence:
        "Global terms appear in public speeches and CSCE context, but many actionable files likely belong in Eastern Europe, China, Latin America, Africa, or other regional volumes.",
      action:
        "Prioritize cross-regional policy memoranda, sanctions standards, and election-observer doctrine; mark country files as external unless they establish global policy.",
      sourcePools: ["pool-rights-democracy"],
      risk: "The volume could become a duplicate of geographic rights coverage."
    },
    {
      id: "gap-refugee-crisis-boundaries",
      laneId: "refugees-relief",
      priority: "High",
      status: "Open",
      problem: "Refugee and humanitarian relief records are entangled with country crises.",
      evidence:
        "Kurdish refugees, Cuba/Haiti migration, Somalia relief, and Balkan displacement have separate regional-volume claims.",
      action:
        "Create a boundary matrix by crisis, document purpose, and decision level; retain global refugee policy and UNHCR doctrine.",
      sourcePools: ["pool-refugee"],
      risk: "Selection may either omit humanitarian doctrine or duplicate crisis volumes."
    },
    {
      id: "gap-health-scope",
      laneId: "health-population",
      priority: "Medium",
      status: "Open",
      problem: "It is unclear how much AIDS and global health policy belongs in Volume XXIX.",
      evidence:
        "Volume XLI includes AIDS Policy as a chapter, but Bush-era health records may be programmatic or domestic unless linked to foreign-policy decisions.",
      action:
        "Sample AIDS/HIV, WHO, HHS international, USAID health, and State health files for foreign-policy decision content.",
      sourcePools: ["pool-health-population"],
      risk: "A viable chapter may be missed because sources sit outside traditional State files."
    },
    {
      id: "gap-population-policy",
      laneId: "population-policy",
      priority: "Medium",
      status: "Open",
      problem: "Population-policy files need to be split from AIDS and health assistance records.",
      evidence:
        "Volume XLI treats International Population Policy separately from AIDS Policy; the Bush-era file search should preserve that distinction.",
      action:
        "Sample USAID, State, HHS, UNFPA, and family-planning files and tag each hit as population policy, health assistance, domestic policy, or development programming.",
      sourcePools: ["pool-population-policy", "pool-health-population"],
      risk: "Population-policy decisions could be hidden inside a broad health chapter."
    },
    {
      id: "gap-commons-fit",
      laneId: "commons-law",
      priority: "Medium",
      status: "Open",
      problem: "Law of the Sea, oceans, and Antarctica files may be a support chapter rather than a full chapter.",
      evidence:
        "Topics such as oceans, Antarctica, outer space, aviation, and treaties can be narrow, technical, or spread across agencies.",
      action:
        "Run a source-pool sample and decide whether to keep a full chapter, merge technical items into climate/Rio, or preserve them as a reference queue.",
      sourcePools: ["pool-commons-law"],
      risk: "Too much technical material could dilute high-policy coverage."
    },
    {
      id: "gap-whaling-biodiversity",
      laneId: "whaling-biodiversity",
      priority: "Medium",
      status: "Open",
      problem: "Whaling, biodiversity, and wildlife protection files need a boundary rule against the Rio chapter.",
      evidence:
        "Volume XLI includes International Regulation of Whaling Practices as a chapter; Bush-era biodiversity files may also be part of Rio summit negotiations.",
      action:
        "Separate technical conservation and IWC files from Rio biodiversity convention decision memoranda.",
      sourcePools: ["pool-whaling-biodiversity", "pool-state-oes"],
      risk: "The chapter could either duplicate Rio records or omit conservation diplomacy."
    },
    {
      id: "gap-source-note-standard",
      laneId: "un-governance",
      priority: "High",
      status: "Open",
      problem: "Source-note fields must be normalized before source leads become candidate documents.",
      evidence:
        "Current seed records include broad source leads, NARA search links, public-paper anchors, and one no-document contact marker.",
      action:
        "Require repository, collection, series, file unit, item title, NAID or document ID, date, release status, and object URL before promoting any item.",
      sourcePools: ["pool-memcon-telcon", "pool-state-io", "pool-state-oes"],
      risk: "Compiler notes will not be reusable in FRUS production."
    },
    {
      id: "gap-public-line-vs-internal",
      laneId: "environment-science",
      priority: "Medium",
      status: "Open",
      problem: "Public statements identify themes but not necessarily policy decisions.",
      evidence:
        "UNGA and Rio speeches are useful anchors, but the volume needs internal decision records.",
      action:
        "For each public anchor, require a paired draft, clearance memo, options memo, or briefing book lead.",
      sourcePools: ["pool-public-papers"],
      risk: "The page could overcount public rhetoric as documentary selection evidence."
    }
  ],
  persons: [
    {
      name: "George H. W. Bush",
      role: "President of the United States",
      lanes: ["un-governance", "environment-science", "ozone-layer", "refugees-relief", "rights-democracy"],
      terms: ["UNGA", "Rio", "collective security", "humanitarian relief", "ozone"],
      compilerCheck: "Confirm whether each public-line anchor has internal decision files."
    },
    {
      name: "James A. Baker III",
      role: "Secretary of State",
      lanes: ["un-governance", "rights-democracy", "environment-science", "refugees-relief", "population-policy"],
      terms: ["State", "UN", "human rights", "environment", "population"],
      compilerCheck: "Search both State principal files and speech/briefing books."
    },
    {
      name: "Brent Scowcroft",
      role: "Assistant to the President for National Security Affairs",
      lanes: ["un-governance", "environment-science", "ozone-layer", "refugees-relief", "commons-law", "whaling-biodiversity"],
      terms: ["NSC", "interagency", "decision memo"],
      compilerCheck: "Use NSC file-unit trails to find decision memoranda behind public statements."
    },
    {
      name: "Robert M. Kimmitt",
      role: "Under Secretary of State for Political Affairs, 1989-1991",
      lanes: ["un-governance", "refugees-relief", "rights-democracy"],
      terms: ["policy review", "UN", "humanitarian"],
      compilerCheck: "Check staff channels for cross-regional policy coordination."
    },
    {
      name: "Lawrence S. Eagleburger",
      role: "Deputy Secretary and later Secretary of State",
      lanes: ["un-governance", "refugees-relief", "rights-democracy"],
      terms: ["UN", "peacekeeping", "humanitarian"],
      compilerCheck: "Search 1992 peacekeeping and humanitarian intervention files."
    },
    {
      name: "Edward J. Perkins",
      role: "U.S. Permanent Representative to the United Nations, 1992-1993",
      lanes: ["un-governance"],
      terms: ["USUN", "Security Council", "peacekeeping"],
      compilerCheck: "Find USUN reporting and State IO correspondence for late-1992 UN policy."
    },
    {
      name: "Thomas R. Pickering",
      role: "U.S. Permanent Representative to the United Nations, 1989-1992",
      lanes: ["un-governance", "refugees-relief", "rights-democracy"],
      terms: ["USUN", "UNGA", "Security Council"],
      compilerCheck: "Search USUN cables and State IO files for UNGA and Security Council policy."
    },
    {
      name: "Javier Perez de Cuellar",
      role: "Secretary-General of the United Nations, 1982-1991",
      lanes: ["un-governance", "refugees-relief"],
      terms: ["UN Secretary-General", "Perez de Cuellar", "peacekeeping"],
      compilerCheck: "Resolve the January 1989 contact-marker gap and search later meeting files."
    },
    {
      name: "Boutros Boutros-Ghali",
      role: "Secretary-General of the United Nations, 1992-1996",
      lanes: ["un-governance", "refugees-relief"],
      terms: ["Agenda for Peace", "peacekeeping", "UN reform"],
      compilerCheck: "Search 1992 UN peacekeeping doctrine and meeting records."
    },
    {
      name: "John R. Bolton",
      role: "Assistant Secretary of State for International Organization Affairs",
      lanes: ["un-governance"],
      terms: ["State IO", "UN", "Security Council", "peacekeeping"],
      compilerCheck: "Search IO files for UN reform, peacekeeping, sanctions, and collective-security records."
    },
    {
      name: "Richard Schifter",
      role: "Assistant Secretary of State for Human Rights and Humanitarian Affairs",
      lanes: ["rights-democracy", "refugees-relief"],
      terms: ["human rights", "humanitarian", "refugees", "democracy"],
      compilerCheck: "Separate cross-regional rights and humanitarian policy from country-specific files."
    },
    {
      name: "William K. Reilly",
      role: "Administrator of the Environmental Protection Agency",
      lanes: ["environment-science", "ozone-layer", "whaling-biodiversity"],
      terms: ["EPA", "climate", "Rio", "ozone", "biodiversity"],
      compilerCheck: "Tie EPA files to State/NSC decision records before selection."
    },
    {
      name: "Michael J. Boskin",
      role: "Chairman, Council of Economic Advisers",
      lanes: ["environment-science"],
      terms: ["climate economics", "G7", "Rio"],
      compilerCheck: "Watch for foreign-economic boundary issues in climate financing records."
    },
    {
      name: "Louis W. Sullivan",
      role: "Secretary of Health and Human Services",
      lanes: ["health-population"],
      terms: ["AIDS", "WHO", "global health"],
      compilerCheck: "Include only international policy or multilateral health decisions."
    },
    {
      name: "Andrew S. Natsios",
      role: "USAID official and humanitarian assistance lead",
      lanes: ["refugees-relief", "health-population", "population-policy"],
      terms: ["USAID", "humanitarian", "relief", "food security", "population"],
      compilerCheck: "Use USAID files for implementation context, but select high-policy records."
    },
    {
      name: "State Legal Adviser",
      role: "Department of State legal policy channel",
      lanes: ["commons-law", "un-governance"],
      terms: ["international law", "treaty", "sanctions", "Law of the Sea"],
      compilerCheck: "Identify named officeholders once file units are harvested."
    }
  ],
  references: [
    {
      id: "ref-frus-v29",
      date: "2026-05-23",
      title: "Official Volume XXIX page",
      kind: "Official status",
      laneId: "un-governance",
      url: "https://history.state.gov/historicaldocuments/frus1989-92v29",
      compilerUse:
        "Official title and status anchor for this assistant. The page states that the volume is planned."
    },
    {
      id: "ref-status-series",
      date: "2026-05-23",
      title: "Status of the FRUS Series",
      kind: "Official status",
      laneId: "un-governance",
      url: "https://history.state.gov/historicaldocuments/status-of-the-series",
      compilerUse:
        "Confirms production-stage vocabulary and lists Volume XXIX, Global Issues, under Planned."
    },
    {
      id: "ref-frus-v41",
      date: "2017-01-01",
      title: "FRUS 1981-1988, Volume XLI, Global Issues II",
      kind: "Precedent volume",
      laneId: "environment-science",
      url: "https://history.state.gov/historicaldocuments/frus1981-88v41",
      compilerUse:
        "Published precedent for chapters on AIDS Policy, Human Rights, Law of the Sea, African Famine, International Population Policy, International Regulation of Whaling Practices, and Protection of the Ozone Layer."
    },
    {
      id: "ref-bush-memcons",
      date: "2026-05-23",
      title: "Bush Library Memcons and Telcons table",
      kind: "Source portal",
      laneId: "un-governance",
      url: "https://www.bush41library.gov/digital-research-room/about-textual-collections/memcons-and-telcons",
      compilerUse:
        "Searchable source for declassified presidential conversation rows and no-document contact markers."
    },
    {
      id: "ref-govinfo-ppp",
      date: "2026-05-23",
      title: "GovInfo Public Papers collection",
      kind: "Source portal",
      laneId: "un-governance",
      url: "https://www.govinfo.gov/app/collection/ppp",
      compilerUse:
        "Official public speeches and statements used as public-line anchors and draft-file search targets."
    },
    {
      id: "ref-1989-unga",
      date: "1989-09-25",
      title: "UN General Assembly public-line anchor",
      kind: "Public statement",
      laneId: "un-governance",
      url: "https://www.govinfo.gov/app/collection/ppp",
      compilerUse:
        "Use 1989 UNGA remarks to generate State IO, NSC, and speech-draft searches."
    },
    {
      id: "ref-1991-unga",
      date: "1991-09-23",
      title: "Post-Gulf War UNGA public-line anchor",
      kind: "Public statement",
      laneId: "un-governance",
      url: "https://www.govinfo.gov/app/collection/ppp",
      compilerUse:
        "Use 1991 UNGA remarks to locate collective-security and peacekeeping files."
    },
    {
      id: "ref-rio-1992",
      date: "1992-06-03",
      title: "Rio Earth Summit public-line anchor",
      kind: "Public statement",
      laneId: "environment-science",
      url: "https://www.govinfo.gov/app/collection/ppp",
      compilerUse:
        "Use Rio remarks, signing statements, and communiques to locate OES, CEQ, EPA, and NSC decision records."
    },
    {
      id: "ref-ozone-precedent",
      date: "2017-01-01",
      title: "Volume XLI Protection of the Ozone Layer chapter precedent",
      kind: "Precedent chapter",
      laneId: "ozone-layer",
      url: "https://history.state.gov/historicaldocuments/frus1981-88v41",
      compilerUse:
        "Use the Reagan-era ozone chapter as a structural precedent for Bush-era Montreal Protocol and atmospheric-policy files."
    },
    {
      id: "ref-nara-catalog",
      date: "2026-05-23",
      title: "National Archives Catalog",
      kind: "Source portal",
      laneId: "un-governance",
      url: "https://catalog.archives.gov/",
      compilerUse:
        "Primary public catalog target for NARA item, file-unit, and series searches."
    }
  ],
  precedents: [
    {
      volume: "FRUS 1977-1980, Volume XXV, Global Issues; United Nations Issues",
      url: "https://history.state.gov/historicaldocuments/frus1977-80v25",
      status: "Being Cleared",
      use: "Closest predecessor for UN/global-issues scope and source-note modeling."
    },
    {
      volume: "FRUS 1981-1988, Volume XL, Global Issues I",
      url: "https://history.state.gov/historicaldocuments/frus1981-88v40",
      status: "Being Cleared",
      use: "Reagan-era continuity check for environment, rights, humanitarian, and UN files."
    },
    {
      volume: "FRUS 1981-1988, Volume XLI, Global Issues II",
      url: "https://history.state.gov/historicaldocuments/frus1981-88v41",
      status: "Published",
      use: "Direct model for AIDS Policy, Human Rights, Law of the Sea, African Famine, International Population Policy, Whaling Practices, and Ozone chapters."
    },
    {
      volume: "FRUS 1993-2000, Volume X, Global Issues: Transnational Security; United Nations; Multilateral Peacekeeping",
      url: "https://history.state.gov/historicaldocuments/status-of-the-series",
      status: "Planned",
      use: "Successor-era model for separating UN peacekeeping and transnational security topics."
    },
    {
      volume: "FRUS 1993-2000, Volume XI, Global Issues: Global Programs",
      url: "https://history.state.gov/historicaldocuments/status-of-the-series",
      status: "Planned",
      use: "Successor-era model for health, population, assistance, and programmatic global issues."
    },
    {
      volume: "FRUS 1993-2000, Volume XII, Global Issues: Rights and Governance",
      url: "https://history.state.gov/historicaldocuments/status-of-the-series",
      status: "Planned",
      use: "Successor-era model for human rights and democracy files."
    },
    {
      volume: "FRUS 1993-2000, Volume XIII, Global Issues: Transnational Commons",
      url: "https://history.state.gov/historicaldocuments/status-of-the-series",
      status: "Planned",
      use: "Successor-era model for commons, environment, law, and technical transnational topics."
    }
  ],
  reviewChecklist: [
    "Promote only records with repository, collection, series, file-unit, item title, date, and persistent URL.",
    "Separate public-line anchors from internal decision records.",
    "Tag every regional overlap before assigning a Volume XXIX chapter.",
    "Record no-document contact markers separately from candidate documents.",
    "Pair each major public statement with drafts, clearance memoranda, or briefing books.",
    "Normalize source-note language before exporting to compiler notes."
  ],
  sourceLinks: [
    {
      label: "Official Volume XXIX page",
      url: "https://history.state.gov/historicaldocuments/frus1989-92v29",
      note: "Official title and planned-status note."
    },
    {
      label: "Status of the FRUS Series",
      url: "https://history.state.gov/historicaldocuments/status-of-the-series",
      note: "Production-stage definitions and current status table."
    },
    {
      label: "FRUS 1981-1988 Volume XLI",
      url: "https://history.state.gov/historicaldocuments/frus1981-88v41",
      note: "Published Global Issues II chapter precedent."
    },
    {
      label: "Bush Library Memcons and Telcons",
      url: "https://www.bush41library.gov/digital-research-room/about-textual-collections/memcons-and-telcons",
      note: "Declassified presidential conversation table and NARA series links."
    },
    {
      label: "National Archives Catalog",
      url: "https://catalog.archives.gov/",
      note: "Catalog target for item, file-unit, and series searches."
    },
    {
      label: "NARA Scout",
      url: "https://therealjameswilson.github.io/nara-scout/",
      note: "FRUS compiler search tool used for Bush Library catalog query links."
    },
    {
      label: "GovInfo Public Papers",
      url: "https://www.govinfo.gov/app/collection/ppp",
      note: "Official public speeches, statements, and messages."
    },
    {
      label: "Bush Public Statements Topic Audit",
      url: "reports/bush-public-statements-topic-audit.md",
      note: "Generated GovInfo audit showing presidential public attention by working chapter."
    },
    {
      label: "NARA Scout Topic Pass",
      url: "reports/nara-scout-topic-pass.md",
      note: "Prepared Scout searches and records the shared API-key limit encountered during live execution."
    },
    {
      label: "HistoryAtState Developer Resources",
      url: "https://history.state.gov/developer",
      note: "FRUS data and publication methods for future structured ingest."
    }
  ]
};
