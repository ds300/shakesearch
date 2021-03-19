import completeWorks from "../completeworks.txt?raw"
import lunr from "elasticlunr"
import * as uuid from "uuid"

interface Document {
  id: string
  body: string
  kind: string
}

const index = lunr<Document>(function () {
  this.addField("body")
  this.addField("kind")
  this.setRef("id")
})

export async function search(query: string, limit?: number) {
  return index.search(query, {})
}

function parseText(text: string) {
  const startTime = Date.now()
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

  const database: Database = {
    characters: {},
    plays: {},
    sonnets: {},
    quotes: {},
  }
  // partitiion lines into works
  const works = partitionWorks(lines, end, titles)
  const sonnets = parseSonnets(database, works[0].lines)
  const plays = works.slice(1).map(parsePlay.bind(null, database))

  console.log({ database })
  console.log("took", Date.now() - startTime, "ms")
}

interface Work {
  title: string
  lines: string[]
}

interface Database {
  plays: Record<string, Play>
  sonnets: Record<string, Sonnet>
  characters: Record<string, Character>
  quotes: Record<string, Quote>
}

type ID = string & { __UUID__: true }
const id = (): ID => uuid.v4() as ID

interface Play {
  type: "play"
  id: ID
  title: string
  body: string
  characters: ID[]
  quotes: ID[]
}

interface Sonnet {
  type: "sonnet"
  id: ID
  num: number
  body: String
}

interface Quote {
  type: "quote"
  id: ID
  character: ID
  play: ID
  body: string
  line: number
}

interface Character {
  type: "character"
  id: ID
  play: ID
  name: string
}

function parsePlay(database: Database, { title, lines }: Work): Play {
  const play: Play = {
    type: "play",
    id: id(),
    title: capitalizeTitle(title),
    characters: [],
    quotes: [],
    body: lines.join("\n"),
  }

  database.plays[play.id] = play

  const characters: Record<string, ID> = {}
  const findOrCreateCharacter = (name: string): ID => {
    if (characters[name]) {
      return characters[name]
    } else {
      const character: Character = {
        type: "character",
        id: id(),
        name,
        play: play.id,
      }
      characters[name] = character.id
      database.characters[character.id] = character
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
        id: id(),
        play: play.id,
        character,
        body: lines.slice(start, end).join("\n").trim(),
        line: start,
      }
      play.quotes.push(quote.id)
      database.quotes[quote.id] = quote
    }
    start++
  }
  start++

  return play
}

const stopWords = [
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
      if (i === 0 || !stopWords.includes(word)) {
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
          id: id(),
          num,
          body: chunk.join("\n"),
        }
        database.sonnets[sonnet.id] = sonnet
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

parseText(completeWorks)
