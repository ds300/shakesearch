/** @jsx jsx */
import { jsx } from "@emotion/react"
import GraphemeSplitter from "grapheme-splitter"
import uniq from "lodash/uniq"
import compact from "lodash/compact"
import { parse } from "qs"
import React, { useMemo } from "react"
import { useLocation } from "react-router"
import { PageWithHeader } from "../Components/PageWithHeader"
import { Toolbar } from "../Components/Toolbar"
import { Character, DBRecord, useDatabase } from "../database"
import { fullTextSearch } from "../fullTextSearch"
import { normalizeText } from "../normalizeText"

const makeTabConfig = (name: string, hash: string, count: number) =>
  count > 0
    ? {
        id: hash,
        name,
        count,
        onClick() {
          window.location.hash = hash
        },
      }
    : undefined
export const Results: React.FC<{}> = () => {
  const { query } = parse(useLocation().search.slice(1)) as { query: string }
  const hash = (useLocation().hash?.slice(1) || "all") as
    | DBRecord["type"]
    | "all"
  const { lexiconTrie, database } = useDatabase()
  const { results, searchWords } = useMemo(
    () => fullTextSearch(lexiconTrie!, database!, query as string),
    [database, query, lexiconTrie],
  )

  const tabs = compact([
    makeTabConfig("All", "all", results.all.length),
    makeTabConfig("Quotes", "quote", results.quote.length),
    makeTabConfig("Characters", "character", results.character.length),
    makeTabConfig("Sonnets", "sonnet", results.sonnet.length),
    makeTabConfig("Plays", "play", results.play.length),
  ])

  console.log({ hash })
  const resultsToDisplay = results[hash]

  return (
    <PageWithHeader>
      <Toolbar
        tabs={tabs}
        activeTabIndex={tabs.findIndex((t) => t.id === hash)}
      />
      Results for {query} at {useLocation().search}
      {resultsToDisplay.slice(0, 10).map((id) => {
        const record = database?.records[id]!
        switch (record.type) {
          case "sonnet":
            return (
              <div key={record.id}>
                Sonnet {record.num}
                <div>{applyHighlight(record.body, searchWords, 50)}</div>
              </div>
            )
          case "quote":
            return (
              <div key={record.id}>
                Quote by{" "}
                {(database?.records[record.character] as Character).name}
                <div>{applyHighlight(record.body, searchWords, 50)}</div>
              </div>
            )
        }
      })}
    </PageWithHeader>
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
        borderRadius: 4,
      }}
    >
      {text}
    </span>
  )
}
