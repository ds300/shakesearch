/** @jsx jsx */
import { jsx } from "@emotion/react"
import GraphemeSplitter from "grapheme-splitter"
import React from "react"
import { superLightGrey } from "../colors"
import { Database, DBRecord, ID, Play, useDatabase } from "../database"
import { CharacterIcon } from "../Icons/CharacterIcon"
import { SearchIcon } from "../Icons/SearchIcon"
import { SonnetIcon } from "../Icons/SonnetIcon"
import { TheaterIcon } from "../Icons/TheaterIcon"
import { normalizeText } from "../normalizeText"

type QuickSearchEntity =
  | Exclude<DBRecord, { type: "quote" }>
  | { type: "query" }

export const QuickSearchResult: React.FC<{
  active?: boolean
  onHover(): void
  onClick(): void
  entityID?: ID
  query: string
}> = ({ active, onHover, entityID, query, onClick }) => {
  const database = useDatabase().database!
  const entity: QuickSearchEntity = entityID
    ? (database?.records[entityID]! as QuickSearchEntity)
    : { type: "query" }
  const icon = getIcon(entity)
  const label = getLabel({ entity, query, database })
  return (
    <div
      onMouseEnter={onHover}
      onClick={onClick}
      css={{
        display: "flex",
        paddingLeft: 20,
        paddingright: 20,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: active ? superLightGrey : undefined,
        cursor: "pointer",
      }}
    >
      <div css={{ flexBasis: 33, flexShrink: 0 }}>{icon}</div>
      <div css={{ fontSize: 16, fontWeight: 300 }}>{label}</div>
    </div>
  )
}

declare function assertNever(val: never): void

function getIcon(entity: QuickSearchEntity) {
  switch (entity.type) {
    case "query":
      return <SearchIcon />
    case "character":
      return <CharacterIcon />
    case "play":
      return <TheaterIcon />
    case "sonnet":
      return <SonnetIcon />
    default:
      assertNever(entity)
  }
}

function getLabel({
  entity,
  query,
  database,
}: {
  entity: QuickSearchEntity
  query: string
  database: Database
}) {
  switch (entity.type) {
    case "query":
      return <div>“{<span css={{ fontWeight: 500 }}>{query}</span>}”</div>
    case "character":
      return (
        <div>
          <div css={{ paddingBottom: 5 }}>
            {applyHighlight(entity.name, query)}
          </div>
          <div css={{ fontSize: 13 }}>
            {(database.records[entity.play] as Play).title}
          </div>
        </div>
      )
    case "play":
      return (
        <div style={{ paddingTop: 2 }}>
          {applyHighlight(entity.title, query)}
        </div>
      )
    case "sonnet":
      return applyHighlight(`Sonnet ${entity.num}`, query)
    default:
      assertNever(entity)
  }
}

const splitter = new GraphemeSplitter()

function applyHighlight(displayLabel: string, highlight: string | undefined) {
  // If highlight is not supplied then use medium weight, since the search result
  // is being rendered in a context that doesn't support highlights
  if (highlight === undefined || !highlight.trim()) {
    return <React.Fragment>{displayLabel}</React.Fragment>
  }
  // search for `highlight` in `displayLabel` but ignore diacritics in `displayLabel`
  // so that a user can type, e.g. `Miro` and see `Miró` highlighted
  const labelGraphemes = splitter.splitGraphemes(displayLabel)
  const highlightGraphemes = splitter.splitGraphemes(highlight)
  let result: [string, string, string] | null = null
  outerLoop: for (let i = 0; i < labelGraphemes.length; i++) {
    innerLoop: for (let j = 0; j < highlightGraphemes.length; j++) {
      if (i + j >= labelGraphemes.length) {
        continue outerLoop
      }
      const labelGrapheme = normalizeText(labelGraphemes[i + j])
      const highlightGrapheme = normalizeText(highlightGraphemes[j])
      if (labelGrapheme === highlightGrapheme) {
        // might be a match, continue to see for sure
        continue innerLoop
      } else {
        // not a match so go on to the next grapheme in the label
        continue outerLoop
      }
    }
    // innerloop eneded naturally so there was a match
    result = [
      labelGraphemes.slice(0, i).join(""),
      labelGraphemes.slice(i, i + highlightGraphemes.length).join(""),
      labelGraphemes.slice(i + highlightGraphemes.length).join(""),
    ]
    break outerLoop
  }
  if (!result) {
    return <React.Fragment>{displayLabel}</React.Fragment>
  }
  return (
    <React.Fragment>
      {result[0]}
      <span css={{ fontWeight: 600, color: "black" }}>{result[1]}</span>
      {result[2]}
    </React.Fragment>
  )
}
