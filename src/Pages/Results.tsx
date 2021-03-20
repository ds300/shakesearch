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
      {results.results.slice(0, 10).map((id) => {
        const record = database?.records[id]!
        switch (record.type) {
          case "sonnet":
            return (
              <div key={record.id}>
                Sonnet {record.num}
                <div>
                  {applyHighlight(record.body, results.searchWords, 50)}
                </div>
              </div>
            )
          case "quote":
            return (
              <div key={record.id}>
                Quote by{" "}
                {(database?.records[record.character] as Character).name}
                <div>
                  {applyHighlight(record.body, results.searchWords, 50)}
                </div>
              </div>
            )
        }
      })}
    </div>
  )
}

const splitter = new GraphemeSplitter()

interface Range {
  start: number
  end: number
}
interface ContextRange extends Range {
  highlightRanges: Range[]
}

function applyHighlight(
  text: string,
  highlights: string[],
  truncateContext?: number,
): React.ReactNode {
  const textGraphemes = splitter.splitGraphemes(text)
  let highlightRanges: Range[] = []

  nextHighlight: for (const highlight of highlights.map((h) =>
    splitter.splitGraphemes(h),
  )) {
    nextTextOffset: for (let i = 0; i < textGraphemes.length; i++) {
      nextHighlightChar: for (let j = 0; j < highlight.length; j++) {
        if (i + j >= textGraphemes.length) {
          continue nextHighlight
        }
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

  highlightRanges = uniq(highlightRanges)
  if (!highlightRanges.length) {
    // no highlight ranges so just return the start of the string,
    // or the full thing of no context
    return truncateContext
      ? textGraphemes.slice(0, truncateContext * 2).join("")
      : text
  }

  const contextRanges: ContextRange[] = []
  if (truncateContext) {
    let nextContextRange = null as ContextRange | null
    for (const highlightRange of highlightRanges) {
      const start = Math.max(highlightRange.start - truncateContext, 0)
      const end = Math.min(
        highlightRange.end + truncateContext,
        textGraphemes.length,
      )
      if (nextContextRange) {
        if (nextContextRange.end < start) {
          contextRanges.push(nextContextRange)
          nextContextRange = { start, end, highlightRanges: [highlightRange] }
        } else {
          // extend previous range
          nextContextRange.end = end
          nextContextRange.highlightRanges.push(highlightRange)
        }
      } else {
        nextContextRange = { start, end, highlightRanges: [highlightRange] }
      }
    }
    contextRanges.push(nextContextRange!)
  } else {
    contextRanges.push({ start: 0, end: textGraphemes.length, highlightRanges })
  }

  // apply ranges
  const results: React.ReactNode[] = []
  for (const contextRange of contextRanges) {
    let offset = contextRange.start
    if (contextRange.start !== 0) {
      results.push(" ...")
    }
    for (const highlightRange of contextRange.highlightRanges) {
      if (highlightRange.start > offset) {
        results.push(textGraphemes.slice(offset, highlightRange.start).join(""))
      }

      results.push(
        highlightText(
          textGraphemes
            .slice(highlightRange.start, highlightRange.end)
            .join(""),
        ),
      )

      offset = highlightRange.end
    }
    if (offset < contextRange.end) {
      results.push(textGraphemes.slice(offset, contextRange.end).join(""))
    }

    if (contextRange.end !== textGraphemes.length) {
      results.push("... ")
    }
  }
  return React.createElement(React.Fragment, null, ...results)
}

function highlightText(text: string) {
  return (
    <span
      css={{
        fontWeight: 600,
        backgroundColor: "rgb(255, 242, 213)",
        paddingLeft: 2,
        paddingRight: 2,
        borderRadius: 4,
      }}
    >
      {text}
    </span>
  )
}
