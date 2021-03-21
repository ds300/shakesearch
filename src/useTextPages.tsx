/** @jsx jsx */
import { jsx } from "@emotion/react"
import { parse } from "qs"
import { useEffect, useMemo } from "react"
import { useLocation } from "react-router-dom"
import { highlightBlue } from "./colors"
import { PageNavigation } from "./Components/Pagination"

export function useTextPages(text: string, startLine?: number) {
  const location = useLocation()
  const { page = "1" } = parse(location.search.slice(1)) as {
    page: string
  }

  const hashLine =
    (location.hash?.match(/#\d+/) && Number(location.hash.slice(1))) || null

  const startingLine = Number(hashLine ?? startLine)

  const lines = useMemo(() => text.split("\n"), [text])
  const pages = useMemo(() => {
    const result: { start: number; lines: string[] }[] = []
    let page = {
      start: 0,
      lines: [] as string[],
    }
    for (let i = 0; i < lines.length; i++) {
      if (page.lines.length < 100) {
        page.lines.push(lines[i])
      } else if (
        (lines[i].trim() === "" && !lines[i - 1]?.match(/^[A-Z]+/)) ||
        i > 150
      ) {
        result.push(page)
        page = {
          start: i,
          lines: [],
        }
      } else {
        page.lines.push(lines[i])
      }
    }
    if (page.lines.length > 0) {
      result.push(page)
    }

    return result
  }, [lines])

  const numPages = pages.length
  const pageIndex = startingLine
    ? pages.findIndex((p) => startingLine < p.start + p.lines.length)
    : Math.max(Math.min(Number(page) - 1, numPages - 1), 0)

  useEffect(() => {
    console.log({ pageIndex, startingLine })
    if (startingLine) {
      const anchor = document.getElementById(`${startingLine}`)
      console.log({ anchor })
      window.scrollTo({
        top: document.getElementById(`${startingLine}`)?.offsetTop,
      })
    } else {
      window.scrollTo({ top: 0, left: 0 })
    }
  }, [pageIndex, startingLine])

  return useMemo(
    () => (
      <div>
        {pages[pageIndex].lines.map((line, i) => {
          const lineIndex = pages[pageIndex].start + i
          return (
            <div
              key={i}
              id={lineIndex.toString()}
              css={{ marginBottom: 7, minHeight: 10, position: "relative" }}
            >
              {line}
              {lineIndex === startingLine - 1 && <Mark />}
            </div>
          )
        })}
        <PageNavigation numPages={numPages} pageIndex={pageIndex} />
      </div>
    ),
    [pages, pageIndex, startingLine],
  )
}

const Mark: React.FC<{}> = ({}) => {
  return (
    <div
      css={{
        width: 5,
        height: "100%",
        backgroundColor: highlightBlue,
        position: "absolute",
        left: -15,
        borderRadius: 2.5,
        top: 0,
      }}
    ></div>
  )
}
