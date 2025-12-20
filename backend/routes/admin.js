const express = require('express');
const CacheService = require('../services/redis.service.js');
const { verifyAdmin } = require('../utils/verify_token.js');
const router = express.Router();

router.get('/invalidate-cache', async (req, res) => {
  // #swagger.tags = ['Developer']
  // #swagger.summary = 'Invalidate the cache'

  try {
    await CacheService.invalidate('*');

    res.status(200).json({ message: 'Successfully invalidated all cache' });
  } catch (err) {
    console.error('Error when invalidating cache:', err);
    res.status(500).json({ message: 'Error when invalidating cache' });
  }
});

module.exports = router;
