import Achievement, { achieve } from './achievement.js';

describe('Achievement', () => {
  describe('can be created', () => {
    test('with only title', () => {
      const title = 'New Achievement';
      const a = achieve({ title });
      expect(a).toBeDefined();
      expect(a.title).toEqual(title);
    });

    test('with title and other optionals', () => {
      const title = 'New Title';
      const description = 'New Description';
      const goals = [1, 2, 3];
      const firstTier = Achievement.Tiers.SILVER;
      const hidden = true;
      const a = achieve({ title, description, goals, firstTier, hidden });

      expect(a).toBeDefined();
      expect(a.title).toEqual(title);
      expect(a.description).toEqual(description);
      expect(a.goals).toEqual(goals);
      expect(a.firstTier).toEqual(firstTier);
      expect(a.hidden).toEqual(hidden);
    });
  });

  test('cannot be created without title', () => {
    expect(() => achieve({})).toThrow();
  });

  test('getter', () => {
    const a = achieve({
      title: 'Do it',
      description: 'Done <goal> times',
      goals: [1, 3],
      firstTier: Achievement.Tiers.SILVER,
      hidden: false,
    });
    expect(a.title).toEqual('Do it');
    expect(a.goals).toEqual([1, 3]);
    expect(a.firstTier).toEqual(Achievement.Tiers.SILVER);
    expect(a.tiers).toEqual([
      Achievement.Tiers.NEW,
      Achievement.Tiers.SILVER,
      Achievement.Tiers.GOLD,
    ]);
    expect(a.hidden).toBeFalsy();
    expect(a.done).toEqual(0);
    expect(a.step).toEqual(0);
    expect(a.earned).toBeFalsy();
    expect(a.description).toEqual(`Done 1 times`);
    expect(a.tier).toEqual(Achievement.Tiers.NEW);
    expect(a.state).toEqual({});

    a.progress();
    expect(a.done).toEqual(1);
    expect(a.step).toEqual(1);
    expect(a.earned).toBeFalsy();
    expect(a.description).toEqual(`Done 3 times`);
    expect(a.tier).toEqual(Achievement.Tiers.SILVER);

    a.progress();
    expect(a.done).toEqual(2);
    expect(a.step).toEqual(1);
    expect(a.earned).toBeFalsy();
    expect(a.description).toEqual(`Done 3 times`);
    expect(a.tier).toEqual(Achievement.Tiers.SILVER);

    a.progress();
    expect(a.done).toEqual(3);
    expect(a.step).toEqual(2);
    expect(a.description).toEqual(`Done 3 times`);
    expect(a.earned).toBeTruthy();
    expect(a.tier).toEqual(Achievement.Tiers.GOLD);
  });

  test('.plug()', () => {
    const mockFunc = jest.fn();
    const plugin = { onPlug: mockFunc };
    achieve({ title: 'Test' }).plug(plugin);
    expect(mockFunc.mock.calls.length).toBe(1);
  });

  test('.reset()', () => {
    const a = achieve({ title: 'Test', goals: [1, 2] });

    a.progress();
    a.reset();
    expect(a.done).toEqual(0);
    expect(a.tier > Achievement.Tiers.NEW).toBeTruthy();

    a.progress();
    a.progress();
    expect(a.done).toEqual(2);
    a.reset();
    expect(a.done).toEqual(2);
  });

  test('.progress()', () => {
    const a = achieve({ title: 'Test', goals: [1, 2] });
    a.progress();
    expect(a.done).toEqual(1);
    expect(a.step).toEqual(1);
    a.progress();
    expect(a.done).toEqual(2);
    expect(a.step).toEqual(2);
    a.progress();
    expect(a.done).toEqual(2);
  });

  test('.beforeReset()', () => {
    const mockFunc1 = jest.fn();
    const mockFunc2 = jest.fn();
    const a = achieve({ title: 'Test' })
      .beforeReset(mockFunc1)
      .beforeReset(mockFunc2);
    a.reset();
    expect(mockFunc1.mock.calls.length).toBe(1);
    expect(mockFunc2.mock.calls.length).toBe(1);
  });

  test('.afterReset()', () => {
    const mockFunc1 = jest.fn();
    const mockFunc2 = jest.fn();
    const a = achieve({ title: 'Test' })
      .afterReset(mockFunc1)
      .afterReset(mockFunc2);
    a.reset();
    expect(mockFunc1.mock.calls.length).toBe(1);
    expect(mockFunc2.mock.calls.length).toBe(1);
  });

  test('.beforeProgress()', () => {
    const mockFunc1 = jest.fn();
    const mockFunc2 = jest.fn();
    const a = achieve({ title: 'Test' })
      .beforeProgress(mockFunc1)
      .beforeProgress(mockFunc2);
    a.progress();
    expect(mockFunc1.mock.calls.length).toBe(1);
    expect(mockFunc2.mock.calls.length).toBe(1);
  });

  test('.afterProgress()', () => {
    const mockFunc1 = jest.fn();
    const mockFunc2 = jest.fn();
    const a = achieve({ title: 'Test' })
      .afterProgress(mockFunc1)
      .afterProgress(mockFunc2);
    a.progress();
    expect(mockFunc1.mock.calls.length).toBe(1);
    expect(mockFunc2.mock.calls.length).toBe(1);
  });

  describe('trigger', () => {
    const Trigger = class {
      addListener(cb) {
        this.cb = cb;
      }
      removeListener(cb) {
        this.cb = null;
      }
      notify() {
        if (this.cb) this.cb();
      }
    };

    let triggerProgress, triggerReset, a;
    let spyProgress, spyReset;

    beforeEach(() => {
      triggerProgress = new Trigger();
      triggerReset = new Trigger();
      a = achieve({ title: 'Test', goals: [2] })
        .subscribe({
          trigger: triggerProgress,
          condition: a => a.title === 'Test',
        })
        .with({
          trigger: triggerReset,
          type: Achievement.Triggers.RESET,
        });

      spyProgress = jest.spyOn(a, 'progress');
      spyReset = jest.spyOn(a, 'reset');
    });

    test('can be subscribed', () => {
      triggerProgress.notify();
      triggerReset.notify();
      expect(spyProgress.mock.calls.length).toBe(1);
      expect(spyReset.mock.calls.length).toBe(1);

      a._title = 'Test2';
      triggerProgress.notify();
      triggerReset.notify();
      expect(spyProgress.mock.calls.length).toBe(1);
      expect(spyReset.mock.calls.length).toBe(2);
    });

    test('can be unsubscribed', () => {
      a.unsubscribe(triggerReset, Achievement.Triggers.RESET);
      triggerProgress.notify();
      triggerReset.notify();
      expect(spyProgress.mock.calls.length).toBe(1);
      expect(spyReset.mock.calls.length).toBe(0);

      a.unsubscribe(triggerProgress, Achievement.Triggers.PROGRESS);
      triggerProgress.notify();
      triggerReset.notify();
      expect(spyProgress.mock.calls.length).toBe(1);
      expect(spyReset.mock.calls.length).toBe(0);
    });

    test('can be unsubscribed all', () => {
      a.unsubscribeAll();
      triggerProgress.notify();
      triggerReset.notify();
      expect(spyProgress.mock.calls.length).toBe(0);
      expect(spyReset.mock.calls.length).toBe(0);
    });
  });
});
