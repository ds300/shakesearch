/** @jsx jsx */
import { jsx } from "@emotion/react"
import React, { useState, useEffect } from "react"
import completeWorks from "../completeworks.txt?raw"
import { ProgressBar } from "./Components/ProgressBar"
import { ShowHide } from "./Components/ShowHide"
import { normalizeText } from "./normalizeText"
import { addString, newTrie, Trie } from "./trie"

export type DBRecord = Play | Poem | Quote | Character

export type ID = string
export type Database = {
  records: Record<ID, DBRecord>
  slugs: Set<string>
  createSlug(s: string): string
}

export interface Play {
  type: "play"
  id: ID
  title: string
  body: string
  characters: ID[]
  quotes: ID[]
}

export interface Poem {
  type: "poem"
  id: ID
  title: string
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
  quotes: ID[]
}

export function createIndex(
  onLoadProgress: (progress: number) => void,
): Promise<{ entityTrie: Trie; database: Database; lexiconTrie: Trie }> {
  const database = parseText(completeWorks)
  return new Promise((resolve) => {
    const entityTrie = newTrie("")
    const lexiconTrie = newTrie("")
    ;(async () => {
      const keys = Object.keys(database.records)
      for (let i = 0; i < keys.length; i++) {
        const r = database.records[keys[i]]
        const val =
          r.type === "character"
            ? r.name
            : r.type === "play"
            ? r.title
            : r.type === "poem"
            ? r.title
            : null

        if (val) {
          const text = normalizeText(val)
          addString(entityTrie, text, r.id, 1)
          let i = text.indexOf(" ")
          while (i !== -1) {
            addString(entityTrie, text.slice(i + 1), r.id, 1)
            i = text.indexOf(" ", i + 1)
          }
          const unigrams = text.split(/\s+/)
          for (const word of unigrams) {
            addString(lexiconTrie, word, r.id, 1)
          }
        }
        if (r.type === "quote" || r.type === "poem") {
          const unigrams = normalizeText(r.body).split(/\s+/)
          for (const word of unigrams) {
            addString(lexiconTrie, word, r.id, 1)
          }
        }

        if (i % 500 === 0) {
          onLoadProgress(i / keys.length)
          await new Promise((r) => requestAnimationFrame(r))
        }
      }
      console.log({ entityTrie, lexiconTrie, database })
      resolve({ entityTrie, database, lexiconTrie })
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

  const slugs = new Set<string>()

  const database: Database = {
    records: {},
    slugs,
    createSlug(name: string) {
      if (name === "sonnet-1") {
        debugger
      }
      const slug = name.toLocaleLowerCase().replace(/[^\w\-]/g, "-")
      if (!slugs.has(slug)) {
        slugs.add(slug)
        return slug
      }
      let i = 1
      let proposal = slug
      while (slugs.has(proposal)) {
        proposal = slug + "-" + i++
      }
      slugs.add(proposal)

      return proposal
    },
  }

  // partition lines into works
  const works = partitionWorks(lines, end, titles)
  parseSonnets(database, works[0].lines.slice(2))
  for (const work of works.slice(1)) {
    if (work.title.match(/(lucrece|adonis)/i)) {
      parsePoem(database, work)
    } else {
      parsePlay(database, work)
    }
  }

  return database
}

interface Work {
  title: string
  lines: string[]
}

function parsePoem(database: Database, { title, lines }: Work): Poem {
  const poem: Poem = {
    type: "poem",
    id: database.createSlug(title),
    title: capitalizeTitle(title),
    body: lines.join("\n").trim(),
  }
  database.records[poem.id] = poem
  return poem
}
function parsePlay(database: Database, { title, lines }: Work): Play {
  const body = lines.slice(1).join("\n").trim()
  lines = body.split("\n")
  const play: Play = {
    type: "play",
    id: database.createSlug(title),
    title: capitalizeTitle(title),
    characters: [],
    quotes: [],
    body,
  }

  database.records[play.id] = play

  const characters: Record<string, Character> = {}
  const findOrCreateCharacter = (name: string): Character => {
    if (characters[name]) {
      return characters[name]
    } else {
      const character: Character = {
        type: "character",
        id: database.createSlug(name),
        name,
        play: play.id,
        quotes: [],
      }
      characters[name] = character
      database.records[character.id] = character
      return character
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
      let end = start + 1
      if (line.match(/\.$/) && lines[end].trim() === "") {
        end = start + 2
      }
      while (end < lines.length && !lines[end].match(/^([A-Z ]+)\./)) {
        end++
      }
      const quote: Quote = {
        type: "quote",
        id: database.createSlug(play.title + "-" + character.id),
        play: play.id,
        character: character.id,
        body: lines
          .slice(start, end)
          .join("\n")
          .replace(/^.*?\./, "")
          .trim(),
        line: start,
      }
      play.quotes.push(quote.id)
      character.quotes.push(quote.id)
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
  let num = 1
  for (let line of lines) {
    line = line.trim()
    if (line.match(/^\d+$/)) {
      if (chunk.length) {
        const sonnet: Poem = {
          type: "poem",
          id: database.createSlug("sonnet-" + num),
          title: `Sonnet ${num}`,
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
  lexiconTrie?: Trie
  loadProgress: number
}>({ loadProgress: 0 })

export const DatabaseProvider: React.FC<{}> = ({ children }) => {
  const [loadProgress, setLoadProgress] = useState(0)
  const [database, setDatabase] = useState<{
    database: Database
    entityTrie: Trie
    lexiconTrie: Trie
  }>()
  useEffect(() => {
    createIndex(setLoadProgress).then((db) => {
      setDatabase(db)
      setLoadProgress(1)
    })
  }, [])
  const [showingProgressBar, setShowingProgressBar] = useState(true)
  const [showingApp, setShowingApp] = useState(false)
  useEffect(() => {
    if (loadProgress === 1) {
      setShowingProgressBar(false)
      setTimeout(() => setShowingApp(true), 700)
    }
  }, [loadProgress])
  return (
    <DatabaseContext.Provider value={{ loadProgress, ...database }}>
      {showingApp ? (
        children
      ) : (
        <div
          css={{
            display: "flex",
            height: "100%",
            flexDirection: "column",
          }}
        >
          <div css={{ height: "20vh", flexShrink: 0 }}></div>
          <ShowHide show={showingProgressBar}>
            <div
              css={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div css={{ paddingTop: 30, paddingBottom: 20 }}>
                Creating search index...
              </div>
              <ProgressBar percentComplete={loadProgress * 100} />
            </div>
          </ShowHide>
        </div>
      )}
    </DatabaseContext.Provider>
  )
}

export function useDatabase() {
  return React.useContext(DatabaseContext)
}
