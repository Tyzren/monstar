const express = require('express');
const multer = require('multer');

const UserController = require('@controllers/user.controller');
const userMiddleware = require('@middleware/user.middleware');
const { storage } = require('@providers/cloudinary.provider');

const upload = multer({ storage });
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
);

router.post(
  '/logout',
  userMiddleware,
  // #swagger.tags = ['User V2']
  // #swagger.summary = 'Clear the token cookies and invalidate refresh token in database'
  UserController.logout
);

router.get(
  '/validate',
  // #swagger.tags = ['User V2']
  // #swagger.summary = 'Check if the user has the access_token in their cookies to keep session'
  UserController.validate
);

router.post(
  '/upload-avatar',
  userMiddleware,
  upload.single('avatar'),
  // #swagger.tags = ['User V2']
  // #swagger.summary = 'Upload avatar to cloudinary and assign it as user's profileImg'
  UserController.uploadAvatar
);

module.exports = router;
