/*
 * Script for Achromevement Popup UI.
 * Right click Achromevement icon and click Inspect Popup to debug.
 */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import AchievementList from 'pu/components/AchievementList';
import { PORT_PU, BG_A_ALL } from 'shared/constant';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      achievements: [],
    };

    const port = chrome.runtime.connect({ name: PORT_PU });

    port.onMessage.addListener(({ action, data }) => {
      switch (action) {
        case BG_A_ALL:
          this.setState({ achievements: data });
          break;
      }
    });
  }

  render() {
    return <AchievementList achievements={this.state.achievements} />;
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
