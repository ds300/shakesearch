/** @jsx jsx */
import { jsx } from "@emotion/react"
import { PageWithHeader } from "../Components/PageWithHeader"
import { Toolbar } from "../Components/Toolbar"
import { Sonnet } from "../database"

export const SonnetPage: React.FC<{ sonnet: Sonnet }> = ({ sonnet }) => {
  return (
    <PageWithHeader>
      <Toolbar title={`Sonnet ${sonnet.num}`} />
      {sonnet.body.split("\n").map((line, i) => (
        <div key={i} css={{marginBottom: 7}}>{line}</div>
      ))}
    </PageWithHeader>
  )
}
