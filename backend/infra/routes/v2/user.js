const express = require('express');

const UserController = require('@controllers/user.controller');

const router = express.Router();

router.post(
  '/google/authenticate',
  // #swagger.tags = ['User V2']
  // #swagger.summary = 'Login/register a user with Google OAuth'
  UserController.authenticateWithGoogle
);

module.exports = router;
