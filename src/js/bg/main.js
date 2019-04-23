/**
 * Entry of background scripts
 * Run in the background whenever Chrome starts.
 * Used to register listeners to Chrome events.
 */

import Achievement, { createDefaultAchievements } from 'bg/Achievement';
import storage from 'bg/storage';

console.log('Achromevement background is running.');

chrome.runtime.onInstalled.addListener(function() {
  console.log('Achromevement is installed.');
});

Promise.all(createDefaultAchievements().map(a => a.load())).then(as => {
  window.achievements = as;
});

window.storage = storage;
window.Achievement = Achievement;
