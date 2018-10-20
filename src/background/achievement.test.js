import Achievement, { achieve } from './achievement.js';

describe('Achievement', () => {
  describe('can be created', () => {
    test('with only title', () => {
      const title = 'New Achievement';
      const a = achieve({ title });
      expect(a).toBeDefined();
      expect(a.title).toBe(title);
    });

    test('with title and other optionals', () => {
      const title = 'New Tittle';
      const description = 'New Description';
      const goals = [1, 2, 3];
      const firstTier = Achievement.Tiers.SILVER;
      const hidden = true;
      const a = achieve({ title, description, goals, firstTier, hidden });

      expect(a).toBeDefined();
      expect(a.title).toBe(title);
      expect(a.description).toBe(description);
      expect(a.goals).toBe(goals);
      expect(a.firstTier).toBe(firstTier);
      expect(a.hidden).toBe(hidden);
    });
  });

  describe('getter', () => {

  });
});
