/** @jsx jsx */
import { jsx } from "@emotion/react"
import GraphemeSplitter from "grapheme-splitter"
import uniq from "lodash/uniq"
import React from "react"
import { Link, useHistory } from "react-router-dom"
import { superLightGrey } from "../colors"

import { Database, DBRecord, ID, useDatabase } from "../database"
import { CharacterIcon } from "../Icons/CharacterIcon"
import { QuoteIcon } from "../Icons/QuoteIcon"
import { SonnetIcon } from "../Icons/SonnetIcon"
import { TheaterIcon } from "../Icons/TheaterIcon"
import { normalizeText } from "../normalizeText"

export const FullSearchResult: React.FC<{ id: ID; searchTerms: string[] }> = ({
  id,
  searchTerms,
}) => {
  const history = useHistory()
  const database = useDatabase().database!
  const entity = database.records[id]!
  const { icon, label, body } = getDetails(entity, searchTerms, database)
  return (
    <div
      onClick={(ev) => {
        if ((ev.target as HTMLElement).tagName !== "A") {
          history.push(`/page/${id}`)
        }
      }}
      css={{
        ":hover": {
          backgroundColor: superLightGrey,
        },
        cursor: "pointer",
        paddingTop: 15,
        paddingBottom: 15,
        borderRadius: 6,
        marginLeft: -10,
        marginRight: -10,
        paddingLeft: 10,
        paddingRight: 10,
      }}
    >
      <div
        css={{
          display: "flex",
          paddingBottom: body ? 10 : 0,
        }}
      >
        <div css={{ flexBasis: 30, flexShrink: 0 }}>{icon}</div>
        <div css={{ fontSize: 16, fontWeight: 300 }}>{label}</div>
      </div>
      {body}
    </div>
  )
}

const getDetails = (
  entity: DBRecord,
  searchTerms: string[],
  database: Database,
): {
  label: React.ReactNode
  body: React.ReactNode
  icon: React.ReactNode
} => {
  switch (entity.type) {
    case "quote":
      return {
        icon: <QuoteIcon />,
        label: (
          <div>
            {getLink(entity.character, database)} in{" "}
            {getLink(entity.play, database)}
          </div>
        ),
        body: applyHighlight(entity.body, searchTerms, 45),
      }
    case "character":
      return {
        icon: <CharacterIcon />,
        label: getLink(entity.id, database),
        body: <div>Character in {getLink(entity.play, database)}</div>,
      }
    case "play":
      return {
        icon: <TheaterIcon />,
        label: getLink(entity.id, database),
        body: null,
      }
    case "sonnet":
      return {
        icon: <SonnetIcon />,
        label: getLink(entity.id, database),
        body: applyHighlight(entity.body, searchTerms, 45),
      }
  }
}

function getLink(id: ID, database: Database) {
  const entity = database.records[id]
  return (
    <Link to={`/page/${entity.id}`}>
      {entity.type === "sonnet"
        ? `Sonnet ${entity.num}`
        : entity.type === "quote"
        ? `quote`
        : entity.type === "character"
        ? entity.name
        : entity.type === "play"
        ? entity.title
        : "link"}
    </Link>
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
