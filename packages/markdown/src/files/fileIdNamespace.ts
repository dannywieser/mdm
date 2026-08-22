/**
 * UUIDv5 namespace every note source seeds `createFileID` with. Shared so
 * services that scan the same vault independently (notes-api, and the
 * transaction scan) resolve a given note to the same `id`, which is what
 * makes cross-service note links work.
 */
export const FILE_ID_NAMESPACE = "6ba7b811-9dad-11d1-80b4-00c04fd430c8"
