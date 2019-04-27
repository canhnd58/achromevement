/**
 * @module storage
 * Note: Chrome does not allow more than 120 write operations per minute
 */

let current = {};
let timer = null;

const set = (obj, { force = false, delay = 2000 } = {}) =>
  new Promise((resolve, reject) => {
    current = { ...current, ...obj };
    if (force) {
      chrome.storage.sync.set(current, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        current = {};
        resolve();
      });
    } else {
      if (!timer) {
        timer = setTimeout(() => {
          chrome.storage.sync.set(current);
          timer = null;
          current = {};
        }, delay);
      }
      resolve();
    }
  });

const remove = async keys =>
  new Promise((resolve, reject) => {
    chrome.storage.sync.remove(keys, () => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
      else {
        keys.forEach(k => delete current[k]);
        resolve();
      }
    });
  });

const clear = async () =>
  new Promise((resolve, reject) => {
    chrome.storage.sync.clear(() => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
      else {
        if (timer != null) {
          clearTimeout(timer);
          timer = null;
        }
        current = {};
        resolve();
      }
    });
  });

const get = keys =>
  new Promise((resolve, reject) => {
    chrome.storage.sync.get(keys, results => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else resolve({ ...results, ...current });
    });
  });

export default { set, get, remove, clear };
