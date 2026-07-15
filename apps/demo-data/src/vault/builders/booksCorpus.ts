import type { BookCorpusEntry } from "./booksCorpus.types"

/** Curated, hand-written book notes — no combinatorial titles or filler sentences. */
export const BOOKS_CORPUS: readonly BookCorpusEntry[] = [
  {
    title: "The Cartographer's Daughter",
    author: "Elena Marsh",
    genre: "literary fiction",
    status: "read",
    rating: 5,
    body: `Finished this in one sitting on a rainy Sunday, which is either the highest compliment or a sign I had nothing better to do.

Marsh writes about inherited work — a daughter mapping the same coastline her father spent forty years surveying — without ever making it sentimental. The prose is patient in a way that pays off; a throwaway detail about tide charts in chapter two becomes the emotional center of the book by chapter eighteen.

> "Every map is an argument about what matters enough to draw."

Would hand this to anyone who has ever taken over a parent's unfinished project.`,
    photoKey: "old-map-compass",
  },
  {
    title: "Static and Silence",
    author: "Devon Okafor",
    genre: "science fiction",
    status: "read",
    rating: 4,
    body: `A first-contact novel that spends almost no time on the aliens and all its time on the radio operators trying to explain the signal to a skeptical government.

## What Worked

- The bureaucratic dread is more unsettling than anything extraterrestrial
- Okafor clearly did the homework on actual SETI protocol

## What Didn't

The ending resolves a little too neatly for a book this committed to ambiguity everywhere else. Still recommend it.`,
    photoKey: "vintage-typewriter",
  },
  {
    title: "A Recipe for Leaving",
    author: "Priya Chandrasekaran",
    genre: "fiction",
    status: "reading",
    body: `About sixty pages in. Structured as a cookbook — each chapter is a recipe followed by the story of the meal — which shouldn't work as well as it does.

So far it's less about food than about the specific kind of leaving where nobody's really at fault. Chandrasekaran has a gift for dialogue that sounds like actual eavesdropping.`,
    photoKey: "coffee-book",
  },
  {
    title: "The Long Thaw",
    author: "Marcus Webb",
    genre: "nature writing",
    status: "read",
    rating: 4,
    body: `Webb spent three field seasons with a glaciology team in the Yukon and it shows — this is reporting first, memoir second, and better for it.

The chapter comparing ice cores to tree rings ("each one a diary entry the glacier didn't know it was keeping") justified the whole book on its own. Dense in the middle with instrumentation detail that could've used an editor's scissors, but the closing chapters land hard.`,
    photoKey: "handwritten-journal",
  },
  {
    title: "Late Bloomers",
    author: "Ingrid Solberg",
    genre: "essays",
    status: "to-read",
    body: `On the shelf since a friend's recommendation at book club in the spring. The premise — essays on people who changed careers after 50 — is exactly the kind of thing I put off reading until I actually need it.`,
    photoKey: "reading-nook",
  },
  {
    title: "The Weight of Small Things",
    author: "Naomi Kessler",
    genre: "literary fiction",
    status: "read",
    rating: 5,
    body: `Kessler's third novel, and the first one that fully earns its reputation. A family inventory after a death, told entirely through the objects being sorted into keep, donate, and discard piles.

No chapter runs longer than four pages. Somehow that restraint makes the grief hit harder than a five-hundred-page family saga would have. Read the last thirty pages twice before moving on to anything else.`,
    photoKey: "old-books",
  },
  {
    title: "Everything We Buried",
    author: "Tomas Reyes",
    genre: "mystery",
    status: "read",
    rating: 3,
    body: `Solid procedural, forgettable detective. The setting — a former mining town slowly sinking, literally, into its own old tunnels — is more memorable than the mystery built around it.

Guessed the ending around the two-thirds mark, which isn't necessarily a flaw. Reyes seems more interested in atmosphere than misdirection.`,
    photoKey: "bookstore-aisle",
  },
  {
    title: "Field Notes from Nowhere",
    author: "Callum Ashworth",
    genre: "travel essays",
    status: "read",
    rating: 4,
    body: `A collection about the towns that show up on maps but not in guidebooks. Ashworth has a reporter's eye for the detail that makes a place specific — the one gas station that doubles as the DMV, the diner whose specials board hasn't changed since a name change nobody remembers the reason for.

Best read a chapter at a time, not straight through.`,
    photoKey: "reading-glasses",
  },
  {
    title: "The Quiet Machine",
    author: "Yuki Tanaka",
    genre: "science fiction",
    status: "reading",
    body: `A generation-ship novel told entirely from the maintenance crew's perspective — the people who never get a vote on where the ship is going, just a work order. About a third through and already convinced this is doing something the genre doesn't do enough.`,
    photoKey: "library",
  },
  {
    title: "Orchard Under Glass",
    author: "Beatrice Lund",
    genre: "historical fiction",
    status: "read",
    rating: 4,
    body: `Set during a Victorian-era conservatory-building boom, following the women who actually ran the greenhouses their husbands got credit for. Lund clearly loves the botanical detail as much as the history — sometimes a little too much, with paragraphs that read like a seed catalog.

Still, the central relationship between the two sisters carries it easily.`,
    photoKey: "book-pages",
  },
  {
    title: "How to Disappear Completely",
    author: "Rosa Iyer",
    genre: "thriller",
    status: "to-read",
    body: `Bought this off a shelf recommendation I can no longer remember the source of. The jacket copy alone — a witness-protection handler who starts believing her own cover stories — is enough to bump it up the pile.`,
    photoKey: "library-ladder",
  },
  {
    title: "The Last Good Winter",
    author: "Henrik Aas",
    genre: "literary fiction",
    status: "read",
    rating: 5,
    body: `A small book about a big subject: the last season a family farm operated before being sold. Aas resists every opportunity to be sentimental about it, which somehow makes the moments that are sentimental (a scene with a dog and a stopped tractor) devastating.

Read this over two evenings and thought about it for a week after.`,
    photoKey: "autumn-reading",
  },
  {
    title: "Notes on Forgetting",
    author: "Amara Osei",
    genre: "essays",
    status: "read",
    rating: 4,
    body: `Essays written while Osei's mother's memory was declining, but the book resists being "a memoir about dementia" — it's really about what forgetting reveals about what a family chose to remember in the first place.

- The essay on inherited recipes with no written instructions is the standout
- Short enough to read in an afternoon, dense enough to reread`,
    photoKey: "book-tea",
  },
  {
    title: "The Architecture of Regret",
    author: "Simon Kwan",
    genre: "literary fiction",
    status: "reading",
    body: `An architect narrator revisiting buildings he designed that later got demolished. Kwan's own background as an architect shows in the technical confidence, though the pacing sags in the middle third. Sticking with it for the voice alone.`,
    photoKey: "leather-books",
  },
  {
    title: "Salt Water Kingdom",
    author: "Delphine Marchetti",
    genre: "historical fiction",
    status: "to-read",
    body: `A recommendation from the reading-list thread at work, about a 19th-century salt-trading dynasty. Nearly 600 pages, which is the only reason it's still waiting.`,
    photoKey: "bookstore-front",
  },
  {
    title: "Everything Is Nearby",
    author: "Otis Fairweather",
    genre: "poetry",
    status: "read",
    rating: 5,
    body: `A poetry collection about proximity — to family, to disaster, to the ordinary. Fairweather writes short and doesn't waste a line.

> "The nearest thing to me is always the thing I forgot to look at."

Read one poem a night for three weeks instead of all at once. Recommend the same pace to anyone else who picks this up.`,
    photoKey: "night-lamp",
  },
]
