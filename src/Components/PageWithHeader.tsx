/** @jsx jsx */
import { jsx } from "@emotion/react"
import { FeatherLogoSmall } from "../FeatherLogo"
import { SearchBox } from "./SearchBox"

export const PageWithHeader: React.FC<{}> = ({ children }) => {
  return (
    <div
      css={{
        height: "100%",
        overflow: "scroll",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        css={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
          position: "relative",
          maxWidth: 660,
          width: "100vw",
        }}
      >
        <div
          css={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 40,
            paddingBottom: 20,
            position: "relative",
            zIndex: 20000,
          }}
        >
          <div css={{ display: "flex", alignItems: "center" }}>
            <h1 css={{ fontSize: 24, paddingRight: 20 }}>shakesearch</h1>
            <FeatherLogoSmall />
          </div>
          <SearchBox hideResultsWhenNotFocused={true} />
        </div>
        <div
          css={{
            width: "100%",
            paddingBottom: 80,
            position: "relative",
            zIndex: 1,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
