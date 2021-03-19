/** @jsx jsx */
import { jsx } from "@emotion/react"

export const ShowHide: React.FC<{ show: boolean; translate?: boolean }> = ({
  show,
  translate,
  children,
}) => {
  return (
    <div
      css={{
        transition: "opacity 0.4s ease, transform 1s ease",
        pointerEvents: show ? undefined : "none",
        opacity: show ? 1 : 0,
        transform: show || !translate ? undefined : "translateY(5px)",
      }}
    >
      {children}
    </div>
  )
}
