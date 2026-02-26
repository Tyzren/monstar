const { CreateError } = require('@utilities/error');

const userMiddleware = require('./user.middleware');

const adminMiddleware = (err, req, res, next) => {
  userMiddleware(req, res, () => {
    if (req.user.admin) next();

    return next(
      CreateError(403, 'You are not authorized! You are not an admin.')
    );
  });
};

module.exports = adminMiddleware;
