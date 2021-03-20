/** @jsx jsx */
import { jsx } from "@emotion/react"
import { useParams } from "react-router"
export const Entity: React.FC<{}> = () => {
  return <div>Entity {JSON.stringify(useParams(), null, "  ")}</div>
}
