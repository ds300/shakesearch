/** @jsx jsx */
import { jsx } from "@emotion/react"
import { PageWithHeader } from "../Components/PageWithHeader"
import { Toolbar } from "../Components/Toolbar"
import { Play } from "../database"
import { useTextPages } from "../useTextPages"

export const PlayPage: React.FC<{ play: Play; line?: number }> = ({
  play,
  line,
}) => {
  return (
    <PageWithHeader>
      <Toolbar title={play.title} />
      {useTextPages(play.body, line)}
    </PageWithHeader>
  )
}
