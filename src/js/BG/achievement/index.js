/**
 * @module achievement
 */

import storage from 'BG/storage';
import achieveEarlyBird from 'BG/achievement/earlyBird';

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
  constructor({
    title,
    goals = [1],
    description = '',
    firstTier = Achievement.Tiers.BRONZE,
    hidden = false,
  }) {
    if (!title) {
      throw new Error('Achievement title cannot be empty');
    }

    this._title = title;
    this._goals = goals;
    this._description = description;
    this._firstTier = firstTier;
    this._hidden = hidden;

    this._done = 0;
    this._step = 0;
    this._state = {};
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
  static create(config) {
    return new Achievement(config);
  }

  static get SavedKey() {
    return '_title';
  }

  static get SavedProps() {
    return [
      '_description',
      '_goals',
      '_firstTier',
      '_hidden',
      '_done',
      '_step',
      '_state',
      'createdAt',
      'updatedAt',
    ];
  }

  static get ShownProps() {
    return ['title', 'description', 'goal', 'hidden', 'done', 'earned', 'tier'];
  }

  /**
   * @typedef {number} Achievement.Tiers
   * @enum {Achievement.Tiers}
   */
  static get Tiers() {
    return Object.freeze({
      BRONZE: 1,
      SILVER: 2,
      GOLD: 3,
    });
  }

  /**
   * @typedef {number} Achievement.Triggers
   * @enum {Achievement.Triggers}
   */
  static get Triggers() {
    return Object.freeze({
      PROGRESS: 0,
      RESET: 1,
    });
  }

  /**
   * Short description
   * @type {string}
   */
  get title() {
    return this._title;
  }

  /**
   * Long description
   * @type {string}
   */
  get description() {
    return this._description.replace(/<(\w+)>/g, (match, p) => this[p]);
  }

  /**
   * Current goal or last goal if all goals are completed
   * @type {number}
   */
  get goal() {
    if (this.earned) return this._goals[this._goals.length - 1];
    return this._goals[this._step];
  }

  /**
   * All goals
   * @type {number[]}
   */
  get goals() {
    return this._goals;
  }

  /**
   * Tier when first goal reached
   * @type {Achievement.Tiers}
   */
  get firstTier() {
    return this._firstTier;
  }

  /**
   * Indicate whether to show this achievement to users
   * @type {boolean}
   */
  get hidden() {
    return this._hidden;
  }

  /**
   * Current progress
   * @type {number}
   */
  get done() {
    return this._done;
  }

  /**
   * Indicate whether all goals are reached
   * @type {boolean}
   */
  get earned() {
    return this._step === this._goals.length;
  }

  /**
   * How many goals have been reached
   * @type {number}
   */
  get step() {
    return this._step;
  }

  /**
   * Available tiers
   * @type {Achievement.Tiers[]}
   */
  get tiers() {
    const Tiers = Achievement.Tiers;
    const tierList = [Tiers.BRONZE, Tiers.SILVER, Tiers.GOLD];
    return tierList.slice(this.firstTier - Tiers.BRONZE);
  }

  /**
   * Current tier
   * @type {Achievement.Tier}
   */
  get tier() {
    return this.earned ? this.tiers[this._step - 1] : this.tiers[this._step];
  }

  /**
   * Store plugins data
   * @type {Object}
   */
  get state() {
    return this._state;
  }

  /**
   * Data shown to other components
   * @type {Object}
   */
  get shownData() {
    return Achievement.ShownProps.reduce((obj, k) => {
      obj[k] = this[k];
      return obj;
    }, {});
  }

  /**
   * Add a plugin
   */
  plug(plugin) {
    plugin.onPlug(this);
    return this;
  }

  /**
   * Register callback to call before reseting achievement
   */
  beforeReset(callback) {
    this._beforeResetCallbacks.push(callback);
    return this;
  }

  /**
   * Reset achievement
   */
  reset() {
    if (this.earned) return this;
    this._beforeResetCallbacks.forEach(cb => cb(this));
    this._done = 0;
    this._afterResetCallbacks.forEach(cb => cb(this));
    this.save();
    return this;
  }

  /**
   * Register callback to call after reseting achievement
   */
  afterReset(callback) {
    this._afterResetCallbacks.push(callback);
    return this;
  }

  /**
   * Register callback to call before progressing achievement
   */
  beforeProgress(callback) {
    this._beforeProgressCallbacks.push(callback);
    return this;
  }

  /*
   * Progress achievement
   */
  progress() {
    if (this.earned) return this;

    this._beforeProgressCallbacks.forEach(cb => cb(this));

    this._done++;
    const goal = this._goals.filter(g => g > this._done)[0];
    if (goal == null) this._step = this._goals.length;
    else this._step = this._goals.indexOf(goal);

    if (this.earned) this.unsubscribeAll();
    this._afterProgressCallbacks.forEach(cb => cb(this));
    this.save();

    return this;
  }

  /**
   * Register callback to call after progressing achievement
   */
  afterProgress(callback) {
    this._afterProgressCallbacks.push(callback);
    return this;
  }

  /**
   * Listen to events to progress or reset achievement
   */
  subscribe({
    trigger,
    condition: satisfy = a => true,
    type = Achievement.Triggers.PROGRESS,
  }) {
    const callback = (...args) => {
      if (satisfy(this, ...args)) {
        if (type === Achievement.Triggers.PROGRESS) this.progress();
        if (type === Achievement.Triggers.RESET) this.reset();
      }
    };

    trigger.addListener(callback);
    this._triggers.push({ trigger, callback, type });

    return this;
  }

  /**
   * Stop listening to a registered event
   */
  unsubscribe(trigger, type) {
    const matched = t => t.trigger === trigger && t.type === type;
    this._triggers
      .filter(t => matched(t))
      .forEach(t => t.trigger.removeListener(t.callback));

    this._triggers = this._triggers.filter(t => !matched(t));
    return this;
  }

  /**
   * Stop listening to all registered events
   */
  unsubscribeAll() {
    this._triggers.forEach(t => t.trigger.removeListener(t.callback));
    this._triggers = [];
    return this;
  }

  /** Subscribe alias for type PROGRESS */
  progressOn(trigger, condition) {
    return this.subscribe({
      trigger,
      condition,
      type: Achievement.Triggers.PROGRESS,
    });
  }

  /** Subscribe alias for type RESET */
  resetOn(trigger, condition) {
    return this.subscribe({
      trigger,
      condition,
      type: Achievement.Triggers.RESET,
    });
  }

  /** Save to chrome storage */
  async save() {
    const objToSave = {};
    const now = new Date().toISOString();

    this.createdAt = this.createdAt || now;
    this.updatedAt = now;

    Achievement.SavedProps.forEach(prop => {
      objToSave[prop] = this[prop];
    });

    await storage.set({ [this[Achievement.SavedKey]]: objToSave });
    return this;
  }

  /** Load from chrome storage */
  async load() {
    const key = this[Achievement.SavedKey];
    const res = await storage.get(key);
    const values = res[key];

    if (values) {
      Achievement.SavedProps.forEach(prop => {
        this[prop] = values[prop];
      });
      if (this.earned) this.unsubscribeAll();
    }
    return this;
  }
}

/**
 * Create new instance of Achievement
 * @function
 * @returns {Achievement} New achievement
 */
export const achieve = config => Achievement.create(config);

/**
 * Create default achievements
 * @function
 * @returns {Achievement[]} Array of created achievements
 */
export const createDefaultAchievements = () => [achieveEarlyBird()];

/**
 * Reset all achievements
 * @function
 * @returns {Promise}
 */
export const resetAllAchievements = achievements => {
  achievements.forEach(a => {
    a._done = 0;
    a._step = 0;
    a._state = {};
    a.createdAt = null;
    a.updatedAt = null;
  });
  return storage.clear();
};

export default Achievement;
