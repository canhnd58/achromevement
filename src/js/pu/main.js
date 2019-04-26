/*
 * Script for Achromevement Popup UI.
 * Right click Achromevement icon and click Inspect Popup to debug.
 */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import AchievementList from 'pu/components/AchievementList';

const achievements = [
  {
    title: 'Title 1',
    description: 'No description',
    goal: 2,
    hidden: false,
    done: 1,
    earned: false,
    tier: 1,
  },
  {
    title: 'Title 2',
    description: 'No description',
    goal: 2,
    hidden: true,
    done: 1,
    earned: false,
    tier: 1,
  },
  {
    title: 'Title 3',
    description: 'No description',
    goal: 7,
    hidden: true,
    done: 1,
    earned: true,
    tier: 2,
  },
];

class App extends Component {
  render() {
    return <AchievementList achievements={achievements} />;
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

console.log('Achromevement popup is running');
