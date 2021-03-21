/** @jsx jsx */
import { jsx } from "@emotion/react"
import { PageWithHeader } from "../Components/PageWithHeader"
import { Toolbar } from "../Components/Toolbar"
import { Poem } from "../database"
import { useTextPages } from "../useTextPages"

export const PoemPage: React.FC<{ poem: Poem }> = ({ poem }) => {
  return (
    <PageWithHeader>
      <Toolbar title={poem.title} />
      {useTextPages(poem.body)}
    </PageWithHeader>
  )
}
