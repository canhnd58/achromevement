import { pass, fail } from 'bg/condition';

describe('condition', () => {
  let fn1, fn2, fn3;

  beforeEach(() => {
    fn1 = jest.fn(x => () => x === 3);
    fn2 = jest.fn(() => true);
    fn3 = jest.fn(() => false);
  });

  test('pass', () => {
    expect(pass(fn1(3))()).toBeTruthy();
    expect(pass(fn2)()).toBeTruthy();
    expect(pass(fn3)()).toBeFalsy();
  });

  test('pass.any', () => {
    expect(pass.any(fn2, fn3)()).toBeTruthy();
    expect(pass.any(fn1(2), fn3)()).toBeFalsy();
  });

  test('pass.all', () => {
    expect(pass.all(fn2, fn3)()).toBeFalsy();
    expect(pass.all(fn1(3), fn2)()).toBeTruthy();
  });

  test('fail', () => {
    expect(fail(fn1(3))()).toBeFalsy();
    expect(fail(fn2)()).toBeFalsy();
    expect(fail(fn3)()).toBeTruthy();
  });

  test('fail.any', () => {
    expect(fail.any(fn2, fn3)()).toBeTruthy();
    expect(fail.any(fn1(3), fn2)()).toBeFalsy();
  });

  test('fail.all', () => {
    expect(fail.all(fn1(2), fn3)()).toBeTruthy();
    expect(fail.all(fn2, fn3)()).toBeFalsy();
  });
});
