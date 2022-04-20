import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import HomePage from '../HomePage';

const Router = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/">
          <HomePage view={0} />
        </Route>
        <Route path="/Projects">
          <HomePage view={0} />
        </Route>
        <Route path="/Packages">
          <HomePage view={1} />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default Router;
