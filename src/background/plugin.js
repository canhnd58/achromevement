import utils from '../utils';

export const lastDoneTime = {
  onPlug: a => {
    a.state.lastDoneTime = null;
    a.afterProgress(a => {
      a.state.lastDoneTime = new Date();
    });
    a.afterReset(a => {
      a.state.lastDoneTime = null;
    });
  },

  oncePerDay: a =>
    !a.state.lastDoneTime ||
    utils.dayPassed(a.state.lastDoneTime, new Date()) > 0,

  consecutiveDay: a =>
    !a.state.lastDoneTime ||
    utils.dayPassed(a.state.lastDoneTime, new Date()) <= 1,

  betweenTime: (t1, t2) => a => {
    let now = new utils.Time(new Date());
    let time1 = new utils.Time(t1);
    let time2 = new utils.Time(t2);
    return time1 <= now && now <= time2;
  },

  beforeTime: t => a => {
    let now = new utils.Time(new Date());
    let time = new utils.Time(t);
    return now < time;
  },

  afterTime: t => a => {
    let now = new utils.Time(new Date());
    let time = new utils.Time(t);
    return now > time;
  },
};
