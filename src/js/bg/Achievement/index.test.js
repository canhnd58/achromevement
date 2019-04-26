import chrome from 'sinon-chrome';
import MockDate from 'mockdate';

import Achievement, {
  achieve,
  createDefaultAchievements,
} from 'bg/Achievement';

import storage from 'bg/storage';

describe('Achievement', () => {
  let a;
  let mockStorageGet;

  const title = 'Do it';
  const goals = [1, 3];
  const firstTier = Achievement.Tiers.SILVER;
  const hidden = false;
  const description = 'Done <goal> times';

  beforeEach(() => {
    mockStorageGet = jest.spyOn(storage, 'get').mockResolvedValue({});
  });

  afterEach(() => {
    mockStorageGet.mockRestore();
  });

  describe('constructor', () => {
    test('can be called with only title', () => {
      a = new Achievement({ title });
      expect(a).toBeDefined();
    });

    test('can be called with title and other optionals', () => {
      const a = new Achievement({
        title,
        description,
        goals,
        firstTier,
        hidden,
      });
      expect(a).toBeDefined();
    });

    test('cannot be called without title', () => {
      expect(() => new Achievement({})).toThrow();
    });
  });

  describe('properties', () => {
    beforeEach(() => {
      a = new Achievement({ title, goals, firstTier, hidden, description });
    });

    describe('.title', () => {
      test('is initialized to equal the passed argument', () => {
        expect(a.title).toEqual(title);
      });
    });

    describe('.goals', () => {
      test('is initialized to equal the passed argument', () => {
        expect(a.goals).toEqual(goals);
      });
    });

    describe('.goal', () => {
      test('is initialized to the first element in goals', () => {
        expect(a.goal).toEqual(goals[0]);
      });

      test('changes to next goal if this goal is reached', () => {
        while (a.done < a.goals[0]) a.progress();
        expect(a.goal).toEqual(goals[1]);
      });

      test('remains the last goal if the last goal is reached', () => {
        while (a.done < a.goals[a.goals.length - 1]) a.progress();
        expect(a.goal).toEqual(a.goals[a.goals.length - 1]);
      });
    });

    describe('.firstTier', () => {
      test('is initialized to equal the passed argument', () => {
        expect(a.firstTier).toEqual(firstTier);
      });
    });

    describe('.hidden', () => {
      test('is initialized to equal the passed argument', () => {
        expect(a.hidden).toEqual(hidden);
      });
    });

    describe('.description', () => {
      test('includes current goal', () => {
        expect(a.description).toEqual(
          expect.stringContaining(a.goal.toString())
        );
        while (a.done < a.goals[0]) a.progress();
        expect(a.description).toEqual(
          expect.stringContaining(a.goal.toString())
        );
      });
    });

    describe('.tiers', () => {
      test('has length equal goals', () => {
        expect(a.tiers.length).toEqual(goals.length);
      });

      test('is a list with firstTier as the first element', () => {
        expect(a.tiers[0]).toEqual(firstTier);
      });
    });

    describe('.done', () => {
      test('is initialized to zero', () => {
        expect(a.done).toEqual(0);
      });

      test('increments when progresses', () => {
        a.progress();
        expect(a.done).toEqual(1);
        a.progress();
        expect(a.done).toEqual(2);
        a.progress();
        expect(a.done).toEqual(3);
      });

      test('is set to zero when resets', () => {
        a.progress();
        expect(a.done).toEqual(1);
        a.progress();
        expect(a.done).toEqual(2);
        a.reset();
        expect(a.done).toEqual(0);
      });
    });

    describe('.step', () => {
      test('is initialized to zero', () => {
        expect(a.step).toEqual(0);
      });

      test('increments if goal reached', () => {
        while (a.done < a.goals[0]) a.progress();
        expect(a.step).toEqual(1);
        while (a.done < a.goals[1]) a.progress();
        expect(a.step).toEqual(2);
      });

      test('keeps untouched if resets', () => {
        while (a.done < a.goals[0]) a.progress();
        expect(a.step).toEqual(1);
        a.reset();
        expect(a.step).toEqual(1);
      });
    });

    describe('.earned', () => {
      test('is initialized to false', () => {
        expect(a.earned).toBeFalsy();
      });

      test('changes to true when last goal reached', () => {
        while (a.done < a.goals[a.goals.length - 1]) a.progress();
        expect(a.earned).toBeTruthy();
      });
    });

    describe('.tier', () => {
      test('is initialized to firstTier', () => {
        expect(a.tier).toEqual(firstTier);
      });

      test('changes to next tier if goal reached', () => {
        while (a.done < a.goals[0]) a.progress();
        expect(a.tier).toEqual(a.tiers[1]);
      });

      test('remains the last tier if last goal reached', () => {
        while (a.done < a.goals[a.goals.length - 1]) a.progress();
        expect(a.tier).toEqual(a.tiers[a.tiers.length - 1]);
      });
    });

    describe('.state', () => {
      test('is initialized to empty object', () => {
        expect(a.state).toEqual({});
      });
    });

    describe('.shownData', () => {
      test('includes all required keys', () => {
        expect(Object.keys(a.shownData)).toEqual(
          expect.arrayContaining(Achievement.ShownProps)
        );
      });
    });
  });

  describe('methods', () => {
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
      expect(a.tier > a.firstTier).toBeTruthy();

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

    test('.load() with saved props', async () => {
      const a = achieve({ title: 'Test' });
      const spyUnsub = jest.spyOn(a, 'unsubscribeAll');
      const spyGet = jest.spyOn(storage, 'get').mockResolvedValue({
        Test: {
          _description: 'Description',
          _goals: [1, 3, 4],
          _firstTier: 1,
          _hidden: false,
          _state: {},
          _done: 2,
          _step: 3,
        },
      });

      await a.load();
      expect(a._title).toEqual('Test');
      expect(a._description).toEqual('Description');
      expect(a._goals).toEqual([1, 3, 4]);
      expect(a._firstTier).toEqual(1);
      expect(a._hidden).toEqual(false);
      expect(a._state).toEqual({});
      expect(a._done).toEqual(2);
      expect(a._step).toEqual(3);
      expect(spyUnsub.mock.calls.length).toEqual(1);

      spyGet.mockRestore();
      spyUnsub.mockRestore();
    });

    test('.load() without saved props', async () => {
      const a = achieve({ title: 'Test' });
      const spy = jest.spyOn(storage, 'get').mockResolvedValue({});
      await a.load();
      // Expect no error
      spy.mockRestore();
    });

    test('.save()', async () => {
      MockDate.set(new Date(2018, 0, 1, 5));
      let store = {};
      const spy = jest.spyOn(storage, 'set').mockImplementation(
        obj =>
          new Promise(resolve => {
            store = obj;
            resolve();
          })
      );
      const a = achieve({ title: 'Test' });
      await a.save();
      expect(store['Test']).toBeDefined();
      expect(a.createdAt).toEqual(a.updatedAt);
      MockDate.set(new Date(2018, 0, 1, 6));
      await a.save();
      expect(a.createdAt).not.toEqual(a.updatedAt);
      spy.mockRestore();
    });
  });

  describe('subscribers', () => {
    const Trigger = class {
      addListener(cb) {
        this.cb = cb;
      }
      removeListener(cb) {
        this.cb = null;
      }
      dispatch() {
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
        .subscribe({
          trigger: triggerReset,
          type: Achievement.Triggers.RESET,
        });

      spyProgress = jest.spyOn(a, 'progress');
      spyReset = jest.spyOn(a, 'reset');
    });

    afterEach(() => {
      spyProgress.mockRestore();
      spyReset.mockRestore();
    });

    test('can be subscribed', () => {
      triggerProgress.dispatch();
      triggerReset.dispatch();
      expect(spyProgress.mock.calls.length).toBe(1);
      expect(spyReset.mock.calls.length).toBe(1);

      a._title = 'Test2';
      triggerProgress.dispatch();
      triggerReset.dispatch();
      expect(spyProgress.mock.calls.length).toBe(1);
      expect(spyReset.mock.calls.length).toBe(2);
    });

    test('can be unsubscribed', () => {
      a.unsubscribe(triggerReset, Achievement.Triggers.RESET);
      triggerProgress.dispatch();
      triggerReset.dispatch();
      expect(spyProgress.mock.calls.length).toBe(1);
      expect(spyReset.mock.calls.length).toBe(0);

      a.unsubscribe(triggerProgress, Achievement.Triggers.PROGRESS);
      triggerProgress.dispatch();
      triggerReset.dispatch();
      expect(spyProgress.mock.calls.length).toBe(1);
      expect(spyReset.mock.calls.length).toBe(0);
    });

    test('can be unsubscribed all', () => {
      a.unsubscribeAll();
      triggerProgress.dispatch();
      triggerReset.dispatch();
      expect(spyProgress.mock.calls.length).toBe(0);
      expect(spyReset.mock.calls.length).toBe(0);
    });

    test('.progressOn()', () => {
      const spy = jest.spyOn(a, 'subscribe');
      a.progressOn(new Trigger());
      expect(spy.mock.calls.length).toBe(1);
      spy.mockRestore();
    });

    test('.resetOn()', () => {
      const spy = jest.spyOn(a, 'subscribe');
      a.resetOn(new Trigger());
      expect(spy.mock.calls.length).toBe(1);
      spy.mockRestore();
    });
  });
});

describe('default achievements', () => {
  beforeAll(() => {
    global.chrome = chrome;
  });

  afterEach(() => {
    chrome.flush();
  });

  afterAll(() => {
    delete global.chrome;
  });

  test('createDefaultAchievements', () => {
    let as = createDefaultAchievements();
    expect(as).toBeInstanceOf(Array);
    as.forEach(a => {
      expect(a).toBeInstanceOf(Achievement);
    });
  });
});
