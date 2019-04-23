/**
 * @module storage
 * Note: Chrome does not allow more than 120 write operations per minute
 */

let current = {};
let timer = null;

const set = (obj, { force = false, delay = 2000, timestamps = true } = {}) =>
  new Promise(resolve => {
    Object.keys(obj).forEach(k => {
      const values = obj[k];
      const now = new Date().toString();
      if (timestamps && typeof values === 'object') {
        obj[k].createdAt = obj[k].createdAt || now;
        obj[k].updatedAt = now;
      }
    });

    current = { ...current, ...obj };
    if (force) {
      chrome.storage.sync.set(current, () => {
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
          chrome.storage.sync.set(obj);
          timer = null;
          current = {};
        }, delay);
      }
      resolve();
    }
  });

const remove = async keys => {
  if (timer != null) await set({}, { force: true });

  return new Promise(resolve => {
    chrome.storage.sync.remove(keys, resolve);
  });
};

const get = keys =>
  new Promise(resolve => {
    chrome.storage.sync.get(keys, results =>
      resolve({ ...results, ...current })
    );
  });

export default { set, get, remove };
