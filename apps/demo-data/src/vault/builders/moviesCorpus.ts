import type { MovieCorpusEntry } from "./moviesCorpus.types"

/** Curated, hand-written movie notes — no combinatorial titles or filler sentences. */
export const MOVIES_CORPUS: readonly MovieCorpusEntry[] = [
  {
    title: "Midnight Harbor",
    director: "R. Okonkwo",
    genre: "thriller",
    status: "watched",
    rating: 4,
    body: `A slow-burn heist film that trusts silence more than dialogue — entire five-minute stretches with no score, and it works. Okonkwo clearly studied the Michael Mann playbook on shooting nighttime docks, and the sound design (mostly just water and diesel engines) does most of the tension-building.

The twist in the final act is telegraphed a little early if you're paying attention, but the last shot earns it anyway.`,
    photoKey: "cinema-seats",
  },
  {
    title: "The Static Sea",
    director: "A. Kobayashi",
    genre: "science fiction",
    status: "watched",
    rating: 5,
    body: `Best sci-fi film in years that isn't based on existing IP. A research vessel loses contact with a colony and the crew slowly realizes the silence itself might be the threat.

## Why It Works

- No monster reveal — the dread stays abstract the whole runtime
- The practical-effects submarine interior looks and sounds genuinely lived-in

Watched it twice in one week, which I almost never do.`,
    photoKey: "clapperboard",
  },
  {
    title: "Paper Verdict",
    director: "S. Whitfield",
    genre: "drama",
    status: "watched",
    rating: 3,
    body: `Courtroom drama more interested in the paralegals than the lawyers, which is a good angle undercut by pacing that drags through the middle hour. The lead performance — a paralegal realizing she's been coached to bury evidence — is the reason to watch it.`,
    photoKey: "director-chair",
  },
  {
    title: "Iron Country",
    director: "M. Espinoza",
    genre: "western",
    status: "watchlist",
    body: `On the list since the trailer — a modern-day western set around a dying steel town rather than a ranch. Espinoza's last film was excellent, so expectations are high.`,
    photoKey: "outdoor-cinema",
  },
  {
    title: "The Seventh Reel",
    director: "L. Toivonen",
    genre: "documentary",
    status: "watched",
    rating: 4,
    body: `A documentary about a film archivist who spent thirty years tracking down a director's "lost" seventh film, which turns out to have been sitting mislabeled in a Helsinki basement the whole time. More about obsession than film preservation, honestly, and better for it.`,
    photoKey: "film-reel",
  },
  {
    title: "Neon Divide",
    director: "D. Falkner",
    genre: "science fiction",
    status: "watched",
    rating: 4,
    body: `A city split literally down the middle by a border wall, shot almost entirely in two competing color palettes — cool blue on one side, warm neon on the other. The visual conceit does a lot of narrative work that the script, on its own, wouldn't quite carry.`,
    photoKey: "neon-city",
  },
  {
    title: "Silent Mile",
    director: "P. Iyer",
    genre: "drama",
    status: "watchlist",
    body: `A marathon-runner drama that premiered at a festival last fall to strong reviews. Adding it to the list on a friend's recommendation, mostly because she never recommends dramas.`,
    photoKey: "ticket-stubs",
  },
  {
    title: "The Last Signal",
    director: "J. Marchand",
    genre: "thriller",
    status: "watched",
    rating: 5,
    body: `A lighthouse keeper picks up a distress call that shouldn't be possible given the timeline. Marchand keeps the cast to essentially two people for ninety minutes and never once lets the tension slip.

> "The signal doesn't care if you believe it."

One of the tightest scripts I've seen this year — not a single wasted scene.`,
    photoKey: "spotlight-stage",
  },
  {
    title: "Orchard Protocol",
    director: "R. Okonkwo",
    genre: "action",
    status: "watched",
    rating: 3,
    body: `Okonkwo's follow-up to Midnight Harbor, and a step down — the action set-pieces are well-shot but the plot (corporate espionage at an agricultural biotech firm) never justifies its own complexity. Watchable for the cinematography alone.`,
    photoKey: "popcorn",
  },
  {
    title: "Summer of Static",
    director: "A. Kobayashi",
    genre: "comedy",
    status: "watchlist",
    body: `Kobayashi doing comedy after The Static Sea is an unexpected turn. The trailer looks genuinely funny — a family road trip where every device they own stops working at once.`,
    photoKey: "vintage-boombox",
  },
  {
    title: "The Glass Harbor",
    director: "S. Whitfield",
    genre: "drama",
    status: "watched",
    rating: 4,
    body: `A quieter, better film than Paper Verdict — two estranged siblings closing out their late father's marine salvage business. Whitfield clearly does better work with fewer characters and more time per scene.`,
    photoKey: "red-curtain",
  },
  {
    title: "Divide and Fold",
    director: "M. Espinoza",
    genre: "documentary",
    status: "watched",
    rating: 4,
    body: `A documentary following an origami master's final year of teaching before retirement. Sounds slight on paper; is actually one of the most focused films about craft and mortality I've seen. No score for the last twenty minutes, and it's the right choice.`,
    photoKey: "film-negatives",
  },
  {
    title: "Country Reel",
    director: "L. Toivonen",
    genre: "drama",
    status: "watchlist",
    body: `Toivonen's first narrative feature after a run of documentaries. Set around a struggling drive-in theater in its final summer. Adding it mostly out of curiosity about the tonal shift.`,
    photoKey: "theater-marquee",
  },
  {
    title: "Protocol Zero",
    director: "D. Falkner",
    genre: "action",
    status: "watched",
    rating: 2,
    body: `Falkner chasing the Neon Divide budget with none of the visual ambition. Competent action, forgettable everything else. Probably won't remember the plot by next month.`,
    photoKey: "film-camera",
  },
]
