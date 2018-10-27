import { achieve } from './achievement';
import { lastDoneTime } from './plugin';
import MockDate from 'mockdate';
import utils from '../utils';

describe('plugin', () => {
  describe('lastDoneTime', () => {
    const now = new Date(1995, 10, 15, 10, 30);
    let a;

    beforeEach(() => {
      a = achieve({ title: 'Test', goals: [10] });
      a.plug(lastDoneTime);
      MockDate.set(now);
    });

    afterEach(() => {
      MockDate.reset();
    });

    test('onPlug', () => {
      a.progress();
      expect(a.state.lastDoneTime).toEqual(now);
      a.reset();
      expect(a.state.lastDoneTime).toBeNull();
    });

    test.each([
      [new Date(1995, 10, 15, 17, 30), false],
      [new Date(1995, 10, 16, 9, 10), true],
    ])('oncePerDay', (date, expected) => {
      a.progress();
      MockDate.set(date);
      expect(lastDoneTime.oncePerDay(a)).toBe(expected);
    });

    test.each([
      [new Date(1995, 10, 15, 17, 30), true],
      [new Date(1995, 10, 16, 17, 30), true],
      [new Date(1995, 10, 17, 17, 30), false],
    ])('consecutiveDay', (date, expected) => {
      a.progress();
      MockDate.set(date);
      expect(lastDoneTime.consecutiveDay(a)).toBe(expected);
    });

    test.each([
      [new utils.Time(9), new utils.Time(11), true],
      [new utils.Time(10, 29), new utils.Time(10, 31), true],
      [new utils.Time(9), new utils.Time(10), false],
    ])('betweenTime', (t1, t2, expected) => {
      expect(lastDoneTime.betweenTime(t1, t2)(a)).toBe(expected);
    });

    test.each([
      [new utils.Time(11), true],
      [new utils.Time(10), false],
      [new utils.Time(1), false],
    ])('beforeTime', (t, expected) => {
      expect(lastDoneTime.beforeTime(t)(a)).toBe(expected);
    });

    test.each([
      [new utils.Time(11), false],
      [new utils.Time(10), true],
      [new utils.Time(1), true],
    ])('afterTime', (t, expected) => {
      expect(lastDoneTime.afterTime(t)(a)).toBe(expected);
    });
  });
});
