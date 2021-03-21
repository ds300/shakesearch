/** @jsx jsx */
import { jsx } from "@emotion/react"
import { useParams } from "react-router"
import { useDatabase } from "../database"
import { CharacterPage } from "./CharacterPage"
import { SonnetPage } from "./SonnetPage"
export const EntityPage: React.FC<{}> = () => {
  const { id } = useParams() as { id: string }

  const database = useDatabase().database

  const entity = database?.records[id]

  switch (entity?.type) {
    case "character":
      return <CharacterPage character={entity} />
    case "sonnet":
      return <SonnetPage sonnet={entity} />
  }
  console.log({ entity })

  return <div>Entity {JSON.stringify(useParams(), null, "  ")}</div>
}
