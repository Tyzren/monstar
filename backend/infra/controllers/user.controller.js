const asyncHandler = require('express-async-handler');

const TokenProvider = require('@infra/providers/token.provider');
const UserService = require('@infra/services/user.service');

class UserController {
  static authenticateWithGoogle = asyncHandler(async (req, res) => {
    const { idToken } = req.body;

    const { accessToken, refreshToken, user } =
      await UserService.googleAuthenticate(idToken);

    return res
      .cookie('access_token', accessToken, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: TokenProvider.ACCESS_TOKEN_EXPIRY,
      })
      .cookie('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: TokenProvider.REFRESH_TOKEN_EXPIRY,
      })
      .status(200)
      .json({ message: 'Login successful', data: user });
  });

  static refresh = asyncHandler(async (req, res) => {
    const { refresh_token } = req.cookies;
    if (!refresh_token) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    const { newAccessToken, newRefreshToken } =
      await UserService.refreshUserToken(refresh_token);

    res
      .cookie('access_token', newAccessToken, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: TokenProvider.ACCESS_TOKEN_EXPIRY,
      })
      .cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: TokenProvider.REFRESH_TOKEN_EXPIRY,
      })
      .status(200)
      .json({ message: 'Token refreshed successfully' });
  });
}

module.exports = UserController;
