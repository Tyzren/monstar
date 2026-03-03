const { CreateError } = require('@utilities/error');

const userMiddleware = require('./user.middleware');

const adminMiddleware = (req, res, next) => {
  userMiddleware(req, res, (err) => {
    if (err) return next(err);

    if (req.user?.isAdmin) return next();

    return next(
      CreateError(403, 'You are not authorised! You are not an admin.')
    );
  });
};

module.exports = adminMiddleware;
