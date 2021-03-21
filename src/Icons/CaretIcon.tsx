import React from "react"

export const CaretIcon: React.FC<{
  direction?: "left" | "right"
  topOffset?: number
  leftOffset?: number
}> = ({ direction = "right", topOffset = 0, leftOffset = 0 }) => {
  return (
    <svg
      width="15"
      height="16"
      viewBox="0 0 15 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "relative",
        top: topOffset,
        left: leftOffset,
        transform: direction === "left" ? "rotate(180deg)" : undefined,
      }}
    >
      <path d="M7 1L14.0002 8.00024L7 15.0005" stroke="#686868" />
    </svg>
  )
}
