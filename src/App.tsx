/** @jsx jsx */
import { jsx } from "@emotion/react"
import { useEffect, useRef, useState } from "react"
import { FeatherLogo } from "./FeatherLogo"
import { SearchIcon } from "./SearchIcon"
import {
  createIndex,
  Database,
  DatabaseProvider,
  DBRecord,
  useDatabase,
} from "./database"
import { ShowHide } from "./Components/ShowHide"
import { ProgressBar } from "./Components/ProgressBar"
import { fuzzySearch, Trie } from "./trie"
import { normalizeText } from "./normalizeText"
import React from "react"
import {
  CharacterSearchResult,
  PlaySearchResult,
  SonnetSearchResult,
} from "./searchResults"

const lightGrey = "#DFDFDF"
const darkGrey = "#686868"

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
      <div css={{ flex: 0, flexBasis: "20vh" }}></div>
      <div
        css={{
          flex: 1,
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
      <div css={{ flex: 2.5, flexShrink: 1 }}></div>
    </div>
  )
}

const SearchBox: React.FC = () => {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { database, entityTrie } = useDatabase()
  const [searchResults, setSearchResults] = useState<DBRecord[]>([])
  const [query, setQuery] = useState("")
  return (
    <div
      css={{
        position: "relative",
        borderRadius: 45 / 2,
        border: `1px solid ${lightGrey}`,
        width: 360,
        display: "flex",
        flexDirection: "column",
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: searchResults.length ? 20 : 0,
        transform: isFocused ? "translateY(-1px)" : undefined,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        boxShadow: isFocused ? "0px 3px 10px 0px rgba(0,0,0,0.1)" : undefined,
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <div
        css={{
          display: "flex",
          height: 45,
          width: "100%",
          cursor: "text",
          alignItems: "center",
          // transform: searchResults.length ? "translateY(3px)" : undefined,
          // transition: "transform 1s ease",
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
      {searchResults.map((r) => {
        switch (r.type) {
          case "character":
            return <CharacterSearchResult character={r} />
          case "play":
            return <PlaySearchResult play={r} />
          case "sonnet":
            return <SonnetSearchResult sonnet={r} />
        }
      })}
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
