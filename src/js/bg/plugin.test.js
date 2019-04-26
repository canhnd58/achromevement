import { achieve } from 'bg/Achievement';
import { doneTime } from 'bg/plugin';
import MockDate from 'mockdate';
import utils from 'bg/utils';
import storage from 'bg/storage';

describe('plugin', () => {
  describe('doneTime', () => {
    const now = new Date(1995, 10, 15, 10, 30);
    let a, spyGet, spySet;

    beforeEach(() => {
      a = achieve({ title: 'Test', goals: [10] });
      a.plug(doneTime);
      MockDate.set(now);
      spyGet = jest.spyOn(storage, 'get').mockResolvedValue({
        Test: {
          _state: { lastDoneTime: null },
          _step: 0,
          _goals: [10],
        },
      });
      spySet = jest.spyOn(storage, 'set').mockResolvedValue();
    });

    afterEach(() => {
      MockDate.reset();
      spyGet.mockRestore();
      spySet.mockRestore();
    });

    test('.onPlug()', () => {
      a.progress();
      expect(a.state.lastDoneTime).toEqual(now);
      a.reset();
      expect(a.state.lastDoneTime).toBeNull();
    });

    test('.onPlug() load', async () => {
      await a.load();
      expect(a.state.lastDoneTime).toBeNull();
      spyGet = jest.spyOn(storage, 'get').mockResolvedValue({
        Test: {
          _state: { lastDoneTime: now.toISOString() },
          _step: 0,
          _goals: [10],
        },
      });
      await a.load();
      expect(a.state.lastDoneTime).toEqual(now);
    });

    test.each([
      [new Date(1995, 10, 15, 17, 30), false],
      [new Date(1995, 10, 16, 9, 10), true],
    ])('.oncePerDay()', (date, expected) => {
      a.progress();
      MockDate.set(date);
      expect(doneTime.oncePerDay(a)).toBe(expected);
    });

    test.each([
      [new Date(1995, 10, 15, 17, 30), true],
      [new Date(1995, 10, 16, 17, 30), true],
      [new Date(1995, 10, 17, 17, 30), false],
    ])('.consecutiveDays()', (date, expected) => {
      a.progress();
      MockDate.set(date);
      expect(doneTime.consecutiveDays(a)).toBe(expected);
    });

    test.each([
      [new utils.Time(9), new utils.Time(11), true],
      [new utils.Time(10, 29), new utils.Time(10, 31), true],
      [new utils.Time(9), new utils.Time(10), false],
    ])('.between()', (t1, t2, expected) => {
      expect(doneTime.between(t1, t2)(a)).toBe(expected);
    });

    test.each([
      [new utils.Time(11), true],
      [new utils.Time(10), false],
      [new utils.Time(1), false],
    ])('.before()', (t, expected) => {
      expect(doneTime.before(t)(a)).toBe(expected);
    });

    test.each([
      [new utils.Time(11), false],
      [new utils.Time(10), true],
      [new utils.Time(1), true],
    ])('.after()', (t, expected) => {
      expect(doneTime.after(t)(a)).toBe(expected);
    });
  });
});
