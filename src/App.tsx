/** @jsx jsx */
import { jsx } from "@emotion/react"
import { useEffect, useRef, useState } from "react"
import { FeatherLogo } from "./FeatherLogo"
import { SearchIcon } from "./SearchIcon"
import { createIndex, Database } from "./database"
import { ShowHide } from "./Components/ShowHide"
import { ProgressBar } from "./Components/ProgressBar"
import { findExact, fuzzySearch, Trie } from "./trie"
import { normalizeText } from "./normalizeText"

const lightGrey = "#DFDFDF"
const darkGrey = "#686868"

function App() {
  const [loadProgress, setLoadProgress] = useState(0)
  const [showingProgressBar, setShowingProgressBar] = useState(true)
  const [showingSearchBar, setShowingSearchBar] = useState(false)
  const searchIndex = useRef<Trie>()
  const databaseLookup = useRef<Database>()
  useEffect(() => {
    createIndex(setLoadProgress).then((index) => {
      setShowingProgressBar(false)
      setTimeout(() => setShowingSearchBar(true), 700)
      searchIndex.current = index.entityTrie
      databaseLookup.current = index.database
    })
  }, [])
  return (
    <div
      css={{
        display: "flex",
        height: "100%",
        flexDirection: "column",
      }}
    >
      <div css={{ flex: 1 }}></div>
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
            <SearchBox
              onSearch={(q) => {
                if (q.trim().length > 2) {
                  const results = fuzzySearch(
                    searchIndex.current!,
                    normalizeText(q.trim()),
                    0,
                    6,
                  )
                  console.log(
                    results?.map((v) => databaseLookup.current?.records[v]),
                  )
                }
              }}
            ></SearchBox>
          </div>
        </ShowHide>
      </div>
      <div css={{ flex: 2.5 }}></div>
    </div>
  )
}

const SearchBox: React.FC<{ onSearch(query: string): void }> = ({
  onSearch,
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div
      css={{
        height: 45,
        borderRadius: 45 / 2,
        border: `1px solid ${lightGrey}`,
        width: 360,
        display: "flex",
        alignItems: "center",
        paddingLeft: 20,
        paddingRight: 20,
        transform: isFocused ? "translateY(-1px)" : undefined,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        boxShadow: isFocused ? "0px 3px 10px 0px rgba(0,0,0,0.1)" : undefined,
        cursor: "text",
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <SearchIcon />
      <Spacer size={15} />
      <input
        ref={inputRef}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onInput={async (e) => {
          onSearch(e.currentTarget.value)
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
  )
}

const Spacer: React.FC<{ size?: number }> = ({ size = 20 }) => {
  return <div css={{ width: size, height: size }}></div>
}

export default App
