# Chrome Extension Overview

A chrome extension can have up to 4 components:

- background scripts
- content scripts
- popup page
- options page

These must be declared in a `manifest.json` file on use.

Communications among components can be made through [message passing](https://developer.chrome.com/extensions/messaging) or [chrome storage](https://developer.chrome.com/extensions/storage).

## Background scripts
Run every time chrome starts, used to listen to chrome events.

Every event has a `addListener` method for extensions to register callbacks.
It looks like

    chrome.runtime.onInstalled.addListener(() => {
        console.log('This runs on first installation or update');
    });

    chrome.webNavigation.onCommitted.addListener(() => {
        console.log('This runs on user committing a navigation');
    });

Some events requires permission registered in `manifest.json`

More events on [Chrome extension APIs](https://developer.chrome.com/extensions/api_index)

## Content scripts
Add functionalities to web pages, can access DOM of current page.

More details [here](https://developer.chrome.com/extensions/content_scripts)

## Popup page
Main UI of the extension, shown when users click the extension icon

## Options page
Provide options for users to customize extension, can be opened from [extension manager](chrome://extensions)
