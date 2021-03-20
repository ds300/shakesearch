/** @jsx jsx */
import { jsx } from "@emotion/react"
import React, { useRef, useState } from "react"
import { darkGrey, lightGrey } from "../colors"
import { useDatabase } from "../database"
import { SearchIcon } from "../Icons/SearchIcon"
import { XIcon } from "../Icons/XIcon"
import { normalizeText } from "../normalizeText"
import { fuzzySearch } from "../trie"
import { QuickSearchResult } from "./QuickSearchResult"
import { ShowHide } from "./ShowHide"
import { Spacer } from "./Spacer"

export const SearchBox: React.FC = () => {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { entityTrie } = useDatabase()
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const isRaised = isFocused || searchResults.length > 0
  const [activeSearchResultIndex, setActiveSearchResultIndex] = useState(-1)
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
          onInput={async (e) => {
            const query = e.currentTarget.value.trim()
            setQuery(query)
            setActiveSearchResultIndex(-1)
            if (query.length >= 1) {
              const ids = fuzzySearch(entityTrie!, normalizeText(query), 1, 4)
              setSearchResults(ids)
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
