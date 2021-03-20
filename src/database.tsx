import React, { useState, useEffect } from "react"
import completeWorks from "../completeworks.txt?raw"
import { normalizeText } from "./normalizeText"
import { addString, newTrie, Trie } from "./trie"

export type DBRecord = Play | Sonnet | Quote | Character

export type ID = string
export type Database = {
  records: Record<ID, DBRecord>
}

const _slugs = new Set()
const slug = (name: string): ID => {
  const slug = normalizeText(name).replace(/\W/g, "-")
  if (!_slugs.has(slug)) {
    return slug
  }
  let i = 1
  let proposal = slug
  while (_slugs.has(proposal)) {
    proposal = slug + "-" + i++
  }

  return proposal
}

export interface Play {
  type: "play"
  id: ID
  title: string
  body: string
  characters: ID[]
  quotes: ID[]
}

export interface Sonnet {
  type: "sonnet"
  id: ID
  num: number
  body: string
}

export interface Quote {
  type: "quote"
  id: ID
  character: ID
  play: ID
  body: string
  line: number
}

export interface Character {
  type: "character"
  id: ID
  play: ID
  name: string
}

export function createIndex(
  onLoadProgress: (progress: number) => void,
): Promise<{ entityTrie: Trie; database: Database }> {
  const database = parseText(completeWorks)
  return new Promise((resolve) => {
    const entityTrie = newTrie()
    const lexiconTrie = newTrie()
    ;(async () => {
      const keys = Object.keys(database.records)
      for (let i = 0; i < keys.length; i++) {
        const r = database.records[keys[i]]
        const val =
          r.type === "character"
            ? r.name
            : r.type === "play"
            ? r.title
            : r.type === "sonnet"
            ? `Sonnet ${r.num}`
            : null

        if (val) {
          const text = normalizeText(val)
          addString(entityTrie, text, r.id, 1)
          const unigrams = text.split(/\s+/)
          if (unigrams.length > 1) {
            for (const word of unigrams) {
              addString(entityTrie, word, r.id, 1)
            }
          }
        } else if (r.type === "quote") {
          const unigrams = r.body.split(/\s+/)
          if (unigrams.length > 1) {
            for (const word of unigrams) {
              addString(lexiconTrie, word, r.id, 1)
            }
          }
        }

        if (i % 500 === 0) {
          onLoadProgress(i / keys.length)
          await new Promise((r) => requestAnimationFrame(r))
        }
      }
      console.log({ entityTrie })
      resolve({ entityTrie, database })
    })()
  })
}

function parseText(text: string): Database {
  const lines = text.split(/\r?\n/)

  // skip to contents

  let start = 0

  while (start < lines.length && lines[start].trim() !== "Contents") {
    start++
  }
  start++
  let end = start
  while (end < lines.length && lines[end].match(/^(\s|$)/)) {
    end++
  }

  // extract work titles
  const titles = lines
    .slice(start, end)
    .map((line) => line.trim())
    .filter(Boolean)

  const database: Database = { records: {} }

  // partition lines into works
  const works = partitionWorks(lines, end, titles)
  parseSonnets(database, works[0].lines)
  works.slice(1).map(parsePlay.bind(null, database))

  return database
}

interface Work {
  title: string
  lines: string[]
}

function parsePlay(database: Database, { title, lines }: Work): Play {
  const play: Play = {
    type: "play",
    id: slug(title),
    title: capitalizeTitle(title),
    characters: [],
    quotes: [],
    body: lines.join("\n"),
  }

  database.records[play.id] = play

  const characters: Record<string, ID> = {}
  const findOrCreateCharacter = (name: string): ID => {
    if (characters[name]) {
      return characters[name]
    } else {
      const character: Character = {
        type: "character",
        id: slug(name),
        name,
        play: play.id,
      }
      characters[name] = character.id
      database.records[character.id] = character
      return character.id
    }
  }

  // gather quotes
  let start = 0
  while (start < lines.length) {
    const line = lines[start].trim()
    const characterMatch = line.match(/^([A-Z ]+)\./)?.[1]
    if (characterMatch && !line.match(/^(act|scene)\b/i)) {
      const character = findOrCreateCharacter(
        capitalizeTitle(characterMatch.toLowerCase()),
      )
      let end = start + 2
      while (end < lines.length && lines[end].trim() !== "") {
        end++
      }
      const quote: Quote = {
        type: "quote",
        id: slug(play.title + "-" + character),
        play: play.id,
        character,
        body: lines.slice(start, end).join("\n").trim(),
        line: start,
      }
      play.quotes.push(quote.id)
      database.records[quote.id] = quote
    }
    start++
  }
  start++

  return play
}

const titleStopWords = [
  "to",
  "of",
  "a",
  "the",
  "in",
  "an",
  "it",
  "that",
  "as",
  "for",
  "and",
]
function capitalizeWord(word: string) {
  return word[0].toLocaleUpperCase() + word.slice(1)
}

function capitalizeTitle(title: string) {
  return title
    .toLocaleLowerCase()
    .split(" ")
    .map((word, i) => {
      if (i === 0 || !titleStopWords.includes(word)) {
        return capitalizeWord(word)
      }
      return word
    })
    .join(" ")
}

function parseSonnets(database: Database, lines: string[]) {
  let chunk: string[] = []
  let num = 0
  for (let line of lines) {
    line = line.trim()
    if (line.match(/^\d+$/)) {
      if (chunk.length) {
        const sonnet: Sonnet = {
          type: "sonnet",
          id: slug("sonnet-" + num),
          num,
          body: chunk.join("\n"),
        }
        database.records[sonnet.id] = sonnet
        chunk = []
      }
      num = Number(line)
    } else {
      chunk.push(line)
    }
  }
}

/**
 * @param lines the lines of the completeworks.txt file
 * @param start the start offest in {lines}
 * @param titles to works titles
 */
function partitionWorks(
  lines: string[],
  start: number,
  titles: string[],
): Work[] {
  let end = start

  const works: Work[] = []
  for (let i = 0; i < titles.length; i++) {
    const currentTitle = titles[i]
    const nextTitle = titles[i + 1]

    while (start < lines.length && !lines[start].startsWith(currentTitle)) {
      start++
    }
    if (!nextTitle) {
      works.push({
        title: currentTitle,
        lines: lines.slice(start),
      })
      break
    }
    end = start
    while (end < lines.length && !lines[end].startsWith(nextTitle)) {
      end++
    }
    works.push({
      title: currentTitle,
      lines: lines.slice(start, end),
    })
    start = end
  }

  return works
}

const DatabaseContext = React.createContext<{
  database?: Database
  entityTrie?: Trie
  loadProgress: number
}>({ loadProgress: 0 })

export const DatabaseProvider: React.FC<{}> = ({ children }) => {
  const [loadProgress, setLoadProgress] = useState(0)
  const [database, setDatabase] = useState<{
    database: Database
    entityTrie: Trie
  }>()
  useEffect(() => {
    createIndex(setLoadProgress).then((db) => {
      setDatabase(db)
      setLoadProgress(1)
    })
  }, [])
  return (
    <DatabaseContext.Provider value={{ loadProgress, ...database }}>
      {children}
    </DatabaseContext.Provider>
  )
}

export function useDatabase() {
  return React.useContext(DatabaseContext)
}
