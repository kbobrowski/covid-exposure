import React, {Fragment, Suspense, lazy} from 'react';
import './App.css';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { MuiThemeProvider, CssBaseline } from "@material-ui/core";
import GlobalStyles from "./GlobalStyles";
import theme from "./theme";
import ComputeComponent from "./matcher/ComputeComponent";
import {DashboardStateProvider} from "./reducer/reducer";

const LoggedInComponent = lazy(() => import("./logged_in/components/Main"));
const LoggedOutComponent = lazy(() => import("./logged_out/components/Main"));

function App() {

  return (
    <DashboardStateProvider>
      <BrowserRouter>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles />
        <Suspense fallback={<Fragment />}>
          <Switch>
            <Route path="/covid-exposure/c">
              <LoggedInComponent />
            </Route>
            <Route path="/covid-exposure/m">
              <ComputeComponent />
            </Route>
            <Route path="/covid-exposure">
              <LoggedOutComponent />
            </Route>
          </Switch>
        </Suspense>
      </MuiThemeProvider>
    </BrowserRouter>
    </DashboardStateProvider>
  );
}

export default App;
