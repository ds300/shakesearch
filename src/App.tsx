/** @jsx jsx */
import { jsx } from "@emotion/react"
import { useEffect, useRef, useState } from "react"
import { FeatherLogo } from "./FeatherLogo"
import { SearchIcon } from "./SearchIcon"
import { DatabaseProvider, DBRecord, useDatabase } from "./database"
import { ShowHide } from "./Components/ShowHide"
import { ProgressBar } from "./Components/ProgressBar"
import { fuzzySearch } from "./trie"
import { normalizeText } from "./normalizeText"
import React from "react"
import {
  CharacterSearchResult,
  PlaySearchResult,
  SonnetSearchResult,
} from "./searchResults"
import { darkGrey, lightGrey } from "./colors"

function App() {
  const { loadProgress } = useDatabase()
  const [showingProgressBar, setShowingProgressBar] = useState(true)
  const [showingSearchBar, setShowingSearchBar] = useState(false)
  useEffect(() => {
    if (loadProgress === 1) {
      setShowingProgressBar(false)
      setTimeout(() => setShowingSearchBar(true), 700)
    }
  }, [loadProgress])
  return (
    <div
      css={{
        display: "flex",
        height: "100%",
        flexDirection: "column",
      }}
    >
      <div css={{ height: "20vh" }}></div>
      <div
        css={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div css={{ position: "absolute" }}>
          <ShowHide show={showingProgressBar}>
            <div
              css={{ textAlign: "center", paddingTop: 30, paddingBottom: 20 }}
            >
              Creating search index...
            </div>
            <ProgressBar percentComplete={loadProgress * 100} />
          </ShowHide>
        </div>
        <ShowHide show={showingSearchBar} translate>
          <div
            css={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <FeatherLogo />
            <h1 css={{ fontSize: 36 }}>shakesearch</h1>
            <SearchBox />
          </div>
        </ShowHide>
      </div>
      <div css={{ flex: 1, flexShrink: 1 }}></div>
    </div>
  )
}

const SearchBox: React.FC = () => {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { database, entityTrie } = useDatabase()
  const [searchResults, setSearchResults] = useState<DBRecord[]>([])
  const [query, setQuery] = useState("")
  const isRaised = isFocused || searchResults.length > 0
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
            if (query.length >= 1) {
              const ids = fuzzySearch(entityTrie!, normalizeText(query), 1, 4)
              const entities = ids.map((id) => database?.records[id]!)
              setSearchResults(entities)
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
            }}
          />
        </ShowHide>
      </div>
      <div
        css={{
          height: 1,
          position: "absolute",
          top: 45,
          left: 20,
          right: 20,
          backgroundColor: lightGrey,
          opacity: searchResults.length ? 0.5 : 0,
        }}
      ></div>
      {searchResults.length > 0 && (
        <div css={{ paddingTop: 10, paddingBottom: 10 }}>
          {searchResults.map((r) => {
            switch (r.type) {
              case "character":
                return (
                  <CharacterSearchResult
                    key={r.id}
                    character={r}
                    query={query}
                  />
                )
              case "play":
                return <PlaySearchResult key={r.id} play={r} query={query} />
              case "sonnet":
                return (
                  <SonnetSearchResult key={r.id} sonnet={r} query={query} />
                )
            }
          })}
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
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M1.00024 1L13.0001 12.9999" stroke="#686868" />
        <path d="M12.9998 1L0.999875 12.9999" stroke="#686868" />
      </svg>
    </div>
  )
}

const Spacer: React.FC<{ size?: number }> = ({ size = 20 }) => {
  return <div css={{ width: size, height: size }}></div>
}

export default () => (
  <DatabaseProvider>
    <App />
  </DatabaseProvider>
)
