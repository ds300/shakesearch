/** @jsx jsx */
import { jsx } from "@emotion/react"
import { Character, Play, Sonnet, useDatabase } from "./database"
import React from "react"
import GraphemeSplitter from "grapheme-splitter"
import { normalizeText } from "./normalizeText"
import { highlightBlue, superLightGrey } from "./colors"

const SearchResult: React.FC<{ icon: React.ReactNode }> = ({
  icon,
  children,
}) => {
  return (
    <div
      css={{
        display: "flex",
        paddingLeft: 20,
        paddingright: 20,
        paddingTop: 10,
        paddingBottom: 10,
        ":hover": {
          backgroundColor: superLightGrey,
          cursor: "pointer",
        },
      }}
    >
      <div css={{ flexBasis: 33, flexShrink: 0 }}>{icon}</div>
      <div css={{ fontSize: 16, fontWeight: 300 }}>{children}</div>
    </div>
  )
}

export const CharacterSearchResult: React.FC<{
  character: Character
  query: string
}> = ({ character, query }) => {
  const { database } = useDatabase()

  const play = database?.records[character.play] as Play

  return (
    <SearchResult
      icon={
        <svg
          width="15"
          height="16"
          viewBox="0 0 15 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          css={{ position: "relative", top: 2 }}
        >
          <circle cx="7.87549" cy="4" r="3.5" stroke="black" />
          <mask id="path-2-inside-1" fill="white">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.775146 13.1988C1.34693 9.79414 4.30821 7.2 7.8754 7.2C11.4428 7.2 14.4042 9.79444 14.9757 13.1994C13.1171 14.9366 10.6206 16 7.87576 16C5.1306 16 2.63387 14.9364 0.775146 13.1988Z"
            />
          </mask>
          <path
            d="M0.775146 13.1988L-0.211043 13.0332L-0.299964 13.5627L0.0922445 13.9293L0.775146 13.1988ZM14.9757 13.1994L15.6586 13.93L16.0508 13.5634L15.9619 13.0339L14.9757 13.1994ZM1.76134 13.3644C2.25357 10.4334 4.80465 8.2 7.8754 8.2V6.2C3.81178 6.2 0.440277 9.15489 -0.211043 13.0332L1.76134 13.3644ZM7.8754 8.2C10.9463 8.2 13.4975 10.4336 13.9895 13.3649L15.9619 13.0339C15.3109 9.15523 11.9392 6.2 7.8754 6.2V8.2ZM14.2929 12.4688C12.6121 14.0398 10.3572 15 7.87576 15V17C10.884 17 13.6221 15.8335 15.6586 13.93L14.2929 12.4688ZM7.87576 15C5.39406 15 3.13889 14.0396 1.45805 12.4683L0.0922445 13.9293C2.12884 15.8332 4.86715 17 7.87576 17V15Z"
            fill="black"
            mask="url(#path-2-inside-1)"
          />
        </svg>
      }
    >
      <div css={{ paddingBottom: 5 }}>
        {applyHighlight(character.name, query)}
      </div>
      <div css={{ fontSize: 13 }}>{play.title}</div>
    </SearchResult>
  )
}

