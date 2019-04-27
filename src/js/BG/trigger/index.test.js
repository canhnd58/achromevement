import triggers, { Trigger } from 'BG/trigger';

describe('trigger', () => {
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
    expect(tr.hasListener(cb1)).toBeTruthy();
    expect(tr.hasListener(cb2)).toBeTruthy();
    tr1.dispatch();
    expect(cb1.mock.calls.length).toBe(1);
    expect(cb2.mock.calls.length).toBe(1);
    tr2.dispatch();
    expect(cb1.mock.calls.length).toBe(2);
    expect(cb2.mock.calls.length).toBe(2);
    tr.removeListener(cb2);
    expect(tr.hasListener(cb1)).toBeTruthy();
    expect(tr.hasListener(cb2)).toBeFalsy();
    tr1.dispatch();
    expect(cb1.mock.calls.length).toBe(3);
    expect(cb2.mock.calls.length).toBe(2);
    tr2.dispatch();
    expect(cb1.mock.calls.length).toBe(4);
    expect(cb2.mock.calls.length).toBe(2);
  });

  test('all', () => {
    const tr = triggers.all(tr1, tr2);
    expect(tr).toBeDefined();
    tr.addListener(cb1).addListener(cb2);
    expect(tr.hasListener(cb1)).toBeTruthy();
    expect(tr.hasListener(cb2)).toBeTruthy();
    tr1.dispatch();
    expect(cb1.mock.calls.length).toBe(0);
    expect(cb2.mock.calls.length).toBe(0);
    tr2.dispatch();
    expect(cb1.mock.calls.length).toBe(1);
    expect(cb2.mock.calls.length).toBe(1);
    tr.removeListener(cb2);
    expect(tr.hasListener(cb1)).toBeTruthy();
    expect(tr.hasListener(cb2)).toBeFalsy();
    tr2.dispatch();
    expect(cb1.mock.calls.length).toBe(1);
    expect(cb2.mock.calls.length).toBe(1);
    tr1.dispatch();
    expect(cb1.mock.calls.length).toBe(2);
    expect(cb2.mock.calls.length).toBe(1);
  });
});
