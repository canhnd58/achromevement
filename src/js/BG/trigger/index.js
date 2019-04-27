export class Trigger {
  constructor() {
    this._callbacks = [];
  }
  addListener(callback) {
    this._callbacks.push(callback);
    return this;
  }
  removeListener(callback) {
    this._callbacks = this._callbacks.filter(cb => cb !== callback);
    return this;
  }
  dispatch(...args) {
    this._callbacks.forEach(cb => cb(...args));
    return this;
  }
  hasListener(callback) {
    return this._callbacks.some(cb => cb === callback);
  }
}

class TriggerAny extends Trigger {
  constructor(...triggers) {
    super();
    this._triggers = triggers;
  }
  addListener(callback) {
    this._triggers.forEach(trigger => trigger.addListener(callback));
    return super.addListener(callback);
  }
  removeListener(callback) {
    this._triggers.forEach(trigger => trigger.removeListener(callback));
    return super.removeListener(callback);
  }
}

class TriggerAll extends Trigger {
  constructor(...triggers) {
    super();
    this._triggers = triggers;
    this._triggerCallbacks = [];
  }
  addListener(callback) {
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

    this._triggerCallbacks.push(triggerCallbacks);
    return super.addListener(callback);
  }
  removeListener(callback) {
    const indices = this._callbacks.reduce((a, e, i) => {
      if (e === callback) a.push(i);
      return a;
    }, []);

    indices.forEach(i => {
      this._triggers.forEach((t, j) =>
        t.removeListener(this._triggerCallbacks[i][j])
      );
    });
    this._triggerCallbacks = this._triggers.filter(
      (cb, i) => !indices.includes(i)
    );
    return super.removeListener(callback);
  }
}

export default {
  any: (...triggers) => new TriggerAny(...triggers),
  all: (...triggers) => new TriggerAll(...triggers),
};
