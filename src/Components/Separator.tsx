/** @jsx jsx */
import { jsx } from "@emotion/react"
import { lightGrey } from "../colors"

export const Separator: React.FC<{}> = ({}) => {
  return (
    <div css={{ height: 1, width: "100%", backgroundColor: lightGrey }}></div>
  )
}
