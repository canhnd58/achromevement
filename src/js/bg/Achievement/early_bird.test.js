import chrome from 'sinon-chrome';
import MockDate from 'mockdate';

import achieveEarlyBird from 'bg/Achievement/early_bird';
import Achievement from 'bg/Achievement';

describe('Early Bird', () => {
  let a, spyProgress, spyReset;

  beforeAll(() => {
    global.chrome = chrome;
  });

  beforeEach(() => {
    a = achieveEarlyBird();
    spyProgress = jest.spyOn(a, 'progress');
    spyReset = jest.spyOn(a, 'reset');
    MockDate.set(new Date(2018, 0, 1, 5));
  });

  afterEach(() => {
    MockDate.reset();
    chrome.flush();
  });

  afterAll(() => {
    delete global.chrome;
  });

  test('properties', () => {
    expect(a.title).toEqual('Early Bird');
    expect(a.goal).toEqual(2);
    expect(a.description).toEqual(
      `Open a page between 04:50 and 05:10 in the morning for ${
        a.goal
      } consecutive days`
    );
    expect(a.tier).toEqual(Achievement.Tiers.NEW);
    expect(a.done).toEqual(0);
    expect(a.state.lastDoneTime).toBeNull();
  });

  test('progress between specified time', () => {
    chrome.webNavigation.onCommitted.dispatch();
    expect(spyProgress).toBeCalled();
  });

  test('progress for two days', () => {
    chrome.webNavigation.onCommitted.dispatch();
    MockDate.set(new Date(2018, 0, 2, 5));
    chrome.webNavigation.onCommitted.dispatch();
    expect(a.done).toEqual(2);
  });

  test('not process twice a day', () => {
    chrome.webNavigation.onCommitted.dispatch();
    expect(spyProgress.mock.calls.length).toEqual(1);
    MockDate.set(new Date(2018, 0, 1, 5, 5));
    chrome.webNavigation.onCommitted.dispatch();
    expect(spyProgress.mock.calls.length).toEqual(1);
  });

  test('not process after 5:10', () => {
    expect(a.done).toEqual(0);
    MockDate.set(new Date(2018, 0, 1, 5, 11));
    chrome.webNavigation.onCommitted.dispatch();
    expect(spyProgress).not.toBeCalled();
  });

  test('not process before 4:50', () => {
    MockDate.set(new Date(2018, 0, 1, 4, 20));
    chrome.webNavigation.onCommitted.dispatch();
    expect(spyProgress).not.toBeCalled();
  });

  test('reset if miss a day', () => {
    chrome.webNavigation.onCommitted.dispatch();
    expect(a.done).toEqual(1);
    MockDate.set(new Date(2018, 0, 3, 5));
    chrome.webNavigation.onCommitted.dispatch();
    expect(spyReset).toBeCalled();
  });

  test('reset if pass 5:10 of the next day', () => {
    chrome.webNavigation.onCommitted.dispatch();
    expect(a.done).toEqual(1);
    MockDate.set(new Date(2018, 0, 2, 6));
    chrome.webNavigation.onCommitted.dispatch();
    expect(spyReset).toBeCalled();
  });
});
