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
      "Official HistoryAtState pages provide the volume title and status. Lane structure and source leads on this page are compiler-facing research scaffolding."
  },
  lanes: [
    {
      id: "un-governance",
      number: "Lane 1",
      name: "United Nations and Multilateral Governance",
      shortName: "UN Governance",
      color: "#2f6f73",
      description:
        "UN reform, Security Council practice, peacekeeping doctrine, sanctions administration, and the post-Cold War multilateral frame.",
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
      id: "rights-democracy",
      number: "Lane 2",
      name: "Human Rights and Democracy",
      shortName: "Rights",
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
      id: "refugees-relief",
      number: "Lane 3",
      name: "Refugees, Migration, and Humanitarian Relief",
      shortName: "Relief",
      color: "#7c5b9b",
      description:
        "Refugee policy, emergency relief, migration diplomacy, asylum pressure, and humanitarian operations that cross regional assignments.",
      boundary:
        "Separate broad refugee and humanitarian doctrine from crisis-specific records in Persian Gulf, Somalia, Haiti, Cuba, and Balkans files.",
      sourceTargets: [
        "State refugee bureau files",
        "NSC humanitarian files",
        "USAID disaster assistance files",
        "UNHCR and ICRC meeting files"
      ],
      searchTerms: ["refugees", "migration", "humanitarian", "UNHCR", "relief", "asylum", "displaced persons"]
    },
    {
      id: "environment-science",
      number: "Lane 4",
      name: "Environment, Climate, and Science Diplomacy",
      shortName: "Environment",
      color: "#c18a2b",
      description:
        "Global warming, ozone, biodiversity, forests, oceans, science cooperation, and the road to the 1992 Rio Earth Summit.",
      boundary:
        "Trade-specific environmental disputes should be checked against Foreign Economic Policy and regional volumes.",
      sourceTargets: [
        "Council on Environmental Quality files",
        "State OES files",
        "NSC environment files",
        "G7 and UNCED summit files"
      ],
      searchTerms: ["global warming", "climate", "ozone", "biodiversity", "UNCED", "Rio", "forests", "oceans"]
    },
    {
      id: "health-population",
      number: "Lane 5",
      name: "Global Health, Population, and Social Policy",
      shortName: "Health",
      color: "#d54f38",
      description:
        "AIDS/HIV diplomacy, population policy, health assistance, food security, and social-policy issues treated as foreign policy.",
      boundary:
        "Keep domestic implementation files out unless they explain U.S. international posture or multilateral negotiations.",
      sourceTargets: [
        "State global health files",
        "HHS international files",
        "USAID population and health files",
        "WHO and population conference files"
      ],
      searchTerms: ["AIDS", "HIV", "population", "health", "WHO", "food security", "family planning"]
    },
    {
      id: "commons-law",
      number: "Lane 6",
      name: "Transnational Commons and International Law",
      shortName: "Commons",
      color: "#5f6f3a",
      description:
        "Antarctica, oceans, law of the sea, outer space, aviation, sanctions law, treaties, and other commons questions.",
      boundary:
        "Arms-control legal questions belong with arms-control volumes unless the document is about general international legal architecture.",
      sourceTargets: [
        "State Legal Adviser files",
        "OES oceans and polar affairs files",
        "NSC legal and treaty files",
        "ICAO and space-policy records"
      ],
      searchTerms: ["Antarctica", "Law of the Sea", "oceans", "outer space", "ICAO", "international law", "treaty"]
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
      laneId: "environment-science",
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
        "Tests whether democratic norms deserve a global-issues lane document or belong exclusively in Europe/Eastern Europe volumes.",
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
        "Most operational documents probably belong in Persian Gulf or Iraq files; keep global doctrine and UN/UNHCR policy records for this lane.",
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
        "Core lane for the Rio Earth Summit preparation chronology.",
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
        "Likely anchor chapter document set for the environment and science lane.",
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
      laneId: "health-population",
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
        "Populates commons and international-law lane if the volume extends beyond UN, environment, and humanitarian issues.",
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
        "Search table and NARA series for UN, environment, refugees, human rights, climate, health, and Rio terms; export NAIDs with no-document markers separately.",
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
      coverage: "Global warming, ozone, biodiversity, forests, oceans, and Rio Earth Summit negotiations.",
      nextAction:
        "Harvest UNCED, climate convention, biodiversity, forests, ozone, and G7 environment file titles; flag documents with decision recommendations.",
      terms: ["OES", "CEQ", "EPA", "UNCED", "Rio", "climate", "biodiversity", "ozone"],
      url: "https://catalog.archives.gov/search?q=UNCED%20climate%20Bush%20OES%20CEQ"
    },
    {
      id: "pool-refugee",
      laneId: "refugees-relief",
      name: "Refugee and Humanitarian Assistance Files",
      repository: "State refugee bureau / USAID / NSC",
      priority: "High",
      coverage: "Refugee admissions, humanitarian relief doctrine, UNHCR contacts, and crisis-boundary records.",
      nextAction:
        "Separate general refugee policy from crisis records in Persian Gulf, Somalia, Haiti, Cuba, and Balkan lanes.",
      terms: ["refugee", "UNHCR", "humanitarian", "asylum", "migration", "displaced persons"],
      url: "https://catalog.archives.gov/search?q=refugee%20UNHCR%20Bush%201989%201992"
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
      coverage: "International AIDS/HIV, WHO engagement, population policy, food security, and health assistance.",
      nextAction:
        "Identify whether files contain foreign-policy decision memoranda or only program administration.",
      terms: ["AIDS", "HIV", "WHO", "population", "UNFPA", "food security", "health assistance"],
      url: "https://catalog.archives.gov/search?q=AIDS%20population%20WHO%20Bush%201989%201992"
    },
    {
      id: "pool-commons-law",
      laneId: "commons-law",
      name: "International Law, Oceans, Polar, and Space Files",
      repository: "State Legal Adviser / OES / NSC",
      priority: "Medium",
      coverage: "Antarctica, oceans, Law of the Sea, civil aviation, outer space, treaties, and sanctions law.",
      nextAction:
        "Search terms first, then decide whether the volume needs a standalone commons lane or only support references.",
      terms: ["Antarctica", "oceans", "Law of the Sea", "outer space", "ICAO", "international law"],
      url: "https://catalog.archives.gov/search?q=Antarctica%20Law%20of%20the%20Sea%20Bush"
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
      coverage: "Prior and later Global Issues volumes used for source-note, chapter, and boundary models.",
      nextAction:
        "Compare 1977-1980, 1981-1988, and planned 1993-2000 global-issues volume structures before freezing lanes.",
      terms: ["FRUS Global Issues", "United Nations", "transnational commons", "global programs"],
      url: "https://history.state.gov/historicaldocuments/status-of-the-series"
    }
  ],
  gaps: [
    {
      id: "gap-lane-structure",
      laneId: "un-governance",
      priority: "Critical",
      status: "Open",
      problem: "Volume XXIX has an official title and planned status, but no published chapter structure.",
      evidence:
        "HistoryAtState volume page lists Global Issues; status page lists the volume under Planned.",
      action:
        "Use predecessor and successor global-issues volumes plus first archival hits to validate lane order before numbering documents.",
      sourcePools: ["pool-precedents", "pool-state-io"],
      risk: "Premature lane choices could misroute regional or functional records."
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
      problem: "It is unclear how much global health and population policy belongs in Volume XXIX.",
      evidence:
        "Health records may be programmatic or domestic unless linked to foreign-policy decisions.",
      action:
        "Sample AIDS/HIV, WHO, population, UNFPA, and food-security files for foreign-policy decision content.",
      sourcePools: ["pool-health-population"],
      risk: "A viable lane may be missed because sources sit outside traditional State files."
    },
    {
      id: "gap-commons-fit",
      laneId: "commons-law",
      priority: "Medium",
      status: "Open",
      problem: "Transnational commons and international law may be a support lane rather than a chapter lane.",
      evidence:
        "Topics such as oceans, Antarctica, outer space, aviation, and treaties can be narrow, technical, or spread across agencies.",
      action:
        "Run a source-pool sample and decide whether to keep a full lane, merge into environment/science, or preserve as a reference queue.",
      sourcePools: ["pool-commons-law"],
      risk: "Too much technical material could dilute high-policy coverage."
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
      lanes: ["un-governance", "environment-science", "refugees-relief", "rights-democracy"],
      terms: ["UNGA", "Rio", "collective security", "humanitarian relief"],
      compilerCheck: "Confirm whether each public-line anchor has internal decision files."
    },
    {
      name: "James A. Baker III",
      role: "Secretary of State",
      lanes: ["un-governance", "rights-democracy", "environment-science", "refugees-relief"],
      terms: ["State", "UN", "human rights", "environment"],
      compilerCheck: "Search both State principal files and speech/briefing books."
    },
    {
      name: "Brent Scowcroft",
      role: "Assistant to the President for National Security Affairs",
      lanes: ["un-governance", "environment-science", "refugees-relief", "commons-law"],
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
      name: "William K. Reilly",
      role: "Administrator of the Environmental Protection Agency",
      lanes: ["environment-science"],
      terms: ["EPA", "climate", "Rio", "ozone"],
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
      lanes: ["refugees-relief", "health-population"],
      terms: ["USAID", "humanitarian", "relief", "food security"],
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
    "Tag every regional overlap before assigning a Volume XXIX lane.",
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
      label: "GovInfo Public Papers",
      url: "https://www.govinfo.gov/app/collection/ppp",
      note: "Official public speeches, statements, and messages."
    },
    {
      label: "HistoryAtState Developer Resources",
      url: "https://history.state.gov/developer",
      note: "FRUS data and publication methods for future structured ingest."
    }
  ]
};
