/** @jsx jsx */
import { jsx } from "@emotion/react"

export const Spacer: React.FC<{ size?: number }> = ({ size = 20 }) => {
  return <div css={{ width: size, height: size }}></div>
}
