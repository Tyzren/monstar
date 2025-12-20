const express = require('express');
const Unit = require('../../models/unit');
const router = express.Router();
const CacheService = require('../../services/redis.service');

router.get('/popular', async (req, res) => {
  // #swagger.tags = ['Units V2']
  // #swagger.summary = 'Get 10 most popular units'

  try {
    const popularUnits = await CacheService.getOrSet(
      'units:popular',
      async () => {
        const aggResults = await Unit.aggregate([
          {
            $addFields: {
              reviewCount: { $size: '$reviews' },
            },
          },
          {
            $sort: { reviewCount: -1 },
          },
          {
            $limit: 10,
          },
        ]);

        return aggResults;
      },
      CacheService.POPULAR_UNITS_TTL
    );

    return res.status(200).json(popularUnits);
  } catch (err) {
    console.error('Error fetching popular units:', err);
    return res
      .status(500)
      .json({ message: 'An error occured while fetching popular units.' });
  }
});

module.exports = router;
