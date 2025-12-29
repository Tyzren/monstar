const express = require('express');

const UserController = require('@controllers/user.controller');

const router = express.Router();

router.post(
  '/google/authenticate',
  // #swagger.tags = ['User V2']
  // #swagger.summary = 'Login/register a user with Google OAuth'
  UserController.authenticateWithGoogle
);

router.post(
  '/refresh',
  // #swagger.tags = ['User V2']
  // #swagger.summary = 'Refresh access token using refresh token'
  UserController.refresh
)

router.post(
  '/logout',
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Clear the token cookies and invalidate refresh token in database'
  UserController.logout
)

module.exports = router;
