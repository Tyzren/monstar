// Load environment variables
require('dotenv').config();

// Module Imports
const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const tagManager = require('./services/tagManager.service');
const aiOverviewService = require("./services/aiOverview.service");
const { setupSwagger } = require('./docs/swagger');
const { exec } = require('child_process');
const path = require('path');

// Router Imports
const UnitRouter = require('./routes/units');
const ReviewRouter = require('./routes/reviews');
const AuthRouter = require('./routes/auth');
const NotificationRouter = require('./routes/notifications');
const GitHubRouter = require('./routes/github');
const SetuRouter = require('./routes/setus');

// === Environment Configuration ===
const isDevelopment = process.env.DEVELOPMENT === 'true';
const isProductionMachine = process.env.PRODUCTION_MACHINE !== 'false';
console.log(`Running in ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
console.log(`Production machine: ${isProductionMachine ? 'YES' : 'NO'} (secure cookies: ${!isDevelopment && isProductionMachine ? 'enabled' : 'disabled'})`);

// === Middleware ===
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

// CSRF Protection
app.use(csrf({
  cookie: {
    httpOnly: true,
    secure: !isDevelopment && isProductionMachine,
    sameSite: 'strict'
  }
}));

// Response handler middlware
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

// === CSRF Token Endpoint ===
app.get('/api/v1/csrf-token', (req, res) => {
  // #swagger.tags = ['CSRF']
  // #swagger.summary = 'Get CSRF token'
  res.json({ csrfToken: req.csrfToken() });
});

// === Routes ===
app.use('/api/v1/units', UnitRouter);
app.use('/api/v1/reviews', ReviewRouter);
app.use('/api/v1/auth', AuthRouter);
app.use('/api/v1/notifications', NotificationRouter);
app.use('/api/v1/github', GitHubRouter);
app.use('/api/v1/setus', SetuRouter);

// === Swagger UI Setup ===
setupSwagger(app).catch(console.error);

// === Serving Static Files (Production Mode) ===
if (!isDevelopment) {
  app.use(
    express.static(path.join(__dirname, '../frontend/dist/frontend/browser'))
  );
}

// === Connect to MongoDB ===
const url = process.env.MONGODB_CONN_STRING;
async function connect(url) {
  await mongoose.connect(url);
}
connect(url)
  .then(() => {
    console.log('Connected to MongoDB Database');
    tagManager.updateMostReviewsTag(1);
  })
  .catch((error) => console.log(error));

// === Services ===
// TODO: Use vercel-cron for jobs, node-cron doesn't work on vercel.

// === Catch all route (Production Mode) ===
// === Export for Vercel ===
module.exports = app;

// === Start Server (for local development) ===
if (require.main === module) {
  const PORT = process.env.PORT || 8080; // Default to 8080 if no port specified
  app.listen(PORT, (error) => {
    if (error) console.log(error);

    console.log(`Server running on port ${PORT}`);
  });
}
