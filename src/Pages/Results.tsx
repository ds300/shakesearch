/** @jsx jsx */
import { jsx } from "@emotion/react"
import compact from "lodash/compact"
import { parse } from "qs"
import React, { useMemo } from "react"
import { useLocation } from "react-router"
import { FullSearchResult } from "../Components/FullSearchResult"
import { PageWithHeader } from "../Components/PageWithHeader"
import { Toolbar } from "../Components/Toolbar"
import { DBRecord, useDatabase } from "../database"
import { fullTextSearch } from "../fullTextSearch"

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
export const Results: React.FC<{}> = () => {
  const { query } = parse(useLocation().search.slice(1)) as { query: string }
  const hash = (useLocation().hash?.slice(1) || "all") as
    | DBRecord["type"]
    | "all"
  const { lexiconTrie, database } = useDatabase()
  const { results, searchWords } = useMemo(
    () => fullTextSearch(lexiconTrie!, database!, query as string),
    [database, query, lexiconTrie],
  )

  const tabs = compact([
    makeTabConfig("All", "all", results.all.length),
    makeTabConfig("Quotes", "quote", results.quote.length),
    makeTabConfig("Characters", "character", results.character.length),
    makeTabConfig("Sonnets", "sonnet", results.sonnet.length),
    makeTabConfig("Plays", "play", results.play.length),
  ])

  const resultsToDisplay = results[hash]

  return (
    <PageWithHeader>
      <Toolbar
        tabs={tabs}
        activeTabIndex={tabs.findIndex((t) => t.id === hash)}
      />
      {resultsToDisplay.slice(0, 10).map((id) => {
        return <FullSearchResult key={id} id={id} searchTerms={searchWords} />
      })}
    </PageWithHeader>
  )
}
