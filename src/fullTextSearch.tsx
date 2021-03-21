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
    results: {
      all: [] as ID[],
      sonnet: [] as ID[],
      play: [] as ID[],
      character: [] as ID[],
      quote: [] as ID[],
    },
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
  const resultsWithScore: [number, ID][] = intersection.map((id) => {
    return [scoreDocument(database, id, words), id]
  })

  resultsWithScore.sort(([a], [b]) => b - a)

  searchResults.results.all = resultsWithScore.map(([, id]) => id)

  for (const result of searchResults.results.all) {
    const record = database.records[result]!
    searchResults.results[record.type].push(result)
  }

  console.log("took", Date.now() - startTime, "ms")
  return searchResults
}

function scoreDocument(database: Database, id: ID, searchWords: string[]) {
  const record = database.records[id]
  const text = normalizeText(
    record.type === "character"
      ? record.name
      : record.type === "play"
      ? record.title
      : record.body,
  ).replace(/\s+/, " ")
  {
    const exactPhrase = normalizeText(searchWords.join(" "))
    let exactMatches = 0
    let idx = 0
    while (idx !== -1) {
      idx = text.indexOf(exactPhrase, idx)
      if (idx !== -1) {
        exactMatches++
        idx += exactPhrase.length
      }
    }
    if (exactMatches > 0) {
      switch (record.type) {
        case "character":
          return 50
        case "play":
          return 30
        default:
          return exactMatches
      }
    }
  }
  const fullWords = text.split(" ")
  const distances: number[] = []
  for (let i = 0; i < searchWords.length - 1; i++) {
    let idx = fullWords.indexOf(searchWords[i])
    if (idx === -1) {
      continue
    }
    const nextWordIdx = fullWords.indexOf(searchWords[i + 1], idx)
    if (nextWordIdx === -1) {
      continue
    }
    distances.push((nextWordIdx - idx) * 2)
  }
  if (distances.length === 0) {
    return 0
  }
  // get half shortest distances and calculate average
  distances.sort()
  distances.length = Math.ceil(distances.length / 2)
  let sum = 0
  for (const dist of distances) {
    sum += dist
  }
  const avg = sum / distances.length
  return 1 / Math.max(avg, 1)
}
