import React from 'react';
import AchievementItem from 'pu/components/AchievementItem';

const AchievementList = ({ achievements }) => (
  <div>
    <p> Achievements </p>
    <hr />
    {achievements.map((a, idx) => (
      <AchievementItem key={a.title} {...a} />
    ))}
  </div>
);

export default AchievementList;
