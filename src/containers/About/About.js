import React, {Component} from 'react';
import Helmet from 'react-helmet';

export default class About extends Component {
  render() {
    return (
      <div className="container">
        <h1>About</h1>
        <Helmet title="About"/>
        <p>
          This is a multiplayer arena game. Check it out! Just log in and click play!
        </p>
      </div>
    );
  }
}
