import { Database, ID } from "./database"
import { normalizeText } from "./normalizeText"
import { findExact, findNearestWord, Trie } from "./trie"

export function fullTextSearch(
  lexiconTrie: Trie,
  database: Database,
  query: string,
) {
  const startTime = Date.now()
  const words = normalizeText(query.trim()).split(/\s+/g)
  const searchResults = {
    results: [] as ID[],
    originalWords: words.slice(0),
    searchWords: words,
  }
  if (!words.length) {
    return searchResults
  }
  // get documents for each word
  const documentsForEachWord = [] as ID[][]

  for (let i = 0; i < words.length; i++) {
    const originalWord = words[i]
    let match = findExact(lexiconTrie, originalWord)
    // if some words do not appear find their closest match
    if (match.length === 0) {
      const nearestWord = findNearestWord(lexiconTrie, originalWord)
      if (!nearestWord) {
        // return nothing since we haven't added any results yet
        return searchResults
      }
      match = findExact(lexiconTrie, nearestWord)
      words[i] = nearestWord
    }
    documentsForEachWord[i] = match.map(([docID]) => docID)
  }

  // find intersection between all doc lists
  const intersection = []
  outer: for (const docID of documentsForEachWord[0]) {
    for (let i = 1; i < documentsForEachWord.length; i++) {
      if (!documentsForEachWord[i].includes(docID)) {
        continue outer
      }
    }
    intersection.push(docID)
  }
  // rank matches

  searchResults.results = intersection

  console.log("took", Date.now() - startTime, "ms")

  return searchResults
}
