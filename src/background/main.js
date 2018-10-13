/* 
 * Run in the background whenever Chrome starts.
 * Used to register listeners to Chrome events.
 */

console.log('Achromevement background is running.');

chrome.runtime.onInstalled.addListener(function() {
  console.log('Achromevement is installed.');
});
