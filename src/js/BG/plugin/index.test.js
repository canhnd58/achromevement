import { achieve } from 'BG/achievement';
import { doneTime } from 'BG/plugin';
import MockDate from 'mockdate';
import utils from 'BG/utils';

describe('plugin', () => {
  describe('doneTime', () => {
    const now = new Date(1995, 10, 15, 10, 30);
    let a;

    beforeEach(() => {
      a = achieve({ title: 'Test', goals: [10] });
      a.plug(doneTime);
      MockDate.set(now);
    });

    afterEach(() => {
      MockDate.reset();
    });

    test('.onPlug()', () => {
      a.progress();
      expect(a.state.lastDoneTime).toEqual(now.toISOString());
      a.reset();
      expect(a.state.lastDoneTime).toBeNull();
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
