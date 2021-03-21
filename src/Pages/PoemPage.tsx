/** @jsx jsx */
import { jsx } from "@emotion/react"
import { PageWithHeader } from "../Components/PageWithHeader"
import { Toolbar } from "../Components/Toolbar"
import { Poem } from "../database"

export const PoemPage: React.FC<{ poem: Poem }> = ({ poem }) => {
  return (
    <PageWithHeader>
      <Toolbar title={poem.title} />
      {poem.body.split("\n").map((line, i) => (
        <div key={i} css={{ marginBottom: 7 }}>
          {line}
        </div>
      ))}
    </PageWithHeader>
  )
}
