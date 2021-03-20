/** @jsx jsx */
import { jsx } from "@emotion/react"
import React, { useRef, useState } from "react"
import { darkGrey, lightGrey } from "../colors"
import { DBRecord, ID, useDatabase } from "../database"
import { SearchIcon } from "../Icons/SearchIcon"
import { XIcon } from "../Icons/XIcon"
import { normalizeText } from "../normalizeText"
import { fuzzySearch } from "../trie"
import { QuickSearchResult } from "./QuickSearchResult"
import { ShowHide } from "./ShowHide"
import { Spacer } from "./Spacer"
import * as levenshtein from "fast-levenshtein"

export const SearchBox: React.FC = () => {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { entityTrie, database } = useDatabase()
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const isRaised = isFocused || searchResults.length > 0
  const [activeSearchResultIndex, setActiveSearchResultIndex] = useState(-1)
  const searchResultComparator = (query: string, a: ID, b: ID) => {
    const labelA = getSearchResultName(database?.records[a]!)
    const labelB = getSearchResultName(database?.records[b]!)
    const labelAPrefixMatch = labelA.startsWith(query)
    const labelBPrefixMatch = labelB.startsWith(query)
    if (labelAPrefixMatch && !labelBPrefixMatch) {
      return -1
    }
    if (!labelAPrefixMatch && labelBPrefixMatch) {
      return 1
    }
    const exactMatchA = labelA.includes(query)
    const exactMatchB = labelB.includes(query)
    if (exactMatchA && !exactMatchB) {
      return -1
    }
    if (!exactMatchA && exactMatchB) {
      return 1
    }
    const labelADist = levenshtein.get(labelA, query)
    const labelBDist = levenshtein.get(labelB, query)
    return labelADist - labelBDist
  }
  return (
    <div
      css={{
        position: "relative",
        borderRadius: 45 / 2,
        border: `1px solid ${lightGrey}`,
        width: 360,
        display: "flex",
        flexDirection: "column",
        transform: isRaised ? "translateY(-1px)" : undefined,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        boxShadow: isRaised ? "0px 3px 10px 0px rgba(0,0,0,0.1)" : undefined,
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <div
        css={{
          display: "flex",
          height: 45,
          paddingLeft: 20,
          paddingRight: 20,
          cursor: "text",
          alignItems: "center",
        }}
      >
        <SearchIcon />
        <Spacer size={15} />
        <input
          ref={inputRef}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setActiveSearchResultIndex((i) =>
                Math.min(i + 1, searchResults.length - 1),
              )
            } else if (e.key === "ArrowUp") {
              e.preventDefault()
              setActiveSearchResultIndex((i) => Math.max(i - 1, -1))
            } else if (e.key === "Enter") {
              alert("enter! " + activeSearchResultIndex)
            }
          }}
          onInput={async (e) => {
            const query = e.currentTarget.value.trim()
            setQuery(query)
            setActiveSearchResultIndex(-1)
            if (query.length >= 1) {
              const ids = fuzzySearch(entityTrie!, normalizeText(query), 1, 16)
              ids.sort(searchResultComparator.bind(null, normalizeText(query)))
              setSearchResults(ids.slice(0, 3))
            } else {
              setSearchResults([])
            }
          }}
          css={{
            outline: "none",
            border: "none",
            flex: 1,
            fontSize: 16,
            "::placeholder": {
              color: darkGrey,
              fontWeight: 300,
            },
            fontWeight: 400,
          }}
          placeholder="Search for characters, quotes, etc..."
        />

        <ShowHide show={Boolean(query)}>
          <ClearButton
            onClick={() => {
              inputRef.current!.value = ""
              setQuery("")
              setSearchResults([])
              setActiveSearchResultIndex(-1)
            }}
          />
        </ShowHide>
      </div>
      {searchResults.length > 0 && (
        <div css={{ paddingBottom: 10 }}>
          <QuickSearchResult
            query={query}
            active={activeSearchResultIndex === -1}
            onHover={() => setActiveSearchResultIndex(-1)}
          />
          {searchResults.map((id, i) => (
            <QuickSearchResult
              key={id}
              entityID={id}
              query={query}
              active={activeSearchResultIndex === i}
              onHover={() => setActiveSearchResultIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const getSearchResultName = (record: DBRecord) => {
  switch (record.type) {
    case "play":
      return normalizeText(record.title)
    case "character":
      return normalizeText(record.name)
    case "sonnet":
      return "sonnet " + record.num
    default:
      return ""
  }
}

const ClearButton: React.FC<{ onClick(): void }> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      css={{
        padding: 5,
        position: "relative",
        top: 1,
        right: -5,
        cursor: "pointer",
      }}
    >
      <XIcon />
    </div>
  )
}
