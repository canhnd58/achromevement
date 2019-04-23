/**
 * Achievement: Early Bird
 * Progress: Open a page between 04:50 and 05:10 once a day
 * Reset: Miss a day
 */

import { pass, fail } from 'bg/condition';
import utils from 'bg/utils';
import { lastDoneTime } from 'bg/plugin';
import triggers from 'bg/trigger';
import Achievement from 'bg/Achievement';

const achieveEarlyBird = () =>
  Achievement.create({
    title: 'Early Bird',
    description:
      'Open a page between 04:50 and 05:10 in the morning for <goal> consecutive days',
    goals: [2, 7, 30],
  })
    .plug(lastDoneTime)
    .with({
      type: Achievement.Triggers.RESET,
      trigger: triggers.any(
        chrome.idle.onStateChanged,
        chrome.webNavigation.onCommitted
      ),
      condition: pass.any(
        fail(lastDoneTime.consecutiveDay),
        pass.all(
          lastDoneTime.afterTime(new utils.Time(5, 10)),
          a =>
            a.state.lastDoneTime &&
            utils.dayPassed(a.state.lastDoneTime, new Date()) === 1
        )
      ),
    })
    .with({
      type: Achievement.Triggers.PROGRESS,
      trigger: chrome.webNavigation.onCommitted,
      condition: pass.all(
        lastDoneTime.oncePerDay,
        lastDoneTime.betweenTime(new utils.Time(4, 50), new utils.Time(5, 10))
      ),
    });

export default achieveEarlyBird;
