/* ----------------------- Load environment variables ----------------------- */
require('dotenv').config();

/* ----------------------------- Module imports ----------------------------- */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const path = require('path');

/* ------------------------- Project module imports ------------------------- */
const tagManager = require('./services/tagManager.service');
const aiOverviewService = require('./services/aiOverview.service');
const { setupSwagger } = require('./docs/swagger');
const { dbConnect } = require('./services/mongodb.service');

/* ----------------------------- Router imports ----------------------------- */
const UnitRouter = require('./routes/units');
const ReviewRouter = require('./routes/reviews');
const AuthRouter = require('./routes/auth');
const NotificationRouter = require('./routes/notifications');
const GitHubRouter = require('./routes/github');
const SetuRouter = require('./routes/setus');

/* ------------------------ Environment configuration ----------------------- */
const isDevelopment = process.env.DEVELOPMENT === 'true';
const isProductionMachine = process.env.PRODUCTION_MACHINE !== 'false';
console.log(`Running in ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
console.log(
  `Production machine: ${isProductionMachine ? 'YES' : 'NO'} (secure cookies: ${!isDevelopment && isProductionMachine ? 'enabled' : 'disabled'})`
);

/* ------------------------------- Middlewares ------------------------------ */
if (isDevelopment) {
  app.use(
    cors({
      origin: 'http://localhost:4200',
      credentials: true,
    })
  );
}

app.use(express.json({ limit: '50mb' })); // Increased payload limit for JSON requests.
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Increased payload limit for URL-encoded requests.
app.use(cookieParser());

/* ---------------------------------- CSRF ---------------------------------- */
app.use(
  csrf({
    cookie: {
      httpOnly: true,
      secure: !isDevelopment && isProductionMachine,
      sameSite: 'strict',
    },
  })
);

/* --------------------------- CSRF Token endpoint -------------------------- */
app.get('/api/v1/csrf-token', (req, res) => {
  // #swagger.tags = ['CSRF']
  // #swagger.summary = 'Get CSRF token'
  res.json({ csrfToken: req.csrfToken() });
});

/* --------------------- Database connection middleware --------------------- */
app.use(async (req, res, next) => {
  try {
    await dbConnect();
    next();
  } catch (err) {
    console.error('Database connection failed:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

/* --------------------------------- Routes --------------------------------- */
app.use('/api/v1/units', UnitRouter);
app.use('/api/v1/reviews', ReviewRouter);
app.use('/api/v1/auth', AuthRouter);
app.use('/api/v1/notifications', NotificationRouter);
app.use('/api/v1/github', GitHubRouter);
app.use('/api/v1/setus', SetuRouter);

/* ---------------------------- Swagger ui setup ---------------------------- */
setupSwagger(app).catch(console.error);

/* -------------------------- Serving static files -------------------------- */
if (!isDevelopment) {
  app.use(
    express.static(path.join(__dirname, '../frontend/dist/frontend/browser'))
  );
}

/* ------------------------ Error handling middleware ----------------------- */
app.use((obj, req, res, next) => {
  const statusCode = obj.status || 500;
  const message = obj.message || 'Internal server error';
  return res.status(statusCode, {
    success: [200, 201, 204].some((a) => a === obj.status) ? true : false,
    status: statusCode,
    message: message,
    data: obj.data,
  });
});

/* -------------------------------- Services -------------------------------- */
// TODO: Use vercel-cron for jobs, node-cron doesn't work on vercel.

/* ---------------------------- Export for vercel --------------------------- */
module.exports = app;

/* ----------------------- Start server for local dev ----------------------- */
if (require.main === module) {
  const PORT = process.env.PORT || 8080;

  dbConnect()
    .then(async () => {
      try {
        await tagManager.updateMostReviewsTag(1);
      } catch (e) {
        console.error('Initial tag update failed', e);
      }

      app.listen(PORT, (err) => {
        if (err) console.error(err);
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to DB locally', err);
    });
}
