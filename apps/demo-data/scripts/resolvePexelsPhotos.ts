/**
 * One-off maintainer tool: resolves a curated list of search queries to
 * concrete Pexels photo IDs and (re)writes the committed lockfile at
 * `src/vault/images/pexelsPhotos.json`. Requires a `PEXELS_API_KEY` env var
 * (free tier at pexels.com/api). NOT part of `npm run demo:data` or CI — the
 * daily demo regeneration only downloads the already-pinned CDN URLs in the
 * lockfile, so it needs no API key. Run this manually when photo picks need
 * refreshing:
 *
 *   PEXELS_API_KEY=... npx tsx apps/demo-data/scripts/resolvePexelsPhotos.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"

import type { PexelsCategory, PexelsPhoto } from "../src/vault/images/pexelsPhoto.types"

interface QuerySpec {
  category: PexelsCategory
  key: string
  query: string
}

interface PexelsSearchPhoto {
  id: number
  width: number
  height: number
  src: { large: string }
}

interface PexelsSearchResponse {
  photos: PexelsSearchPhoto[]
}

// Extend this list and re-run when a category needs new/refreshed photos.
// Keys must match the ones consumed by the builders in src/vault/builders/.
const QUERIES: readonly QuerySpec[] = [
  { category: "books", key: "reading-nook", query: "cozy reading nook" },
  { category: "books", key: "old-books", query: "stack of old books" },
  { category: "books", key: "library", query: "library bookshelves" },
  { category: "books", key: "coffee-book", query: "coffee and book table" },
  { category: "books", key: "autumn-reading", query: "person reading book outdoors" },
  { category: "books", key: "old-map-compass", query: "old map and compass" },
  { category: "books", key: "vintage-typewriter", query: "vintage typewriter desk" },
  { category: "books", key: "handwritten-journal", query: "handwritten journal pen" },
  { category: "books", key: "bookstore-aisle", query: "bookstore shelves aisle" },
  { category: "books", key: "reading-glasses", query: "reading glasses on book" },
  { category: "books", key: "book-pages", query: "book pages close up" },
  { category: "books", key: "library-ladder", query: "antique library ladder" },
  { category: "books", key: "book-tea", query: "book and tea cup" },
  { category: "books", key: "leather-books", query: "leather bound book stack" },
  { category: "books", key: "bookstore-front", query: "used bookstore storefront" },
  { category: "books", key: "night-lamp", query: "night reading lamp book" },
  { category: "movies", key: "cinema-seats", query: "cinema theater seats" },
  { category: "movies", key: "film-reel", query: "vintage film reel" },
  { category: "movies", key: "popcorn", query: "popcorn movie night" },
  { category: "movies", key: "theater-marquee", query: "drive-in theater night" },
  { category: "movies", key: "film-camera", query: "vintage film camera" },
  { category: "movies", key: "clapperboard", query: "clapperboard film set" },
  { category: "movies", key: "director-chair", query: "director chair movie set" },
  { category: "movies", key: "outdoor-cinema", query: "outdoor cinema screen night" },
  { category: "movies", key: "neon-city", query: "neon city street night" },
  { category: "movies", key: "ticket-stubs", query: "movie ticket stubs" },
  { category: "movies", key: "spotlight-stage", query: "spotlight stage dark" },
  { category: "movies", key: "vintage-boombox", query: "drive-in speaker box" },
  { category: "movies", key: "red-curtain", query: "red curtain theater stage" },
  { category: "movies", key: "film-negatives", query: "vintage film strip negatives" },
  { category: "recipes", key: "sourdough-focaccia", query: "sourdough focaccia bread" },
  { category: "recipes", key: "street-tacos", query: "street corn tacos" },
  { category: "recipes", key: "tomato-galette", query: "tomato galette pastry" },
  { category: "recipes", key: "miso-salmon", query: "miso glazed salmon" },
  { category: "recipes", key: "lemon-ricotta-pancakes", query: "ricotta pancakes" },
  { category: "recipes", key: "chickpea-stew", query: "chickpea stew spinach" },
  { category: "recipes", key: "brown-butter-gnocchi", query: "gnocchi brown butter sage" },
  { category: "recipes", key: "black-pepper-ramen", query: "ramen bowl noodles" },
  { category: "recipes", key: "honey-garlic-chicken", query: "roast chicken thighs" },
  { category: "recipes", key: "dutch-baby", query: "dutch baby pancake" },
  { category: "photos", key: "ravine-trail", query: "ravine hiking trail forest" },
  { category: "photos", key: "lakeshore", query: "lakeshore sunset" },
  { category: "photos", key: "old-town", query: "old town european street" },
  { category: "photos", key: "harbor-market", query: "harbor fishing market" },
  { category: "photos", key: "botanical-garden", query: "botanical garden greenhouse" },
  { category: "photos", key: "mountain-pass", query: "mountain pass road" },
  { category: "photos", key: "riverside-path", query: "riverside path autumn" },
  { category: "photos", key: "city-rooftop", query: "city rooftop skyline" },
  { category: "photos", key: "winter-forest", query: "winter forest snow" },
  { category: "photos", key: "farmers-market", query: "farmers market produce" },
  { category: "photos", key: "lighthouse-point", query: "lighthouse coast" },
  { category: "photos", key: "meadow-loop", query: "meadow wildflowers" },
  { category: "photos", key: "canyon-overlook", query: "canyon overlook desert" },
  { category: "photos", key: "museum-district", query: "museum interior architecture" },
  { category: "photos", key: "backyard", query: "backyard garden patio" },
  { category: "photos", key: "prairie-road", query: "prairie road sunset" },
  { category: "photos", key: "autumn-orchard", query: "autumn orchard apple trees" },
  { category: "photos", key: "desert-overlook", query: "desert overlook sunset" },
  { category: "photos", key: "coastal-cliffs", query: "coastal cliffs ocean" },
  { category: "photos", key: "vineyard-row", query: "vineyard rows hills" },
  { category: "photos", key: "train-platform", query: "train platform station" },
  { category: "photos", key: "frozen-pond", query: "frozen pond ice winter" },
  { category: "photos", key: "alpine-lake", query: "alpine lake mountains" },
  { category: "photos", key: "night-market", query: "night market street food" },
]

const LOCKFILE_PATH = path.join(__dirname, "../src/vault/images/pexelsPhotos.json")

const resolveQuery = async (apiKey: string, query: string): Promise<PexelsSearchPhoto> => {
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
    { headers: { Authorization: apiKey } },
  )
  if (!response.ok) {
    throw new Error(`Pexels search failed (${String(response.status)}) for query "${query}"`)
  }
  const body = (await response.json()) as PexelsSearchResponse
  const [photo] = body.photos
  if (!photo) throw new Error(`Pexels search returned no results for query "${query}"`)
  return photo
}

const main = async (): Promise<void> => {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) throw new Error("PEXELS_API_KEY env var is required")

  const library: Record<PexelsCategory, PexelsPhoto[]> = {
    books: [],
    movies: [],
    photos: [],
    recipes: [],
  }

  for (const { category, key, query } of QUERIES) {
    const photo = await resolveQuery(apiKey, query)
    library[category].push({
      key,
      photoId: photo.id,
      src: photo.src.large,
      width: photo.width,
      height: photo.height,
    })
    console.info(`[resolve-pexels-photos] ${category}/${key} -> photo ${String(photo.id)}`)
  }

  writeFileSync(LOCKFILE_PATH, `${JSON.stringify(library, null, 2)}\n`, "utf8")
  console.info(`[resolve-pexels-photos] wrote ${LOCKFILE_PATH}`)
}

main().catch((error: unknown) => {
  console.error("[resolve-pexels-photos] failed", error)
  process.exitCode = 1
})
