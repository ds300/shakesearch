/** @jsx jsx */
import { jsx } from "@emotion/react"
import { stringify } from "qs"
import React from "react"
import { Link } from "react-router-dom"
import { PageWithHeader } from "../Components/PageWithHeader"
import { Spacer } from "../Components/Spacer"
import { Toolbar } from "../Components/Toolbar"
import { Character, useDatabase } from "../database"
import { getLink } from "../getLink"
import { TheaterIcon } from "../Icons/TheaterIcon"
import { normalizeText } from "../normalizeText"
import { findExact } from "../trie"

export const CharacterPage: React.FC<{ character: Character }> = ({
  character,
}) => {
  const database = useDatabase().database!
  const lexiconTrie = useDatabase().lexiconTrie!
  const numMentions = findExact(lexiconTrie, normalizeText(character.name))
    .filter(([id]) => {
      const entity = database.records[id]
      return entity.type === "quote" && entity.play === character.play
    })
    .reduce((count, [, freq]) => count + freq, 0)

  const mentionsLink = `/results?${stringify({ query: character.name })}#quote`
  const numQuotes = character.quotes.length

  return (
    <PageWithHeader>
      <Toolbar title={character.name} />
      <Section title="Appears in">
        <TheaterIcon />
        <Spacer size={5} />
        {getLink(character.play, database)}
      </Section>
      <Section title="About">
        {character.name} has {numQuotes} {pluralize("line", numQuotes)}
        {numMentions > 0 ? (
          <React.Fragment>
            {" "}
            and is mentioned&nbsp;
            <Link to={mentionsLink}>
              {numMentions} {pluralize("time", numMentions)}
            </Link>
            .
          </React.Fragment>
        ) : (
          "."
        )}
      </Section>
    </PageWithHeader>
  )
}

const pluralize = (word: string, n: number) => {
  if (n === 1) {
    return word
  } else {
    return word + "s"
  }
}

const Section: React.FC<{ title: string }> = ({ title, children }) => {
  return (
    <div css={{ marginBottom: 20 }}>
      <div css={{ fontSize: 14, marginBottom: 10 }}>{title}</div>
      <div css={{ display: "flex", alignItems: "center" }}>{children}</div>
    </div>
  )
}
