import React from 'react';
import { shallow } from 'enzyme';

import AchievementItem from './AchievementItem';

const defaultProps = {
  title: 'No Title',
  description: 'No description',
  goal: [2, 7, 30],
  hidden: false,
  done: 3,
  earned: false,
  tier: 2,
};

describe('AchievementItem', () => {
  test('render correctly', () => {
    const component = shallow(<AchievementItem {...defaultProps} />);
    expect(component).toMatchSnapshot();
  });

  test('do not show description with "hidden" prop', () => {
    const component = shallow(
      <AchievementItem {...defaultProps} hidden={true} />
    );
    expect(component).toMatchSnapshot();
  });

  test('show hidden description with "earned" prop', () => {
    const component = shallow(
      <AchievementItem {...defaultProps} hidden={true} earned={true} />
    );
    expect(component).toMatchSnapshot();
  });
});
