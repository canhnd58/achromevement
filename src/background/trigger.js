class TriggerAny {
  constructor (...triggers) {
    this._triggers = triggers;
  }
  addListener (callback) {
    this._triggers.forEach(trigger => trigger.addListener(callback));
    return this;
  }
  removeListener (callback) {
    this._triggers.forEach(trigger => trigger.removeListener(callback));
    return this;
  }
}

class TriggerAll {
  constructor (...triggers) {
    this._triggers = triggers;
    this._callbacks = [];
  }
  addListener (callback) {
    const triggersCalled = new Array(this._triggers.length).fill(false);
    const triggerCallbacks = new Array(this._triggers.length);

    this._triggers.forEach((trigger, i) => {
      const triggerCallback = (...args) => {
        triggersCalled[i] = true;
        if (triggersCalled.every(called => called)) {
          callback(...args);
          triggersCalled.fill(false);
        }
      };
      trigger.addListener(triggerCallback);
      triggerCallbacks[i] = triggerCallback;
    });
    this._callbacks.push({ callback, triggerCallbacks });
    return this;
  }
  removeListener (callback) {
    this._callbacks
      .filter(cb => cb.callback === callback)
      .forEach(cb => {
        this._triggers.forEach((t, i) => t.removeListener(cb.triggerCallbacks[i]));
      });

    this._callbacks = this._callbacks.filter(cb => cb.callback !== callback);
    return this;
  }
}

class TriggerChain {
  // eslint-disable-next-line no-useless-constructor
  constructor (...triggers) {
    // TODO
  }
  addListener (callback) {
    // TODO
  }
  removeListener (callback) {
    // TODO
  }
}

class TriggerConditional {
  // eslint-disable-next-line no-useless-constructor
  constructor (trigger, condition) {
    // TODO
  }
  addListener (callback) {
    // TODO
  }
  removeListener (callback) {
    // TODO
  }
}

export default {
  any: (...triggers) => new TriggerAny(...triggers),
  all: (...triggers) => new TriggerAll(...triggers),
  chain: (...triggers) => new TriggerChain(...triggers),
  conditional: (trigger, condition) => new TriggerConditional(trigger, condition),
};
