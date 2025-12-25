const UnitService = require('@services/unit.service');
const Unit = require('@models/unit');
const Review = require('@models/review');

describe('UnitService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getMostReviewedUnits', () => {
    it('should return populated units', async () => {
      // no arranging needed

      // act
      const results = await UnitService.getMostReviewedUnits(10);

      // assert
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(10);

      for (let i = 0; i <= results.length - 2; i++) {
        const current = results[i].reviews.length;
        const next = results[i + 1].reviews.length;

        expect(current).toBeGreaterThanOrEqual(next);
      }
    });
  });
});
