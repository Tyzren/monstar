/* ----------------------- Load environment variables ----------------------- */
require('dotenv').config();
require('module-alias/register');

/* ----------------------------- Module imports ----------------------------- */
const path = require('path');

const cookieParser = require('cookie-parser');
const cors = require('cors');
const csrf = require('csurf');
const express = require('express');

const { setupSwagger } = require('@docs/swagger');
const { dbConnect } = require('@infra/providers/mongodb.provider');
const tagManager = require('@infra/providers/tagManager.provider');
const errorMiddleware = require('@middleware/error.middleware');

/* --------------------------- Initialize Express --------------------------- */
const app = express();

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
app.use('/api/v1/units', require('./infra/routes/v1/units'));
app.use('/api/v2/units', require('./infra/routes/v2/units'));
app.use('/api/v1/reviews', require('./infra/routes/v1/reviews'));
app.use('/api/v1/auth', require('./infra/routes/v1/auth'));
app.use('/api/v1/notifications', require('./infra/routes/v1/notifications'));
app.use('/api/v1/github', require('./infra/routes/v1/github'));
app.use('/api/v1/setus', require('./infra/routes/v1/setus'));
if (isDevelopment && !isProductionMachine) {
  app.use('/api/admin', require('./infra/routes/v1/admin'));
}

/* ---------------------------- Swagger ui setup ---------------------------- */
setupSwagger(app).catch(console.error);

/* -------------------------- Serving static files -------------------------- */
if (!isDevelopment) {
  app.use(
    express.static(path.join(__dirname, '../frontend/dist/frontend/browser'))
  );
}

/* ------------------------ Error handling middleware ----------------------- */
app.use(errorMiddleware);

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
