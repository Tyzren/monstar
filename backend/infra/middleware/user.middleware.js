const { CreateError } = require('@utilities/error');
const jwt = require('jsonwebtoken');

const userMiddleware = (err, req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) return next(CreateError(401, 'You are not authenticated!'));

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(CreateError(403, 'Token is not valid'));

    req.user = user;
    next();
  });
};

module.exports = userMiddleware
