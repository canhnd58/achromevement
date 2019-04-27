import utils from 'BG/utils';

export const doneTime = {
  onPlug: a => {
    a.state.lastDoneTime = null;
    a.afterProgress(a => {
      a.state.lastDoneTime = new Date().toISOString();
    });
    a.afterReset(a => {
      a.state.lastDoneTime = null;
    });
  },

  oncePerDay: a =>
    !a.state.lastDoneTime ||
    utils.dayPassed(new Date(a.state.lastDoneTime), new Date()) > 0,

  consecutiveDays: a =>
    !a.state.lastDoneTime ||
    utils.dayPassed(new Date(a.state.lastDoneTime), new Date()) <= 1,

  between: (t1, t2) => a => {
    let now = new utils.Time(new Date());
    let time1 = new utils.Time(t1);
    let time2 = new utils.Time(t2);
    return time1 <= now && now <= time2;
  },

  before: t => a => {
    let now = new utils.Time(new Date());
    let time = new utils.Time(t);
    return now < time;
  },

  after: t => a => {
    let now = new utils.Time(new Date());
    let time = new utils.Time(t);
    return now > time;
  },
};
