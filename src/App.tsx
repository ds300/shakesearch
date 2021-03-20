/** @jsx jsx */
import { jsx } from "@emotion/react"
import { DatabaseProvider } from "./database"
import { Home } from "./Pages/Home"
import { Route, Router, Switch } from "react-router-dom"

import { createBrowserHistory } from "history"
import { Entity } from "./Pages/Entity"
import { Results } from "./Pages/Results"

const history = createBrowserHistory()

export default () => (
  <DatabaseProvider>
    <Router history={history}>
      <Switch>
        <Route path="/page/:id">
          <Entity />
        </Route>
        <Route path="/results">
          <Results />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  </DatabaseProvider>
)
