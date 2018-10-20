import { pass, fail } from './condition';
import utils from '../utils';
import { lastDoneTime } from './plugin';
import triggers from './trigger';

class Achievement {

  constructor({
    title,
    goals = [1],
    description = 'No description',
    firstTier = Achievement.Tiers.BRONZE,
    hidden = false,
  }) {

    if (!title) 
      throw 'Achievement title cannot be empty';

    this._title = title;
    this._goals = goals;
    this._description = description;
    this._firstTier = firstTier;
    this._hidden = hidden;

    this._done = 0;
    this._state = {};
    this._goalsReached = new Array(this._goals.length).fill(false);
    this._triggers = [];

    this._beforeProgressCallbacks = []
    this._afterProgressCallbacks = []
    this._beforeResetCallbacks = []
    this._afterResetCallbacks = []
  }

  static create(config) {
    return new Achievement(config);
  }

  static get Tiers() {
    return Object.freeze({
      NEW: 0,
      BRONZE: 1,
      SILVER: 2,
      GOLD: 3,
    });
  }

  static get Triggers() {
    return Object.freeze({
      PROGRESS: 0,
      RESET: 1,
    });
  }

  get title() { 
    return this._title; 
  }

  get description() {
    return this._description.replace(/<(\w+)>/g, (match, p) => this[p]);
  };

  get goal() {
    return this.goals.filter(g => g > this._done)[0]; 
  }

  get goals() { 
    return this._goals;
  }

  get goalsReached() {
    return this._goalsReached;
  }

  get firstTier() {
    return this._firstTier;
  }

  get hidden() {
    return this._hidden;
  }

  get done() { 
    return Math.min(this._done, this.goals[this.goals.length - 1]); 
  }

  get earned() {
    return this.goalsReached.every(reached => reached);
  }

  get step() { 
    const numStep = this.goals.length + 1;
    return (this.goals.indexOf(this.goal) + numStep) % numStep; 
  }

  get tiers() { 
    const Tiers = Achievement.Tiers;
    const tierList = [Tiers.BRONZE, Tiers.SILVER, Tiers.GOLD];
    return [Tiers.NEW, ...tierList.slice(this.firstTier - Tiers.BRONZE)];
  }

  get tier() { 
    return this.tiers[this.step]; 
  }

  get state() {
    return this._state;
  }

  plug(plugin) {
    plugin.onPlug(this);
    return this;
  }

  beforeReset(callback) {
    this._beforeResetCallbacks.push(callback);
    return this;
  }

  reset() {
    this._beforeResetCallbacks.forEach(cb => cb(this));
    this._done = 0;
    this._afterResetCallbacks.forEach(cb => cb(this));
    return this;
  }

  afterReset(callback) {
    this._afterResetCallbacks.push(callback);
    return this;
  }

  beforeProgress(callbacks) {
    this._beforeProgressCallbacks.push(callback);
    return this;
  }

  progress() {
    this._beforeProgressCallbacks.forEach(cb => cb(this));
    this._done ++;

    this.goals.forEach((g, i) => {
      if (this._done == this._goals[i])
        this._goalsReached[i] = true;
    });

    if (this.earned) this.unsubscribeAll();

    this._afterProgressCallbacks.forEach(cb => cb(this));
    return this;
  }

  afterProgress(callback) {
    this._afterProgressCallbacks.push(callback);
    return this;
  }

  subscribe({
    trigger,
    condition: satisfy = (a) => true,
    type = Achievement.Triggers.PROGRESS
  }) {

    const callback = (...args) => { 
      if (satisfy(this, ...args)) {
        if (type == Achievement.Triggers.PROGRESS) this.progress();
        if (type == Achievement.Triggers.RESET) this.reset();
      }
    }

    trigger.addListener(callback);
    this._triggers.push({ trigger, callback, type });

    return this;
  }

  unsubscribe(trigger, type) {
    const matched = t => t.trigger == trigger && t.type == type;
    this._triggers
      .filter(t => matched(t))
      .forEach(t => t.removeListener(t.callback));
      
    this._triggers = this._trigger.filter(t => !matched(t));
    return this;
  }

  unsubscribeAll() {
    this._triggers.forEach(t => t.removeListener(t.callback));
    this._triggers = [];
    return this;
  }

  with(config) {
    return this.subscribe(config);
  }
}

export const createDefaultAchievements = () => [
  Achievement
    .create({
      title: 'Early Bird',
      description: 'Open a page between 04:50 and 05:10 in the morning for <goal> consecutive days',
      goals: [2, 7, 30],
    })
    .plug(lastDoneTime) 
    .with({
      trigger: chrome.webNavigation.onCommitted,
      type: Achievement.Triggers.PROGRESS,
      condition: pass.all(
        lastDoneTime.oncePerDay,
        lastDoneTime.betweenTime(new utils.Time(4, 50), new utils.Time(5, 10)),
      )      
    })
    .with({
      trigger: triggers.any(
        chrome.idle.onStateChanged,
        chrome.webNavigation.onCommitted
      ),
      type: Achievement.Triggers.RESET,
      condition: pass.any(
        fail(lastDoneTime.consecutiveDay),
        pass.all(
          lastDoneTime.afterTime(new utils.Time(5, 10)),
          a => a.state.lastDoneTime
            && utils.dayPassed(a.state.lastDoneTime, new Date()) == 1,
        ),
      )
    }),
];

export const achieve = (config) => Achievement.create(config);

export default Achievement;
