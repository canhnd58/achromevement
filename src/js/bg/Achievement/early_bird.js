/**
 * Achievement: Early Bird
 * Progress: Open a page between 04:50 and 05:10 once a day
 * Reset: Miss a day
 */

import { pass, fail } from 'bg/condition';
import utils from 'bg/utils';
import { doneTime } from 'bg/plugin';
import triggers from 'bg/trigger';
import { achieve } from 'bg/Achievement';

const achieveEarlyBird = () =>
  achieve({
    title: 'Early Bird',
    description:
      'Open a page between 04:50 and 05:10 in the morning for <goal> consecutive days',
    goals: [2, 7, 30],
  })
    .plug(doneTime)
    .resetOn(
      triggers.any(
        chrome.idle.onStateChanged,
        chrome.webNavigation.onCommitted
      ),
      pass.any(
        fail(doneTime.consecutiveDays),
        pass.all(
          doneTime.after(new utils.Time(5, 10)),
          a =>
            a.state.lastDoneTime &&
            utils.dayPassed(a.state.lastDoneTime, new Date()) === 1
        )
      )
    )
    .progressOn(
      chrome.webNavigation.onCommitted,
      pass.all(
        doneTime.oncePerDay,
        doneTime.between(new utils.Time(4, 50), new utils.Time(5, 10))
      )
    );

export default achieveEarlyBird;
