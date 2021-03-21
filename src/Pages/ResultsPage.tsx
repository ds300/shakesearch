/** @jsx jsx */
import { jsx } from "@emotion/react"
import compact from "lodash/compact"
import { parse } from "qs"
import React, { useEffect, useMemo } from "react"
import { useLocation } from "react-router"
import { darkGrey } from "../colors"
import { FullSearchResult } from "../Components/FullSearchResult"
import { PageWithHeader } from "../Components/PageWithHeader"
import { PageNavigation } from "../Components/Pagination"
import { Toolbar } from "../Components/Toolbar"
import { DBRecord, useDatabase } from "../database"
import { fullTextSearch } from "../fullTextSearch"

const RESULTS_PER_PAGE = 10

const makeTabConfig = (name: string, hash: string, count: number) =>
  count > 0
    ? {
        id: hash,
        name,
        count,
        onClick() {
          window.location.hash = hash
        },
      }
    : undefined
export const ResultsPage: React.FC<{}> = () => {
  const { query, page = "1" } = parse(useLocation().search.slice(1)) as {
    query: string
    page: string
  }
  const hash = (useLocation().hash?.slice(1) || "all") as
    | DBRecord["type"]
    | "all"
  const { lexiconTrie, database } = useDatabase()
  const { results, searchWords, originalWords } = useMemo(
    () => fullTextSearch(lexiconTrie!, database!, query as string),
    [database, query, lexiconTrie],
  )

  const tabs = compact([
    makeTabConfig("All", "all", results.all.length),
    makeTabConfig("Quotes", "quote", results.quote.length),
    makeTabConfig("Characters", "character", results.character.length),
    makeTabConfig("Poems", "poem", results.poem.length),
    makeTabConfig("Plays", "play", results.play.length),
  ])

  const resultsToDisplay = results[hash]

  const numPages = Math.ceil(resultsToDisplay.length / RESULTS_PER_PAGE)
  const pageIndex =
    Math.min(Number(page.match(/^\d+$/) ? page : "1"), numPages) - 1

  const resultsPage = resultsToDisplay.slice(
    pageIndex * RESULTS_PER_PAGE,
    (pageIndex + 1) * RESULTS_PER_PAGE,
  )

  const originalSearchString = originalWords.join(" ")
  const actualSearchString = searchWords.join(" ")

  useEffect(() => {
    console.log("scrolling")
    window.scrollTo(0, 0)
  }, [pageIndex])

  return (
    <PageWithHeader>
      <Toolbar
        tabs={tabs}
        activeTabIndex={tabs.findIndex((t) => t.id === hash)}
      />
      {!resultsPage.length && (
        <div>No results found for "{originalSearchString}"</div>
      )}
      {resultsPage.length && originalSearchString !== actualSearchString && (
        <div>
          <div css={{ fontSize: 14, color: darkGrey, marginBottom: 5 }}>
            No results found for "{originalSearchString}"
          </div>
          <div css={{ marginBottom: 10, fontStyle: "italic" }}>
            Showing results for{" "}
            <span css={{ fontWeight: 600, fontStyle: "normal" }}>
              "{actualSearchString}"
            </span>
          </div>
        </div>
      )}
      {resultsPage.slice(0, 10).map((id) => {
        return <FullSearchResult key={id} id={id} searchTerms={searchWords} />
      })}
      <PageNavigation
        pageIndex={pageIndex}
        numPages={numPages}
      ></PageNavigation>
    </PageWithHeader>
  )
}
