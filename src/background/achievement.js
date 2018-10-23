/**
 * @module achievement
 */

import { pass, fail } from './condition';
import utils from '../utils';
import { lastDoneTime } from './plugin';
import triggers from './trigger';

class Achievement {
  /**
   * @constructor Achievement
   * @param {Object} config
   * @param {string} config.title - Short description
   * @param {string} [config.description=''] - Long description
   * @param {number[]} [config.goals=[1]] - List of goals to reach
   * @param {boolean} [config.hidden=false] - Whether to show this to users
   * @param {boolean} [config.firstTier=Achievement.Tiers.BRONZE] - Tier on first goal reached
   */
  constructor ({
    title,
    goals = [1],
    description = '',
    firstTier = Achievement.Tiers.BRONZE,
    hidden = false,
  }) {
    if (!title) { throw 'Achievement title cannot be empty'; }

    this._title = title;
    this._goals = goals;
    this._description = description;
    this._firstTier = firstTier;
    this._hidden = hidden;

    this._done = 0;
    this._state = {};
    this._goalsReached = new Array(this._goals.length).fill(false);
    this._triggers = [];

    this._beforeProgressCallbacks = [];
    this._afterProgressCallbacks = [];
    this._beforeResetCallbacks = [];
    this._afterResetCallbacks = [];
  }

  /**
   * Create an instance of Achievement
   * @param {Object} config
   */
  static create (config) {
    return new Achievement(config);
  }

  /**
   * @typedef {number} Achievement.Tiers
   * @enum {Achievement.Tiers}
   */
  static get Tiers () {
    return Object.freeze({
      NEW: 0,
      BRONZE: 1,
      SILVER: 2,
      GOLD: 3,
    });
  }

  /**
   * @typedef {number} Achievement.Triggers
   * @enum {Achievement.Triggers}
   */
  static get Triggers () {
    return Object.freeze({
      PROGRESS: 0,
      RESET: 1,
    });
  }

  /**
   * Short description
   * @type {string}
   */
  get title () {
    return this._title;
  }

  /**
   * Long description
   * @type {string}
   */
  get description () {
    return this._description.replace(/<(\w+)>/g, (match, p) => this[p]);
  };

  /**
   * Current goal
   * @type {?number}
   */
  get goal () {
    return this.goals.filter(g => g > this._done)[0];
  }

  /**
   * All goals
   * @type {number[]}
   */
  get goals () {
    return this._goals;
  }

  /**
   * Indicate which goals are reached
   * @type {boolean[]}
   */
  get goalsReached () {
    return this._goalsReached;
  }

  /**
   * Tier when first goal reached
   * @type {Achievement.Tiers}
   */
  get firstTier () {
    return this._firstTier;
  }

  /**
   * Indicate whether to show this achievement to users
   * @type {boolean}
   */
  get hidden () {
    return this._hidden;
  }

  /**
   * Current progress
   * @type {number}
   */
  get done () {
    return Math.min(this._done, this.goals[this.goals.length - 1]);
  }

  /**
   * Indicate whether all goals are reached
   * @type {boolean}
   */
  get earned () {
    return this.goalsReached.every(reached => reached);
  }

  /**
   * How many goals have been reached
   * @type {number}
   */
  get step () {
    const numStep = this.goals.length + 1;
    return (this.goals.indexOf(this.goal) + numStep) % numStep;
  }

  /**
   * Available tiers
   * @type {Achievement.Tiers[]}
   */
  get tiers () {
    const Tiers = Achievement.Tiers;
    const tierList = [Tiers.BRONZE, Tiers.SILVER, Tiers.GOLD];
    return [Tiers.NEW, ...tierList.slice(this.firstTier - Tiers.BRONZE)];
  }

  /**
   * Current tier
   * @type {Achievement.Tier}
   */
  get tier () {
    return this.tiers[this.step];
  }

  /**
   * Store plugins data
   * @type {Object}
   */
  get state () {
    return this._state;
  }

  /**
   * Add a plugin
   */
  plug (plugin) {
    plugin.onPlug(this);
    return this;
  }

  /**
   * Register callback to call before reseting achievement
   */
  beforeReset (callback) {
    this._beforeResetCallbacks.push(callback);
    return this;
  }

  /**
   * Reset achievement
   */
  reset () {
    this._beforeResetCallbacks.forEach(cb => cb(this));
    this._done = 0;
    this._afterResetCallbacks.forEach(cb => cb(this));
    return this;
  }

  /**
   * Register callback to call after reseting achievement
   */
  afterReset (callback) {
    this._afterResetCallbacks.push(callback);
    return this;
  }

  /**
   * Register callback to call before progressing achievement
   */
  beforeProgress (callbacks) {
    this._beforeProgressCallbacks.push(callback);
    return this;
  }

  /*
   * Progress achievement
   */
  progress () {
    this._beforeProgressCallbacks.forEach(cb => cb(this));
    this._done++;

    this.goals.forEach((g, i) => {
      if (this._done == this._goals[i]) { this._goalsReached[i] = true; }
    });

    if (this.earned) this.unsubscribeAll();

    this._afterProgressCallbacks.forEach(cb => cb(this));
    return this;
  }

  /**
   * Register callback to call after progressing achievement
   */
  afterProgress (callback) {
    this._afterProgressCallbacks.push(callback);
    return this;
  }

  /**
   * Listen to events to progress or reset achievement
   */
  subscribe ({
    trigger,
    condition: satisfy = (a) => true,
    type = Achievement.Triggers.PROGRESS,
  }) {
    const callback = (...args) => {
      if (satisfy(this, ...args)) {
        if (type == Achievement.Triggers.PROGRESS) this.progress();
        if (type == Achievement.Triggers.RESET) this.reset();
      }
    };

    trigger.addListener(callback);
    this._triggers.push({ trigger, callback, type });

    return this;
  }

  /**
   * Stop listening to a registered event
   */
  unsubscribe (trigger, type) {
    const matched = t => t.trigger == trigger && t.type == type;
    this._triggers
      .filter(t => matched(t))
      .forEach(t => t.removeListener(t.callback));

    this._triggers = this._trigger.filter(t => !matched(t));
    return this;
  }

  /**
   * Stop listening to all registered events
   */
  unsubscribeAll () {
    this._triggers.forEach(t => t.removeListener(t.callback));
    this._triggers = [];
    return this;
  }

  /**
   * Subscribe alias
   */
  with (config) {
    return this.subscribe(config);
  }
}

/**
 * Create default achievements
 * @function
 * @return {Achievement[]} Array of created achievements
 */
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
      ),
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
          a => a.state.lastDoneTime &&
            utils.dayPassed(a.state.lastDoneTime, new Date()) == 1,
        ),
      ),
    }),
];

/**
 * Create new instance of Achievement
 * @function
 * @returns {Achievement} New achievement
 */
export const achieve = (config) => Achievement.create(config);

export default Achievement;
