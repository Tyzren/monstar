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
}

module.exports = UserController;
