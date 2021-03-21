/** @jsx jsx */
import { jsx } from "@emotion/react"
import { useEffect, useState } from "react"
import { SearchBox } from "../Components/SearchBox"
import { ShowHide } from "../Components/ShowHide"
import { FeatherLogo } from "../FeatherLogo"

export function Home() {
  const [didMount, setDidMount] = useState(false)
  useEffect(() => {
    setTimeout(() => setDidMount(true), 100)
  }, [])

  return (
    <div
      css={{
        display: "flex",
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
        <div
          css={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <ShowHide show={didMount} enterTransition="slide-from-above">
            <FeatherLogo />
          </ShowHide>
          <ShowHide show={didMount}>
            <h1 css={{ fontSize: 36 }}>shakesearch</h1>
          </ShowHide>
          <ShowHide show={didMount} enterTransition="slide-from-below">
            <SearchBox />
          </ShowHide>
        </div>
      </div>
      <div css={{ flex: 1, flexShrink: 1 }}></div>
    </div>
  )
}
