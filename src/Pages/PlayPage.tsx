/** @jsx jsx */
import { jsx } from "@emotion/react"
import { useEffect } from "react"
import { useLocation } from "react-router"
import { PageWithHeader } from "../Components/PageWithHeader"
import { Toolbar } from "../Components/Toolbar"
import { Play } from "../database"

export const PlayPage: React.FC<{ play: Play; line?: number }> = ({
  play,
  line,
}) => {
  const hash = useLocation().hash
  useEffect(() => {
    if (line) {
      window.scrollTo({
        top: document.getElementById(`${line}`)?.offsetTop,
      })
    } else if (hash) {
      window.scrollTo({
        top: document.getElementById(hash.slice(1))?.offsetTop,
      })
    }
  }, [])
  return (
    <PageWithHeader>
      <Toolbar title={play.title} />
      {play.body.split("\n").map((line, i) => (
        <div id={i.toString()} css={{ marginBottom: 7, minHeight: 10 }}>
          {line}
        </div>
      ))}
    </PageWithHeader>
  )
}
