/** @jsx jsx */
import { jsx } from "@emotion/react"
import React from "react"
import { darkGrey, lightGrey } from "../colors"

export const TabLabel: React.FC<{ name: string; count: number }> = ({
  name,
  count,
}) => {
  return (
    <span css={{ fontSize: 14, fontWeight: 400 }}>
      {name}
      {count != null && <span css={{ color: darkGrey }}> ({count})</span>}
    </span>
  )
}

export const Toolbar: React.FC<{
  title?: string
  icon?: React.ReactNode
  tabs?: { name: string; count: number; onClick(): void }[]
  activeTabIndex?: number
}> = ({ title, tabs, activeTabIndex }) => {
  return (
    <div css={{ paddingBottom: 20 }}>
      <div
        css={{
          display: "flex",
          alignItems: "baseline",
          position: "relative",
          borderBottom: `1px solid ${lightGrey}`,
          "> *": {
            // hang over parent border
            position: "relative",
            bottom: -1,
          },
        }}
      >
        {title && (
          <h2
            css={{
              fontSize: 24,
              fontWeight: 400,
              marginBottom: 0,
              paddingRight: 40,
              paddingBottom: 10,
            }}
          >
            {title}
          </h2>
        )}
        {tabs &&
          tabs.map((t, i) => (
            <div
              key={i}
              onClick={t.onClick}
              css={{
                marginRight: 20,
                paddingBottom: 10,
                paddingTop: 10,
                cursor: "pointer",
                borderBottom:
                  activeTabIndex === i ? "2px solid black" : undefined,
              }}
            >
              <TabLabel name={t.name} count={t.count} />
            </div>
          ))}
      </div>
    </div>
  )
}
