/** @jsx jsx */
import { jsx } from "@emotion/react"
import { parse } from "qs"
import { useLocation } from "react-router"
export const Results: React.FC<{}> = () => {
  const { query } = parse(useLocation().search.slice(1))
  return (
    <div>
      Results for {query} at {useLocation().search}
    </div>
  )
}
