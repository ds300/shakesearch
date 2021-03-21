/** @jsx jsx */
import { jsx } from "@emotion/react"
import { DatabaseProvider } from "./database"
import { HomePage } from "./Pages/HomePage"
import { Route, Router, Switch } from "react-router-dom"

import { createBrowserHistory } from "history"
import { EntityPage } from "./Pages/EntityPage"
import { ResultsPage } from "./Pages/ResultsPage"

const history = createBrowserHistory()

export default () => (
  <DatabaseProvider>
    <Router history={history}>
      <Switch>
        <Route path="/page/:id">
          <EntityPage />
        </Route>
        <Route path="/results">
          <ResultsPage />
        </Route>
        <Route path="/">
          <HomePage />
        </Route>
      </Switch>
    </Router>
  </DatabaseProvider>
)
