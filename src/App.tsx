/** @jsx jsx */
import { jsx } from "@emotion/react"
import { useRef, useState } from "react"
import { FeatherLogo } from "./FeatherLogo"
import { SearchIcon } from "./SearchIcon"

const lightGrey = "#DFDFDF"
const darkGrey = "#686868"

function App() {
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
        <FeatherLogo />
        <h1 css={{ fontSize: 36 }}>shakesearch</h1>
        <SearchBox></SearchBox>
      </div>
      <div css={{ flex: 2.5 }}></div>
    </div>
  )
}

const SearchBox: React.FC<{}> = ({}) => {
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
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
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
