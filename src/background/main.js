/**
 * Entry of background scripts
 * Run in the background whenever Chrome starts.
 * Used to register listeners to Chrome events.
 */

import Achievement, { createDefaultAchievements } from './achievement';

console.log('Achromevement background is running.');

chrome.runtime.onInstalled.addListener(function () {
  console.log('Achromevement is installed.');
});

const achievements = createDefaultAchievements();

window.achievements = achievements;
window.Achievement = Achievement;
