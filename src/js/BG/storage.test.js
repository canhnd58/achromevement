import chrome from 'sinon-chrome';

import storage from 'BG/storage';

describe('storage', () => {
  let store = {};

  beforeAll(() => {
    global.chrome = chrome;
  });

  beforeEach(() => {
    chrome.storage.sync.set.callsFake((obj, cb) => {
      store = { ...store, ...obj };
      cb && cb();
    });

    chrome.storage.sync.get.callsFake((keys, cb) => {
      const res = keys.reduce((obj, k) => {
        obj[k] = store[k];
        return obj;
      }, {});
      cb(res);
    });

    chrome.storage.sync.remove.callsFake((keys, cb) => {
      keys.forEach(k => delete store[k]);
      cb && cb();
    });

    chrome.storage.sync.clear.callsFake(cb => {
      store = {};
      cb && cb();
    });

    jest.useFakeTimers();
  });

  afterEach(() => {
    chrome.flush();
    store = {};
  });

  afterAll(() => {
    delete global.chrome;
  });

  describe('.get()', () => {
    test('returns correct value', async () => {
      store['testKey'] = 'testValue';
      const res = await storage.get(['testKey']);
      expect(res).toEqual({ testKey: 'testValue' });
    });

    test('raises correct error', async () => {
      const errMsg = 'TEST_ERR_GET';
      chrome.storage.sync.get.callsFake((keys, cb) => {
        chrome.runtime.lastError = errMsg;
        cb({});
      });
      await expect(storage.get(['k'])).rejects.toEqual(errMsg);
    });
  });

  describe('.set()', () => {
    describe('with default options', () => {
      test('delays to save a single key', async () => {
        const delay = 2000;
        await storage.set({ setKey: 'setValue' }, { delay });
        expect(store['setKey']).toBeUndefined();
        jest.advanceTimersByTime(delay);
        expect(store['setKey']).toEqual('setValue');
      });

      test('delays to save multiple keys', async () => {
        const delay = 2000;
        await storage.set({ k1: 'v1' }, { delay });
        await storage.set({ k2: 'v2' }, { delay });
        expect(store['k1']).toBeUndefined();
        expect(store['k2']).toBeUndefined();
        jest.advanceTimersByTime(delay);
        expect(store['k1']).toEqual('v1');
        expect(store['k2']).toEqual('v2');
      });
    });

    describe('with force=true', () => {
      test('saves immediately', async () => {
        await storage.set({ setKey: 'setValue' }, { force: true });
        expect(store['setKey']).toEqual('setValue');
      });

      test('returns correct error', async () => {
        const errMsg = 'TEST_ERR_SET';
        chrome.storage.sync.set.callsFake((obj, cb) => {
          chrome.runtime.lastError = errMsg;
          cb && cb();
        });
        await expect(
          storage.set({ TEST_ERR: 1 }, { force: true })
        ).rejects.toEqual(errMsg);
        expect(chrome.runtime.lastError).toEqual(errMsg);
      });

      test('saves pending values', async () => {
        const delay = 2000;
        await storage.set({ k1: 'v1' }, { delay });
        expect(store['k1']).toBeUndefined();
        expect(store['k2']).toBeUndefined();
        await storage.set({ k2: 'v2' }, { force: true });
        expect(store['k1']).toEqual('v1');
        expect(store['k2']).toEqual('v2');
      });
    });
  });

  describe('.remove()', () => {
    test('deletes correct key', async () => {
      store['key'] = 'value';
      await storage.remove(['key']);
      expect(store['key']).toBeUndefined();
    });

    test('raises correct error', async () => {
      const errMsg = 'TEST_ERR_REMOVE';
      chrome.storage.sync.remove.callsFake((keys, cb) => {
        chrome.runtime.lastError = errMsg;
        cb();
      });
      await expect(storage.remove(['k'])).rejects.toEqual(errMsg);
    });
  });

  describe('.clear()', () => {
    test('deletes all the keys', async () => {
      store['k1'] = 'v1';
      store['k2'] = 'v2';
      store['k3'] = 'v3';
      await storage.clear();
      expect(store['k1']).toBeUndefined();
      expect(store['k2']).toBeUndefined();
      expect(store['k3']).toBeUndefined();
    });

    test('raises correct error', async () => {
      const errMsg = 'TEST_ERR_CLEAR';
      chrome.storage.sync.clear.callsFake(cb => {
        chrome.runtime.lastError = errMsg;
        cb();
      });
      await expect(storage.clear()).rejects.toEqual(errMsg);
    });

    test('removes pending save', async () => {
      const delay = 2000;
      await storage.set({ k1: 'v1' }, { delay });
      await storage.clear();
      jest.advanceTimersByTime(delay);
      expect(store['k1']).toBeUndefined();
    });
  });
});
