import type { VaultBuilderOptions, VaultNote } from "../vault.types"

import { pickMany, pickOne } from "../random/random"
import { randomDateBefore, TIMELINE_DAYS, toModifiedTimestamp } from "./builderShared"

export const PERSON_NAMES = [
  "Ada Moreno",
  "Ben Castellan",
  "Carmen Ilsley",
  "Devi Rahal",
  "Elliot Fenwick",
  "Farah Osei",
  "Grace Talvik",
  "Hugo Marchetti",
  "Imogen Hale",
  "Jonas Petrov",
  "Keiko Aldana",
  "Liam Byrnes",
  "Mara Solheim",
  "Nadia Ferreira",
  "Owen Delacroix",
  "Priya Vanterpool",
  "Quinn Abernathy",
  "Rosa Lindqvist",
  "Sami Okafor",
  "Tessa Marlowe",
  "Umberto Reyes",
  "Vera Nakashima",
  "Wes Calloway",
  "Yara Dominguez",
] as const

const COMPANIES = [
  "Northbeam Studio",
  "Quietwater Labs",
  "Fieldstone Collective",
  "Bright Harbor Co",
  "Juniper Systems",
  "Copper Kettle Bakery",
] as const

const ROLES = ["friend", "colleague", "family", "neighbor", "mentor"] as const

const PERSON_TAGS = ["book-club", "running", "work", "old-friends", "travel"] as const

const BIO_SENTENCES = [
  "Always has a podcast recommendation ready before you finish asking.",
  "We met years ago over a shared dislike of long meetings.",
  "Hosts the kind of dinners that end well after midnight.",
  "Knows every good trail within an hour of the city.",
  "Can explain anything with three boxes and two arrows.",
  "Sends postcards from places that are hard to find on a map.",
] as const

const buildBody = (name: string, random: VaultBuilderOptions["random"]): string => {
  const bio = pickMany(random, BIO_SENTENCES, 2).join(" ")
  return `${bio}\n\n## Notes\n\n- Remember to follow up on our last conversation\n- ${name.split(" ")[0]} prefers mornings for calls\n`
}

export const buildPeopleNotes = ({ endDate, random }: VaultBuilderOptions): VaultNote[] =>
  PERSON_NAMES.map((name) => {
    const created = randomDateBefore(endDate, TIMELINE_DAYS, random)
    return {
      body: buildBody(name, random),
      folder: "people",
      frontmatter: {
        created,
        company: pickOne(random, COMPANIES),
        role: pickOne(random, ROLES),
        tags: pickMany(random, PERSON_TAGS, 2),
      },
      modifiedDate: toModifiedTimestamp(created, random),
      title: name,
    }
  })
