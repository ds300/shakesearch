/** @jsx jsx */
import { jsx } from "@emotion/react"
import GraphemeSplitter from "grapheme-splitter"
import uniq from "lodash/uniq"
import { parse } from "qs"
import React from "react"
import { useLocation } from "react-router"
import { Character, useDatabase } from "../database"
import { fullTextSearch } from "../fullTextSearch"
import { normalizeText } from "../normalizeText"

export const Results: React.FC<{}> = () => {
  const { query } = parse(useLocation().search.slice(1))
  const { lexiconTrie, database } = useDatabase()
  const results = fullTextSearch(lexiconTrie!, database!, query as string)
  return (
    <div>
      Results for {query} at {useLocation().search}
      {results.results.map((id) => {
        const record = database?.records[id]!
        switch (record.type) {
          case "sonnet":
            return (
              <div key={record.id}>
                Sonnet {record.num}
                <div>
                  {applyHighlight(record.body, results.searchWords, (word) => (
                    <span css={{ fontWeight: 600 }}>{word}</span>
                  ))}
                </div>
              </div>
            )
          case "quote":
            return (
              <div key={record.id}>
                Quote by{" "}
                {(database?.records[record.character] as Character).name}
                <div>
                  {applyHighlight(record.body, results.searchWords, (word) => (
                    <span css={{ fontWeight: 600 }}>{word}</span>
                  ))}
                </div>
              </div>
            )
        }
      })}
    </div>
  )
}

const splitter = new GraphemeSplitter()

function applyHighlight(
  text: string,
  highlights: string[],
  highightFn: (match: string) => React.ReactNode,
) {
  const textGraphemes = splitter.splitGraphemes(text)
  const highlightRanges: Array<{ start: number; end: number }> = []

  nextHighlight: for (const highlight of highlights.map((h) =>
    splitter.splitGraphemes(h),
  )) {
    nextTextOffset: for (let i = 0; i < textGraphemes.length; i++) {
      nextHighlightChar: for (
        let j = 0;
        i + j < textGraphemes.length && j < highlight.length;
        j++
      ) {
        if (
          normalizeText(textGraphemes[i + j]) !== normalizeText(highlight[j])
        ) {
          continue nextTextOffset
        }
      }
      // loop finished naturally so there's a match
      highlightRanges.push({ start: i, end: i + highlight.length })
    }
  }

  if (highlightRanges.length === 0) {
    return text
  }

  // sort ranges by start time
  highlightRanges.sort((a, b) => a.start - b.start)

  // remove any overlapping ranges
  for (let i = 1; i < highlightRanges.length; i++) {
    const prev = highlightRanges[i - 1]
    const cur = highlightRanges[i]!
    if (prev && prev.end > cur.start) {
      highlightRanges[i] = prev
    }
  }
  // apply ranges
  const results: React.ReactNode[] = []
  let offset = 0
  for (const { start, end } of uniq(highlightRanges)) {
    if (start > offset) {
      results.push(textGraphemes.slice(offset, start).join(""))
    }
    results.push(highightFn(textGraphemes.slice(start, end).join("")))

    offset = end
  }
  if (offset < textGraphemes.length) {
    results.push(textGraphemes.slice(offset))
  }
  return React.createElement(React.Fragment, null, ...results)
}
