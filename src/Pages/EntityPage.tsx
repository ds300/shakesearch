/** @jsx jsx */
import { jsx } from "@emotion/react"
import { useParams } from "react-router"
import { Play, useDatabase } from "../database"
import { CharacterPage } from "./CharacterPage"
import { PlayPage } from "./PlayPage"
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
    case "play":
      return <PlayPage play={entity} />
    case "quote":
      return <PlayPage play={database?.records[entity.play] as Play} line={entity.line} />
  }

  return <div>Entity {JSON.stringify(useParams(), null, "  ")}</div>
}
