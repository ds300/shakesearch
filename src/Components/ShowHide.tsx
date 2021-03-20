/** @jsx jsx */
import { jsx } from "@emotion/react"

const entranceTransforms = {
  "slide-from-above": "translateY(-5px)",
  "slide-from-below": "translateY(5px)",
}

export const ShowHide: React.FC<{
  show: boolean
  enterTransition?: keyof typeof entranceTransforms
}> = ({ show, enterTransition, children }) => {
  const transform = enterTransition && entranceTransforms[enterTransition]
  return (
    <div
      css={{
        transition: "opacity 0.4s ease, transform 1s ease",
        pointerEvents: show ? undefined : "none",
        opacity: show ? 1 : 0,
        transform: show ? undefined : transform,
      }}
    >
      {children}
    </div>
  )
}
