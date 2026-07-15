import type { IdeaCorpusEntry } from "./ideasCorpus.types"

/** Curated project-idea pitches; a few are marked archived to exercise `$missing` filters. */
export const IDEAS_CORPUS: readonly IdeaCorpusEntry[] = [
  {
    title: "Offline-First Recipe Box",
    pitch:
      "A recipe app that works entirely without a connection — sync is an afterthought, not the foundation. Most of my actual cooking happens somewhere with bad wifi.",
    openQuestions: ["Is this just a plain text file with extra steps?", "Who else would actually use it?"],
    tags: ["app", "home"],
  },
  {
    title: "Seasonal Reading Tracker",
    pitch:
      "A reading log that groups books by the season you read them in rather than by genre or rating. Half of what I remember about a book is the weather outside while I was reading it.",
    openQuestions: ["Does this need to be an app or just a spreadsheet tab?"],
    tags: ["app", "writing"],
  },
  {
    title: "Automated Garden Watering Log",
    pitch:
      "A sensor that just logs when the garden actually got watered, cross-referenced against rainfall data, so guilt doesn't have to substitute for memory.",
    openQuestions: ["What does week two look like, after the novelty wears off?"],
    tags: ["home", "automation"],
    archived: true,
  },
  {
    title: "Minimal Budget Board",
    pitch: "A budgeting tool with exactly four categories. Everything else is a rounding error most months anyway.",
    openQuestions: ["Could a spreadsheet do 80% of this?", "Is this a tool or a habit wearing a tool costume?"],
    tags: ["finance", "home"],
  },
  {
    title: "Shared Family Photo Archive",
    pitch:
      "One place for the decades of scanned family photos currently split across three drives and a shoebox. The hard part isn't storage, it's tagging who's in each photo before nobody left remembers.",
    openQuestions: ["Who's actually responsible for the tagging work?"],
    tags: ["family", "home"],
  },
  {
    title: "Ambient Habit Coach",
    pitch:
      "Notifications that get quieter, not louder, the longer a streak goes — the opposite of how most habit apps work. Reward consistency with less noise, not more badges.",
    openQuestions: ["Is 'ambient' just a nicer word for 'does nothing'?"],
    tags: ["app", "habits"],
  },
  {
    title: "Weekly Neighborhood Book Swap",
    pitch:
      "A recurring low-key book swap at the end of the block, no app required — just a folding table and a chalk sign. Started as a joke, thought about it seriously for a week now.",
    openQuestions: ["Does the neighborhood actually want this, or do I?"],
    tags: ["community", "someday"],
    archived: true,
  },
  {
    title: "Local-Only Music Discovery",
    pitch:
      "A discovery feed that only ever recommends artists playing within driving distance in the next month. Most recommendation engines optimize for anything but 'could I actually go see this.'",
    openQuestions: ["Is the data even available at the venue level?"],
    tags: ["app", "research"],
  },
  {
    title: "Open Recipe Ratio Cards",
    pitch:
      "Recipe cards written as ratios instead of fixed quantities, so scaling a dinner party doesn't require a calculator. Cooks who've done this long enough already think this way; nobody's written it down cleanly.",
    openQuestions: ["Which dishes actually work as ratios and which don't?"],
    tags: ["writing", "someday"],
  },
  {
    title: "Modular Camping Kit Checklist",
    pitch:
      "A packing list that reconfigures itself based on trip length and forecast instead of one static master list that's always slightly wrong.",
    openQuestions: ["Is this solved better by three separate static lists?"],
    tags: ["outdoors", "app"],
  },
  {
    title: "Annual Letter Generator",
    pitch:
      "A prompt list, not a template, for writing the yearly family letter — questions instead of fill-in-the-blanks, so it doesn't read like a form. Been meaning to write this year's letter for two months now.",
    openQuestions: ["Would people rather answer prompts or free-write?"],
    tags: ["writing", "family"],
    archived: true,
  },
  {
    title: "Home Network Health Dashboard",
    pitch:
      "One screen that shows whether the internet problem is the router, the ISP, or the sketchy powerline adapter in the basement, instead of guessing every time it drops.",
    openQuestions: ["Is this three separate blinking lights and I'm overengineering it?"],
    tags: ["tech", "home"],
  },
]
