//import Header from '../header/header'
import ReactDOM from "react-dom";
import React from "react";
import { BrowserRouter as Router, Link } from "react-router-dom";
import { Route } from "react-router";

const User = () => {
  return (
    <div>
      <h1>Welcome</h1>
      <p>Welcome to your new Drash + React app!</p>
    </div>
  );
};

// Header
//ReactDOM.render(<Header />, document.getElementById('header'))

// Everything else
const App = () => {
  return (
    <Router>
      <Route path="/" component={User} />
    </Router>
  );
};
ReactDOM.render(<App />, document.getElementById("app"));
