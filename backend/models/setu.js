const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * @typedef {Object} ISETU
 * @property {import('mongoose').Types.ObjectId} _id - SETU record ID
 * @property {string} unit_code - Unit code
 * @property {string} unit_name - Unit name
 * @property {string} code - Extended code with location and delivery info
 * @property {string} Season - Season (e.g., "2019_S1")
 * @property {number} Responses - Number of students who completed the SETU
 * @property {number} Invited - Total students invited
 * @property {number} [Response_Rate] - Response rate percentage
 * @property {number} [Level] - Unit level (1-4)
 * @property {import('mongoose').Types.Array<number>} [I1] - "The learning outcomes for this unit were clear to me" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I2] - "The instructions for Assessment tasks were clear to me" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I3] - "The assessment allowed me to demonstrate learning outcomes" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I4] - "The feedback helped me achieve learning outcomes" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I5] - "The resources helped me achieve learning outcomes" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I6] - "The activities helped me achieve learning outcomes" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I7] - "I attempted to engage to the best of my ability" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I8] - "Overall, I was satisfied with this unit" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I9] - "I could see how topics were related" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I10] - "The online resources helped me succeed" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I11] - "The workload was manageable" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I12] - "The practical/tutorial exercises assisted learning" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [I13] - "Pre-class activities were useful" [median/5, mean/5]
 * @property {import('mongoose').Types.Array<number>} [agg_score] - Aggregate score [mean aggregate, median aggregate]
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

const setuSchema = new Schema(
  {
    unit_code: { type: String, required: true, index: true },
    unit_name: { type: String, required: true },
    // Extended code with location and delivery info
    code: { type: String, required: true },
    // Season of the SETU, e.g. "2019_S1" for Semester 1, 2019
    Season: { type: String, required: true },
    // Number of students who completed the SETU
    Responses: { type: Number, required: true },
    // Total students invited to complete the SETU
    Invited: { type: Number, required: true },
    // Percentage of invited students who completed the SETU
    Response_Rate: { type: Number },
    // Unit level, e.g., 1 for first year, 2 for second year
    Level: { type: Number },
    /**
     * Evaluation metrics for SETU (I1 - I13)
     *
     * Array will have two values: [median/5, mean/5]
     */
    // "The learning outcomes for this unit were clear to me"
    I1: {
      type: [Number],
    },
    // "The instructions for Assessment tasks were clear to me"
    I2: {
      type: [Number],
    },
    // "The assessment in this unit allowed me to demonstrate the learning outcomes"
    I3: {
      type: [Number],
    },
    // "The feedback helped me achieve the learning outcomes for this unit"
    I4: {
      type: [Number],
    },
    // "The resources helped me achieve the learning outcomes for this unit"
    I5: {
      type: [Number],
    },
    // "The activities helped me achieve the learning outcomes for this unit"
    I6: {
      type: [Number],
    },
    // "I attempted to engage in this unit to the best of my ability"
    I7: {
      type: [Number],
    },
    // "Overall, I was satisfied with this unit"
    I8: {
      type: [Number],
    },
    // "As the unit progressed I could see how the various topics were related to each other"
    I9: {
      type: [Number],
    },
    // "The online resources for this unit helped me succeed in this unit"
    I10: {
      type: [Number],
    },
    // "The workload in this unit was manageable"
    I11: {
      type: [Number],
    },
    // "The practical or tutorial exercises assisted my learning"
    I12: {
      type: [Number],
    },
    // "I found the pre-class activities for this unit useful"
    I13: {
      type: [Number],
    },
    // Aggregate score of all metrics [mean aggregate, median aggregate]
    agg_score: {
      type: [Number],
    },
  },
  { timestamps: true }
);

// Create compound index for faster queries
setuSchema.index({ unit_code: 1, Season: 1 });

// Static method to get SETU data by unit code
setuSchema.statics.findByUnitCode = function (unitCode) {
  return this.find({ unit_code: unitCode }).sort({ Season: -1 });
};

// Static method to get average SETU scores for a unit
setuSchema.statics.getAverageScores = function (unitCode) {
  return this.aggregate([
    { $match: { unit_code: unitCode } },
    {
      $group: {
        _id: '$unit_code',
        averageAggScore: { $avg: { $arrayElemAt: ['$agg_score', 0] } },
        totalResponses: { $sum: '$Responses' },
      },
    },
  ]);
};

const SETU = mongoose.model('SETU', setuSchema);
module.exports = SETU;
