import React from 'react';

/* const Tiers = Object.freeze({
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
}); */

const displayTier = t =>
  ({
    1: 'BRONZE',
    2: 'SILVER',
    3: 'GOLD',
  }[t]);

const AchievementItem = ({
  title,
  description,
  goal,
  hidden,
  done,
  earned,
  tier,
}) => (
  <div>
    <div className="title">
      <b>{title}</b> ({displayTier(tier)})
    </div>
    {(!hidden || earned) && (
      <>
        <div className="description">
          <i>{description}</i>
        </div>
        <div className="progress">
          Progress: {done}
          &#47;
          {goal}
        </div>
      </>
    )}
    <hr />
  </div>
);

export default AchievementItem;
