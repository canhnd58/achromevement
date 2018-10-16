import utils from './utils'

describe('utils', () => {
  test.each([
    [new Date(1995, 10, 15), new Date(1995, 10, 18), 3],
    [new Date(1995, 10, 15), new Date(1995, 11, 16), 31],
    [new Date(1995, 10, 15, 22), new Date(1995, 10, 16, 0, 0, 1), 1],
    [new Date(1995, 10, 15, 22), new Date(1995, 10, 15, 23), 0],
  ])(
    '.dayPassed(%o, %o) == %i', 
    (d1, d2, expected) => {
      expect(utils.dayPassed(d1, d2)).toBe(expected);
      expect(utils.dayPassed(d2, d1)).toBe(expected);
    }
  );

  describe('.Time', () => {
    describe('can be created', () => {

      test('without arguments', () => {
        const t = new utils.Time();
        expect(t).toBeDefined();
        expect(t.hour).toBeDefined();
        expect(t.minute).toBeDefined();
        expect(t.second).toBeDefined();
      });
      
      test('with Date object', () => {
        const d = new Date(1995, 10, 15, 2, 3, 4);
        const t = new utils.Time(d);
        expect(t).toBeDefined();
        expect(t.hour).toBe(2);
        expect(t.minute).toBe(3);
        expect(t.second).toBe(4);
      });

      test('with other utils.Time object', () => {
        const d = new Date(1995, 10, 15, 2, 3, 4);
        const t = new utils.Time(d);
        const t2 = new utils.Time(t);
        expect(t2).toBeDefined();
        expect(t2.hour).toBe(2);
        expect(t2.minute).toBe(3);
        expect(t2.second).toBe(4);
      });

      test('with only hour', () => {
        const t = new utils.Time(10);
        expect(t).toBeDefined();
        expect(t.hour).toBe(10);
        expect(t.minute).toBe(0);
        expect(t.second).toBe(0);
      });

      test('with hour and minute', () => {
        const t = new utils.Time(10, 20);
        expect(t).toBeDefined();
        expect(t.hour).toBe(10);
        expect(t.minute).toBe(20);
        expect(t.second).toBe(0);
      });
      
      test('with hour, minute and second', () => {
        const t = new utils.Time(10, 20, 30);
        expect(t).toBeDefined();
        expect(t.hour).toBe(10);
        expect(t.minute).toBe(20);
        expect(t.second).toBe(30);
      });

    });

    describe('can be compared', () => {
      test.each([
        [new utils.Time(10, 1), new utils.Time(10)],
        [new utils.Time(10, 1), new utils.Time(10, 0 ,1)],
        [new utils.Time(10, 20), new utils.Time(9, 40)],
      ])('%s > %s', (t1, t2) => {
        expect(t1 > t2).toBeTruthy();
        expect(t1 >= t2).toBeTruthy();
        expect(t2 < t1).toBeTruthy();
        expect(t2 <= t1).toBeTruthy();
        expect(t1 != t2).toBeTruthy();
        expect(t1 < t2).toBeFalsy();
        expect(t2 > t1).toBeFalsy();
        expect(t1 == t2).toBeFalsy();
      });
    });
  });
});