export const PlaySearchResult: React.FC<{ play: Play; query: string }> = ({
  play,
  query,
}) => {
  return (
    <SearchResult
      icon={
        <svg
          width="23"
          height="22"
          viewBox="0 0 23 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          css={{
            position: "relative",
            left: -3,
          }}
        >
          <path
            d="M4.12918 12.6528C2.30497 10.5956 1.14845 3.90402 1.14845 3.90402C5.7412 4.78072 7.96003 4.18708 11.8379 1.03979C11.8379 1.03979 14.1822 7.4131 13.6309 10.1068C13.0797 12.8005 10.3121 16.7245 10.3121 16.7245C10.3121 16.7245 5.95339 14.71 4.12918 12.6528Z"
            fill="white"
            stroke="black"
          />
          <path d="M4.79688 8.01836L6.63669 6.57064" stroke="black" />
          <path d="M8.71509 6.01375L10.7353 6.42716" stroke="black" />
          <path
            d="M8.40283 9.59817C7.21511 9.91642 6.39158 11.1979 6.12828 11.7989L11.1761 10.4463C10.7465 10.031 9.59055 9.27993 8.40283 9.59817Z"
            stroke="black"
          />
          <path
            d="M8.5825 11.8004C8.46927 9.05328 11.8028 3.13701 11.8028 3.13701C14.8075 6.71941 16.9021 7.6619 21.8964 7.67426C21.8964 7.67426 19.6844 14.0947 17.5546 15.8336C15.4248 17.5724 10.7999 18.8638 10.7999 18.8638C10.7999 18.8638 8.69574 14.5476 8.5825 11.8004Z"
            fill="white"
            stroke="black"
          />
          <path d="M12.0764 8.32231L14.3228 8.98149" stroke="black" />
          <path d="M16.1665 9.72588L17.8028 10.9809" stroke="black" />
          <path
            d="M12.6613 14.242C13.7262 14.8568 15.4535 14.3793 16.0647 14.1405C13.8598 13.4793 12.9055 12.7335 11.4537 11.0665C11.4637 11.6639 11.5964 13.6272 12.6613 14.242Z"
            stroke="black"
          />
        </svg>
      }
    >
      <div style={{ paddingTop: 2 }}>{applyHighlight(play.title, query)}</div>
    </SearchResult>
  )
}

export const SonnetSearchResult: React.FC<{
  sonnet: Sonnet
  query: string
}> = ({ sonnet, query }) => {
  return (
    <SearchResult
      icon={
        <svg
          width="15"
          height="21"
          viewBox="0 0 15 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.95044 16.8015L3.78387 17.2066C3.78387 16.7388 3.91349 16.1359 4.17273 15.9437M4.46568 5.05165C4.35074 4.25484 4.04008 3.59902 3.39502 3.43099C2.55153 3.21127 1.45074 3.83616 1.06189 5.86198C0.75788 7.44577 1.64224 8.039 2.22846 7.83527M4.46568 5.05165L2.61731 5.86198C2.61731 5.86198 2.9284 6.83438 2.61731 7.48265C2.55218 7.61837 2.45433 7.71999 2.33836 7.78562M4.46568 5.05165C4.54667 5.61306 4.5305 6.24447 4.46568 6.82457M3.78387 19.8974C3.25602 20.1213 2.43417 20.0663 1.83961 18.8273C1.21744 17.5307 3.13578 11.2642 4.17273 8.29298C4.2867 7.93673 4.40067 7.40646 4.46568 6.82457M3.78387 19.8974C3.94646 19.8284 4.08116 19.733 4.17273 19.6376C4.56158 19.2324 5.72814 17.6118 4.95044 16.3963C4.72537 16.0445 4.53287 15.8964 4.37294 15.8831M3.78387 19.8974L13.5 16.5C13.7592 15.8247 14.6222 14.1483 14 13.5C13.3778 12.8517 12.6656 13.2045 11.4991 13.5601M11.4991 13.5601C10.3325 13.9157 5.47752 15.5477 4.37294 15.8831M11.4991 13.5601C12.1471 11.3992 13.21 7.72575 13.8322 5.45682C14.4543 3.18789 13.1841 1.27011 12.6656 1L3.00617 3.43099M4.37294 15.8831C4.2993 15.8769 4.23256 15.8994 4.17273 15.9437M4.37294 15.8831C4.24414 15.9222 4.17273 15.9437 4.17273 15.9437M2.33836 7.78562C2.30325 7.80548 2.26648 7.82205 2.22846 7.83527M2.33836 7.78562L2.22846 7.83527M2.33836 7.78562L4.46568 6.82457"
            stroke="black"
          />
          <path
            d="M7 7L12 5.5M6 10L11 8.5M5 13L10 11.5"
            stroke="black"
            strokeWidth="0.5"
          />
        </svg>
      }
    >
      {applyHighlight(`Sonnet ${sonnet.num}`, query)}
    </SearchResult>
  )
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
      <span css={{ fontWeight: 600, color: highlightBlue }}>{result[1]}</span>
      {result[2]}
    </React.Fragment>
  )
}
