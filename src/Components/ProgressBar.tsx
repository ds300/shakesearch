/** @jsx jsx */
import { jsx } from "@emotion/react"

const lightGrey = "#DFDFDF"
const darkGrey = "#686868"

export const ProgressBar: React.FC<{ percentComplete: number }> = ({
  percentComplete,
}) => {
  return (
    <div style={{ width: 300, height: 2, backgroundColor: lightGrey }}>
      <div
        css={{
          transition: "width 0.2s ease",
          height: 2,
          width: percentComplete + "%",
          backgroundColor: darkGrey,
        }}
      ></div>
    </div>
  )
}
