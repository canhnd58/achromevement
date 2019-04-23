import triggers from 'bg/trigger';

describe('trigger', () => {
  const Trigger = class {
    constructor() {
      this._cbs = [];
    }
    addListener(cb) {
      this._cbs.push(cb);
    }
    removeListener(cb) {
      this._cbs = this._cbs.filter(callback => callback !== cb);
    }
    notify() {
      this._cbs.forEach(cb => cb());
    }
  };

  let cb1, cb2, tr1, tr2;

  beforeEach(() => {
    tr1 = new Trigger();
    tr2 = new Trigger();
    cb1 = jest.fn();
    cb2 = jest.fn();
  });

  test('any', () => {
    const tr = triggers.any(tr1, tr2);
    expect(tr).toBeDefined();
    tr.addListener(cb1).addListener(cb2);
    tr1.notify();
    expect(cb1.mock.calls.length).toBe(1);
    expect(cb2.mock.calls.length).toBe(1);
    tr2.notify();
    expect(cb1.mock.calls.length).toBe(2);
    expect(cb2.mock.calls.length).toBe(2);
    tr.removeListener(cb2);
    tr1.notify();
    expect(cb1.mock.calls.length).toBe(3);
    expect(cb2.mock.calls.length).toBe(2);
    tr2.notify();
    expect(cb1.mock.calls.length).toBe(4);
    expect(cb2.mock.calls.length).toBe(2);
  });

  test('all', () => {
    const tr = triggers.all(tr1, tr2);
    expect(tr).toBeDefined();
    tr.addListener(cb1).addListener(cb2);
    tr1.notify();
    expect(cb1.mock.calls.length).toBe(0);
    expect(cb2.mock.calls.length).toBe(0);
    tr2.notify();
    expect(cb1.mock.calls.length).toBe(1);
    expect(cb2.mock.calls.length).toBe(1);
    tr.removeListener(cb2);
    tr2.notify();
    expect(cb1.mock.calls.length).toBe(1);
    expect(cb2.mock.calls.length).toBe(1);
    tr1.notify();
    expect(cb1.mock.calls.length).toBe(2);
    expect(cb2.mock.calls.length).toBe(1);
  });
});
