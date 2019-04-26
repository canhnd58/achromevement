import React from 'react';
import AchievementItem from 'pu/components/AchievementItem';

const AchievementList = ({ achievements }) => (
  <div>
    <p> Achievements </p>
    <hr />
    {achievements.map(a => (
      <>
        <AchievementItem key={a.title} {...a} />
        <hr />
      </>
    ))}
  </div>
);

export default AchievementList;
