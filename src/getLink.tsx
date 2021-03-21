/** @jsx jsx */
import { jsx } from "@emotion/react"
import { Link } from "react-router-dom"
import { Database, ID } from "./database"

export function getLink(id: ID, database: Database) {
  const entity = database.records[id]
  return (
    <Link to={`/page/${entity.id}`}>
      {entity.type === "sonnet"
        ? `Sonnet ${entity.num}`
        : entity.type === "quote"
        ? `quote`
        : entity.type === "character"
        ? entity.name
        : entity.type === "play"
        ? entity.title
        : "link"}
    </Link>
  )
}
