/*
 * Script for Achromevement Popup UI.
 * Right click Achromevement icon and click Inspect Popup to debug.
 */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class App extends Component {
  render () {
    return <div id="hello">Hello, World!</div>;
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

console.log('Achromevement popup is running');
