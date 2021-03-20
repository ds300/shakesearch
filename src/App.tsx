/** @jsx jsx */
import { jsx } from "@emotion/react"
import { useEffect, useRef, useState } from "react"
import { ProgressBar } from "./Components/ProgressBar"
import { SearchBox } from "./Components/SearchBox"
import { ShowHide } from "./Components/ShowHide"
import { DatabaseProvider, useDatabase } from "./database"
import { FeatherLogo } from "./FeatherLogo"

function App() {
  const initialRenderTime = useRef(Date.now()).current
  const { loadProgress } = useDatabase()
  const [showingProgressBar, setShowingProgressBar] = useState(true)
  const [showingSearchBar, setShowingSearchBar] = useState(false)
  useEffect(() => {
    if (loadProgress === 1) {
      // show load progress for min 1 sec
      const initialDelay = Math.max(0, initialRenderTime + 1000 - Date.now())
      setTimeout(() => setShowingProgressBar(false), initialDelay)
      setTimeout(() => setShowingSearchBar(true), 700 + initialDelay)
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
      <div css={{ height: "20vh", flexShrink: 0 }}></div>
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
        <div
          css={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <ShowHide show={showingSearchBar} enterTransition="slide-from-above">
            <FeatherLogo />
          </ShowHide>
          <ShowHide show={showingSearchBar}>
            <h1 css={{ fontSize: 36 }}>shakesearch</h1>
          </ShowHide>
          <ShowHide show={showingSearchBar} enterTransition="slide-from-below">
            <SearchBox />
          </ShowHide>
        </div>
      </div>
      <div css={{ flex: 1, flexShrink: 1 }}></div>
    </div>
  )
}

export default () => (
  <DatabaseProvider>
    <App />
  </DatabaseProvider>
)
