const mongoose = require('mongoose');
const { Schema } = mongoose;

const UnitTags = {
  MOST_REVIEWS: 'most-reviews',
  CONTROVERSIAL: 'controversial',
  WAM_BOOSTER: 'wam-booster',
};

/**
 * @typedef {Object} IRequisite
 * @property {number} [NumReq] - Number of units required
 * @property {import('mongoose').Types.Array<string>} [units] - Array of unit codes
 */

/**
 * @typedef {Object} IRequisites
 * @property {boolean} permission - Permission required
 * @property {import('mongoose').Types.Array<string>} [prohibitions] - Prohibited units
 * @property {import('mongoose').Types.DocumentArray<IRequisite>} [corequisites] - Corequisite requirements
 * @property {import('mongoose').Types.DocumentArray<IRequisite>} [prerequisites] - Prerequisite requirements
 * @property {number} cpRequired - Credit points required
 */

/**
 * @typedef {Object} IOffering
 * @property {string} location - Campus location
 * @property {string} mode - Delivery mode
 * @property {string} name - Teaching period name
 * @property {string} period - Teaching period code
 */

/**
 * @typedef {Object} IAIOverview
 * @property {string} [summary] - AI-generated summary
 * @property {Date} [generatedAt] - When the overview was generated
 * @property {string} [model] - AI model used
 * @property {number} [totalReviewsConsidered] - Total reviews analyzed
 * @property {number} [reviewSampleSize] - Sample size used
 * @property {import('mongoose').Types.Array<string>} setuSeasons - SETU seasons included
 */

/**
 * @typedef {Object} IUnit
 * @property {import('mongoose').Types.ObjectId} _id - Unit ID
 * @property {string} unitCode - Unit code (lowercase)
 * @property {string} name - Unit name
 * @property {string} [description] - Unit description
 * @property {import('mongoose').Types.Array<import('mongoose').Types.ObjectId>} reviews - Array of review IDs
 * @property {number} avgOverallRating - Average overall rating (0-5)
 * @property {number} avgRelevancyRating - Average relevancy rating (0-5)
 * @property {number} avgFacultyRating - Average faculty rating (0-5)
 * @property {number} avgContentRating - Average content rating (0-5)
 * @property {number} level - Unit level (1-4)
 * @property {number} creditPoints - Credit points
 * @property {string} school - School name
 * @property {string} academicOrg - Academic organization
 * @property {string} scaBand - SCA band
 * @property {IRequisites} requisites - Unit requisites
 * @property {import('mongoose').Types.DocumentArray<IOffering>} offerings - Unit offerings
 * @property {import('mongoose').Types.Array<string>} tags - Unit tags (max 2)
 * @property {IAIOverview} [aiOverview] - AI-generated overview
 */

const RequisiteSchema = new Schema({
  NumReq: { type: Number, required: false },
  units: { type: [String], required: false },
});

const UnitSchema = new Schema({
  unitCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
    set: (value) => value.toLowerCase(),
  },
  name: { type: String, required: true },
  description: { type: String },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],

  avgOverallRating: { type: Number, default: 0, min: 0, max: 5 },
  avgRelevancyRating: { type: Number, default: 0, min: 0, max: 5 },
  avgFacultyRating: { type: Number, default: 0, min: 0, max: 5 },
  avgContentRating: { type: Number, default: 0, min: 0, max: 5 },

  level: { type: Number, required: true },
  creditPoints: { type: Number, required: true },
  school: { type: String, required: true },
  academicOrg: { type: String, required: true },
  scaBand: { type: String, required: true },

  requisites: {
    permission: { type: Boolean, default: false },
    prohibitions: { type: [String], required: false },
    corequisites: { type: [RequisiteSchema], required: false },
    prerequisites: { type: [RequisiteSchema], required: false },
    cpRequired: { type: Number, default: 0 },
  },

  offerings: [
    {
      location: { type: String, required: true },
      mode: { type: String, required: true },
      name: { type: String, required: true },
      period: { type: String, required: true },
    },
  ],

  tags: {
    type: [{ type: String, enum: Object.values(UnitTags) }],
    validate: {
      validator: (val) => val.length <= 2,
      message: 'Unit can only have up to 2 tags',
    },
  },

  aiOverview: {
    summary: { type: String },
    generatedAt: { type: Date },
    model: { type: String },
    totalReviewsConsidered: { type: Number },
    reviewSampleSize: { type: Number },
    setuSeasons: { type: [String], default: [] },
  },
});

const Unit = mongoose.model('Unit', UnitSchema);
module.exports = Unit;
